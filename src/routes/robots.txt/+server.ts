import { base } from '$app/paths';
import { absoluteUrl } from '$lib/seo';

export const prerender = true;

export function GET() {
	// robots.txt lives at the origin root even though the site is served from a
	// subdirectory, so every rule has to spell out the base path.
	const body = `User-agent: *
Allow: ${base}/
Disallow: ${base}/admin

Sitemap: ${absoluteUrl('/sitemap.xml')}
`;
	return new Response(body, {
		headers: { 'content-type': 'text/plain; charset=utf-8' }
	});
}
