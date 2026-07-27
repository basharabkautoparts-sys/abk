<script lang="ts">
	import type { PageData } from './$types';
	import { brands, categories, features, site } from '$lib/config';
	import Seo from '$lib/components/Seo.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import PartCard from '$lib/components/PartCard.svelte';
	import { organizationJsonLd, websiteJsonLd } from '$lib/seo';

	let { data }: { data: PageData } = $props();
</script>

<Seo
	canonical="/"
	jsonLd={[organizationJsonLd(), websiteJsonLd()]}
	description="A.B.K. Auto Parts Co., Ltd — 100% genuine Japanese auto parts for Toyota, Isuzu, Mitsubishi and Nissan. Engine, brake, suspension, filters, clutch and body parts with fast global export from Thailand."
/>

<!-- ============================ HERO ============================ -->
<section class="brand-gradient relative overflow-hidden text-white">
	<div class="absolute inset-0 opacity-[0.07]"
		style="background-image: radial-gradient(circle at 1px 1px, white 1px, transparent 0); background-size: 22px 22px;"
	></div>
	<div class="container-page relative grid items-center gap-8 py-14 lg:grid-cols-2 lg:py-20">
		<div>
			<span
				class="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider ring-1 ring-white/20"
			>
				<Icon name="shield" size={14} /> 100% Genuine Japanese Parts
			</span>
			<h1 class="mt-5 text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
				Genuine Japanese<br />
				<span class="text-white">Auto Parts</span>,
				<span class="text-abk-red-light">Delivered Worldwide</span>
			</h1>
			<p class="mt-5 max-w-xl text-lg text-white/80">
				{site.name} supplies authentic parts for
				<strong class="font-semibold text-white">Toyota, Isuzu, Mitsubishi &amp; Nissan</strong> —
				{site.slogan.toLowerCase()}
			</p>
			<div class="mt-8 flex flex-wrap gap-3">
				<a
					href="/parts"
					class="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-abk-blue shadow-md transition hover:bg-slate-100"
				>
					Browse All Parts <Icon name="arrow" size={18} />
				</a>
				<a
					href={`https://wa.me/${site.whatsappNumber}`}
					target="_blank"
					rel="noopener"
					class="inline-flex items-center gap-2 rounded-full bg-abk-red px-6 py-3 text-sm font-bold text-white shadow-md transition hover:bg-abk-red-dark"
				>
					<Icon name="whatsapp" size={18} /> Inquire on WhatsApp
				</a>
			</div>
			<dl class="mt-10 flex flex-wrap gap-x-10 gap-y-4">
				<div>
					<dt class="text-2xl font-black">4</dt>
					<dd class="text-xs uppercase tracking-wide text-white/70">Vehicle brands</dd>
				</div>
				<div>
					<dt class="text-2xl font-black">{categories.length}</dt>
					<dd class="text-xs uppercase tracking-wide text-white/70">Part categories</dd>
				</div>
				<div>
					<dt class="text-2xl font-black">Global</dt>
					<dd class="text-xs uppercase tracking-wide text-white/70">Export shipping</dd>
				</div>
			</dl>
		</div>

		<div class="relative">
			<div class="overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-white/20">
				<img
					src="/hero-parts.jpg"
					alt="A montage of genuine Japanese auto parts — coil springs, brake discs, clutch kits, filters and drive shafts"
					class="w-full"
					width="845"
					height="809"
					fetchpriority="high"
				/>
			</div>
		</div>
	</div>
</section>

<!-- ============================ FEATURES ============================ -->
<section class="border-b border-slate-100 bg-white">
	<div class="container-page grid gap-6 py-10 sm:grid-cols-3">
		{#each features as f}
			<div class="flex items-start gap-4">
				<div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-abk-sky text-abk-blue">
					<Icon name={f.icon} size={24} />
				</div>
				<div>
					<h3 class="font-bold text-slate-800">{f.title}</h3>
					<p class="mt-0.5 text-sm text-slate-500">{f.text}</p>
				</div>
			</div>
		{/each}
	</div>
</section>

<!-- ============================ CATEGORIES ============================ -->
<section class="container-page py-16">
	<div class="mb-10 text-center">
		<p class="text-sm font-bold uppercase tracking-wider text-abk-red">Shop by category</p>
		<h2 class="mt-2 text-3xl font-black tracking-tight text-slate-800">Find the right part, fast</h2>
		<p class="mx-auto mt-3 max-w-2xl text-slate-500">
			From engine internals to body panels — browse our catalogue by system.
		</p>
	</div>

	<div class="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
		{#each categories as cat}
			<a
				href={`/parts?category=${cat.slug}`}
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
					{data.counts[cat.slug] ?? 0} item{(data.counts[cat.slug] ?? 0) === 1 ? '' : 's'}
				</span>
			</a>
		{/each}
	</div>
</section>

<!-- ============================ BRANDS ============================ -->
<section class="bg-slate-50 py-14">
	<div class="container-page text-center">
		<p class="text-sm font-bold uppercase tracking-wider text-abk-red">Vehicle coverage</p>
		<h2 class="mt-2 text-2xl font-black tracking-tight text-slate-800">
			Parts for Japan's most trusted brands
		</h2>
		<div class="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
			{#each brands as brand}
				<a
					href={`/parts?brand=${brand.slug}`}
					class="flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-8 text-xl font-black tracking-tight text-slate-700 shadow-sm transition hover:border-abk-blue hover:text-abk-blue"
				>
					{brand.name}
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
				<p class="text-sm font-bold uppercase tracking-wider text-abk-red">Featured</p>
				<h2 class="mt-2 text-3xl font-black tracking-tight text-slate-800">Popular parts</h2>
			</div>
			<a
				href="/parts"
				class="hidden items-center gap-1 text-sm font-bold text-abk-blue hover:underline sm:flex"
			>
				View all <Icon name="arrow" size={16} />
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
<section class="brand-gradient text-white">
	<div class="container-page grid items-center gap-10 py-16 lg:grid-cols-2">
		<div>
			<h2 class="text-3xl font-black tracking-tight">Why buy from ABK?</h2>
			<ul class="mt-6 space-y-4">
				{#each [{ t: 'Authenticity guaranteed', d: 'Every part is 100% genuine — sourced through trusted Japanese channels, never imitation.' }, { t: 'Fast, reliable export', d: 'Professional packing and worldwide shipping so your parts arrive safely, on time.' }, { t: 'Expert support', d: 'Not sure of the part number? Send us your VIN or a photo on WhatsApp and we will confirm the fit.' }] as item}
					<li class="flex gap-3">
						<span class="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/15">
							<Icon name="check" size={15} />
						</span>
						<div>
							<h3 class="font-bold">{item.t}</h3>
							<p class="text-sm text-white/75">{item.d}</p>
						</div>
					</li>
				{/each}
			</ul>
			<a
				href="/about"
				class="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-abk-blue transition hover:bg-slate-100"
			>
				About ABK <Icon name="arrow" size={16} />
			</a>
		</div>
		<div class="overflow-hidden rounded-2xl shadow-2xl ring-1 ring-white/20">
			<img
				src="/banner-square.jpg"
				alt="A.B.K. Auto Parts — genuine Japanese parts for Toyota, Isuzu, Mitsubishi and Nissan"
				class="w-full"
				width="1254"
				height="1254"
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
				<p class="text-sm font-bold uppercase tracking-wider text-abk-red">New arrivals</p>
				<h2 class="mt-2 text-3xl font-black tracking-tight text-slate-800">Recently added</h2>
			</div>
			<a
				href="/parts?sort=newest"
				class="hidden items-center gap-1 text-sm font-bold text-abk-blue hover:underline sm:flex"
			>
				View all <Icon name="arrow" size={16} />
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
		<div class="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-[var(--shadow-card)] sm:p-12">
			<h2 class="text-3xl font-black tracking-tight text-slate-800">Can't find your part?</h2>
			<p class="mx-auto mt-3 max-w-2xl text-slate-500">
				Send us the part number, VIN, or a photo and our team will source it for you and quote a
				price with export shipping.
			</p>
			<div class="mt-7 flex flex-wrap justify-center gap-3">
				<a
					href={`https://wa.me/${site.whatsappNumber}`}
					target="_blank"
					rel="noopener"
					class="inline-flex items-center gap-2 rounded-full bg-abk-red px-6 py-3 text-sm font-bold text-white shadow-md transition hover:bg-abk-red-dark"
				>
					<Icon name="whatsapp" size={18} /> {site.whatsappDisplay}
				</a>
				<a
					href={site.phoneHref}
					class="inline-flex items-center gap-2 rounded-full border border-slate-300 px-6 py-3 text-sm font-bold text-slate-700 transition hover:border-abk-blue hover:text-abk-blue"
				>
					<Icon name="phone" size={18} /> {site.phoneDisplay}
				</a>
			</div>
		</div>
	</div>
</section>
