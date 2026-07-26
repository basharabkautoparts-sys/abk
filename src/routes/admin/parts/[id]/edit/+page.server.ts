import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { deletePart, getPartById, updatePart } from '$lib/server/db';
import { parsePartForm, type PartFormValues } from '$lib/server/partForm';

export const load: PageServerLoad = async ({ locals, params }) => {
	const part = await getPartById(locals.supabase, params.id);
	if (!part) throw error(404, 'Part not found');

	const values: PartFormValues = {
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

	return { part, values };
};

export const actions: Actions = {
	update: async ({ request, locals, params }) => {
		const result = await parsePartForm(request, locals.supabase);
		if (!result.ok) {
			return fail(400, { errors: result.errors, values: result.values });
		}
		await updatePart(locals.supabase, params.id, result.input!);
		throw redirect(303, '/admin/parts?updated=1');
	},
	delete: async ({ locals, params }) => {
		await deletePart(locals.supabase, params.id);
		throw redirect(303, '/admin/parts?deleted=1');
	}
};
