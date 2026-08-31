<script lang="ts">
	import { url } from '$lib/paths';
	import { page } from '$app/state';
	import { nav, site } from '$lib/config';
	import { admin } from '$lib/auth.svelte';
	import { t, type TranslationKey } from '$lib/i18n.svelte';
	import { isUnder, routePath, searchParams } from '$lib/query';
	import Logo from './Logo.svelte';
	import Icon from './Icon.svelte';
	import SearchBox from './SearchBox.svelte';
	import LanguageSwitch from './LanguageSwitch.svelte';

	let menuOpen = $state(false);

	const path = $derived(routePath(page.url.pathname));
	const isAdmin = $derived(admin.email !== null);
	const searchValue = $derived(path === '/parts' ? (searchParams(page.url).get('q') ?? '') : '');

	function isActive(href: string): boolean {
		if (href === '/') return path === '/';
		return isUnder(path, href);
	}
</script>

<!-- Top utility bar. Light rather than a colour band: the page below it is
     white, and this is a contact strip, not a banner. -->
<div class="hidden border-b border-slate-100 bg-slate-50 text-slate-600 md:block">
	<div class="container-page flex h-9 items-center justify-between text-xs">
		<p class="flex items-center gap-2 font-medium tracking-wide">
			<Icon name="shield" size={14} class="text-abk-blue" />
			{t('site.tagline')} — Toyota · Isuzu · Mitsubishi · Nissan
		</p>
		<div class="flex items-center gap-5">
			<a href={site.phoneHref} class="flex items-center gap-1.5 hover:text-abk-blue">
				<Icon name="phone" size={14} />
				<span dir="ltr">{site.phoneDisplay}</span>
			</a>
			<a
				href={`https://wa.me/${site.whatsappNumber}`}
				target="_blank"
				rel="noopener"
				class="flex items-center gap-1.5 hover:text-abk-blue"
			>
				<Icon name="whatsapp" size={14} />
				<span dir="ltr">{site.whatsappDisplay}</span>
			</a>
		</div>
	</div>
</div>

<!-- Main header -->
<header class="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
	<div class="container-page flex h-16 items-center gap-4">
		<a href={url('/')} class="shrink-0" aria-label={site.name}>
			<Logo height={40} />
		</a>

		<!-- Desktop nav -->
		<nav class="ms-2 hidden items-center gap-1 lg:flex">
			{#each nav as item}
				<a
					href={url(item.href)}
					class="relative rounded-md px-3 py-2 text-sm font-semibold transition-colors {isActive(
						item.href
					)
						? 'text-abk-blue'
						: 'text-slate-600 hover:bg-slate-50 hover:text-abk-blue'}"
					aria-current={isActive(item.href) ? 'page' : undefined}
				>
					{t(item.key as TranslationKey)}
					{#if isActive(item.href)}
						<!-- Red marks "you are here"; blue (above) is reserved for hover. -->
						<span class="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-abk-red"></span>
					{/if}
				</a>
			{/each}
		</nav>

		<div class="ms-auto flex items-center gap-2">
			<!-- Desktop search, with live suggestions -->
			<div class="hidden md:block">
				<SearchBox value={searchValue} />
			</div>

			<div class="hidden sm:block">
				<LanguageSwitch />
			</div>

			{#if isAdmin}
				<a
					href={url('/admin')}
					class="hidden rounded-full border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:border-abk-blue hover:text-abk-blue sm:inline-block"
					>{t('nav.admin')}</a
				>
			{/if}

			<a
				href={`https://wa.me/${site.whatsappNumber}`}
				target="_blank"
				rel="noopener"
				class="hidden items-center gap-2 rounded-full bg-abk-red px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-abk-red-dark sm:flex"
			>
				<Icon name="whatsapp" size={16} />
				<span>{t('action.inquire')}</span>
			</a>

			<!-- Mobile toggle -->
			<button
				type="button"
				class="rounded-md p-2 text-slate-700 lg:hidden"
				aria-label={t('nav.toggleMenu')}
				aria-expanded={menuOpen}
				onclick={() => (menuOpen = !menuOpen)}
			>
				<Icon name={menuOpen ? 'close' : 'menu'} size={24} />
			</button>
		</div>
	</div>

	<!-- Mobile menu -->
	{#if menuOpen}
		<div class="border-t border-slate-200 bg-white lg:hidden">
			<div class="container-page space-y-1 py-3">
				<div class="mb-3">
					<SearchBox block value={searchValue} onnavigate={() => (menuOpen = false)} />
				</div>
				{#each nav as item}
					<a
						href={url(item.href)}
						onclick={() => (menuOpen = false)}
						class="block rounded-md border-s-4 px-3 py-2.5 text-base font-semibold {isActive(
							item.href
						)
							? 'border-abk-red bg-abk-sky text-abk-blue'
							: 'border-transparent text-slate-700 hover:bg-slate-50'}"
					>
						{t(item.key as TranslationKey)}
					</a>
				{/each}
				{#if isAdmin}
					<a
						href={url('/admin')}
						onclick={() => (menuOpen = false)}
						class="block rounded-md px-3 py-2.5 text-base font-semibold text-slate-700 hover:bg-slate-50"
						>{t('nav.adminDashboard')}</a
					>
				{/if}
				<div class="pt-2 sm:hidden">
					<LanguageSwitch block />
				</div>
				<div class="flex gap-2 pt-2">
					<a
						href={site.phoneHref}
						class="flex flex-1 items-center justify-center gap-2 rounded-full border border-slate-200 px-4 py-2.5 text-sm font-bold text-abk-blue"
					>
						<Icon name="phone" size={16} />
						{t('action.call')}
					</a>
					<a
						href={`https://wa.me/${site.whatsappNumber}`}
						target="_blank"
						rel="noopener"
						class="flex flex-1 items-center justify-center gap-2 rounded-full bg-abk-red px-4 py-2.5 text-sm font-bold text-white"
					>
						<Icon name="whatsapp" size={16} />
						{t('action.whatsapp')}
					</a>
				</div>
			</div>
		</div>
	{/if}
</header>
