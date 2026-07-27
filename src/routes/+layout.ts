import type { LayoutLoad } from './$types';
import { isSupabaseConfigured } from '$lib/supabase';
import { ensureTaxonomy } from '$lib/taxonomy.svelte';

/**
 * Everything is prerendered to static HTML at build time. Individual routes opt
 * out below where that is impossible (the admin, which is browser-only).
 */
export const prerender = true;

/**
 * Emit `parts/index.html` rather than `parts.html`. `/parts` is both a page and
 * the parent of `/parts/[slug]`, so the flat layout would ask a static host to
 * resolve `/parts` against both a file and a directory of the same name —
 * ambiguous, and resolved differently by different hosts. Directory-with-index
 * is unambiguous everywhere.
 */
export const trailingSlash = 'always';

/**
 * Load the brand/category taxonomy before anything renders. Every page reads it
 * — navigation, filters, category cards — so resolving it once here, above all
 * of them, is what lets components treat it as plain synchronous data. During
 * the build this bakes the live lists into the static HTML; in the browser it
 * runs once on hydration.
 */
export const load: LayoutLoad = async () => {
	await ensureTaxonomy();
	return { demoMode: !isSupabaseConfigured };
};
