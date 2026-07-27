<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData } from './$types';
	import Seo from '$lib/components/Seo.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import PartImage from '$lib/components/PartImage.svelte';

	let { data }: { data: PageData } = $props();
</script>

<Seo title="Manage Parts" canonical="/admin/parts" noindex />

<div class="flex flex-wrap items-center justify-between gap-3">
	<div>
		<h1 class="text-2xl font-black tracking-tight text-slate-800">Parts</h1>
		<p class="text-sm text-slate-500">{data.parts.length} item{data.parts.length === 1 ? '' : 's'}</p>
	</div>
	<a
		href="/admin/parts/new"
		class="inline-flex items-center gap-2 rounded-lg bg-abk-blue px-4 py-2.5 text-sm font-bold text-white transition hover:bg-abk-navy"
	>
		<Icon name="plus" size={16} /> Add part
	</a>
</div>

<form method="GET" class="mt-5" role="search">
	<div class="relative max-w-md">
		<span class="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
			<Icon name="search" size={16} />
		</span>
		<input
			type="search"
			name="q"
			value={data.q}
			placeholder="Search name or part number…"
			class="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-abk-blue"
		/>
	</div>
</form>

<div class="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white">
	{#if data.parts.length}
		<div class="overflow-x-auto">
			<table class="w-full text-left text-sm">
				<thead class="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
					<tr>
						<th class="px-4 py-3 font-semibold">Part</th>
						<th class="px-4 py-3 font-semibold">Vehicle brand</th>
						<th class="hidden px-4 py-3 font-semibold lg:table-cell">Category</th>
						<th class="px-4 py-3 font-semibold">Status</th>
						<th class="px-4 py-3 text-right font-semibold">Actions</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-slate-100">
					{#each data.parts as part (part.id)}
						<tr class="hover:bg-slate-50">
							<td class="px-4 py-3">
								<div class="flex items-center gap-3">
									<div class="h-11 w-11 shrink-0 overflow-hidden rounded-lg border border-slate-200">
										<PartImage {part} />
									</div>
									<div class="min-w-0">
										<p class="truncate font-semibold text-slate-800">{part.name}</p>
										<p class="font-mono text-xs text-slate-400">{part.part_number}</p>
									</div>
								</div>
							</td>
							<td class="px-4 py-3">
								<span
									class="inline-flex items-center gap-1.5 rounded-full bg-abk-rose px-2.5 py-1 text-xs font-bold text-abk-red"
								>
									<Icon name="car" size={13} />
									{part.brand.name}
								</span>
							</td>
							<td class="hidden px-4 py-3 text-slate-600 lg:table-cell">{part.category.name}</td>
							<td class="px-4 py-3">
								<div class="flex flex-wrap gap-1">
									{#if part.published}
										<span class="rounded bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700">Live</span>
									{:else}
										<span class="rounded bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-500">Draft</span>
									{/if}
									{#if part.featured}
										<span class="rounded bg-abk-rose px-2 py-0.5 text-[11px] font-bold text-abk-red">Featured</span>
									{/if}
									{#if !part.in_stock}
										<span class="rounded bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-700">Backorder</span>
									{/if}
								</div>
							</td>
							<td class="px-4 py-3">
								<div class="flex items-center justify-end gap-1">
									<a
										href={`/parts/${part.slug}`}
										target="_blank"
										title="View on site"
										class="rounded-md p-2 text-slate-400 hover:bg-slate-100 hover:text-abk-blue"
									>
										<Icon name="arrow" size={16} />
									</a>
									<a
										href={`/admin/parts/${part.id}/edit`}
										title="Edit"
										class="rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-abk-blue"
									>
										<Icon name="edit" size={16} />
									</a>
									<form
										method="POST"
										action="?/delete"
										use:enhance={() =>
											async ({ update }) => {
												await update();
											}}
										onsubmit={(e) => {
											if (!confirm(`Delete “${part.name}”? This cannot be undone.`)) e.preventDefault();
										}}
									>
										<input type="hidden" name="id" value={part.id} />
										<button
											type="submit"
											title="Delete"
											class="rounded-md p-2 text-slate-400 hover:bg-abk-rose hover:text-abk-red"
										>
											<Icon name="trash" size={16} />
										</button>
									</form>
								</div>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{:else}
		<div class="py-16 text-center">
			<div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
				<Icon name="part" size={24} />
			</div>
			<p class="mt-3 font-semibold text-slate-700">
				{data.q ? `No parts match “${data.q}”.` : 'No parts yet.'}
			</p>
			<a href="/admin/parts/new" class="mt-4 inline-block rounded-lg bg-abk-blue px-4 py-2 text-sm font-bold text-white">
				Add your first part
			</a>
		</div>
	{/if}
</div>
