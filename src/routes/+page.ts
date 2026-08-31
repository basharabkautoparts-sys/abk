import type { PageLoad } from './$types';
import { countByCategory, listParts } from '$lib/db';

export const load: PageLoad = async () => {
	// One query, sliced three ways — cheaper than three round-trips, and the
	// counts have to be computed over the whole catalogue anyway.
	const all = await listParts({ sort: 'newest' });

	// No `featured` list: the owner asked for the "Popular parts" grid to go, and
	// a load function that keeps computing one is how it quietly comes back.
	return {
		latest: all.slice(0, 8),
		counts: countByCategory(all)
	};
};
