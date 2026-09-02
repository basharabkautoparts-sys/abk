import type { Brand, BrandInput, Category, CategoryInput } from './types';
import { DEFAULT_BRANDS, DEFAULT_CATEGORIES } from './config';
import { supabase } from './supabase';
import { slugify } from './utils';

/**
 * Vehicle brands and part categories — the catalogue's taxonomy.
 *
 * These used to be hard-coded in config.ts. They now live in Supabase so staff
 * can add a brand or a category without a deploy, but the *shape* of the app
 * has not changed: components still read a plain list synchronously.
 *
 * The trick is this module-level `taxonomy` state. It starts as the bundled
 * defaults — so a page can render before any query resolves, and demo mode
 * works with no database at all — and `ensureTaxonomy()` swaps in the live rows
 * once. Every load function awaits it, so prerendered HTML is built from the
 * real lists, and any admin mutation refreshes it in place, which re-renders
 * every component reading it.
 *
 * A part references its brand and category by SLUG, and the slug is immutable
 * once created: renaming "Isuzu" to "ISUZU" changes only what is displayed.
 * Deleting is refused by the database while any part still points at the row.
 */

interface TaxonomyState {
	brands: Brand[];
	categories: Category[];
	/** True once the live rows have replaced the bundled defaults. */
	loaded: boolean;
}

export const taxonomy: TaxonomyState = $state({
	brands: [...DEFAULT_BRANDS],
	categories: [...DEFAULT_CATEGORIES],
	loaded: false
});

/** Icons a category can be given, in the order they appear in the picker. */
export const ICON_CHOICES = [
	'engine',
	'brake',
	'suspension',
	'filter',
	'clutch',
	'spark',
	'body',
	'part',
	'truck',
	'shield',
	'tag',
	'grid'
] as const;

const BRANDS_TABLE = 'vehicle_brands';
const CATEGORIES_TABLE = 'part_categories';
const BRAND_COLUMNS = 'slug,name,sort_order';
const CATEGORY_COLUMNS = 'slug,name,description,icon,sort_order';

/* ------------------------------ lookups ------------------------------- */

export function brandBySlug(slug: string): Brand | undefined {
	return taxonomy.brands.find((b) => b.slug === slug);
}

export function categoryBySlug(slug: string): Category | undefined {
	return taxonomy.categories.find((c) => c.slug === slug);
}

/** Display name for a slug, falling back to the slug itself. */
export function brandName(slug: string): string {
	return brandBySlug(slug)?.name ?? slug;
}

export function categoryName(slug: string): string {
	return categoryBySlug(slug)?.name ?? slug;
}

/**
 * The categories worth offering as a filter on the public site.
 *
 * A category with nothing in it is a link to an empty listing — it advertises
 * a range the shop cannot currently supply, and reads as a fault rather than
 * as stock news. So it is hidden until a part lands in it, and reappears by
 * itself when one does. The admin still lists every category: you have to be
 * able to create one and assign the first part to it.
 *
 * `keep` pins a slug that must stay visible whatever its count — the category
 * currently being filtered on, which would otherwise vanish from the very list
 * that selected it. And if *nothing* has stock (an empty catalogue, or a
 * catalogue that failed to load) the full list is returned: an empty section is
 * worse than a few zeroes.
 */
export function stockedCategories(counts: Record<string, number>, keep = ''): Category[] {
	const stocked = taxonomy.categories.filter((c) => (counts[c.slug] ?? 0) > 0 || c.slug === keep);
	return stocked.length ? stocked : taxonomy.categories;
}

/* ------------------------------ loading ------------------------------- */

function mapBrand(row: Record<string, unknown>): Brand {
	return {
		slug: String(row.slug),
		name: String(row.name),
		sort_order: Number(row.sort_order ?? 0)
	};
}

function mapCategory(row: Record<string, unknown>): Category {
	return {
		slug: String(row.slug),
		name: String(row.name),
		description: String(row.description ?? ''),
		icon: String(row.icon || 'part'),
		sort_order: Number(row.sort_order ?? 0)
	};
}

async function fetchTaxonomy(): Promise<void> {
	const db = supabase();
	if (!db) {
		taxonomy.loaded = true;
		return;
	}

	const [brandsRes, categoriesRes] = await Promise.all([
		db.from(BRANDS_TABLE).select(BRAND_COLUMNS).order('sort_order').order('name'),
		db.from(CATEGORIES_TABLE).select(CATEGORY_COLUMNS).order('sort_order').order('name')
	]);
	if (brandsRes.error) throw new Error(`loadTaxonomy: ${brandsRes.error.message}`);
	if (categoriesRes.error) throw new Error(`loadTaxonomy: ${categoriesRes.error.message}`);

	// An empty table means a database that has not been seeded yet; keep the
	// bundled defaults rather than emptying every filter on the site.
	if (brandsRes.data?.length) taxonomy.brands = brandsRes.data.map(mapBrand);
	if (categoriesRes.data?.length) taxonomy.categories = categoriesRes.data.map(mapCategory);
	taxonomy.loaded = true;
}

let inflight: Promise<void> | null = null;

/**
 * Load the taxonomy once. Safe to call from anywhere, any number of times:
 * concurrent callers share one request, and later calls are free.
 *
 * A failure here is deliberately swallowed — the site falls back to the bundled
 * defaults rather than failing to render. A broken taxonomy query should not
 * take down the catalogue.
 */
export function ensureTaxonomy(): Promise<void> {
	inflight ??= fetchTaxonomy().catch((e) => {
		console.warn('[taxonomy] falling back to bundled defaults:', e);
	});
	return inflight;
}

/** Re-read the taxonomy from the database (after an admin mutation). */
export async function refreshTaxonomy(): Promise<void> {
	inflight = null;
	await ensureTaxonomy();
}

/* --------------------------- brand mutations --------------------------- */

/**
 * Slugs are generated from the name at creation and never change afterwards,
 * because every part row points at one. Uniqueness is settled here rather than
 * by catching the primary-key violation, so the caller gets "toyota-2" instead
 * of an error.
 */
function uniqueSlug(base: string, taken: string[]): string {
	const root = slugify(base) || 'item';
	let candidate = root;
	let n = 1;
	while (taken.includes(candidate)) {
		n += 1;
		candidate = `${root}-${n}`;
	}
	return candidate;
}

export async function createBrand(input: BrandInput): Promise<Brand> {
	const slug = uniqueSlug(input.name, taxonomy.brands.map((b) => b.slug));
	const brand: Brand = { slug, name: input.name.trim(), sort_order: input.sort_order };

	const db = supabase();
	if (db) {
		const { data, error } = await db
			.from(BRANDS_TABLE)
			.insert(brand)
			.select(BRAND_COLUMNS)
			.single();
		if (error) throw new Error(error.message);
		await refreshTaxonomy();
		return mapBrand(data);
	}

	taxonomy.brands = [...taxonomy.brands, brand].sort(bySortOrder);
	return brand;
}

export async function updateBrand(slug: string, input: BrandInput): Promise<Brand> {
	const patch = { name: input.name.trim(), sort_order: input.sort_order };

	const db = supabase();
	if (db) {
		const { data, error } = await db
			.from(BRANDS_TABLE)
			.update(patch)
			.eq('slug', slug)
			.select(BRAND_COLUMNS)
			.single();
		if (error) throw new Error(error.message);
		await refreshTaxonomy();
		return mapBrand(data);
	}

	const updated = { slug, ...patch };
	taxonomy.brands = taxonomy.brands.map((b) => (b.slug === slug ? updated : b)).sort(bySortOrder);
	return updated;
}

export async function deleteBrand(slug: string): Promise<void> {
	const db = supabase();
	if (db) {
		const { error } = await db.from(BRANDS_TABLE).delete().eq('slug', slug);
		if (error) throw new Error(inUseMessage(error, 'brand'));
		await refreshTaxonomy();
		return;
	}
	taxonomy.brands = taxonomy.brands.filter((b) => b.slug !== slug);
}

/* -------------------------- category mutations ------------------------- */

export async function createCategory(input: CategoryInput): Promise<Category> {
	const slug = uniqueSlug(input.name, taxonomy.categories.map((c) => c.slug));
	const category: Category = {
		slug,
		name: input.name.trim(),
		description: input.description.trim(),
		icon: input.icon || 'part',
		sort_order: input.sort_order
	};

	const db = supabase();
	if (db) {
		const { data, error } = await db
			.from(CATEGORIES_TABLE)
			.insert(category)
			.select(CATEGORY_COLUMNS)
			.single();
		if (error) throw new Error(error.message);
		await refreshTaxonomy();
		return mapCategory(data);
	}

	taxonomy.categories = [...taxonomy.categories, category].sort(bySortOrder);
	return category;
}

export async function updateCategory(slug: string, input: CategoryInput): Promise<Category> {
	const patch = {
		name: input.name.trim(),
		description: input.description.trim(),
		icon: input.icon || 'part',
		sort_order: input.sort_order
	};

	const db = supabase();
	if (db) {
		const { data, error } = await db
			.from(CATEGORIES_TABLE)
			.update(patch)
			.eq('slug', slug)
			.select(CATEGORY_COLUMNS)
			.single();
		if (error) throw new Error(error.message);
		await refreshTaxonomy();
		return mapCategory(data);
	}

	const updated = { slug, ...patch };
	taxonomy.categories = taxonomy.categories
		.map((c) => (c.slug === slug ? updated : c))
		.sort(bySortOrder);
	return updated;
}

export async function deleteCategory(slug: string): Promise<void> {
	const db = supabase();
	if (db) {
		const { error } = await db.from(CATEGORIES_TABLE).delete().eq('slug', slug);
		if (error) throw new Error(inUseMessage(error, 'category'));
		await refreshTaxonomy();
		return;
	}
	taxonomy.categories = taxonomy.categories.filter((c) => c.slug !== slug);
}

/* ------------------------------ helpers -------------------------------- */

function bySortOrder(a: { sort_order: number; name: string }, b: { sort_order: number; name: string }) {
	return a.sort_order - b.sort_order || a.name.localeCompare(b.name);
}

/**
 * The foreign key from `parts` is what actually prevents deleting a taxonomy
 * row that is still in use; Postgres reports that as 23503. Translate it, since
 * "violates foreign key constraint parts_brand_slug_fkey" is not an answer.
 */
function inUseMessage(error: { code?: string; message: string }, kind: string): string {
	if (error.code === '23503') {
		return `This ${kind} still has parts assigned to it. Move or delete those parts first.`;
	}
	return error.message;
}
