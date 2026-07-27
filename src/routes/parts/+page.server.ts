import type { PageServerLoad } from './$types';
import { getCategoryCounts, listParts } from '$lib/server/db';
import type { PartQuery } from '$lib/types';

const SORTS: PartQuery['sort'][] = ['newest', 'name'];

export const load: PageServerLoad = async ({ locals, url }) => {
	const q = url.searchParams.get('q')?.trim() ?? '';
	const category = url.searchParams.get('category') ?? '';
	const brand = url.searchParams.get('brand') ?? '';
	const sortParam = url.searchParams.get('sort') ?? 'newest';
	const sort = (SORTS.includes(sortParam as PartQuery['sort']) ? sortParam : 'newest') as PartQuery['sort'];

	const query: PartQuery = {
		q: q || undefined,
		category: category || undefined,
		brand: brand || undefined,
		sort
	};

	const [parts, counts] = await Promise.all([
		listParts(locals.supabase, query),
		getCategoryCounts(locals.supabase)
	]);

	return { parts, counts, filters: { q, category, brand, sort } };
};
