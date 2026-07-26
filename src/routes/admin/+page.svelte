<script lang="ts">
	import type { PageData } from './$types';
	import Seo from '$lib/components/Seo.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import { formatPrice } from '$lib/utils';

	let { data }: { data: PageData } = $props();

	const cards = $derived([
		{ label: 'Total parts', value: data.stats.total, icon: 'part', accent: 'text-abk-blue bg-abk-sky' },
		{ label: 'Published', value: data.stats.published, icon: 'check', accent: 'text-emerald-700 bg-emerald-50' },
		{ label: 'Featured', value: data.stats.featured, icon: 'star', accent: 'text-abk-red bg-red-50' },
		{ label: 'On backorder', value: data.stats.outOfStock, icon: 'alert', accent: 'text-amber-700 bg-amber-50' }
	]);

	const maxCat = $derived(Math.max(1, ...data.byCategory.map((c) => c.count)));
</script>

<Seo title="Dashboard" canonical="/admin" noindex />

<div class="flex flex-wrap items-center justify-between gap-3">
	<div>
		<h1 class="text-2xl font-black tracking-tight text-slate-800">Dashboard</h1>
		<p class="text-sm text-slate-500">Overview of your parts catalogue</p>
	</div>
	<a
		href="/admin/parts/new"
		class="inline-flex items-center gap-2 rounded-lg bg-abk-blue px-4 py-2.5 text-sm font-bold text-white transition hover:bg-abk-navy"
	>
		<Icon name="plus" size={16} /> Add part
	</a>
</div>

<!-- Stat cards -->
<div class="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
	{#each cards as c}
		<div class="rounded-2xl border border-slate-200 bg-white p-5">
			<div class="flex items-center justify-between">
				<span class="flex h-9 w-9 items-center justify-center rounded-lg {c.accent}">
					<Icon name={c.icon} size={18} />
				</span>
			</div>
			<p class="mt-3 text-3xl font-black text-slate-800">{c.value}</p>
			<p class="text-sm text-slate-500">{c.label}</p>
		</div>
	{/each}
</div>

<div class="mt-6 grid gap-6 lg:grid-cols-2">
	<!-- By category -->
	<div class="rounded-2xl border border-slate-200 bg-white p-6">
		<h2 class="text-sm font-bold uppercase tracking-wider text-slate-400">Parts by category</h2>
		<ul class="mt-4 space-y-3">
			{#each data.byCategory as cat}
				<li>
					<a href={`/admin/parts?q=`} class="flex items-center gap-3 text-sm">
						<span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-abk-sky text-abk-blue">
							<Icon name={cat.icon} size={16} />
						</span>
						<span class="w-40 shrink-0 truncate font-medium text-slate-700">{cat.name}</span>
						<span class="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
							<span class="block h-full rounded-full bg-abk-blue" style="width: {(cat.count / maxCat) * 100}%"></span>
						</span>
						<span class="w-6 text-right font-bold text-slate-600">{cat.count}</span>
					</a>
				</li>
			{/each}
		</ul>
	</div>

	<!-- By brand -->
	<div class="rounded-2xl border border-slate-200 bg-white p-6">
		<h2 class="text-sm font-bold uppercase tracking-wider text-slate-400">Parts by brand</h2>
		<div class="mt-4 grid grid-cols-2 gap-3">
			{#each data.byBrand as brand}
				<div class="rounded-xl border border-slate-200 p-4">
					<p class="text-2xl font-black text-slate-800">{brand.count}</p>
					<p class="text-sm font-semibold text-slate-500">{brand.name}</p>
				</div>
			{/each}
		</div>
	</div>
</div>

<!-- Recent -->
<div class="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
	<div class="flex items-center justify-between">
		<h2 class="text-sm font-bold uppercase tracking-wider text-slate-400">Recently added</h2>
		<a href="/admin/parts" class="text-sm font-bold text-abk-blue hover:underline">All parts →</a>
	</div>
	<ul class="mt-4 divide-y divide-slate-100">
		{#each data.recent as part (part.id)}
			<li>
				<a href={`/admin/parts/${part.id}/edit`} class="flex items-center gap-3 py-3 hover:bg-slate-50">
					<span class="w-28 shrink-0 font-mono text-xs text-slate-400">{part.part_number}</span>
					<span class="min-w-0 flex-1 truncate font-semibold text-slate-700">{part.name}</span>
					<span class="hidden text-xs text-slate-400 sm:inline">{part.brand.name}</span>
					<span class="w-20 text-right text-sm font-bold text-slate-600">{formatPrice(part.price)}</span>
					{#if !part.published}
						<span class="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500">Draft</span>
					{/if}
				</a>
			</li>
		{/each}
	</ul>
</div>
