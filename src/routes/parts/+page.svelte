<script lang="ts">
	import type { PageData } from './$types';
	import { brands, categories, categoryBySlug, brandBySlug } from '$lib/config';
	import Seo from '$lib/components/Seo.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import PartCard from '$lib/components/PartCard.svelte';
	import { breadcrumbJsonLd } from '$lib/seo';

	let { data }: { data: PageData } = $props();

	const activeCategory = $derived(data.filters.category ? categoryBySlug(data.filters.category) : null);
	const activeBrand = $derived(data.filters.brand ? brandBySlug(data.filters.brand) : null);

	const heading = $derived(
		data.filters.q
			? `Search: “${data.filters.q}”`
			: activeCategory
				? activeCategory.name
				: activeBrand
					? `${activeBrand.name} Parts`
					: 'All Parts'
	);

	const seoDescription = $derived(
		activeCategory
			? `${activeCategory.description} Genuine parts for Toyota, Isuzu, Mitsubishi and Nissan from ABK Auto Parts.`
			: activeBrand
				? `Genuine ${activeBrand.name} auto parts — engine, brake, suspension, filters and more — from ABK Auto Parts.`
				: 'Browse the full ABK Auto Parts catalogue of 100% genuine Japanese auto parts.'
	);

	/** Build a /parts URL from the current filters with overrides applied. */
	function buildUrl(overrides: Partial<typeof data.filters>): string {
		const f = { ...data.filters, ...overrides };
		const p = new URLSearchParams();
		if (f.q) p.set('q', f.q);
		if (f.category) p.set('category', f.category);
		if (f.brand) p.set('brand', f.brand);
		if (f.sort && f.sort !== 'newest') p.set('sort', f.sort);
		const qs = p.toString();
		return qs ? `/parts?${qs}` : '/parts';
	}

	const canonical = $derived(
		data.filters.q ? '/parts' : buildUrl({ q: '', sort: 'newest' })
	);
</script>

<Seo
	title={heading}
	canonical={canonical}
	description={seoDescription}
	noindex={Boolean(data.filters.q)}
	jsonLd={[
		breadcrumbJsonLd([
			{ name: 'Home', url: '/' },
			{ name: 'Parts', url: '/parts' },
			...(activeCategory ? [{ name: activeCategory.name, url: `/parts?category=${activeCategory.slug}` }] : [])
		])
	]}
/>

<!-- Page header -->
<section class="brand-gradient text-white">
	<div class="container-page py-10">
		<nav class="mb-3 flex items-center gap-1.5 text-sm text-white/70" aria-label="Breadcrumb">
			<a href="/" class="hover:text-white">Home</a>
			<Icon name="chevron" size={14} />
			<a href="/parts" class="hover:text-white">Parts</a>
			{#if activeCategory}
				<Icon name="chevron" size={14} />
				<span class="text-white">{activeCategory.name}</span>
			{/if}
		</nav>
		<h1 class="text-3xl font-black tracking-tight sm:text-4xl">{heading}</h1>
		<p class="mt-2 text-white/80">
			{data.parts.length} part{data.parts.length === 1 ? '' : 's'}
			{activeBrand && !activeCategory ? '' : ''} available
		</p>
	</div>
</section>

<div class="container-page grid gap-8 py-10 lg:grid-cols-[220px_1fr]">
	<!-- Sidebar filters -->
	<aside class="lg:sticky lg:top-24 lg:self-start">
		<form method="GET" action="/parts" class="space-y-6">
			<!-- keep search term when changing filters -->
			{#if data.filters.q}<input type="hidden" name="q" value={data.filters.q} />{/if}
			<input type="hidden" name="sort" value={data.filters.sort} />

			<div>
				<h2 class="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">Search</h2>
				<div class="relative">
					<span class="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
						<Icon name="search" size={16} />
					</span>
					<input
						type="search"
						name="q"
						value={data.filters.q}
						placeholder="Name or part no…"
						class="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-abk-blue"
					/>
				</div>
			</div>

			<div>
				<h2 class="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">Category</h2>
				<ul class="space-y-0.5 text-sm">
					<li>
						<a
							href={buildUrl({ category: '' })}
							class="flex items-center justify-between rounded-md px-2.5 py-1.5 {!data.filters
								.category
								? 'bg-abk-sky font-semibold text-abk-blue'
								: 'text-slate-600 hover:bg-slate-50'}"
						>
							All categories
						</a>
					</li>
					{#each categories as cat}
						<li>
							<a
								href={buildUrl({ category: cat.slug })}
								class="flex items-center justify-between rounded-md px-2.5 py-1.5 {data.filters
									.category === cat.slug
									? 'bg-abk-sky font-semibold text-abk-blue'
									: 'text-slate-600 hover:bg-slate-50'}"
							>
								<span>{cat.name}</span>
								<span class="text-xs text-slate-400">{data.counts[cat.slug] ?? 0}</span>
							</a>
						</li>
					{/each}
				</ul>
			</div>

			<div>
				<h2 class="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">Brand</h2>
				<ul class="space-y-0.5 text-sm">
					<li>
						<a
							href={buildUrl({ brand: '' })}
							class="block rounded-md px-2.5 py-1.5 {!data.filters.brand
								? 'bg-abk-sky font-semibold text-abk-blue'
								: 'text-slate-600 hover:bg-slate-50'}"
						>
							All brands
						</a>
					</li>
					{#each brands as brand}
						<li>
							<a
								href={buildUrl({ brand: brand.slug })}
								class="block rounded-md px-2.5 py-1.5 {data.filters.brand === brand.slug
									? 'bg-abk-sky font-semibold text-abk-blue'
									: 'text-slate-600 hover:bg-slate-50'}"
							>
								{brand.name}
							</a>
						</li>
					{/each}
				</ul>
			</div>

			<noscript>
				<button
					type="submit"
					class="w-full rounded-lg bg-abk-blue px-4 py-2 text-sm font-bold text-white"
					>Apply search</button
				>
			</noscript>
		</form>
	</aside>

	<!-- Results -->
	<div>
		<div class="mb-5 flex flex-wrap items-center justify-between gap-3">
			<div class="flex flex-wrap gap-2">
				{#if activeCategory}
					<a
						href={buildUrl({ category: '' })}
						class="inline-flex items-center gap-1.5 rounded-full bg-abk-sky px-3 py-1 text-xs font-semibold text-abk-blue"
					>
						{activeCategory.name}
						<Icon name="close" size={13} />
					</a>
				{/if}
				{#if activeBrand}
					<a
						href={buildUrl({ brand: '' })}
						class="inline-flex items-center gap-1.5 rounded-full bg-abk-sky px-3 py-1 text-xs font-semibold text-abk-blue"
					>
						{activeBrand.name}
						<Icon name="close" size={13} />
					</a>
				{/if}
				{#if data.filters.q}
					<a
						href={buildUrl({ q: '' })}
						class="inline-flex items-center gap-1.5 rounded-full bg-abk-sky px-3 py-1 text-xs font-semibold text-abk-blue"
					>
						“{data.filters.q}”
						<Icon name="close" size={13} />
					</a>
				{/if}
			</div>

			<div class="flex items-center gap-2 text-sm">
				<span class="text-slate-400">Sort</span>
				<div class="flex overflow-hidden rounded-lg border border-slate-200">
					{#each [{ v: 'newest', l: 'Newest' }, { v: 'name', l: 'Name' }] as opt}
						<a
							href={buildUrl({ sort: opt.v as typeof data.filters.sort })}
							class="px-3 py-1.5 text-xs font-semibold {data.filters.sort === opt.v
								? 'bg-abk-blue text-white'
								: 'bg-white text-slate-600 hover:bg-slate-50'}"
						>
							{opt.l}
						</a>
					{/each}
				</div>
			</div>
		</div>

		{#if data.parts.length}
			<div class="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
				{#each data.parts as part, i (part.id)}
					<PartCard {part} eager={i < 4} />
				{/each}
			</div>
		{:else}
			<div class="rounded-xl border border-dashed border-slate-300 bg-slate-50 py-20 text-center">
				<div class="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white text-slate-300">
					<Icon name="search" size={28} />
				</div>
				<h3 class="mt-4 text-lg font-bold text-slate-700">No parts found</h3>
				<p class="mt-1 text-sm text-slate-500">Try clearing filters or contact us — we source parts on request.</p>
				<div class="mt-5 flex justify-center gap-3">
					<a href="/parts" class="rounded-full bg-abk-blue px-5 py-2 text-sm font-bold text-white">
						Clear filters
					</a>
				</div>
			</div>
		{/if}
	</div>
</div>
