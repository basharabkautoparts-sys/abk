<script lang="ts">
	import { url } from '$lib/paths';
	import { nav, site } from '$lib/config';
	import { taxonomy } from '$lib/taxonomy.svelte';
	import { t, type TranslationKey } from '$lib/i18n.svelte';
	import Icon from './Icon.svelte';
	import Logo from './Logo.svelte';

	const year = new Date().getFullYear();
</script>

<footer class="mt-20 border-t-2 border-abk-red bg-abk-navy text-slate-300">
	<div class="container-page grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-4">
		<!-- Brand + contact -->
		<div class="lg:col-span-1">
			<div class="inline-flex rounded-lg bg-white px-4 py-3 shadow-sm">
				<Logo height={34} wordmark />
			</div>
			<p class="mt-4 max-w-xs text-sm leading-relaxed text-slate-400">
				{t('site.description')}
			</p>
			<div class="mt-5 space-y-2.5 text-sm">
				<a href={site.phoneHref} class="flex items-center gap-2.5 hover:text-white">
					<Icon name="phone" size={16} class="shrink-0 text-abk-red" />
					<span dir="ltr">{site.phoneDisplay}</span>
				</a>
				<a
					href={`https://wa.me/${site.whatsappNumber}`}
					target="_blank"
					rel="noopener"
					class="flex items-center gap-2.5 hover:text-white"
				>
					<Icon name="whatsapp" size={16} class="shrink-0 text-abk-red" />
					<span dir="ltr">{site.whatsappDisplay}</span>
				</a>
				<a href={`mailto:${site.email}`} class="flex items-center gap-2.5 hover:text-white">
					<Icon name="mail" size={16} class="shrink-0 text-abk-red" />
					<span dir="ltr" class="break-all">{site.email}</span>
				</a>
				<p class="flex items-center gap-2.5 text-slate-400">
					<Icon name="pin" size={16} class="shrink-0 text-abk-red" />
					{site.address.city}, {site.address.country}
				</p>
			</div>
		</div>

		<!-- Quick links -->
		<div>
			<h2 class="text-sm font-bold uppercase tracking-wider text-white">{t('footer.company')}</h2>
			<ul class="mt-4 space-y-2.5 text-sm">
				{#each nav as item}
					<li>
						<a href={url(item.href)} class="text-slate-400 hover:text-white">
							{t(item.key as TranslationKey)}
						</a>
					</li>
				{/each}
			</ul>
		</div>

		<!-- Categories -->
		<div>
			<h2 class="text-sm font-bold uppercase tracking-wider text-white">{t('footer.parts')}</h2>
			<ul class="mt-4 space-y-2.5 text-sm">
				{#each taxonomy.categories.slice(0, 6) as cat}
					<li>
						<a href={url(`/parts?category=${cat.slug}`)} class="text-slate-400 hover:text-white">
							{cat.name}
						</a>
					</li>
				{/each}
			</ul>
		</div>

		<!-- Brands -->
		<div>
			<h2 class="text-sm font-bold uppercase tracking-wider text-white">{t('footer.brands')}</h2>
			<ul class="mt-4 space-y-2.5 text-sm">
				{#each taxonomy.brands as brand}
					<li>
						<a href={url(`/parts?brand=${brand.slug}`)} class="text-slate-400 hover:text-white">
							{brand.name}
						</a>
					</li>
				{/each}
			</ul>
			{#if site.social.facebook}
				<a
					href={site.social.facebook}
					target="_blank"
					rel="noopener"
					class="mt-5 inline-flex items-center gap-2 text-slate-400 hover:text-abk-red"
				>
					<Icon name="facebook" size={20} /> Facebook
				</a>
			{/if}
		</div>
	</div>

	<div class="border-t border-white/10">
		<div
			class="container-page flex flex-col items-center justify-between gap-2 py-5 text-xs text-slate-400 sm:flex-row"
		>
			<p>© {year} {site.legalName}. {t('footer.rights')}</p>
			<p>{t('site.slogan')}</p>
		</div>
	</div>
</footer>
