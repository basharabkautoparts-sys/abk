import { DEMO_ADMIN_EMAIL, DEMO_ADMIN_PASSWORD } from './config';

/** Cookie + token used for the demo-mode admin session (no Supabase configured). */
export const DEMO_COOKIE = 'abk_demo_admin';
export const DEMO_TOKEN = 'abk-demo-session-v1';

export function validateDemoLogin(email: string, password: string): boolean {
	return (
		email.trim().toLowerCase() === DEMO_ADMIN_EMAIL.toLowerCase() &&
		password === DEMO_ADMIN_PASSWORD
	);
}
