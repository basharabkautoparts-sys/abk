import { browser } from '$app/environment';
import { isSupabaseConfigured, supabase } from './supabase';

/**
 * Admin session, held entirely in the browser.
 *
 * With Supabase configured this is a real Supabase Auth session (persisted in
 * localStorage by supabase-js). Without it, the app runs in demo mode against a
 * hard-coded login so the admin can still be explored locally.
 */
export const DEMO_ADMIN_EMAIL = 'admin@abkautoparts.local';
export const DEMO_ADMIN_PASSWORD = 'abk-demo-admin';
const DEMO_KEY = 'abk-demo-admin';

export const admin = $state({
	/** False until the session has been resolved — render a shell, not a redirect. */
	ready: false,
	email: null as string | null
});

export const isSignedIn = () => admin.email !== null;

let initialised = false;

/** Resolve the current session. Safe to call from every admin page. */
export async function initAdminSession(): Promise<void> {
	if (!browser || initialised) return;
	initialised = true;

	const db = supabase();
	if (!db) {
		admin.email = sessionStorage.getItem(DEMO_KEY);
		admin.ready = true;
		return;
	}

	const { data } = await db.auth.getUser();
	admin.email = data.user?.email ?? null;
	admin.ready = true;

	// Keep in step with sign-out in another tab, or an expired refresh token.
	db.auth.onAuthStateChange((_event, session) => {
		admin.email = session?.user?.email ?? null;
	});
}

export async function signIn(email: string, password: string): Promise<string | null> {
	const db = supabase();

	if (!db) {
		const ok =
			email.trim().toLowerCase() === DEMO_ADMIN_EMAIL.toLowerCase() &&
			password === DEMO_ADMIN_PASSWORD;
		if (!ok) return 'Invalid credentials.';
		sessionStorage.setItem(DEMO_KEY, DEMO_ADMIN_EMAIL);
		admin.email = DEMO_ADMIN_EMAIL;
		return null;
	}

	const { data, error } = await db.auth.signInWithPassword({ email, password });
	if (error) return error.message;
	admin.email = data.user?.email ?? email;
	return null;
}

export async function signOut(): Promise<void> {
	const db = supabase();
	if (db) await db.auth.signOut();
	else sessionStorage.removeItem(DEMO_KEY);
	admin.email = null;
}

export const demoMode = !isSupabaseConfigured;
