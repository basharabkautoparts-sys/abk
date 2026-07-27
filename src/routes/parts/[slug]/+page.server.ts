import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getPartBySlug, listParts } from '$lib/server/db';

export const load: PageServerLoad = async ({ locals, params }) => {
	const part = await getPartBySlug(locals.supabase, params.slug);
	if (!part) throw error(404, 'Part not found');

	const related = (await listParts(locals.supabase, { category: part.category.slug, limit: 5 }))
		.filter((p) => p.id !== part.id)
		.slice(0, 4);

	return { part, related };
};
