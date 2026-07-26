export interface Category {
	id: string;
	slug: string;
	name: string;
	description: string;
	/** icon keyword resolved by CategoryIcon.svelte */
	icon: string;
	sort_order: number;
}

export interface Brand {
	id: string;
	slug: string;
	name: string;
}

export type PartCondition = 'Genuine' | 'OEM' | 'Aftermarket';

/** Shape returned to the UI (category/brand flattened to {slug,name}). */
export interface Part {
	id: string;
	slug: string;
	name: string;
	part_number: string;
	description: string;
	price: number | null;
	currency: string;
	condition: PartCondition;
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
	price: number | null;
	condition: PartCondition;
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
	sort?: 'newest' | 'name' | 'price-asc' | 'price-desc';
}
