<script lang="ts">
	import { asset, url } from '$lib/paths';
	import { features, site } from '$lib/config';
	import { taxonomy } from '$lib/taxonomy.svelte';
	import { t, type TranslationKey } from '$lib/i18n.svelte';
	import Seo from '$lib/components/Seo.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import BrandMark, { needsNameLabel } from '$lib/components/BrandMark.svelte';
	import { breadcrumbJsonLd } from '$lib/seo';
</script>

<Seo
	title="About Us"
	canonical="/about"
	description={`About ${site.name} — a Thailand-based B2B wholesale supplier and exporter of Japanese auto parts for Toyota, Isuzu, Mitsubishi and Nissan, exporting worldwide.`}
	jsonLd={[breadcrumbJsonLd([{ name: 'Home', url: '/' }, { name: 'About', url: '/about' }])]}
/>

<section class="border-b border-slate-200 bg-white">
	<div class="container-page py-16">
		<div class="rule-brand mb-3"></div>
		<p class="text-sm font-bold uppercase tracking-wider text-abk-red">{t('about.eyebrow')}</p>
		<h1 class="mt-3 max-w-3xl text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">
			{t('about.heading')}
		</h1>
		<p class="mt-4 max-w-3xl text-lg leading-relaxed text-slate-600">{t('site.description')}</p>
	</div>
</section>

<section class="container-page grid gap-12 py-16 lg:grid-cols-2">
	<div>
		<div class="rule-brand mb-3"></div>
		<h2 class="text-3xl font-black tracking-tight text-slate-800">{t('about.who.heading')}</h2>
		<div class="mt-4 space-y-4 leading-relaxed text-slate-600">
			{#each [1, 2, 3, 4] as n}
				<p>{t(`about.who.${n}` as TranslationKey)}</p>
			{/each}
			<p class="font-semibold text-abk-blue">{t('about.who.slogan')}</p>
		</div>
		<div class="mt-8 flex flex-wrap gap-3">
			<a
				href={url('/parts')}
				class="inline-flex items-center gap-2 rounded-full bg-abk-blue px-5 py-2.5 text-sm font-bold text-white transition hover:bg-abk-navy"
			>
				{t('about.cta.parts')}
				<Icon name="arrow" size={16} class="rtl:-scale-x-100" />
			</a>
			<a
				href={url('/contact')}
				class="inline-flex items-center gap-2 rounded-full border border-slate-300 px-5 py-2.5 text-sm font-bold text-slate-700 transition hover:border-abk-blue hover:text-abk-blue"
			>
				{t('about.cta.contact')}
			</a>
		</div>
	</div>

	<div class="self-start overflow-hidden rounded-2xl border border-slate-200 shadow-[var(--shadow-card)]">
		<img src={asset('/banner-square.jpg')} alt={site.name} class="w-full" width="1254" height="1254" />
	</div>
</section>

<!-- Values -->
<section class="bg-slate-50 py-16">
	<div class="container-page">
		<div class="text-center">
			<div class="rule-brand mx-auto mb-3 w-fit"></div>
			<h2 class="text-3xl font-black tracking-tight text-slate-800">{t('about.values.heading')}</h2>
		</div>
		<div class="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
			{#each features as f}
				<div
					class="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-[var(--shadow-card)]"
				>
					<div
						class="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-abk-sky text-abk-blue"
					>
						<Icon name={f.icon} size={28} />
					</div>
					<h3 class="mt-4 text-lg font-bold text-slate-800">
						{t(`${f.key}.title` as TranslationKey)}
					</h3>
					<p class="mt-2 text-sm text-slate-500">{t(`${f.key}.text` as TranslationKey)}</p>
				</div>
			{/each}
		</div>
	</div>
</section>

<!-- Brands -->
<section class="container-page py-16 text-center">
	<div class="rule-brand mx-auto mb-3 w-fit"></div>
	<h2 class="text-2xl font-black tracking-tight text-slate-800">{t('about.brands.heading')}</h2>
	<div class="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
		{#each taxonomy.brands as brand}
			<div
				class="flex h-32 flex-col items-center justify-center gap-2.5 rounded-xl border border-slate-200 bg-white px-4 text-slate-700 shadow-sm"
			>
				<BrandMark slug={brand.slug} name={brand.name} size={48} />
				{#if needsNameLabel(brand.slug)}
					<span class="text-base font-black tracking-tight">{brand.name}</span>
				{/if}
			</div>
		{/each}
	</div>
</section>
