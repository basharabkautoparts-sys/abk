<script lang="ts">
	import { url } from '$lib/paths';
	import type { PageData } from './$types';
	import { site, whatsappInquiry } from '$lib/config';
	import { t } from '$lib/i18n.svelte';
	import Seo from '$lib/components/Seo.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import PartCard from '$lib/components/PartCard.svelte';
	import PartImage from '$lib/components/PartImage.svelte';
	import { breadcrumbJsonLd, productJsonLd } from '$lib/seo';

	let { data }: { data: PageData } = $props();
	const part = $derived(data.part);

	let selected = $state(0);

	/**
	 * Only rows that were actually filled in. The page used to print a fixed
	 * six-row table with the brand and category repeated from the badges above
	 * it; what a buyer needs is the numbers they will quote back to us, and
	 * whether it is on the shelf.
	 */
	const specs = $derived(
		[
			part.oem && part.oem !== part.part_number
				? { label: t('part.oem'), value: part.oem, ltr: true }
				: null,
			part.condition ? { label: t('part.condition'), value: part.condition } : null,
			{
				label: t('parts.category'),
				value: part.category.name,
				href: `/parts?category=${part.category.slug}`
			},
			{
				label: t('part.availability'),
				value: part.in_stock ? t('part.inStock') : t('part.backorder')
			}
		].filter(Boolean) as { label: string; value: string; href?: string; ltr?: boolean }[]
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
		<a href={url('/')} class="hover:text-abk-blue">{t('nav.home')}</a>
		<Icon name="chevron" size={14} class="rtl:-scale-x-100" />
		<a href={url('/parts')} class="hover:text-abk-blue">{t('nav.parts')}</a>
		<Icon name="chevron" size={14} class="rtl:-scale-x-100" />
		<a href={url(`/parts?category=${part.category.slug}`)} class="hover:text-abk-blue">
			{part.category.name}
		</a>
	</nav>

	<div class="mt-6 grid gap-10 lg:grid-cols-2 lg:gap-14">
		<!-- Gallery -->
		<div>
			<div class="aspect-square overflow-hidden rounded-xl border border-slate-200 bg-white">
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
							aria-label={`${t('part.viewImage')} ${i + 1}`}
						>
							<img src={img} alt="" class="h-full w-full object-cover" />
						</button>
					{/each}
				</div>
			{/if}
		</div>

		<!-- Details. Plain and vertical: brand, name, number, then the two ways
		     to reach us. Nothing between the buyer and the enquiry. -->
		<div class="lg:pt-2">
			<a
				href={url(`/parts?brand=${part.brand.slug}`)}
				class="text-xs font-bold uppercase tracking-[0.18em] text-slate-400 hover:text-abk-blue"
			>
				{part.brand.name}
			</a>

			<h1 class="mt-2 text-3xl font-black leading-tight tracking-tight text-slate-900 sm:text-4xl">
				{part.name}
			</h1>

			<!-- `dir="ltr"`: a part number is a Latin run joined by bidi-neutral
			     hyphens, and Arabic page direction would otherwise reverse its
			     segments and display a different number. -->
			<p class="mt-3 font-mono text-sm text-slate-500">
				{t('part.partNo')}
				<span dir="ltr" class="inline-block text-slate-700">{part.part_number}</span>
			</p>

			{#if part.description}
				<p class="mt-5 leading-relaxed text-slate-600">{part.description}</p>
			{/if}

			<div class="mt-7 flex flex-col gap-3 sm:flex-row">
				<a
					href={whatsappInquiry(part.name, part.part_number)}
					target="_blank"
					rel="noopener"
					class="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-abk-red px-6 py-3 font-bold text-white transition hover:bg-abk-red-dark"
				>
					<Icon name="whatsapp" size={20} />
					{t('action.inquireWhatsapp')}
				</a>
				<a
					href={`mailto:${site.email}?subject=${encodeURIComponent(`${part.name} (${part.part_number})`)}`}
					class="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-slate-300 px-6 py-3 font-bold text-slate-700 transition hover:border-abk-blue hover:text-abk-blue"
				>
					<Icon name="mail" size={20} />
					{t('contact.method.email')}
				</a>
			</div>

			<p class="mt-3 text-xs text-slate-400">{t('part.quoteNote')}</p>

			<dl class="mt-8 space-y-2.5 border-t border-slate-100 pt-6 text-sm">
				{#each specs as spec}
					<div class="flex justify-between gap-4">
						<dt class="text-slate-500">{spec.label}</dt>
						<dd dir={spec.ltr ? 'ltr' : undefined} class="text-end font-semibold text-slate-800">
							{#if spec.href}
								<a href={url(spec.href)} class="hover:text-abk-blue">{spec.value}</a>
							{:else}
								{spec.value}
							{/if}
						</dd>
					</div>
				{/each}
			</dl>
		</div>
	</div>

	<!-- Related -->
	{#if data.related.length}
		<section class="mt-16">
			<h2 class="mb-6 text-2xl font-black tracking-tight text-slate-800">{t('part.related')}</h2>
			<div class="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
				{#each data.related as rel (rel.id)}
					<PartCard part={rel} />
				{/each}
			</div>
		</section>
	{/if}
</div>
