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
 * The site is served from the root of www.abkautoparts.com (static/CNAME), so
 * there is no base path. Serving from a repo subpath instead
 * (user.github.io/abk) would need `paths.base` here AND every internal href
 * prefixed with it — links are written as plain absolute paths throughout.
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
		alias: {
			$lib: 'src/lib'
		}
	}
};

export default config;
