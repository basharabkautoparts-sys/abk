import type { SupabaseClient } from '@supabase/supabase-js';
import type { Part, PartInput, PartQuery } from '$lib/types';
import { brandBySlug, categoryBySlug } from '$lib/config';
import { SEED_PARTS } from '$lib/data/seed';
import { slugify } from '$lib/utils';

const TABLE = 'parts';

const COLUMNS =
	'id,slug,name,part_number,description,price,currency,condition,oem,images,in_stock,featured,published,category_slug,brand_slug,created_at,updated_at';

/* --------------------------------------------------------------------------
 * Row mapping (DB row -> UI Part). Category/brand names come from static config.
 * ------------------------------------------------------------------------ */
function mapRow(row: Record<string, unknown>): Part {
	const categorySlug = String(row.category_slug ?? '');
	const brandSlug = String(row.brand_slug ?? '');
	const cat = categoryBySlug(categorySlug);
	const brand = brandBySlug(brandSlug);
	return {
		id: String(row.id),
		slug: String(row.slug),
		name: String(row.name),
		part_number: String(row.part_number ?? ''),
		description: String(row.description ?? ''),
		price: row.price == null ? null : Number(row.price),
		currency: String(row.currency ?? 'THB'),
		condition: (row.condition as Part['condition']) ?? 'Genuine',
		oem: (row.oem as string) ?? null,
		images: Array.isArray(row.images) ? (row.images as string[]) : [],
		in_stock: Boolean(row.in_stock),
		featured: Boolean(row.featured),
		published: Boolean(row.published),
		category: { slug: categorySlug, name: cat?.name ?? categorySlug },
		brand: { slug: brandSlug, name: brand?.name ?? brandSlug },
		created_at: String(row.created_at ?? ''),
		updated_at: String(row.updated_at ?? '')
	};
}

/* --------------------------------------------------------------------------
 * In-memory demo store (used when Supabase is not configured).
 * Mutations persist for the lifetime of the dev server process only.
 * ------------------------------------------------------------------------ */
let demoStore: Part[] | null = null;
function store(): Part[] {
	if (!demoStore) demoStore = SEED_PARTS.map((p) => ({ ...p }));
	return demoStore;
}

function sortParts(list: Part[], sort: PartQuery['sort']): Part[] {
	const arr = [...list];
	switch (sort) {
		case 'name':
			return arr.sort((a, b) => a.name.localeCompare(b.name));
		case 'price-asc':
			return arr.sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity));
		case 'price-desc':
			return arr.sort((a, b) => (b.price ?? -Infinity) - (a.price ?? -Infinity));
		default:
			return arr.sort((a, b) => b.created_at.localeCompare(a.created_at));
	}
}

function queryDemo(q: PartQuery, admin: boolean): Part[] {
	let list = store();
	if (!admin) list = list.filter((p) => p.published);
	if (q.category) list = list.filter((p) => p.category.slug === q.category);
	if (q.brand) list = list.filter((p) => p.brand.slug === q.brand);
	if (q.featured) list = list.filter((p) => p.featured);
	if (q.inStock) list = list.filter((p) => p.in_stock);
	if (q.q) {
		const term = q.q.toLowerCase();
		list = list.filter(
			(p) =>
				p.name.toLowerCase().includes(term) ||
				p.part_number.toLowerCase().includes(term) ||
				p.description.toLowerCase().includes(term)
		);
	}
	list = sortParts(list, q.sort);
	if (q.offset) list = list.slice(q.offset);
	if (q.limit) list = list.slice(0, q.limit);
	return list;
}

/* --------------------------------------------------------------------------
 * Public API — every function takes the request-scoped client (or null=demo).
 * ------------------------------------------------------------------------ */
export async function listParts(
	supabase: SupabaseClient | null,
	q: PartQuery = {},
	opts: { admin?: boolean } = {}
): Promise<Part[]> {
	const admin = opts.admin ?? false;
	if (!supabase) return queryDemo(q, admin);

	let builder = supabase.from(TABLE).select(COLUMNS);
	if (!admin) builder = builder.eq('published', true);
	if (q.category) builder = builder.eq('category_slug', q.category);
	if (q.brand) builder = builder.eq('brand_slug', q.brand);
	if (q.featured) builder = builder.eq('featured', true);
	if (q.inStock) builder = builder.eq('in_stock', true);
	if (q.q) {
		const term = q.q.replace(/[%,()]/g, ' ').trim();
		if (term) {
			builder = builder.or(
				`name.ilike.%${term}%,part_number.ilike.%${term}%,description.ilike.%${term}%`
			);
		}
	}

	switch (q.sort) {
		case 'name':
			builder = builder.order('name', { ascending: true });
			break;
		case 'price-asc':
			builder = builder.order('price', { ascending: true, nullsFirst: false });
			break;
		case 'price-desc':
			builder = builder.order('price', { ascending: false, nullsFirst: false });
			break;
		default:
			builder = builder.order('created_at', { ascending: false });
	}

	const from = q.offset ?? 0;
	if (q.limit) builder = builder.range(from, from + q.limit - 1);

	const { data, error } = await builder;
	if (error) throw new Error(`listParts: ${error.message}`);
	return (data ?? []).map(mapRow);
}

export async function getPartBySlug(
	supabase: SupabaseClient | null,
	slug: string,
	opts: { admin?: boolean } = {}
): Promise<Part | null> {
	const admin = opts.admin ?? false;
	if (!supabase) {
		return store().find((p) => p.slug === slug && (admin || p.published)) ?? null;
	}
	let builder = supabase.from(TABLE).select(COLUMNS).eq('slug', slug);
	if (!admin) builder = builder.eq('published', true);
	const { data, error } = await builder.maybeSingle();
	if (error) throw new Error(`getPartBySlug: ${error.message}`);
	return data ? mapRow(data) : null;
}

export async function getPartById(
	supabase: SupabaseClient | null,
	id: string
): Promise<Part | null> {
	if (!supabase) return store().find((p) => p.id === id) ?? null;
	const { data, error } = await supabase.from(TABLE).select(COLUMNS).eq('id', id).maybeSingle();
	if (error) throw new Error(`getPartById: ${error.message}`);
	return data ? mapRow(data) : null;
}

/** Count of published parts per category slug (for catalog/category cards). */
export async function getCategoryCounts(
	supabase: SupabaseClient | null
): Promise<Record<string, number>> {
	const counts: Record<string, number> = {};
	if (!supabase) {
		for (const p of store()) if (p.published) counts[p.category.slug] = (counts[p.category.slug] ?? 0) + 1;
		return counts;
	}
	const { data, error } = await supabase.from(TABLE).select('category_slug').eq('published', true);
	if (error) throw new Error(`getCategoryCounts: ${error.message}`);
	for (const row of data ?? []) {
		const slug = String((row as { category_slug: string }).category_slug);
		counts[slug] = (counts[slug] ?? 0) + 1;
	}
	return counts;
}

/* ------------------------- mutations (admin) --------------------------- */

async function uniqueSlug(
	supabase: SupabaseClient | null,
	base: string,
	ignoreId?: string
): Promise<string> {
	const root = slugify(base) || 'part';
	let candidate = root;
	let n = 1;
	// eslint-disable-next-line no-constant-condition
	while (true) {
		const existing = await getPartBySlug(supabase, candidate, { admin: true });
		if (!existing || existing.id === ignoreId) return candidate;
		n += 1;
		candidate = `${root}-${n}`;
	}
}

export async function createPart(
	supabase: SupabaseClient | null,
	input: PartInput
): Promise<Part> {
	const slug = await uniqueSlug(supabase, input.name);

	if (!supabase) {
		const now = '2026-07-13T00:00:00.000Z';
		const cat = categoryBySlug(input.category_slug);
		const brand = brandBySlug(input.brand_slug);
		const part: Part = {
			id: `demo-${slug}`,
			slug,
			name: input.name,
			part_number: input.part_number,
			description: input.description,
			price: input.price,
			currency: 'THB',
			condition: input.condition,
			oem: input.oem,
			images: input.images,
			in_stock: input.in_stock,
			featured: input.featured,
			published: input.published,
			category: { slug: input.category_slug, name: cat?.name ?? input.category_slug },
			brand: { slug: input.brand_slug, name: brand?.name ?? input.brand_slug },
			created_at: now,
			updated_at: now
		};
		store().unshift(part);
		return part;
	}

	const { data, error } = await supabase
		.from(TABLE)
		.insert({
			slug,
			name: input.name,
			part_number: input.part_number,
			description: input.description,
			price: input.price,
			currency: 'THB',
			condition: input.condition,
			oem: input.oem,
			images: input.images,
			in_stock: input.in_stock,
			featured: input.featured,
			published: input.published,
			category_slug: input.category_slug,
			brand_slug: input.brand_slug
		})
		.select(COLUMNS)
		.single();
	if (error) throw new Error(`createPart: ${error.message}`);
	return mapRow(data);
}

export async function updatePart(
	supabase: SupabaseClient | null,
	id: string,
	input: PartInput
): Promise<Part> {
	if (!supabase) {
		const list = store();
		const idx = list.findIndex((p) => p.id === id);
		if (idx === -1) throw new Error('Part not found');
		const cat = categoryBySlug(input.category_slug);
		const brand = brandBySlug(input.brand_slug);
		const updated: Part = {
			...list[idx],
			name: input.name,
			part_number: input.part_number,
			description: input.description,
			price: input.price,
			condition: input.condition,
			oem: input.oem,
			images: input.images,
			in_stock: input.in_stock,
			featured: input.featured,
			published: input.published,
			category: { slug: input.category_slug, name: cat?.name ?? input.category_slug },
			brand: { slug: input.brand_slug, name: brand?.name ?? input.brand_slug },
			updated_at: '2026-07-13T00:00:00.000Z'
		};
		list[idx] = updated;
		return updated;
	}

	const { data, error } = await supabase
		.from(TABLE)
		.update({
			name: input.name,
			part_number: input.part_number,
			description: input.description,
			price: input.price,
			condition: input.condition,
			oem: input.oem,
			images: input.images,
			in_stock: input.in_stock,
			featured: input.featured,
			published: input.published,
			category_slug: input.category_slug,
			brand_slug: input.brand_slug,
			updated_at: new Date().toISOString()
		})
		.eq('id', id)
		.select(COLUMNS)
		.single();
	if (error) throw new Error(`updatePart: ${error.message}`);
	return mapRow(data);
}

export async function deletePart(supabase: SupabaseClient | null, id: string): Promise<void> {
	if (!supabase) {
		demoStore = store().filter((p) => p.id !== id);
		return;
	}
	const { error } = await supabase.from(TABLE).delete().eq('id', id);
	if (error) throw new Error(`deletePart: ${error.message}`);
}
