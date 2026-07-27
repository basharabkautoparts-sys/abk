import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { emptyPartValues, parsePartForm } from '$lib/server/partForm';
import { createPart } from '$lib/server/db';

export const load: PageServerLoad = async () => {
	return { values: emptyPartValues() };
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const result = await parsePartForm(request, locals.supabase);
		if (!result.ok) {
			return fail(400, { errors: result.errors, values: result.values });
		}
		const part = await createPart(locals.supabase, result.input!);
		throw redirect(303, `/admin/parts?created=${encodeURIComponent(part.name)}`);
	}
};
