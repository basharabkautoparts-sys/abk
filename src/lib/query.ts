import { browser } from '$app/environment';
import { base } from '$app/paths';

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
 * Reduce a live pathname to the base-less, slash-less form that route paths are
 * written in throughout the app, so the two can be compared. `page.url.pathname`
 * carries both the deployment's base path and the trailing slash; a plain href
 * like `/parts` carries neither.
 */
export function routePath(pathname: string): string {
	const withoutBase = base && pathname.startsWith(base) ? pathname.slice(base.length) : pathname;
	return withoutBase.replace(/\/+$/, '') || '/';
}

/** True when `pathname` is `href` itself, or a page nested under it. */
export function isUnder(pathname: string, href: string): boolean {
	const path = routePath(pathname);
	const base = routePath(href);
	return path === base || (base !== '/' && path.startsWith(base + '/'));
}
