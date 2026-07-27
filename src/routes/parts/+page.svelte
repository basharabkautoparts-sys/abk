<script lang="ts">
	import { url } from '$lib/paths';
	import { untrack } from 'svelte';
	import type { PageData } from './$types';
	import { taxonomy, categoryBySlug, brandBySlug } from '$lib/taxonomy.svelte';
	import Seo from '$lib/components/Seo.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import PartCard from '$lib/components/PartCard.svelte';
	import { breadcrumbJsonLd } from '$lib/seo';
	import { filterParts } from '$lib/db';
	import { searchParams } from '$lib/query';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';

	let { data }: { data: PageData } = $props();

	const SORTS = ['newest', 'name', 'brand'] as const;
	type Sort = (typeof SORTS)[number];

	/**
	 * A static host cannot vary a response by query string, so the page ships
	 * with the whole published catalogue and narrows it here instead.
	 */
	const urlFilters = $derived.by(() => {
		const p = searchParams(page.url);
		const sort = p.get('sort') ?? 'newest';
		return {
			q: p.get('q')?.trim() ?? '',
			category: p.get('category') ?? '',
			brand: p.get('brand') ?? '',
			sort: (SORTS.includes(sort as Sort) ? sort : 'newest') as Sort
		};
	});

	/**
	 * The search box owns the term, rather than reading it back out of the URL:
	 * the URL update is a best-effort mirror (it can be dropped if a navigation
	 * is already in flight), and results must never depend on that landing.
	 * Category, brand and sort stay URL-driven — they are plain links.
	 */
	let searchTerm = $state(untrack(() => urlFilters.q));
	let lastUrlQuery = untrack(() => urlFilters.q);

	$effect(() => {
		// Adopt the URL's term when it changes underneath us — a header search,
		// a shared link, or the back button.
		if (urlFilters.q !== lastUrlQuery) {
			lastUrlQuery = urlFilters.q;
			searchTerm = urlFilters.q;
		}
	});

	const filters = $derived({ ...urlFilters, q: searchTerm });

	const parts = $derived(
		filterParts(data.parts, {
			q: filters.q || undefined,
			category: filters.category || undefined,
			brand: filters.brand || undefined,
			sort: filters.sort
		})
	);

	const activeCategory = $derived(filters.category ? categoryBySlug(filters.category) : null);
	const activeBrand = $derived(filters.brand ? brandBySlug(filters.brand) : null);

	const heading = $derived(
		filters.q
			? `Search: “${filters.q}”`
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
	function buildUrl(overrides: Partial<typeof filters>): string {
		const f = { ...filters, ...overrides };
		const p = new URLSearchParams();
		if (f.q) p.set('q', f.q);
		if (f.category) p.set('category', f.category);
		if (f.brand) p.set('brand', f.brand);
		if (f.sort && f.sort !== 'newest') p.set('sort', f.sort);
		const qs = p.toString();
		return qs ? `/parts/?${qs}` : '/parts/';
	}

	const canonical = $derived(filters.q ? '/parts' : buildUrl({ q: '', sort: 'newest' }));

	// Filter on every keystroke; mirror into the URL a beat later so the view
	// stays shareable. Without JS the form submits normally and the page
	// reloads with ?q= applied.
	let searchTimer: ReturnType<typeof setTimeout>;
	function onSearchInput(event: Event) {
		searchTerm = (event.currentTarget as HTMLInputElement).value;
		clearTimeout(searchTimer);
		searchTimer = setTimeout(() => {
			lastUrlQuery = searchTerm.trim();
			goto(url(buildUrl({ q: searchTerm.trim() })), {
				keepFocus: true,
				noScroll: true,
				replaceState: true
			});
		}, 250);
	}

	function clearSearch() {
		clearTimeout(searchTimer);
		searchTerm = '';
		lastUrlQuery = '';
		goto(url(buildUrl({ q: '' })), { keepFocus: true, noScroll: true, replaceState: true });
	}
</script>

<Seo
	title={heading}
	{canonical}
	description={seoDescription}
	noindex={Boolean(filters.q)}
	jsonLd={[
		breadcrumbJsonLd([
			{ name: 'Home', url: '/' },
			{ name: 'Parts', url: '/parts' },
			...(activeCategory
				? [{ name: activeCategory.name, url: `/parts?category=${activeCategory.slug}` }]
				: [])
		])
	]}
/>

<!-- Page header -->
<section class="brand-gradient text-white">
	<div class="container-page py-10">
		<nav class="mb-3 flex items-center gap-1.5 text-sm text-white/70" aria-label="Breadcrumb">
			<a href={url('/')} class="hover:text-white">Home</a>
			<Icon name="chevron" size={14} />
			<a href={url('/parts')} class="hover:text-white">Parts</a>
			{#if activeCategory}
				<Icon name="chevron" size={14} />
				<span class="text-white">{activeCategory.name}</span>
			{/if}
			{#if activeBrand}
				<Icon name="chevron" size={14} />
				<span class="text-white">{activeBrand.name}</span>
			{/if}
		</nav>
		<h1 class="text-3xl font-black tracking-tight sm:text-4xl">{heading}</h1>
		<p class="mt-2 text-white/80">
			{parts.length} part{parts.length === 1 ? '' : 's'} available
			<!-- The heading above collapses to the category name when both a category
			     and a brand are active, so the brand filter needs its own callout here
			     — otherwise it is only visible as a removable chip further down. -->
			{#if activeBrand}
				for <span class="font-bold text-white">{activeBrand.name}</span>
			{/if}
		</p>
	</div>
</section>

<div class="container-page grid gap-8 py-10 lg:grid-cols-[220px_1fr]">
	<!-- Sidebar filters -->
	<aside class="lg:sticky lg:top-24 lg:self-start">
		<form method="GET" action={url('/parts/')} class="space-y-6">
			<!-- keep the other filters when submitting without JS -->
			{#if filters.category}<input type="hidden" name="category" value={filters.category} />{/if}
			{#if filters.brand}<input type="hidden" name="brand" value={filters.brand} />{/if}
			<input type="hidden" name="sort" value={filters.sort} />

			<div>
				<div class="rule-brand mb-2"></div>
				<h2 class="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">Search</h2>
				<div class="relative">
					<span class="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
						<Icon name="search" size={16} />
					</span>
					<input
						type="search"
						name="q"
						value={searchTerm}
						oninput={onSearchInput}
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
							href={url(buildUrl({ category: '' }))}
							class="flex items-center justify-between rounded-md px-2.5 py-1.5 {!filters.category
								? 'bg-abk-sky font-semibold text-abk-blue'
								: 'text-slate-600 hover:bg-slate-50'}"
						>
							All categories
						</a>
					</li>
					{#each taxonomy.categories as cat}
						<li>
							<a
								href={url(buildUrl({ category: cat.slug }))}
								class="flex items-center justify-between rounded-md px-2.5 py-1.5 {filters.category ===
								cat.slug
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
				<!-- Bolder and blue, with a vehicle icon, so this reads as more than
				     another filter group — a customer must always be able to tell
				     which vehicle brand a part fits. -->
				<h2 class="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-abk-blue">
					<Icon name="truck" size={14} /> Brand
				</h2>
				<ul class="space-y-0.5 text-sm">
					<li>
						<a
							href={url(buildUrl({ brand: '' }))}
							class="block rounded-md px-2.5 py-1.5 {!filters.brand
								? 'bg-abk-sky font-semibold text-abk-blue'
								: 'text-slate-600 hover:bg-slate-50'}"
						>
							All brands
						</a>
					</li>
					{#each taxonomy.brands as brand}
						<li>
							<a
								href={url(buildUrl({ brand: brand.slug }))}
								class="block rounded-md px-2.5 py-1.5 {filters.brand === brand.slug
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
					class="w-full rounded-lg bg-abk-blue px-4 py-2 text-sm font-bold text-white">Apply search</button
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
						href={url(buildUrl({ category: '' }))}
						class="inline-flex items-center gap-1.5 rounded-full bg-abk-sky px-3 py-1 text-xs font-semibold text-abk-blue"
					>
						{activeCategory.name}
						<Icon name="close" size={13} />
					</a>
				{/if}
				{#if activeBrand}
					<a
						href={url(buildUrl({ brand: '' }))}
						class="inline-flex items-center gap-1.5 rounded-full bg-abk-sky px-3 py-1 text-xs font-semibold text-abk-blue"
					>
						{activeBrand.name}
						<Icon name="close" size={13} />
					</a>
				{/if}
				{#if filters.q}
					<button
						type="button"
						onclick={clearSearch}
						class="inline-flex items-center gap-1.5 rounded-full bg-abk-sky px-3 py-1 text-xs font-semibold text-abk-blue"
					>
						“{filters.q}”
						<Icon name="close" size={13} />
					</button>
				{/if}
			</div>

			<div class="flex items-center gap-2 text-sm">
				<span class="text-slate-400">Sort</span>
				<div class="flex overflow-hidden rounded-lg border border-slate-200">
					{#each [{ v: 'newest', l: 'Newest' }, { v: 'name', l: 'Name' }, { v: 'brand', l: 'Brand' }] as opt}
						<a
							href={url(buildUrl({ sort: opt.v as Sort }))}
							class="px-3 py-1.5 text-xs font-semibold {filters.sort === opt.v
								? 'bg-abk-blue text-white'
								: 'bg-white text-slate-600 hover:bg-slate-50'}"
						>
							{opt.l}
						</a>
					{/each}
				</div>
			</div>
		</div>

		{#if parts.length}
			<div class="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
				{#each parts as part, i (part.id)}
					<PartCard {part} eager={i < 4} />
				{/each}
			</div>
		{:else}
			<div class="rounded-xl border border-dashed border-slate-300 bg-slate-50 py-20 text-center">
				<div
					class="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white text-slate-300"
				>
					<Icon name="search" size={28} />
				</div>
				<h3 class="mt-4 text-lg font-bold text-slate-700">No parts found</h3>
				<p class="mt-1 text-sm text-slate-500">
					Try clearing filters or contact us — we source parts on request.
				</p>
				<div class="mt-5 flex justify-center gap-3">
					<a href={url('/parts')} class="rounded-full bg-abk-blue px-5 py-2 text-sm font-bold text-white">
						Clear filters
					</a>
				</div>
			</div>
		{/if}
	</div>
</div>
