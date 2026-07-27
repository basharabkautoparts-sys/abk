<script lang="ts">
	import { url } from '$lib/paths';
	import Seo from '$lib/components/Seo.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import { taxonomy, createBrand, updateBrand, deleteBrand } from '$lib/taxonomy.svelte';
	import { listParts } from '$lib/db';
	import { resource } from '$lib/resource.svelte';
	import type { Brand, Part } from '$lib/types';

	// Counts need every part, published or not — this is the admin, and a brand
	// with only drafts against it is still "in use" and should not be deletable.
	const parts = resource<Part[]>([], () => listParts({}, { admin: true }));

	const counts = $derived.by(() => {
		const tally: Record<string, number> = {};
		for (const p of parts.value) tally[p.brand.slug] = (tally[p.brand.slug] ?? 0) + 1;
		return tally;
	});

	function nextSortOrder(): number {
		return taxonomy.brands.length
			? Math.max(...taxonomy.brands.map((b) => b.sort_order)) + 1
			: 1;
	}

	// The form above the table doubles as both "add" and "edit" — editingSlug
	// tracks which, so there is only one set of inputs and one save path to keep
	// in sync, rather than a second form that could drift from this one.
	let editingSlug = $state<string | null>(null);
	let name = $state('');
	let sortOrder = $state(nextSortOrder());
	let saving = $state(false);
	let error = $state<string | null>(null);
	let notice = $state<string | null>(null);

	function startEdit(brand: Brand) {
		editingSlug = brand.slug;
		name = brand.name;
		sortOrder = brand.sort_order;
		error = null;
		notice = null;
	}

	function resetForm() {
		editingSlug = null;
		name = '';
		sortOrder = nextSortOrder();
	}

	async function save(event: SubmitEvent) {
		event.preventDefault();
		saving = true;
		error = null;
		notice = null;
		try {
			const input = { name, sort_order: sortOrder };
			if (editingSlug) {
				await updateBrand(editingSlug, input);
				notice = `Saved “${name.trim()}”.`;
			} else {
				await createBrand(input);
				notice = `Added “${name.trim()}”.`;
			}
			resetForm();
		} catch (e) {
			error = e instanceof Error ? e.message : String(e);
		} finally {
			saving = false;
		}
	}

	async function remove(brand: Brand) {
		if (!confirm(`Delete “${brand.name}”? This cannot be undone.`)) return;
		error = null;
		notice = null;
		try {
			await deleteBrand(brand.slug);
			if (editingSlug === brand.slug) resetForm();
			notice = `Deleted “${brand.name}”.`;
		} catch (e) {
			error = e instanceof Error ? e.message : String(e);
		}
	}
</script>

<Seo title="Brands" canonical="/admin/brands" noindex />

<div>
	<h1 class="text-2xl font-black tracking-tight text-slate-800">Brands</h1>
	<p class="text-sm text-slate-500">Vehicle brands parts are catalogued under</p>
	<div class="rule-brand mt-2"></div>
</div>

{#if error}
	<div class="mt-5 flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
		<Icon name="alert" size={16} />
		{error}
	</div>
{/if}
{#if notice}
	<div class="mt-5 flex items-center gap-2 rounded-lg bg-slate-800 px-4 py-3 text-sm font-medium text-white">
		<Icon name="check" size={16} />
		{notice}
	</div>
{/if}

<!-- Add / edit -->
<form class="mt-6 rounded-2xl border border-slate-200 bg-white p-6" onsubmit={save}>
	<h2 class="text-sm font-bold uppercase tracking-wider text-slate-400">
		{editingSlug ? `Editing “${name}”` : 'Add a brand'}
	</h2>
	<div class="mt-4 grid gap-4 sm:grid-cols-[1fr_8rem_auto] sm:items-end">
		<div>
			<label for="brand-name" class="mb-1 block text-sm font-semibold text-slate-700">Name *</label>
			<input
				id="brand-name"
				required
				bind:value={name}
				placeholder="e.g. Toyota"
				class="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-abk-blue"
			/>
		</div>
		<div>
			<label for="brand-sort" class="mb-1 block text-sm font-semibold text-slate-700">Sort order</label>
			<input
				id="brand-sort"
				type="number"
				step="1"
				bind:value={sortOrder}
				class="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-abk-blue"
			/>
		</div>
		<div class="flex gap-2">
			<button
				type="submit"
				disabled={saving}
				class="inline-flex items-center justify-center gap-2 rounded-lg bg-abk-blue px-5 py-2.5 text-sm font-bold text-white transition hover:bg-abk-navy disabled:opacity-60"
			>
				<Icon name={editingSlug ? 'check' : 'plus'} size={16} />
				{saving ? 'Saving…' : editingSlug ? 'Save' : 'Add'}
			</button>
			{#if editingSlug}
				<button
					type="button"
					onclick={resetForm}
					class="rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-500 hover:text-slate-800"
				>
					Cancel
				</button>
			{/if}
		</div>
	</div>
</form>

<!-- List -->
<div class="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
	{#if taxonomy.brands.length === 0}
		<div class="py-16 text-center text-sm font-semibold text-slate-400">No brands yet.</div>
	{:else}
		<table class="w-full text-left text-sm">
			<thead class="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
				<tr>
					<th class="px-4 py-3 font-semibold">Name</th>
					<th class="hidden px-4 py-3 font-semibold sm:table-cell">Slug</th>
					<th class="px-4 py-3 font-semibold">Sort</th>
					<th class="px-4 py-3 font-semibold">Parts</th>
					<th class="px-4 py-3 text-right font-semibold">Actions</th>
				</tr>
			</thead>
			<tbody class="divide-y divide-slate-100">
				{#each taxonomy.brands as brand (brand.slug)}
					{@const count = counts[brand.slug] ?? 0}
					<tr class="hover:bg-slate-50">
						<td class="px-4 py-3 font-semibold text-slate-800">{brand.name}</td>
						<td class="hidden px-4 py-3 font-mono text-xs text-slate-400 sm:table-cell">{brand.slug}</td>
						<td class="px-4 py-3 text-slate-500">{brand.sort_order}</td>
						<td class="px-4 py-3 text-slate-600">
							{parts.loading ? '—' : `${count} part${count === 1 ? '' : 's'}`}
						</td>
						<td class="px-4 py-3 text-right">
							<div class="flex items-center justify-end gap-1">
								<button
									type="button"
									title="Edit"
									onclick={() => startEdit(brand)}
									class="rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-abk-blue"
								>
									<Icon name="edit" size={16} />
								</button>
								<button
									type="button"
									title={count > 0
										? 'This brand still has parts assigned to it. Move or delete those parts first.'
										: 'Delete'}
									disabled={count > 0}
									onclick={() => remove(brand)}
									class="rounded-md p-2 text-slate-400 hover:bg-red-50 hover:text-abk-red disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400"
								>
									<Icon name="trash" size={16} />
								</button>
							</div>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	{/if}
</div>

<p class="mt-4 text-xs text-slate-400">
	A brand's slug is set once, from its name, and never changes — every part refers to it, so
	editing here only ever updates the display name, not the id.
</p>

<p class="mt-6 text-sm">
	<a href={url('/admin')} class="font-semibold text-abk-blue hover:underline">← Back to dashboard</a>
</p>
