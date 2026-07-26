declare global {
	namespace App {
		// interface Error {}
		// interface Locals {} — there is no server: the site is fully prerendered.
		// interface PageData {}
		// interface Platform {}
	}

	/** Supabase credentials, inlined at build time (see vite.config.ts envPrefix). */
	interface ImportMetaEnv {
		readonly PUBLIC_SUPABASE_URL?: string;
		readonly PUBLIC_SUPABASE_ANON_KEY?: string;
	}
}

export {};
