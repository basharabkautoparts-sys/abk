<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import Seo from '$lib/components/Seo.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import PartForm from '$lib/components/PartForm.svelte';
	import { parsePartForm, valuesFromPart } from '$lib/partForm';
	import { deletePart, getPartById, updatePart } from '$lib/db';
	import { resource } from '$lib/resource.svelte';
	import { searchParams } from '$lib/query';
	import { demoMode } from '$lib/auth.svelte';
	import type { Part } from '$lib/types';

	// The id travels in the query string rather than the path: every route has to
	// be prerenderable for a static host, and `/admin/parts/[id]/edit` has no
	// knowable set of ids at build time.
	const id = $derived(searchParams(page.url).get('id') ?? '');

	const part = resource<Part | null>(null, () => (id ? getPartById(id) : Promise.resolve(null)));

	let deleting = $state(false);

	async function save(form: FormData) {
		const result = await parsePartForm(form);
		if (!result.ok) return result.errors;
		await updatePart(id, result.input!);
		await goto('/admin/parts', { invalidateAll: true });
	}

	async function remove() {
		const current = part.value;
		if (!current) return;
		if (!confirm(`Delete “${current.name}”? This cannot be undone.`)) return;
		deleting = true;
		try {
			await deletePart(current.id);
			await goto('/admin/parts', { invalidateAll: true });
		} finally {
			deleting = false;
		}
	}
</script>

<Seo title={part.value ? `Edit ${part.value.name}` : 'Edit Part'} canonical="/admin/parts" noindex />

<nav class="mb-4 flex items-center gap-1.5 text-sm text-slate-500">
	<a href="/admin/parts" class="hover:text-abk-blue">Parts</a>
	<Icon name="chevron" size={14} />
	<span class="truncate text-slate-800">{part.value?.name ?? 'Edit'}</span>
</nav>

{#if part.loading}
	<p class="text-sm font-semibold text-slate-400">Loading part…</p>
{:else if part.error}
	<div class="flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
		<Icon name="alert" size={16} />
		{part.error}
	</div>
{:else if !part.value}
	<div class="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center">
		<p class="font-semibold text-slate-700">That part no longer exists.</p>
		<a
			href="/admin/parts"
			class="mt-4 inline-block rounded-lg bg-abk-blue px-4 py-2 text-sm font-bold text-white"
		>
			Back to parts
		</a>
	</div>
{:else}
	<div class="mb-6 flex flex-wrap items-center justify-between gap-3">
		<h1 class="text-2xl font-black tracking-tight text-slate-800">Edit part</h1>
		<a
			href={`/parts/${part.value.slug}`}
			target="_blank"
			class="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-abk-blue"
		>
			View on site <Icon name="arrow" size={15} />
		</a>
	</div>

	{#key part.value.id}
		<PartForm
			values={valuesFromPart(part.value)}
			submitLabel="Save changes"
			{demoMode}
			{save}
		/>
	{/key}

	<!-- Danger zone -->
	<div class="mt-8 rounded-2xl border border-red-200 bg-red-50/40 p-6">
		<h2 class="text-sm font-bold uppercase tracking-wider text-red-500">Danger zone</h2>
		<div class="mt-3 flex flex-wrap items-center justify-between gap-4">
			<p class="text-sm text-slate-600">Permanently delete this part from the catalogue.</p>
			<button
				type="button"
				disabled={deleting}
				onclick={remove}
				class="inline-flex items-center gap-2 rounded-lg border border-red-300 bg-white px-4 py-2.5 text-sm font-bold text-abk-red hover:bg-red-50 disabled:opacity-60"
			>
				<Icon name="trash" size={16} />
				{deleting ? 'Deleting…' : 'Delete part'}
			</button>
		</div>
	</div>
{/if}
