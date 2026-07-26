import { browser } from '$app/environment';
import { isSupabaseConfigured, supabase } from './supabase';
import { getRole } from './staff';
import { DEMO_ADMIN_EMAIL, DEMO_ADMIN_PASSWORD } from './demo';
import type { StaffRole } from './types';

/**
 * Admin session, held entirely in the browser.
 *
 * Signing in and being *authorised* are two separate things: Supabase Auth says
 * who you are, and the `staff` allowlist says what you may do. An account that
 * is not on the list resolves to `role: null` and gets nothing — the same
 * answer Row Level Security gives it in the database.
 */
export { DEMO_ADMIN_EMAIL, DEMO_ADMIN_PASSWORD };

export const admin = $state({
	/** False until the session has been resolved — render a shell, not a redirect. */
	ready: false,
	email: null as string | null,
	/** null = signed in but not on the staff allowlist. */
	role: null as StaffRole | null
});

export const isStaff = () => admin.role !== null;
export const isRoot = () => admin.role === 'root';

let initialised = false;

async function resolveRole(email: string | null): Promise<StaffRole | null> {
	if (!email) return null;
	try {
		return await getRole(email);
	} catch {
		// A lookup failure must not read as "authorised".
		return null;
	}
}

/** Resolve the current session. Safe to call from every admin page. */
export async function initAdminSession(): Promise<void> {
	if (!browser || initialised) return;
	initialised = true;

	const db = supabase();
	if (!db) {
		admin.email = sessionStorage.getItem('abk-demo-admin');
		admin.role = await resolveRole(admin.email);
		admin.ready = true;
		return;
	}

	const { data } = await db.auth.getUser();
	admin.email = data.user?.email ?? null;
	admin.role = await resolveRole(admin.email);
	admin.ready = true;

	// Keep in step with sign-out in another tab, or an expired refresh token.
	db.auth.onAuthStateChange(async (_event, session) => {
		const email = session?.user?.email ?? null;
		if (email === admin.email) return;
		admin.email = email;
		admin.role = await resolveRole(email);
	});
}

export async function signIn(email: string, password: string): Promise<string | null> {
	const db = supabase();

	if (!db) {
		const ok =
			email.trim().toLowerCase() === DEMO_ADMIN_EMAIL.toLowerCase() &&
			password === DEMO_ADMIN_PASSWORD;
		if (!ok) return 'Invalid credentials.';
		sessionStorage.setItem('abk-demo-admin', DEMO_ADMIN_EMAIL);
		admin.email = DEMO_ADMIN_EMAIL;
		admin.role = await resolveRole(DEMO_ADMIN_EMAIL);
		return null;
	}

	const { data, error } = await db.auth.signInWithPassword({ email, password });
	if (error) return error.message;

	admin.email = data.user?.email ?? email;
	admin.role = await resolveRole(admin.email);
	return null;
}

export async function signOut(): Promise<void> {
	const db = supabase();
	if (db) await db.auth.signOut();
	else sessionStorage.removeItem('abk-demo-admin');
	admin.email = null;
	admin.role = null;
}

export const demoMode = !isSupabaseConfigured;
