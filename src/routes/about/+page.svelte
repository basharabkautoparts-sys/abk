<script lang="ts">
	import { asset, url } from '$lib/paths';
	import { brands, features, site } from '$lib/config';
	import Seo from '$lib/components/Seo.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import { breadcrumbJsonLd } from '$lib/seo';
</script>

<Seo
	title="About Us"
	canonical="/about"
	description={`About ${site.name} — a Thailand-based supplier of 100% genuine Japanese auto parts for Toyota, Isuzu, Mitsubishi and Nissan, exporting worldwide.`}
	jsonLd={[breadcrumbJsonLd([{ name: 'Home', url: '/' }, { name: 'About', url: '/about' }])]}
/>

<section class="brand-gradient text-white">
	<div class="container-page py-16">
		<p class="text-sm font-bold uppercase tracking-wider text-red-300">About us</p>
		<h1 class="mt-3 max-w-3xl text-4xl font-black tracking-tight sm:text-5xl">
			Genuine Japanese parts, trusted worldwide
		</h1>
		<p class="mt-4 max-w-2xl text-lg text-white/80">{site.description}</p>
	</div>
</section>

<section class="container-page grid gap-12 py-16 lg:grid-cols-2">
	<div>
		<h2 class="text-3xl font-black tracking-tight text-slate-800">Who we are</h2>
		<div class="mt-4 space-y-4 leading-relaxed text-slate-600">
			<p>
				{site.name} is a Thailand-based supplier of authentic Japanese automotive parts. We specialise
				in <strong>Toyota, Isuzu, Mitsubishi and Nissan</strong> — supplying workshops, dealers and
				vehicle owners with the exact parts they need.
			</p>
			<p>
				Every item we sell is <strong>100% genuine</strong>. We never deal in imitation parts, because
				the right part, made to specification, is what keeps vehicles safe and reliable on the road.
			</p>
			<p>
				With professional packing and reliable export shipping, we deliver to customers around the
				world — {site.slogan.toLowerCase()}
			</p>
		</div>
		<div class="mt-8 flex flex-wrap gap-3">
			<a
				href={url('/parts')}
				class="inline-flex items-center gap-2 rounded-full bg-abk-blue px-5 py-2.5 text-sm font-bold text-white transition hover:bg-abk-navy"
			>
				Browse parts <Icon name="arrow" size={16} />
			</a>
			<a
				href={url('/contact')}
				class="inline-flex items-center gap-2 rounded-full border border-slate-300 px-5 py-2.5 text-sm font-bold text-slate-700 transition hover:border-abk-blue hover:text-abk-blue"
			>
				Contact us
			</a>
		</div>
	</div>

	<div class="overflow-hidden rounded-2xl border border-slate-200 shadow-[var(--shadow-card)]">
		<img src={asset('/banner-square.jpg')} alt={site.name} class="w-full" width="1254" height="1254" />
	</div>
</section>

<!-- Values -->
<section class="bg-slate-50 py-16">
	<div class="container-page">
		<div class="text-center">
			<h2 class="text-3xl font-black tracking-tight text-slate-800">What we stand for</h2>
		</div>
		<div class="mt-10 grid gap-6 sm:grid-cols-3">
			{#each features as f}
				<div class="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-[var(--shadow-card)]">
					<div
						class="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-abk-sky text-abk-blue"
					>
						<Icon name={f.icon} size={28} />
					</div>
					<h3 class="mt-4 text-lg font-bold text-slate-800">{f.title}</h3>
					<p class="mt-2 text-sm text-slate-500">{f.text}</p>
				</div>
			{/each}
		</div>
	</div>
</section>

<!-- Brands -->
<section class="container-page py-16 text-center">
	<h2 class="text-2xl font-black tracking-tight text-slate-800">Vehicle brands we cover</h2>
	<div class="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
		{#each brands as brand}
			<div
				class="flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-8 text-xl font-black text-slate-700 shadow-sm"
			>
				{brand.name}
			</div>
		{/each}
	</div>
</section>
