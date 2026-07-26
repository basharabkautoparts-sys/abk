import { redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { DEMO_COOKIE } from '$lib/server/auth';

export const actions: Actions = {
	default: async ({ locals, cookies }) => {
		if (locals.supabase) {
			await locals.supabase.auth.signOut();
		}
		cookies.delete(DEMO_COOKIE, { path: '/' });
		throw redirect(303, '/admin/login');
	}
};
