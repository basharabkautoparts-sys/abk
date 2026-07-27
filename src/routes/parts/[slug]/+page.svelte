<script lang="ts">
	import { url } from '$lib/paths';
	import type { PageData } from './$types';
	import { site, whatsappInquiry } from '$lib/config';
	import { categoryBySlug } from '$lib/taxonomy.svelte';
	import Seo from '$lib/components/Seo.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import PartCard from '$lib/components/PartCard.svelte';
	import PartImage from '$lib/components/PartImage.svelte';
	import { breadcrumbJsonLd, productJsonLd } from '$lib/seo';

	let { data }: { data: PageData } = $props();
	const part = $derived(data.part);

	let selected = $state(0);
	const icon = $derived(categoryBySlug(part.category.slug)?.icon ?? 'part');

	const specs = $derived(
		[
			{ label: 'Part Number', value: part.part_number },
			part.oem && part.oem !== part.part_number ? { label: 'OEM / Ref', value: part.oem } : null,
			{ label: 'Vehicle Brand', value: part.brand.name },
			{ label: 'Category', value: part.category.name },
			{ label: 'Condition', value: part.condition },
			{ label: 'Availability', value: part.in_stock ? 'In stock' : 'On backorder' }
		].filter(Boolean) as { label: string; value: string }[]
	);
</script>

<Seo
	title={part.name}
	description={part.description}
	canonical={`/parts/${part.slug}`}
	type="product"
	image={part.images[0] ?? '/og-image.jpg'}
	jsonLd={[
		productJsonLd(part),
		breadcrumbJsonLd([
			{ name: 'Home', url: '/' },
			{ name: 'Parts', url: '/parts' },
			{ name: part.category.name, url: `/parts?category=${part.category.slug}` },
			{ name: part.name, url: `/parts/${part.slug}` }
		])
	]}
/>

<div class="container-page py-8">
	<!-- Breadcrumb -->
	<nav class="flex flex-wrap items-center gap-1.5 text-sm text-slate-500" aria-label="Breadcrumb">
		<a href={url('/')} class="hover:text-abk-blue">Home</a>
		<Icon name="chevron" size={14} />
		<a href={url('/parts')} class="hover:text-abk-blue">Parts</a>
		<Icon name="chevron" size={14} />
		<a href={url(`/parts?category=${part.category.slug}`)} class="hover:text-abk-blue"
			>{part.category.name}</a
		>
		<Icon name="chevron" size={14} />
		<span class="truncate text-slate-800">{part.name}</span>
	</nav>

	<div class="mt-6 grid gap-10 lg:grid-cols-2">
		<!-- Gallery -->
		<div>
			<div class="aspect-square overflow-hidden rounded-2xl border border-slate-200 bg-white">
				{#if part.images.length}
					<img src={part.images[selected]} alt={part.name} class="h-full w-full object-cover" />
				{:else}
					<PartImage {part} eager />
				{/if}
			</div>
			{#if part.images.length > 1}
				<div class="mt-3 grid grid-cols-5 gap-2">
					{#each part.images as img, i}
						<button
							type="button"
							onclick={() => (selected = i)}
							class="aspect-square overflow-hidden rounded-lg border-2 {selected === i
								? 'border-abk-blue'
								: 'border-slate-200'}"
							aria-label={`View image ${i + 1}`}
						>
							<img src={img} alt="" class="h-full w-full object-cover" />
						</button>
					{/each}
				</div>
			{/if}
		</div>

		<!-- Details -->
		<div>
			<div class="flex items-center gap-2">
				<span
					class="inline-flex items-center gap-1.5 rounded-full bg-abk-sky px-3 py-1 text-xs font-bold text-abk-blue"
				>
					<Icon name={icon} size={14} />
					{part.category.name}
				</span>
				<span
					class="inline-flex items-center gap-1.5 rounded-full bg-abk-blue px-3 py-1 text-xs font-bold text-white"
				>
					<Icon name="truck" size={14} />
					{part.brand.name}
				</span>
				{#if part.featured}
					<span class="rounded-full bg-abk-red px-3 py-1 text-xs font-bold text-white">Featured</span>
				{/if}
			</div>

			<h1 class="mt-4 text-3xl font-black leading-tight tracking-tight text-slate-900">
				{part.name}
			</h1>
			<p class="mt-2 font-mono text-sm text-slate-500">Part No. {part.part_number}</p>

			<!-- ABK quotes per enquiry rather than showing a price, so this space
			     carries the two things a buyer actually needs to decide: condition
			     and availability. -->
			<div class="mt-5 flex flex-wrap items-center gap-3">
				<span
					class="inline-flex items-center rounded-full bg-abk-sky px-3 py-1 text-sm font-bold text-abk-blue"
				>
					{part.condition}
				</span>
				{#if part.in_stock}
					<span
						class="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-sm font-bold text-emerald-700"
					>
						<Icon name="check" size={15} /> In stock
					</span>
				{:else}
					<span class="rounded-full bg-amber-50 px-3 py-1 text-sm font-bold text-amber-700"
						>On backorder</span
					>
				{/if}
			</div>

			<!-- Inquiry CTAs -->
			<div class="mt-6 flex flex-col gap-3 sm:flex-row">
				<a
					href={whatsappInquiry(part.name, part.part_number)}
					target="_blank"
					rel="noopener"
					class="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-abk-red px-6 py-3.5 font-bold text-white shadow-md transition hover:bg-abk-red-dark"
				>
					<Icon name="whatsapp" size={20} /> Inquire on WhatsApp
				</a>
				<a
					href={site.phoneHref}
					class="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-300 px-6 py-3.5 font-bold text-slate-700 transition hover:border-abk-blue hover:text-abk-blue"
				>
					<Icon name="phone" size={20} /> Call {site.phoneDisplay}
				</a>
			</div>
			<p class="mt-2 text-center text-xs text-slate-400 sm:text-left">
				We quote per enquiry, including export shipping — message us for pricing and availability.
			</p>

			<!-- Specs -->
			<dl class="mt-8 divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200">
				{#each specs as spec}
					<div class="flex justify-between gap-4 px-4 py-3 text-sm odd:bg-slate-50/60">
						<dt class="font-medium text-slate-500">{spec.label}</dt>
						<dd class="text-right font-semibold text-slate-800">{spec.value}</dd>
					</div>
				{/each}
			</dl>
		</div>
	</div>

	<!-- Description -->
	{#if part.description}
		<section class="mt-12 max-w-3xl">
			<h2 class="text-xl font-black tracking-tight text-slate-800">Description</h2>
			<p class="mt-3 leading-relaxed text-slate-600">{part.description}</p>
		</section>
	{/if}

	<!-- Related -->
	{#if data.related.length}
		<section class="mt-16">
			<h2 class="mb-6 text-2xl font-black tracking-tight text-slate-800">Related parts</h2>
			<div class="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
				{#each data.related as rel (rel.id)}
					<PartCard part={rel} />
				{/each}
			</div>
		</section>
	{/if}
</div>
