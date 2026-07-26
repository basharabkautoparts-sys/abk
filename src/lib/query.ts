import { browser } from '$app/environment';

/**
 * Read a page's query string safely.
 *
 * `url.searchParams` throws during prerendering: one static file cannot vary by
 * query string, so SvelteKit refuses to let prerendered HTML depend on one.
 * Returning empty params under Node is the correct behaviour anyway — the
 * prerendered page is the unfiltered one, and the query string is applied on
 * hydration.
 */
export function searchParams(url: URL): URLSearchParams {
	return browser ? url.searchParams : new URLSearchParams();
}

/**
 * Drop the trailing slash the router appends (see `trailingSlash` in
 * +layout.ts) so a live pathname can be compared against a plain href.
 */
export function routePath(pathname: string): string {
	return pathname.replace(/\/+$/, '') || '/';
}

/** True when `pathname` is `href` itself, or a page nested under it. */
export function isUnder(pathname: string, href: string): boolean {
	const path = routePath(pathname);
	const base = routePath(href);
	return path === base || (base !== '/' && path.startsWith(base + '/'));
}
