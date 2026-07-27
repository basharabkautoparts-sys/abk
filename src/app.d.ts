import type { SupabaseClient, Session, User } from '@supabase/supabase-js';

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			/** Request-scoped Supabase client (null when Supabase env is not configured — demo mode). */
			supabase: SupabaseClient | null;
			/** Validates the cookie session against Supabase Auth (getUser). */
			safeGetSession: () => Promise<{ session: Session | null; user: User | null }>;
			session: Session | null;
			user: User | null;
			/** True when the current request belongs to a signed-in staff member (real or demo). */
			isAdmin: boolean;
		}
		interface PageData {
			session?: Session | null;
			user?: User | null;
		}
		// interface Platform {} — provided by @sveltejs/adapter-cloudflare
	}
}

export {};
