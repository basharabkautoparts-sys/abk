import { ensureTaxonomy, taxonomy } from '$lib/taxonomy.svelte';
import { absoluteUrl } from '$lib/seo';
import { listParts } from '$lib/db';
import type { RequestHandler } from './$types';

export const prerender = true;

export const GET: RequestHandler = async () => {
	// This is a prerendered endpoint rather than a page, so the root layout's
	// load never runs for it — without this, the category URLs below would be
	// built from the bundled fallback categories instead of the real ones.
	await ensureTaxonomy();

	const parts = await listParts({ sort: 'newest' });

	type Entry = { loc: string; priority: string; changefreq: string; lastmod?: string };
	const entries: Entry[] = [
		{ loc: '/', priority: '1.0', changefreq: 'weekly' },
		{ loc: '/parts', priority: '0.9', changefreq: 'daily' },
		{ loc: '/about', priority: '0.5', changefreq: 'monthly' },
		{ loc: '/contact', priority: '0.5', changefreq: 'monthly' },
		...taxonomy.categories.map((c) => ({
			loc: `/parts?category=${c.slug}`,
			priority: '0.7',
			changefreq: 'weekly'
		})),
		...parts.map((p) => ({
			loc: `/parts/${p.slug}`,
			priority: '0.8',
			changefreq: 'weekly',
			lastmod: p.updated_at ? p.updated_at.slice(0, 10) : undefined
		}))
	];

	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries
	.map(
		(e) => `  <url>
    <loc>${absoluteUrl(e.loc).replace(/&/g, '&amp;')}</loc>${e.lastmod ? `\n    <lastmod>${e.lastmod}</lastmod>` : ''}
    <changefreq>${e.changefreq}</changefreq>
    <priority>${e.priority}</priority>
  </url>`
	)
	.join('\n')}
</urlset>`;

	return new Response(xml, {
		headers: {
			'content-type': 'application/xml; charset=utf-8',
			'cache-control': 'public, max-age=3600'
		}
	});
};
