import type { StaffMember, StaffRole } from './types';
import { supabase } from './supabase';
import { DEMO_ADMIN_EMAIL } from './demo';

const TABLE = 'staff';
const COLUMNS = 'email,role,note,created_at,created_by';

/**
 * The staff allowlist. Membership is keyed by email — the same email the
 * account signs in with — which is what lets someone be authorised before their
 * account exists.
 *
 * Everything here is also enforced by Row Level Security (see
 * supabase/schema.sql). These calls fail closed: a non-root client that tries
 * to add a member gets an error from Postgres, not from this file.
 */

function normalise(email: string): string {
	return email.trim().toLowerCase();
}

/* ----------------------------- demo mode ------------------------------ */
let demoStaff: StaffMember[] | null = null;
function demoStore(): StaffMember[] {
	demoStaff ??= [
		{
			email: DEMO_ADMIN_EMAIL,
			role: 'root',
			note: 'Demo owner',
			created_at: new Date().toISOString(),
			created_by: null
		}
	];
	return demoStaff;
}

function mapRow(row: Record<string, unknown>): StaffMember {
	return {
		email: String(row.email),
		role: (row.role as StaffRole) ?? 'admin',
		note: String(row.note ?? ''),
		created_at: String(row.created_at ?? ''),
		created_by: (row.created_by as string) ?? null
	};
}

/* ------------------------------- reads -------------------------------- */

export async function listStaff(): Promise<StaffMember[]> {
	const db = supabase();
	if (!db) return [...demoStore()];

	const { data, error } = await db.from(TABLE).select(COLUMNS).order('created_at');
	if (error) throw new Error(`listStaff: ${error.message}`);
	return (data ?? []).map(mapRow);
}

/**
 * The signed-in user's role, or null if they are not staff. Null is the
 * ordinary case for any account that simply is not on the list — it is not an
 * error, and the admin treats it as "not authorised".
 */
export async function getRole(email: string): Promise<StaffRole | null> {
	const db = supabase();
	if (!db) return demoStore().find((s) => s.email === normalise(email))?.role ?? null;

	const { data, error } = await db
		.from(TABLE)
		.select('role')
		.eq('email', normalise(email))
		.maybeSingle();
	// RLS hides the whole table from non-staff, so "no row" and "not staff" are
	// the same answer; only surface real failures.
	if (error) throw new Error(`getRole: ${error.message}`);
	return (data?.role as StaffRole) ?? null;
}

/* ------------------------ mutations (root only) ------------------------ */

export async function addStaff(
	email: string,
	role: StaffRole,
	note: string,
	addedBy: string
): Promise<StaffMember> {
	const db = supabase();
	const clean = normalise(email);

	if (!db) {
		if (demoStore().some((s) => s.email === clean)) {
			throw new Error('That email is already on the list.');
		}
		const member: StaffMember = {
			email: clean,
			role,
			note,
			created_at: new Date().toISOString(),
			created_by: addedBy
		};
		demoStore().push(member);
		return member;
	}

	const { data, error } = await db
		.from(TABLE)
		.insert({ email: clean, role, note, created_by: addedBy })
		.select(COLUMNS)
		.single();
	if (error) {
		if (error.code === '23505') throw new Error('That email is already on the list.');
		throw new Error(error.message);
	}
	return mapRow(data);
}

export async function setStaffRole(email: string, role: StaffRole): Promise<void> {
	const db = supabase();
	const clean = normalise(email);

	if (!db) {
		const list = demoStore();
		const member = list.find((s) => s.email === clean);
		if (!member) throw new Error('Not found.');
		if (member.role === 'root' && role !== 'root' && list.filter((s) => s.role === 'root').length === 1) {
			throw new Error('Cannot remove the last root account');
		}
		member.role = role;
		return;
	}

	const { error } = await db.from(TABLE).update({ role }).eq('email', clean);
	if (error) throw new Error(error.message);
}

/**
 * Create the login, or reset its password — one idempotent call. Runs through
 * the `admin_set_staff_password` database function (SECURITY DEFINER), which
 * re-checks that the caller is root and that the target is on the allowlist,
 * so like everything else here it fails closed. No service-role key is
 * involved: the function authorises the caller by their own session, which is
 * why a static site can do this safely.
 */
export async function setPassword(email: string, password: string): Promise<{ created: boolean }> {
	const db = supabase();
	const clean = normalise(email);

	if (!db) {
		if (!demoStore().some((s) => s.email === clean)) {
			throw new Error('Add that email to the staff list first.');
		}
		// Demo mode has no real logins; report "created" so the UI flow reads true.
		return { created: true };
	}

	const { data, error } = await db.rpc('admin_set_staff_password', {
		target_email: clean,
		new_password: password
	});
	// PostgREST surfaces the function's RAISE message as error.message.
	if (error) throw new Error(error.message);
	// A jsonb-returning function comes back as the bare object; tolerate an
	// array wrapper too, in case the row shape ever changes.
	const row = (Array.isArray(data) ? data[0] : data) as { created?: boolean } | null;
	return { created: Boolean(row?.created) };
}

export async function removeStaff(email: string): Promise<void> {
	const db = supabase();
	const clean = normalise(email);

	if (!db) {
		const list = demoStore();
		const member = list.find((s) => s.email === clean);
		if (member?.role === 'root' && list.filter((s) => s.role === 'root').length === 1) {
			throw new Error('Cannot remove the last root account');
		}
		demoStaff = list.filter((s) => s.email !== clean);
		return;
	}

	const { error } = await db.from(TABLE).delete().eq('email', clean);
	if (error) throw new Error(error.message);
}
