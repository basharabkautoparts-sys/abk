<script lang="ts">
	import { asset, url } from '$lib/paths';
	import type { PageData } from './$types';
	import { features, site } from '$lib/config';
	import { taxonomy } from '$lib/taxonomy.svelte';
	import { t, type TranslationKey } from '$lib/i18n.svelte';
	import Seo from '$lib/components/Seo.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import Logo from '$lib/components/Logo.svelte';
	import PartCard from '$lib/components/PartCard.svelte';
	import BrandMark, { isWordmark } from '$lib/components/BrandMark.svelte';
	import { organizationJsonLd, websiteJsonLd } from '$lib/seo';

	let { data }: { data: PageData } = $props();
</script>

<Seo canonical="/" jsonLd={[organizationJsonLd(), websiteJsonLd()]} description={site.metaDescription} />

<!-- ============================ HERO ============================
     White, with the company lockup where the headline used to be and the
     vehicle brands facing it across a divider — the arrangement the owner
     sketched. No band, no photo montage: the logo is the statement. -->
<section class="border-b border-slate-100 bg-white">
	<div class="container-page grid items-center gap-10 py-14 lg:grid-cols-2 lg:gap-16 lg:py-20">
		<div class="text-center lg:text-start">
			<Logo height={92} wordmark class="mx-auto lg:mx-0" />

			<p class="mx-auto mt-7 max-w-xl text-lg leading-relaxed text-slate-600 lg:mx-0">
				{t('site.description')}
			</p>

			<div class="mt-8 flex flex-wrap justify-center gap-3 lg:justify-start">
				<a
					href={url('/parts')}
					class="inline-flex items-center gap-2 rounded-full bg-abk-blue px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-abk-navy"
				>
					{t('action.browseParts')}
					<Icon name="arrow" size={18} class="rtl:-scale-x-100" />
				</a>
				<a
					href={`https://wa.me/${site.whatsappNumber}`}
					target="_blank"
					rel="noopener"
					class="inline-flex items-center gap-2 rounded-full bg-abk-red px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-abk-red-dark"
				>
					<Icon name="whatsapp" size={18} />
					{t('action.inquireWhatsapp')}
				</a>
			</div>
		</div>

		<!-- Vehicle brands, facing the lockup across a rule (lg and up). -->
		<div class="lg:border-s lg:border-slate-200 lg:ps-16">
			<p class="mb-5 text-center text-xs font-bold uppercase tracking-wider text-slate-400 lg:text-start">
				{t('home.coverage.eyebrow')}
			</p>
			<ul class="grid grid-cols-2 gap-3 sm:gap-4">
				{#each taxonomy.brands as brand}
					<li>
						<a
							href={url(`/parts?brand=${brand.slug}`)}
							class="flex h-28 flex-col items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-slate-700 transition hover:border-abk-blue hover:text-abk-blue"
						>
							<BrandMark slug={brand.slug} name={brand.name} size={40} />
							{#if !isWordmark(brand.slug)}
								<span class="text-sm font-bold tracking-tight">{brand.name}</span>
							{/if}
						</a>
					</li>
				{/each}
			</ul>
		</div>
	</div>
</section>

<!-- ============================ FEATURES ============================ -->
<section class="border-b border-slate-100 bg-white">
	<div class="container-page grid gap-6 py-10 sm:grid-cols-3">
		{#each features as f}
			<div class="flex items-start gap-4">
				<div
					class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-abk-sky text-abk-blue"
				>
					<Icon name={f.icon} size={24} />
				</div>
				<div>
					<h3 class="font-bold text-slate-800">{t(`${f.key}.title` as TranslationKey)}</h3>
					<p class="mt-0.5 text-sm text-slate-500">{t(`${f.key}.text` as TranslationKey)}</p>
				</div>
			</div>
		{/each}
	</div>
</section>

<!-- ============================ CATEGORIES ============================ -->
<section class="container-page py-16">
	<div class="mb-10 text-center">
		<div class="rule-brand mx-auto mb-3 w-fit"></div>
		<p class="text-sm font-bold uppercase tracking-wider text-abk-red">
			{t('home.category.eyebrow')}
		</p>
		<h2 class="mt-2 text-3xl font-black tracking-tight text-slate-800">
			{t('home.category.heading')}
		</h2>
		<p class="mx-auto mt-3 max-w-2xl text-slate-500">{t('home.category.lead')}</p>
	</div>

	<div class="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
		{#each taxonomy.categories as cat}
			<a
				href={url(`/parts?category=${cat.slug}`)}
				class="group flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-[var(--shadow-card)] transition hover:-translate-y-1 hover:border-abk-blue/30 hover:shadow-lg"
			>
				<div
					class="flex h-14 w-14 items-center justify-center rounded-xl bg-abk-sky text-abk-blue transition group-hover:bg-abk-blue group-hover:text-white"
				>
					<Icon name={cat.icon} size={28} />
				</div>
				<h3 class="mt-4 font-bold leading-snug text-slate-800 group-hover:text-abk-blue">
					{cat.name}
				</h3>
				<p class="mt-1 line-clamp-2 text-xs text-slate-500">{cat.description}</p>
				<span class="mt-3 text-xs font-semibold text-slate-400">
					{data.counts[cat.slug] ?? 0}
					{(data.counts[cat.slug] ?? 0) === 1 ? t('parts.item') : t('parts.items')}
				</span>
			</a>
		{/each}
	</div>
</section>

<!-- ============================ BRANDS ============================ -->
<section class="bg-slate-50 py-14">
	<div class="container-page text-center">
		<div class="rule-brand mx-auto mb-3 w-fit"></div>
		<p class="text-sm font-bold uppercase tracking-wider text-abk-red">
			{t('home.coverage.eyebrow')}
		</p>
		<h2 class="mt-2 text-2xl font-black tracking-tight text-slate-800">
			{t('home.coverage.heading')}
		</h2>
		<div class="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
			{#each taxonomy.brands as brand}
				<a
					href={url(`/parts?brand=${brand.slug}`)}
					class="flex h-32 flex-col items-center justify-center gap-2.5 rounded-xl border border-slate-200 bg-white px-4 text-slate-700 shadow-sm transition hover:border-abk-blue hover:text-abk-blue"
				>
					<BrandMark slug={brand.slug} name={brand.name} size={46} />
					{#if !isWordmark(brand.slug)}
						<span class="text-base font-black tracking-tight">{brand.name}</span>
					{/if}
				</a>
			{/each}
		</div>
	</div>
</section>

<!-- ============================ FEATURED ============================ -->
{#if data.featured.length}
	<section class="container-page py-16">
		<div class="mb-8 flex items-end justify-between">
			<div>
				<div class="rule-brand mb-3"></div>
				<p class="text-sm font-bold uppercase tracking-wider text-abk-red">
					{t('home.featured.eyebrow')}
				</p>
				<h2 class="mt-2 text-3xl font-black tracking-tight text-slate-800">
					{t('home.featured.heading')}
				</h2>
			</div>
			<a
				href={url('/parts')}
				class="hidden items-center gap-1 text-sm font-bold text-abk-blue hover:underline sm:flex"
			>
				{t('action.viewAll')}
				<Icon name="arrow" size={16} class="rtl:-scale-x-100" />
			</a>
		</div>
		<div class="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
			{#each data.featured as part, i (part.id)}
				<PartCard {part} eager={i < 4} />
			{/each}
		</div>
	</section>
{/if}

<!-- ============================ WHY ABK ============================ -->
<section class="border-y border-slate-100 bg-white">
	<div class="container-page grid items-center gap-10 py-16 lg:grid-cols-2">
		<div>
			<div class="rule-brand mb-3"></div>
			<h2 class="text-3xl font-black tracking-tight text-slate-800">{t('home.why.heading')}</h2>
			<ul class="mt-6 space-y-4">
				{#each [1, 2, 3] as n}
					<li class="flex gap-3">
						<span
							class="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-abk-sky text-abk-blue"
						>
							<Icon name="check" size={15} />
						</span>
						<div>
							<h3 class="font-bold text-slate-800">
								{t(`home.why.${n}.title` as TranslationKey)}
							</h3>
							<p class="text-sm text-slate-500">{t(`home.why.${n}.text` as TranslationKey)}</p>
						</div>
					</li>
				{/each}
			</ul>
			<a
				href={url('/about')}
				class="mt-8 inline-flex items-center gap-2 rounded-full bg-abk-blue px-5 py-2.5 text-sm font-bold text-white transition hover:bg-abk-navy"
			>
				{t('home.why.cta')}
				<Icon name="arrow" size={16} class="rtl:-scale-x-100" />
			</a>
		</div>
		<div class="overflow-hidden rounded-2xl border border-slate-200 shadow-[var(--shadow-card)]">
			<img
				src={asset('/hero-parts.jpg')}
				alt="Genuine Japanese auto parts — coil springs, brake discs, clutch kits, filters and drive shafts"
				class="w-full"
				width="845"
				height="809"
				loading="lazy"
			/>
		</div>
	</div>
</section>

<!-- ============================ LATEST ============================ -->
{#if data.latest.length}
	<section class="container-page py-16">
		<div class="mb-8 flex items-end justify-between">
			<div>
				<div class="rule-brand mb-3"></div>
				<p class="text-sm font-bold uppercase tracking-wider text-abk-red">
					{t('home.latest.eyebrow')}
				</p>
				<h2 class="mt-2 text-3xl font-black tracking-tight text-slate-800">
					{t('home.latest.heading')}
				</h2>
			</div>
			<a
				href={url('/parts?sort=newest')}
				class="hidden items-center gap-1 text-sm font-bold text-abk-blue hover:underline sm:flex"
			>
				{t('action.viewAll')}
				<Icon name="arrow" size={16} class="rtl:-scale-x-100" />
			</a>
		</div>
		<div class="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
			{#each data.latest as part (part.id)}
				<PartCard {part} />
			{/each}
		</div>
	</section>
{/if}

<!-- ============================ CONTACT CTA ============================ -->
<section class="bg-slate-50 py-16">
	<div class="container-page">
		<div
			class="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-[var(--shadow-card)] sm:p-12"
		>
			<div class="rule-brand mx-auto mb-3 w-fit"></div>
			<h2 class="text-3xl font-black tracking-tight text-slate-800">{t('home.cta.heading')}</h2>
			<p class="mx-auto mt-3 max-w-2xl text-slate-500">{t('home.cta.lead')}</p>
			<div class="mt-7 flex flex-wrap justify-center gap-3">
				<a
					href={`https://wa.me/${site.whatsappNumber}`}
					target="_blank"
					rel="noopener"
					class="inline-flex items-center gap-2 rounded-full bg-abk-red px-6 py-3 text-sm font-bold text-white shadow-md transition hover:bg-abk-red-dark"
				>
					<Icon name="whatsapp" size={18} />
					<span dir="ltr">{site.whatsappDisplay}</span>
				</a>
				<a
					href={site.phoneHref}
					class="inline-flex items-center gap-2 rounded-full border border-slate-300 px-6 py-3 text-sm font-bold text-slate-700 transition hover:border-abk-blue hover:text-abk-blue"
				>
					<Icon name="phone" size={18} />
					<span dir="ltr">{site.phoneDisplay}</span>
				</a>
			</div>
		</div>
	</div>
</section>
