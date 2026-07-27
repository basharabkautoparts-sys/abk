<script lang="ts">
	import { page } from '$app/state';
	import { nav, site } from '$lib/config';
	import Logo from './Logo.svelte';
	import Icon from './Icon.svelte';

	let menuOpen = $state(false);

	const path = $derived(page.url.pathname);
	const isAdmin = $derived(Boolean(page.data.isAdmin));
	const searchValue = $derived(path === '/parts' ? (page.url.searchParams.get('q') ?? '') : '');

	function isActive(href: string): boolean {
		if (href === '/') return path === '/';
		return path === href || path.startsWith(href + '/');
	}
</script>

<!-- Top utility bar -->
<div class="brand-gradient hidden text-white md:block">
	<div class="container-page flex h-9 items-center justify-between text-xs">
		<p class="flex items-center gap-2 font-medium tracking-wide">
			<Icon name="shield" size={14} />
			{site.tagline} — Toyota · Isuzu · Mitsubishi · Nissan
		</p>
		<div class="flex items-center gap-5">
			<a href={site.phoneHref} class="flex items-center gap-1.5 hover:text-white/80">
				<Icon name="phone" size={14} />
				{site.phoneDisplay}
			</a>
			<a
				href={`https://wa.me/${site.whatsappNumber}`}
				target="_blank"
				rel="noopener"
				class="flex items-center gap-1.5 hover:text-white/80"
			>
				<Icon name="whatsapp" size={14} />
				{site.whatsappDisplay}
			</a>
		</div>
	</div>
</div>

<!-- Main header -->
<header class="sticky top-0 z-50 bg-white/95 backdrop-blur">
	<div class="container-page flex h-16 items-center gap-4">
		<a href="/" class="shrink-0" aria-label={site.name}>
			<Logo height={44} />
		</a>

		<!-- Desktop nav -->
		<nav class="ml-2 hidden items-center gap-1 lg:flex">
			{#each nav as item}
				<a
					href={item.href}
					class="rounded-md px-3 py-2 text-sm font-semibold transition-colors {isActive(item.href)
						? 'text-abk-blue'
						: 'text-slate-600 hover:bg-slate-50 hover:text-abk-blue'}"
					aria-current={isActive(item.href) ? 'page' : undefined}
				>
					{item.label}
				</a>
			{/each}
		</nav>

		<div class="ml-auto flex items-center gap-2">
			<!-- Desktop search -->
			<form action="/parts" method="GET" class="hidden md:block" role="search">
				<div class="relative">
					<span class="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
						<Icon name="search" size={16} />
					</span>
					<input
						type="search"
						name="q"
						value={searchValue}
						placeholder="Search parts or part no…"
						aria-label="Search parts"
						class="w-52 rounded-full border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm outline-none transition focus:w-64 focus:border-abk-blue focus:bg-white"
					/>
				</div>
			</form>

			{#if isAdmin}
				<a
					href="/admin"
					class="hidden rounded-full border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:border-abk-blue hover:text-abk-blue sm:inline-block"
					>Admin</a
				>
			{/if}

			<a
				href={`https://wa.me/${site.whatsappNumber}`}
				target="_blank"
				rel="noopener"
				class="hidden items-center gap-2 rounded-full bg-abk-red px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-abk-red-dark sm:flex"
			>
				<Icon name="whatsapp" size={16} />
				<span>Inquire</span>
			</a>

			<!-- Mobile toggle -->
			<button
				type="button"
				class="rounded-md p-2 text-slate-700 lg:hidden"
				aria-label="Toggle menu"
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
				<form action="/parts" method="GET" class="mb-3" role="search">
					<div class="relative">
						<span class="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
							<Icon name="search" size={18} />
						</span>
						<input
							type="search"
							name="q"
							placeholder="Search parts or part no…"
							aria-label="Search parts"
							class="w-full rounded-full border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-abk-blue focus:bg-white"
						/>
					</div>
				</form>
				{#each nav as item}
					<a
						href={item.href}
						onclick={() => (menuOpen = false)}
						class="block rounded-md px-3 py-2.5 text-base font-semibold {isActive(item.href)
							? 'bg-abk-sky text-abk-blue'
							: 'text-slate-700 hover:bg-slate-50'}"
					>
						{item.label}
					</a>
				{/each}
				{#if isAdmin}
					<a
						href="/admin"
						onclick={() => (menuOpen = false)}
						class="block rounded-md px-3 py-2.5 text-base font-semibold text-slate-700 hover:bg-slate-50"
						>Admin dashboard</a
					>
				{/if}
				<div class="flex gap-2 pt-2">
					<a
						href={site.phoneHref}
						class="flex flex-1 items-center justify-center gap-2 rounded-full border border-slate-200 px-4 py-2.5 text-sm font-bold text-abk-blue"
					>
						<Icon name="phone" size={16} /> Call
					</a>
					<a
						href={`https://wa.me/${site.whatsappNumber}`}
						target="_blank"
						rel="noopener"
						class="flex flex-1 items-center justify-center gap-2 rounded-full bg-abk-red px-4 py-2.5 text-sm font-bold text-white"
					>
						<Icon name="whatsapp" size={16} /> WhatsApp
					</a>
				</div>
			</div>
		</div>
	{/if}

	<!-- brand keyline: blue running into the logo red -->
	<div class="brand-rule h-[3px] w-full"></div>
</header>
