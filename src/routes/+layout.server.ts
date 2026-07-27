import type { LayoutServerLoad } from './$types';
import { isSupabaseConfigured } from '$lib/server/config';

export const load: LayoutServerLoad = async ({ locals }) => {
	return {
		isAdmin: locals.isAdmin,
		demoMode: !isSupabaseConfigured,
		userEmail: locals.user?.email ?? null
	};
};
