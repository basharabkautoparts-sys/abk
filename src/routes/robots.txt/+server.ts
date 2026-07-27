import { site } from '$lib/config';

export const prerender = true;

export function GET() {
	const body = `User-agent: *
Allow: /
Disallow: /admin

Sitemap: ${site.url}/sitemap.xml
`;
	return new Response(body, {
		headers: { 'content-type': 'text/plain; charset=utf-8' }
	});
}
