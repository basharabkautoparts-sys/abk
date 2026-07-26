import type { Part, PartCondition, PartInput } from './types';
import { brandBySlug, categoryBySlug } from './config';
import { PART_IMAGES_BUCKET, supabase } from './supabase';

const CONDITIONS: PartCondition[] = ['Genuine', 'OEM', 'Aftermarket'];

/** Re-render-friendly view of the submitted values. */
export interface PartFormValues {
	name: string;
	part_number: string;
	description: string;
	price: string;
	condition: string;
	oem: string;
	category_slug: string;
	brand_slug: string;
	in_stock: boolean;
	featured: boolean;
	published: boolean;
	images: string[];
}

export interface ParseResult {
	ok: boolean;
	input?: PartInput;
	errors: Record<string, string>;
	values: PartFormValues;
}

export function emptyPartValues(): PartFormValues {
	return {
		name: '',
		part_number: '',
		description: '',
		price: '',
		condition: 'Genuine',
		oem: '',
		category_slug: '',
		brand_slug: '',
		in_stock: true,
		featured: false,
		published: true,
		images: []
	};
}

export function valuesFromPart(part: Part): PartFormValues {
	return {
		name: part.name,
		part_number: part.part_number,
		description: part.description,
		price: part.price != null ? String(part.price) : '',
		condition: part.condition,
		oem: part.oem ?? '',
		category_slug: part.category.slug,
		brand_slug: part.brand.slug,
		in_stock: part.in_stock,
		featured: part.featured,
		published: part.published,
		images: part.images
	};
}

/**
 * Validate the admin form and upload any newly attached files to Supabase
 * Storage. Runs in the browser — the staff member's own session is what
 * authorises the upload (see the storage policies in supabase/schema.sql).
 */
export async function parsePartForm(form: FormData): Promise<ParseResult> {
	const get = (k: string) => String(form.get(k) ?? '').trim();

	const values: PartFormValues = {
		name: get('name'),
		part_number: get('part_number'),
		description: get('description'),
		price: get('price'),
		condition: get('condition') || 'Genuine',
		oem: get('oem'),
		category_slug: get('category_slug'),
		brand_slug: get('brand_slug'),
		in_stock: form.get('in_stock') === 'on',
		featured: form.get('featured') === 'on',
		published: form.get('published') === 'on',
		images: form
			.getAll('images')
			.map(String)
			.map((s) => s.trim())
			.filter(Boolean)
	};

	const errors: Record<string, string> = {};
	if (!values.name) errors.name = 'Name is required.';
	if (!values.part_number) errors.part_number = 'Part number is required.';
	if (!categoryBySlug(values.category_slug)) errors.category_slug = 'Choose a category.';
	if (!brandBySlug(values.brand_slug)) errors.brand_slug = 'Choose a brand.';

	let price: number | null = null;
	if (values.price) {
		const n = Number(values.price.replace(/,/g, ''));
		if (Number.isNaN(n) || n < 0) errors.price = 'Enter a valid price, or leave blank.';
		else price = n;
	}

	const condition = (
		CONDITIONS.includes(values.condition as PartCondition) ? values.condition : 'Genuine'
	) as PartCondition;

	// Handle file uploads (Supabase Storage only; ignored in demo mode).
	const db = supabase();
	const files = form.getAll('files').filter((f): f is File => f instanceof File && f.size > 0);
	const uploaded: string[] = [];
	if (db && files.length) {
		for (const file of files) {
			if (!file.type.startsWith('image/')) {
				errors.images = 'Only image files can be uploaded.';
				continue;
			}
			if (file.size > 5 * 1024 * 1024) {
				errors.images = 'Each image must be under 5 MB.';
				continue;
			}
			const ext =
				(file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
			const path = `parts/${crypto.randomUUID()}.${ext}`;
			const { error } = await db.storage
				.from(PART_IMAGES_BUCKET)
				.upload(path, file, { contentType: file.type, upsert: false });
			if (error) {
				errors.images = `Upload failed: ${error.message}`;
				continue;
			}
			const { data } = db.storage.from(PART_IMAGES_BUCKET).getPublicUrl(path);
			uploaded.push(data.publicUrl);
		}
	}

	values.images = [...values.images, ...uploaded];

	if (Object.keys(errors).length) {
		return { ok: false, errors, values };
	}

	const input: PartInput = {
		name: values.name,
		part_number: values.part_number,
		description: values.description,
		price,
		condition,
		oem: values.oem || null,
		images: values.images,
		in_stock: values.in_stock,
		featured: values.featured,
		published: values.published,
		category_slug: values.category_slug,
		brand_slug: values.brand_slug
	};
	return { ok: true, input, errors: {}, values };
}
