import type { PageServerLoad } from './$types';
import { getCategoryCounts, listParts } from '$lib/server/db';

export const load: PageServerLoad = async ({ locals }) => {
	const [featured, latest, counts] = await Promise.all([
		listParts(locals.supabase, { featured: true, limit: 8 }),
		listParts(locals.supabase, { sort: 'newest', limit: 8 }),
		getCategoryCounts(locals.supabase)
	]);

	return { featured, latest, counts };
};
