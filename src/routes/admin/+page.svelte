<script lang="ts">
	import { url } from '$lib/paths';
	import Seo from '$lib/components/Seo.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import { taxonomy } from '$lib/taxonomy.svelte';
	import { listParts } from '$lib/db';
	import { resource } from '$lib/resource.svelte';
	import type { Part } from '$lib/types';

	const all = resource<Part[]>([], () => listParts({ sort: 'newest' }, { admin: true }));

	const stats = $derived({
		total: all.value.length,
		published: all.value.filter((p) => p.published).length,
		featured: all.value.filter((p) => p.featured).length,
		outOfStock: all.value.filter((p) => !p.in_stock).length
	});

	const byBrand = $derived(
		taxonomy.brands.map((b) => ({
			name: b.name,
			slug: b.slug,
			count: all.value.filter((p) => p.brand.slug === b.slug).length
		}))
	);

	const byCategory = $derived(
		taxonomy.categories.map((c) => ({
			name: c.name,
			slug: c.slug,
			icon: c.icon,
			count: all.value.filter((p) => p.category.slug === c.slug).length
		}))
	);

	const recent = $derived(all.value.slice(0, 6));

	/** Shortcuts to the screens staff reach for most often. */
	const quickLinks = [
		{ href: '/admin/parts/new', label: 'Add part', hint: 'List a new item', icon: 'plus' },
		{ href: '/admin/parts', label: 'Manage parts', hint: 'Edit the catalogue', icon: 'part' },
		{ href: '/admin/brands', label: 'Brands', hint: 'Vehicle brands', icon: 'truck' },
		{ href: '/admin/categories', label: 'Categories', hint: 'Part categories', icon: 'tag' }
	] as const;

	const cards = $derived([
		{ label: 'Total parts', value: stats.total, icon: 'part', accent: 'text-abk-blue bg-abk-sky' },
		{
			label: 'Published',
			value: stats.published,
			icon: 'check',
			accent: 'text-emerald-700 bg-emerald-50'
		},
		{
			label: 'Featured',
			value: stats.featured,
			icon: 'star',
			accent: 'text-abk-red bg-abk-red-soft'
		},
		{
			label: 'On backorder',
			value: stats.outOfStock,
			icon: 'alert',
			accent: 'text-amber-700 bg-amber-50'
		}
	]);

	const maxCat = $derived(Math.max(1, ...byCategory.map((c) => c.count)));
</script>

<Seo title="Dashboard" canonical="/admin" noindex />

<div class="flex flex-wrap items-center justify-between gap-3">
	<div>
		<h1 class="text-2xl font-black tracking-tight text-slate-800">Dashboard</h1>
		<p class="text-sm text-slate-500">Overview of your parts catalogue</p>
		<div class="rule-brand mt-2"></div>
	</div>
	<a
		href={url('/admin/parts/new')}
		class="inline-flex items-center gap-2 rounded-lg bg-abk-blue px-4 py-2.5 text-sm font-bold text-white transition hover:bg-abk-navy"
	>
		<Icon name="plus" size={16} /> Add part
	</a>
</div>

{#if all.error}
	<div class="mt-5 flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
		<Icon name="alert" size={16} />
		Couldn't load the catalogue: {all.error}
	</div>
{/if}

<!-- Quick links -->
<div class="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
	{#each quickLinks as link}
		<a
			href={url(link.href)}
			class="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-abk-blue hover:shadow-[var(--shadow-card)]"
		>
			<span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-abk-sky text-abk-blue">
				<Icon name={link.icon} size={18} />
			</span>
			<div class="min-w-0">
				<p class="font-semibold text-slate-800">{link.label}</p>
				<p class="truncate text-xs text-slate-500">{link.hint}</p>
			</div>
		</a>
	{/each}
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
			<p class="mt-3 text-3xl font-black text-slate-800">{all.loading ? '—' : c.value}</p>
			<p class="text-sm text-slate-500">{c.label}</p>
		</div>
	{/each}
</div>

<div class="mt-6 grid gap-6 lg:grid-cols-2">
	<!-- By category -->
	<div class="rounded-2xl border border-slate-200 bg-white p-6">
		<h2 class="text-sm font-bold uppercase tracking-wider text-slate-400">Parts by category</h2>
		<ul class="mt-4 space-y-3">
			{#each byCategory as cat}
				<li class="flex items-center gap-3 text-sm">
					<span
						class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-abk-sky text-abk-blue"
					>
						<Icon name={cat.icon} size={16} />
					</span>
					<span class="w-40 shrink-0 truncate font-medium text-slate-700">{cat.name}</span>
					<span class="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
						<span
							class="block h-full rounded-full bg-abk-blue transition-[width]"
							style="width: {(cat.count / maxCat) * 100}%"
						></span>
					</span>
					<span class="w-6 text-right font-bold text-slate-600">{cat.count}</span>
				</li>
			{/each}
		</ul>
	</div>

	<!-- By brand -->
	<div class="rounded-2xl border border-slate-200 bg-white p-6">
		<h2 class="text-sm font-bold uppercase tracking-wider text-slate-400">Parts by brand</h2>
		<div class="mt-4 grid grid-cols-2 gap-3">
			{#each byBrand as brand}
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
		<a href={url('/admin/parts')} class="text-sm font-bold text-abk-blue hover:underline">All parts →</a>
	</div>
	{#if all.loading}
		<p class="mt-4 text-sm text-slate-400">Loading…</p>
	{:else if !recent.length}
		<p class="mt-4 text-sm text-slate-400">No parts yet.</p>
	{:else}
		<ul class="mt-4 divide-y divide-slate-100">
			{#each recent as part (part.id)}
				<li>
					<a
						href={url(`/admin/parts/edit?id=${part.id}`)}
						class="flex items-center gap-3 py-3 hover:bg-slate-50"
					>
						<span class="w-28 shrink-0 font-mono text-xs text-slate-400">{part.part_number}</span>
						<span class="min-w-0 flex-1 truncate font-semibold text-slate-700">{part.name}</span>
						<span class="rounded bg-abk-sky px-2 py-0.5 text-[11px] font-bold text-abk-blue"
							>{part.brand.name}</span
						>
						{#if !part.published}
							<span class="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500"
								>Draft</span
							>
						{/if}
					</a>
				</li>
			{/each}
		</ul>
	{/if}
</div>
