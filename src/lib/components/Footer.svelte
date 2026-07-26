<script lang="ts">
	import { brands, categories, nav, site } from '$lib/config';
	import Icon from './Icon.svelte';

	const year = new Date().getFullYear();
</script>

<footer class="mt-20 bg-abk-navy text-slate-300">
	<div class="container-page grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-4">
		<!-- Brand + contact -->
		<div class="lg:col-span-1">
			<div class="inline-flex rounded-lg bg-white p-3 shadow-sm">
				<img src="/logo.png" alt={site.name} class="h-10 w-auto" />
			</div>
			<p class="mt-4 max-w-xs text-sm leading-relaxed text-slate-400">
				{site.description}
			</p>
			<div class="mt-5 space-y-2.5 text-sm">
				<a href={site.phoneHref} class="flex items-center gap-2.5 hover:text-white">
					<Icon name="phone" size={16} class="text-abk-red" />
					{site.phoneDisplay}
				</a>
				<a
					href={`https://wa.me/${site.whatsappNumber}`}
					target="_blank"
					rel="noopener"
					class="flex items-center gap-2.5 hover:text-white"
				>
					<Icon name="whatsapp" size={16} class="text-abk-red" />
					{site.whatsappDisplay}
				</a>
				<a href={`mailto:${site.email}`} class="flex items-center gap-2.5 hover:text-white">
					<Icon name="mail" size={16} class="text-abk-red" />
					{site.email}
				</a>
				<p class="flex items-center gap-2.5 text-slate-400">
					<Icon name="pin" size={16} class="text-abk-red" />
					{site.address.city}, {site.address.country}
				</p>
			</div>
		</div>

		<!-- Quick links -->
		<div>
			<h3 class="text-sm font-bold uppercase tracking-wider text-white">Company</h3>
			<ul class="mt-4 space-y-2.5 text-sm">
				{#each nav as item}
					<li>
						<a href={item.href} class="text-slate-400 hover:text-white">{item.label}</a>
					</li>
				{/each}
			</ul>
		</div>

		<!-- Categories -->
		<div>
			<h3 class="text-sm font-bold uppercase tracking-wider text-white">Parts</h3>
			<ul class="mt-4 space-y-2.5 text-sm">
				{#each categories.slice(0, 6) as cat}
					<li>
						<a href={`/parts?category=${cat.slug}`} class="text-slate-400 hover:text-white"
							>{cat.name}</a
						>
					</li>
				{/each}
			</ul>
		</div>

		<!-- Brands -->
		<div>
			<h3 class="text-sm font-bold uppercase tracking-wider text-white">Vehicle Brands</h3>
			<ul class="mt-4 space-y-2.5 text-sm">
				{#each brands as brand}
					<li>
						<a href={`/parts?brand=${brand.slug}`} class="text-slate-400 hover:text-white"
							>{brand.name}</a
						>
					</li>
				{/each}
			</ul>
			{#if site.social.facebook}
				<a
					href={site.social.facebook}
					target="_blank"
					rel="noopener"
					class="mt-5 inline-flex items-center gap-2 text-slate-400 hover:text-white"
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
			<p>© {year} {site.legalName}. All rights reserved.</p>
			<p>{site.slogan}</p>
		</div>
	</div>
</footer>
