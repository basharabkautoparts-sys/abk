import type { PageLoad } from './$types';
import { countByCategory, listParts } from '$lib/db';

export const load: PageLoad = async () => {
	// One query, sliced three ways — cheaper than three round-trips, and the
	// counts have to be computed over the whole catalogue anyway.
	const all = await listParts({ sort: 'newest' });

	return {
		featured: all.filter((p) => p.featured).slice(0, 8),
		latest: all.slice(0, 8),
		counts: countByCategory(all)
	};
};
