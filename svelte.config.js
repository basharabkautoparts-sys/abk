import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/**
 * Static build for GitHub Pages.
 *
 * Every page is prerendered to plain HTML at build time — including part detail
 * pages, whose slugs are read from Supabase during the build (see
 * `src/routes/parts/[slug]/+page.ts`). `fallback` catches URLs that did not
 * exist at build time (a part added in the admin since the last deploy): GitHub
 * Pages serves 404.html, the app boots and resolves the route client-side.
 *
 * The site is served from the root of abkautopart.com, so `base` is empty. It
 * carried the `/abk` repo subpath while it lived on the GitHub Pages project
 * URL (basharabkautoparts-sys.github.io/abk), and `url()` in src/lib/paths.ts
 * still prefixes every internal link — so either layout works without touching
 * a component. CI takes BASE_PATH from actions/configure-pages, which follows
 * whatever the Pages settings say; the default here is only for local builds.
 */
const config = {
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter({
			pages: 'build',
			assets: 'build',
			fallback: '404.html',
			precompress: false,
			strict: false
		}),
		paths: {
			base: process.env.BASE_PATH ?? '',
			// Keep `base` an absolute path. Left relative (the default), it
			// resolves to `..`/`../..` per page during prerendering, which is fine
			// for links but corrupts the absolute URLs built for canonical tags,
			// Open Graph and JSON-LD.
			relative: false
		},
		alias: {
			$lib: 'src/lib'
		}
	}
};

export default config;
