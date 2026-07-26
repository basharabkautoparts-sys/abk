import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { deletePart, listParts } from '$lib/server/db';

export const load: PageServerLoad = async ({ locals, url }) => {
	const q = url.searchParams.get('q')?.trim() ?? '';
	const parts = await listParts(locals.supabase, { q: q || undefined, sort: 'newest' }, { admin: true });
	return { parts, q };
};

export const actions: Actions = {
	delete: async ({ request, locals }) => {
		const form = await request.formData();
		const id = String(form.get('id') ?? '');
		if (!id) return fail(400, { error: 'Missing part id.' });
		await deletePart(locals.supabase, id);
		return { deleted: true };
	}
};
