import type { PageLoad } from './$types';
import { countByCategory, listParts } from '$lib/db';

/**
 * The whole published catalogue, prerendered into the page. Search and the
 * category/brand/sort filters then run in the browser against this list — a
 * static host cannot vary a response by query string, and it makes filtering
 * instant. Revisit if the catalogue outgrows a few hundred parts.
 */
export const load: PageLoad = async () => {
	const parts = await listParts({ sort: 'newest' });
	return { parts, counts: countByCategory(parts) };
};
