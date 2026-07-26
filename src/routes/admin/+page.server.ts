import type { PageServerLoad } from './$types';
import { listParts } from '$lib/server/db';
import { brands, categories } from '$lib/config';

export const load: PageServerLoad = async ({ locals }) => {
	const all = await listParts(locals.supabase, { sort: 'newest' }, { admin: true });

	const stats = {
		total: all.length,
		published: all.filter((p) => p.published).length,
		featured: all.filter((p) => p.featured).length,
		outOfStock: all.filter((p) => !p.in_stock).length
	};

	const byBrand = brands.map((b) => ({
		name: b.name,
		slug: b.slug,
		count: all.filter((p) => p.brand.slug === b.slug).length
	}));
	const byCategory = categories.map((c) => ({
		name: c.name,
		slug: c.slug,
		icon: c.icon,
		count: all.filter((p) => p.category.slug === c.slug).length
	}));

	return { stats, byBrand, byCategory, recent: all.slice(0, 6) };
};
