<script lang="ts">
	import { url } from '$lib/paths';
	import Seo from '$lib/components/Seo.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import {
		taxonomy,
		ICON_CHOICES,
		createCategory,
		updateCategory,
		deleteCategory
	} from '$lib/taxonomy.svelte';
	import { listParts } from '$lib/db';
	import { resource } from '$lib/resource.svelte';
	import type { Category, Part } from '$lib/types';

	// Counts need every part, published or not — this is the admin, and a
	// category with only drafts against it is still "in use" and should not be
	// deletable.
	const parts = resource<Part[]>([], () => listParts({}, { admin: true }));

	const counts = $derived.by(() => {
		const tally: Record<string, number> = {};
		for (const p of parts.value) tally[p.category.slug] = (tally[p.category.slug] ?? 0) + 1;
		return tally;
	});

	function nextSortOrder(): number {
		return taxonomy.categories.length
			? Math.max(...taxonomy.categories.map((c) => c.sort_order)) + 1
			: 1;
	}

	// The form above the table doubles as both "add" and "edit" — editingSlug
	// tracks which, so there is only one set of inputs and one save path to keep
	// in sync, rather than a second form that could drift from this one.
	let editingSlug = $state<string | null>(null);
	let name = $state('');
	let description = $state('');
	let icon = $state('part');
	let sortOrder = $state(nextSortOrder());
	let saving = $state(false);
	let error = $state<string | null>(null);
	let notice = $state<string | null>(null);

	function startEdit(category: Category) {
		editingSlug = category.slug;
		name = category.name;
		description = category.description;
		icon = category.icon;
		sortOrder = category.sort_order;
		error = null;
		notice = null;
	}

	function resetForm() {
		editingSlug = null;
		name = '';
		description = '';
		icon = 'part';
		sortOrder = nextSortOrder();
	}

	async function save(event: SubmitEvent) {
		event.preventDefault();
		saving = true;
		error = null;
		notice = null;
		try {
			const input = { name, description, icon, sort_order: sortOrder };
			if (editingSlug) {
				await updateCategory(editingSlug, input);
				notice = `Saved “${name.trim()}”.`;
			} else {
				await createCategory(input);
				notice = `Added “${name.trim()}”.`;
			}
			resetForm();
		} catch (e) {
			error = e instanceof Error ? e.message : String(e);
		} finally {
			saving = false;
		}
	}

	async function remove(category: Category) {
		if (!confirm(`Delete “${category.name}”? This cannot be undone.`)) return;
		error = null;
		notice = null;
		try {
			await deleteCategory(category.slug);
			if (editingSlug === category.slug) resetForm();
			notice = `Deleted “${category.name}”.`;
		} catch (e) {
			error = e instanceof Error ? e.message : String(e);
		}
	}
</script>

<Seo title="Categories" canonical="/admin/categories" noindex />

<div>
	<h1 class="text-2xl font-black tracking-tight text-slate-800">Categories</h1>
	<p class="text-sm text-slate-500">Part categories used across the catalogue</p>
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
		{editingSlug ? `Editing “${name}”` : 'Add a category'}
	</h2>
	<div class="mt-4 grid gap-4 sm:grid-cols-2">
		<div>
			<label for="cat-name" class="mb-1 block text-sm font-semibold text-slate-700">Name *</label>
			<input
				id="cat-name"
				required
				bind:value={name}
				placeholder="e.g. Filters"
				class="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-abk-blue"
			/>
		</div>
		<div>
			<label for="cat-sort" class="mb-1 block text-sm font-semibold text-slate-700">Sort order</label>
			<input
				id="cat-sort"
				type="number"
				step="1"
				bind:value={sortOrder}
				class="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-abk-blue"
			/>
		</div>
		<div class="sm:col-span-2">
			<label for="cat-description" class="mb-1 block text-sm font-semibold text-slate-700"
				>Description</label
			>
			<textarea
				id="cat-description"
				rows="2"
				bind:value={description}
				placeholder="What belongs in this category…"
				class="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-abk-blue"
			></textarea>
		</div>
		<div class="sm:col-span-2">
			<span class="mb-1 block text-sm font-semibold text-slate-700">Icon</span>
			<div class="flex flex-wrap gap-2">
				{#each ICON_CHOICES as choice}
					<button
						type="button"
						title={choice}
						aria-pressed={icon === choice}
						onclick={() => (icon = choice)}
						class="flex h-10 w-10 items-center justify-center rounded-lg border transition {icon ===
						choice
							? 'border-abk-blue bg-abk-sky text-abk-blue'
							: 'border-slate-200 text-slate-400 hover:border-slate-300 hover:text-slate-600'}"
					>
						<Icon name={choice} size={18} />
					</button>
				{/each}
			</div>
		</div>
		<div class="flex gap-2 sm:col-span-2">
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
	{#if taxonomy.categories.length === 0}
		<div class="py-16 text-center text-sm font-semibold text-slate-400">No categories yet.</div>
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
				{#each taxonomy.categories as category (category.slug)}
					{@const count = counts[category.slug] ?? 0}
					<tr class="hover:bg-slate-50">
						<td class="px-4 py-3">
							<div class="flex items-center gap-2.5">
								<span
									class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-abk-sky text-abk-blue"
								>
									<Icon name={category.icon} size={16} />
								</span>
								<span class="font-semibold text-slate-800">{category.name}</span>
							</div>
						</td>
						<td class="hidden px-4 py-3 font-mono text-xs text-slate-400 sm:table-cell"
							>{category.slug}</td
						>
						<td class="px-4 py-3 text-slate-500">{category.sort_order}</td>
						<td class="px-4 py-3 text-slate-600">
							{parts.loading ? '—' : `${count} part${count === 1 ? '' : 's'}`}
						</td>
						<td class="px-4 py-3 text-right">
							<div class="flex items-center justify-end gap-1">
								<button
									type="button"
									title="Edit"
									onclick={() => startEdit(category)}
									class="rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-abk-blue"
								>
									<Icon name="edit" size={16} />
								</button>
								<button
									type="button"
									title={count > 0
										? 'This category still has parts assigned to it. Move or delete those parts first.'
										: 'Delete'}
									disabled={count > 0}
									onclick={() => remove(category)}
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
	A category's slug is set once, from its name, and never changes — every part refers to it, so
	editing here only ever updates the display name, description, icon and order, not the id.
</p>

<p class="mt-6 text-sm">
	<a href={url('/admin')} class="font-semibold text-abk-blue hover:underline">← Back to dashboard</a>
</p>
