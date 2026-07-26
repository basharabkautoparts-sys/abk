import { error } from '@sveltejs/kit';
import type { EntryGenerator, PageLoad } from './$types';
import { getPartBySlug, listParts } from '$lib/db';

/**
 * Slugs to prerender, read from Supabase during the build. A part added in the
 * admin after the last deploy is not in this list — GitHub Pages then serves
 * the SPA fallback and `load` below resolves it in the browser instead. Rerun
 * the deploy workflow to give it real static HTML (and a crawlable page).
 */
export const entries: EntryGenerator = async () => {
	const parts = await listParts({ sort: 'newest' });
	return parts.map((p) => ({ slug: p.slug }));
};

export const load: PageLoad = async ({ params }) => {
	const part = await getPartBySlug(params.slug);
	if (!part) throw error(404, 'Part not found');

	const related = (await listParts({ category: part.category.slug, limit: 5 }))
		.filter((p) => p.id !== part.id)
		.slice(0, 4);

	return { part, related };
};
