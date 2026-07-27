/**
 * Part categories and vehicle brands are managed in the admin and stored in
 * Supabase (`part_categories` / `vehicle_brands`). The slug is the identity:
 * parts reference it, URLs are built from it, and it never changes once
 * created. See src/lib/taxonomy.svelte.ts.
 */
export interface Category {
	slug: string;
	name: string;
	description: string;
	/** Icon keyword resolved by Icon.svelte — see ICON_CHOICES in taxonomy. */
	icon: string;
	sort_order: number;
}

export interface Brand {
	slug: string;
	name: string;
	sort_order: number;
}

/** Fields accepted when creating/editing a category. */
export interface CategoryInput {
	name: string;
	description: string;
	icon: string;
	sort_order: number;
}

/** Fields accepted when creating/editing a vehicle brand. */
export interface BrandInput {
	name: string;
	sort_order: number;
}

export type PartCondition = 'Genuine' | 'OEM' | 'Aftermarket';

/** `root` additionally manages the staff allowlist. */
export type StaffRole = 'root' | 'admin';

export interface StaffMember {
	email: string;
	role: StaffRole;
	note: string;
	created_at: string;
	created_by: string | null;
}

/**
 * Shape returned to the UI (category/brand flattened to {slug,name}).
 *
 * There is deliberately no price: ABK quotes per enquiry, including export
 * shipping, so the catalogue never shows or stores one.
 */
export interface Part {
	id: string;
	slug: string;
	name: string;
	part_number: string;
	description: string;
	/**
	 * Null when nobody chose one, which is the default. The catalogue shows a
	 * condition only where it was set deliberately — a badge that appears on
	 * every part by default says nothing.
	 */
	condition: PartCondition | null;
	/** Original equipment number, if different from part_number. */
	oem: string | null;
	images: string[];
	in_stock: boolean;
	featured: boolean;
	published: boolean;
	category: { slug: string; name: string };
	brand: { slug: string; name: string };
	created_at: string;
	updated_at: string;
}

/** Fields accepted by create/update in the admin. */
export interface PartInput {
	name: string;
	part_number: string;
	description: string;
	condition: PartCondition | null;
	oem: string | null;
	images: string[];
	in_stock: boolean;
	featured: boolean;
	published: boolean;
	category_slug: string;
	brand_slug: string;
}

export interface PartQuery {
	q?: string;
	category?: string;
	brand?: string;
	featured?: boolean;
	inStock?: boolean;
	limit?: number;
	offset?: number;
	sort?: 'newest' | 'name' | 'brand';
}
