import type { Part, PartInput, PartQuery } from './types';
import { brandName, categoryName, ensureTaxonomy } from './taxonomy.svelte';
import { SEED_PARTS } from './data/seed';
import { slugify } from './utils';
import { supabase } from './supabase';

const TABLE = 'parts';

const COLUMNS =
	'id,slug,name,part_number,description,condition,oem,images,in_stock,featured,published,category_slug,brand_slug,created_at,updated_at';

/* --------------------------------------------------------------------------
 * Row mapping (DB row -> UI Part).
 *
 * A part row stores only the category/brand slug; the display names are looked
 * up in the taxonomy, which every query below loads first. An unknown slug
 * falls back to the slug itself rather than rendering blank — that can only
 * happen if a taxonomy row was deleted out from under a part, and showing
 * "body-parts" is a better failure than showing nothing.
 * ------------------------------------------------------------------------ */
function mapRow(row: Record<string, unknown>): Part {
	const categorySlug = String(row.category_slug ?? '');
	const brandSlug = String(row.brand_slug ?? '');
	return {
		id: String(row.id),
		slug: String(row.slug),
		name: String(row.name),
		part_number: String(row.part_number ?? ''),
		description: String(row.description ?? ''),
		condition: (row.condition as Part['condition']) ?? null,
		oem: (row.oem as string) ?? null,
		images: Array.isArray(row.images) ? (row.images as string[]) : [],
		in_stock: Boolean(row.in_stock),
		featured: Boolean(row.featured),
		published: Boolean(row.published),
		category: { slug: categorySlug, name: categoryName(categorySlug) },
		brand: { slug: brandSlug, name: brandName(brandSlug) },
		created_at: String(row.created_at ?? ''),
		updated_at: String(row.updated_at ?? '')
	};
}

/* --------------------------------------------------------------------------
 * In-memory demo store (used when Supabase is not configured).
 * Mutations survive client-side navigation but reset on a full page reload.
 * ------------------------------------------------------------------------ */
let demoStore: Part[] | null = null;
function store(): Part[] {
	if (!demoStore) demoStore = SEED_PARTS.map((p) => ({ ...p }));
	return demoStore;
}

export function sortParts(list: Part[], sort: PartQuery['sort']): Part[] {
	const arr = [...list];
	switch (sort) {
		case 'name':
			return arr.sort((a, b) => a.name.localeCompare(b.name));
		case 'brand':
			return arr.sort(
				(a, b) => a.brand.name.localeCompare(b.brand.name) || a.name.localeCompare(b.name)
			);
		default:
			return arr.sort((a, b) => b.created_at.localeCompare(a.created_at));
	}
}

/** Filter an already-loaded list. Also used for client-side catalogue filtering. */
export function filterParts(list: Part[], q: PartQuery, admin = false): Part[] {
	let out = admin ? list : list.filter((p) => p.published);
	if (q.category) out = out.filter((p) => p.category.slug === q.category);
	if (q.brand) out = out.filter((p) => p.brand.slug === q.brand);
	if (q.featured) out = out.filter((p) => p.featured);
	if (q.inStock) out = out.filter((p) => p.in_stock);
	if (q.q) {
		const term = q.q.toLowerCase();
		out = out.filter(
			(p) =>
				p.name.toLowerCase().includes(term) ||
				p.part_number.toLowerCase().includes(term) ||
				p.description.toLowerCase().includes(term)
		);
	}
	out = sortParts(out, q.sort);
	if (q.offset) out = out.slice(q.offset);
	if (q.limit) out = out.slice(0, q.limit);
	return out;
}

/** Count published parts per category slug (for catalogue/category cards). */
export function countByCategory(list: Part[]): Record<string, number> {
	return tally(list, (p) => p.category.slug);
}

/** Count published parts per brand slug (for the brand strip and filters). */
export function countByBrand(list: Part[]): Record<string, number> {
	return tally(list, (p) => p.brand.slug);
}

function tally(list: Part[], key: (p: Part) => string): Record<string, number> {
	const counts: Record<string, number> = {};
	for (const p of list) {
		if (!p.published) continue;
		counts[key(p)] = (counts[key(p)] ?? 0) + 1;
	}
	return counts;
}

/* --------------------------------------------------------------------------
 * Queries. Each resolves the shared client itself, so the same call works
 * during the build and in the browser.
 * ------------------------------------------------------------------------ */
export async function listParts(
	q: PartQuery = {},
	opts: { admin?: boolean } = {}
): Promise<Part[]> {
	const admin = opts.admin ?? false;
	await ensureTaxonomy();
	const db = supabase();
	if (!db) return filterParts(store(), q, admin);

	let builder = db.from(TABLE).select(COLUMNS);
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
		case 'brand':
			// Ordering by slug, not display name: the name lives in another table
			// and PostgREST cannot sort by it without an embed. The slug is coined
			// from the name, so the two only diverge for a brand that was renamed
			// after creation — close enough for a sort, and it keeps paging
			// correct, which sorting the mapped rows afterwards would not.
			builder = builder.order('brand_slug', { ascending: true }).order('name', { ascending: true });
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
	slug: string,
	opts: { admin?: boolean } = {}
): Promise<Part | null> {
	const admin = opts.admin ?? false;
	await ensureTaxonomy();
	const db = supabase();
	if (!db) return store().find((p) => p.slug === slug && (admin || p.published)) ?? null;

	let builder = db.from(TABLE).select(COLUMNS).eq('slug', slug);
	if (!admin) builder = builder.eq('published', true);
	const { data, error } = await builder.maybeSingle();
	if (error) throw new Error(`getPartBySlug: ${error.message}`);
	return data ? mapRow(data) : null;
}

export async function getPartById(id: string): Promise<Part | null> {
	await ensureTaxonomy();
	const db = supabase();
	if (!db) return store().find((p) => p.id === id) ?? null;
	const { data, error } = await db.from(TABLE).select(COLUMNS).eq('id', id).maybeSingle();
	if (error) throw new Error(`getPartById: ${error.message}`);
	return data ? mapRow(data) : null;
}

/* ------------------------- mutations (admin) --------------------------- */

async function uniqueSlug(base: string, ignoreId?: string): Promise<string> {
	const root = slugify(base) || 'part';
	let candidate = root;
	let n = 1;
	for (;;) {
		const existing = await getPartBySlug(candidate, { admin: true });
		if (!existing || existing.id === ignoreId) return candidate;
		n += 1;
		candidate = `${root}-${n}`;
	}
}

export async function createPart(input: PartInput): Promise<Part> {
	const slug = await uniqueSlug(input.name);
	const db = supabase();

	if (!db) {
		const now = new Date().toISOString();
		const part: Part = {
			id: `demo-${slug}`,
			slug,
			created_at: now,
			updated_at: now,
			...input,
			category: { slug: input.category_slug, name: categoryName(input.category_slug) },
			brand: { slug: input.brand_slug, name: brandName(input.brand_slug) }
		};
		store().unshift(part);
		return part;
	}

	const { data, error } = await db
		.from(TABLE)
		.insert({
			slug,
			name: input.name,
			part_number: input.part_number,
			description: input.description,
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

export async function updatePart(id: string, input: PartInput): Promise<Part> {
	await ensureTaxonomy();
	const db = supabase();

	if (!db) {
		const list = store();
		const idx = list.findIndex((p) => p.id === id);
		if (idx === -1) throw new Error('Part not found');
		const updated: Part = {
			...list[idx],
			...input,
			category: { slug: input.category_slug, name: categoryName(input.category_slug) },
			brand: { slug: input.brand_slug, name: brandName(input.brand_slug) },
			updated_at: new Date().toISOString()
		};
		list[idx] = updated;
		return updated;
	}

	const { data, error } = await db
		.from(TABLE)
		.update({
			name: input.name,
			part_number: input.part_number,
			description: input.description,
			condition: input.condition,
			oem: input.oem,
			images: input.images,
			in_stock: input.in_stock,
			featured: input.featured,
			published: input.published,
			category_slug: input.category_slug,
			brand_slug: input.brand_slug
		})
		.eq('id', id)
		.select(COLUMNS)
		.single();
	if (error) throw new Error(`updatePart: ${error.message}`);
	return mapRow(data);
}

export async function deletePart(id: string): Promise<void> {
	const db = supabase();
	if (!db) {
		demoStore = store().filter((p) => p.id !== id);
		return;
	}
	const { error } = await db.from(TABLE).delete().eq('id', id);
	if (error) throw new Error(`deletePart: ${error.message}`);
}
