import { browser } from '$app/environment';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * There is no server in this deployment — the site is prerendered to static
 * files and hosted on GitHub Pages — so one isomorphic client serves both
 * roles: it runs under Node during the build (to bake catalogue data into the
 * HTML) and in the browser afterwards (live data + the admin).
 *
 * The anon key is public by design; Row Level Security is what actually guards
 * the data. See supabase/schema.sql.
 */
export const SUPABASE_URL = import.meta.env.PUBLIC_SUPABASE_URL ?? '';
export const SUPABASE_ANON_KEY = import.meta.env.PUBLIC_SUPABASE_ANON_KEY ?? '';

/** When false the app runs in DEMO MODE: bundled sample parts + a demo login. */
export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

/** Bucket that holds part images in Supabase Storage. */
export const PART_IMAGES_BUCKET = 'part-images';

let client: SupabaseClient | null = null;

/** The shared Supabase client, or null in demo mode. */
export function supabase(): SupabaseClient | null {
	if (!isSupabaseConfigured) return null;
	client ??= createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
		auth: {
			// During prerendering there is no localStorage and nobody to sign in.
			persistSession: browser,
			autoRefreshToken: browser,
			detectSessionInUrl: browser,
			storageKey: 'abk-admin-auth'
		}
	});
	return client;
}
