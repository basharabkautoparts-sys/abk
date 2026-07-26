import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { isSupabaseConfigured, DEMO_ADMIN_EMAIL, DEMO_ADMIN_PASSWORD } from '$lib/server/config';
import { DEMO_COOKIE, DEMO_TOKEN, validateDemoLogin } from '$lib/server/auth';

function safeRedirect(target: string | null): string {
	if (target && target.startsWith('/admin')) return target;
	return '/admin';
}

export const load: PageServerLoad = async () => {
	return {
		demoMode: !isSupabaseConfigured,
		demoEmail: isSupabaseConfigured ? null : DEMO_ADMIN_EMAIL,
		demoPassword: isSupabaseConfigured ? null : DEMO_ADMIN_PASSWORD
	};
};

export const actions: Actions = {
	default: async ({ request, locals, cookies, url }) => {
		const form = await request.formData();
		const email = String(form.get('email') ?? '').trim();
		const password = String(form.get('password') ?? '');
		const redirectTo = safeRedirect(url.searchParams.get('redirectTo'));

		if (!email || !password) {
			return fail(400, { email, error: 'Enter your email and password.' });
		}

		if (locals.supabase) {
			const { error } = await locals.supabase.auth.signInWithPassword({ email, password });
			if (error) return fail(400, { email, error: error.message });
			throw redirect(303, redirectTo);
		}

		// Demo mode
		if (validateDemoLogin(email, password)) {
			cookies.set(DEMO_COOKIE, DEMO_TOKEN, {
				path: '/',
				httpOnly: true,
				sameSite: 'lax',
				maxAge: 60 * 60 * 8
			});
			throw redirect(303, redirectTo);
		}
		return fail(400, { email, error: 'Invalid credentials.' });
	}
};
