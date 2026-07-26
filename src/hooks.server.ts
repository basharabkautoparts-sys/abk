import { createServerClient } from '@supabase/ssr';
import type { Handle } from '@sveltejs/kit';
import { isSupabaseConfigured, SUPABASE_ANON_KEY, SUPABASE_URL } from '$lib/server/config';
import { DEMO_COOKIE, DEMO_TOKEN } from '$lib/server/auth';

export const handle: Handle = async ({ event, resolve }) => {
	if (isSupabaseConfigured) {
		event.locals.supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
			cookies: {
				getAll: () => event.cookies.getAll(),
				setAll: (cookiesToSet) => {
					cookiesToSet.forEach(({ name, value, options }) => {
						event.cookies.set(name, value, { ...options, path: '/' });
					});
				}
			}
		});

		/** Validate the cookie session against the Auth server (never trust getSession alone). */
		event.locals.safeGetSession = async () => {
			const {
				data: { session }
			} = await event.locals.supabase!.auth.getSession();
			if (!session) return { session: null, user: null };

			const {
				data: { user },
				error
			} = await event.locals.supabase!.auth.getUser();
			if (error) return { session: null, user: null };
			return { session, user };
		};

		const { session, user } = await event.locals.safeGetSession();
		event.locals.session = session;
		event.locals.user = user;
		event.locals.isAdmin = Boolean(user);
	} else {
		// ---- Demo mode: no Supabase, use a simple signed-ish cookie ----
		event.locals.supabase = null;
		event.locals.safeGetSession = async () => ({ session: null, user: null });
		event.locals.session = null;
		event.locals.user = null;
		event.locals.isAdmin = event.cookies.get(DEMO_COOKIE) === DEMO_TOKEN;
	}

	return resolve(event, {
		filterSerializedResponseHeaders(name) {
			return name === 'content-range' || name === 'x-supabase-api-version';
		}
	});
};
