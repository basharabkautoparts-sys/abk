import { base, assets } from '$app/paths';

/**
 * Apply the site's trailing-slash convention (see `trailingSlash` in
 * +layout.ts). Paths that name a file are left alone.
 */
export function normalisePath(path: string): string {
	const [pathname, query] = path.split('?');
	if (/\.[a-z0-9]+$/i.test(pathname)) return path;
	const withSlash = pathname.endsWith('/') ? pathname : `${pathname}/`;
	return query ? `${withSlash}?${query}` : withSlash;
}

/**
 * Resolve an internal path for use in an `href`, `action` or `goto`.
 *
 * Paths are written base-less throughout the app — including the ones passed to
 * `absoluteUrl` for canonical URLs — and pick up the prefix here, along with
 * the trailing slash, so links point at the URL that is actually served rather
 * than one that redirects to it.
 *
 * `base` is empty on abkautopart.com. It was `/abk` on the GitHub Pages project
 * URL (`…github.io/abk/`), where no internal link could be a bare absolute
 * path; moving between the two is `BASE_PATH` alone, with no change to callers.
 */
export function url(path: string): string {
	return base + normalisePath(path);
}

/** Same, for files in `static/`. */
export function asset(file: string): string {
	return (assets || base) + file;
}
