import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { isSupabaseConfigured } from '$lib/server/config';

export const load: LayoutServerLoad = async ({ locals, url }) => {
	const onLogin = url.pathname === '/admin/login';

	if (!locals.isAdmin && !onLogin) {
		const redirectTo = encodeURIComponent(url.pathname + url.search);
		throw redirect(303, `/admin/login?redirectTo=${redirectTo}`);
	}
	if (locals.isAdmin && onLogin) {
		throw redirect(303, '/admin');
	}

	return {
		isAdmin: locals.isAdmin,
		demoMode: !isSupabaseConfigured,
		userEmail: locals.user?.email ?? (locals.isAdmin ? 'Demo admin' : null)
	};
};
