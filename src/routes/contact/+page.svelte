<script lang="ts">
	import { url } from '$lib/paths';
	import { site } from '$lib/config';
	import Seo from '$lib/components/Seo.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import { breadcrumbJsonLd } from '$lib/seo';

	const methods = [
		{
			icon: 'whatsapp',
			label: 'WhatsApp',
			value: site.whatsappDisplay,
			href: `https://wa.me/${site.whatsappNumber}`,
			hint: 'Fastest reply — send a part number or photo',
			accent: 'bg-[#25D366]'
		},
		{
			icon: 'phone',
			label: 'Telephone',
			value: site.phoneDisplay,
			href: site.phoneHref,
			hint: 'Call us during business hours',
			accent: 'bg-abk-blue'
		},
		{
			icon: 'mail',
			label: 'Email',
			value: site.email,
			href: `mailto:${site.email}`,
			hint: 'For quotes and export enquiries',
			accent: 'bg-abk-navy'
		}
	];
</script>

<Seo
	title="Contact"
	canonical="/contact"
	description={`Contact ${site.name} — WhatsApp ${site.whatsappDisplay} or call ${site.phoneDisplay}. Genuine Japanese auto parts with worldwide export.`}
	jsonLd={[breadcrumbJsonLd([{ name: 'Home', url: '/' }, { name: 'Contact', url: '/contact' }])]}
/>

<section class="brand-gradient text-white">
	<div class="container-page py-16">
		<p class="text-sm font-bold uppercase tracking-wider text-red-300">Get in touch</p>
		<h1 class="mt-3 text-4xl font-black tracking-tight sm:text-5xl">Contact ABK Auto Parts</h1>
		<p class="mt-4 max-w-2xl text-lg text-white/80">
			Tell us the part you need — include the part number, VIN or a photo, and we'll confirm the fit
			and quote a price with export shipping.
		</p>
	</div>
</section>

<section class="container-page py-16">
	<div class="grid gap-6 md:grid-cols-3">
		{#each methods as m}
			<a
				href={m.href}
				target={m.href.startsWith('http') ? '_blank' : undefined}
				rel={m.href.startsWith('http') ? 'noopener' : undefined}
				class="group flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-[var(--shadow-card)] transition hover:-translate-y-1 hover:shadow-lg"
			>
				<div class="flex h-12 w-12 items-center justify-center rounded-xl {m.accent} text-white">
					<Icon name={m.icon} size={24} />
				</div>
				<h2 class="mt-4 text-sm font-bold uppercase tracking-wider text-slate-400">{m.label}</h2>
				<p class="mt-1 text-lg font-black text-slate-800 group-hover:text-abk-blue">{m.value}</p>
				<p class="mt-1 text-sm text-slate-500">{m.hint}</p>
			</a>
		{/each}
	</div>

	<div class="mt-10 grid gap-6 lg:grid-cols-2">
		<div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-[var(--shadow-card)]">
			<h2 class="flex items-center gap-2 text-lg font-bold text-slate-800">
				<Icon name="clock" size={20} class="text-abk-blue" /> Business hours
			</h2>
			<p class="mt-3 text-slate-600">{site.hours}</p>
			<h2 class="mt-6 flex items-center gap-2 text-lg font-bold text-slate-800">
				<Icon name="pin" size={20} class="text-abk-blue" /> Location
			</h2>
			<p class="mt-3 text-slate-600">
				{site.address.city}, {site.address.country}
			</p>
		</div>

		<div class="flex flex-col justify-center rounded-2xl bg-slate-50 p-8 text-center">
			<h2 class="text-2xl font-black tracking-tight text-slate-800">Ready to order?</h2>
			<p class="mx-auto mt-2 max-w-md text-slate-500">
				Chat with our team now on WhatsApp for the quickest response.
			</p>
			<div class="mt-6 flex flex-wrap justify-center gap-3">
				<a
					href={`https://wa.me/${site.whatsappNumber}`}
					target="_blank"
					rel="noopener"
					class="inline-flex items-center gap-2 rounded-full bg-abk-red px-6 py-3 text-sm font-bold text-white shadow-md transition hover:bg-abk-red-dark"
				>
					<Icon name="whatsapp" size={18} /> Message on WhatsApp
				</a>
				<a
					href={url('/parts')}
					class="inline-flex items-center gap-2 rounded-full border border-slate-300 px-6 py-3 text-sm font-bold text-slate-700 transition hover:border-abk-blue hover:text-abk-blue"
				>
					Browse catalogue
				</a>
			</div>
		</div>
	</div>
</section>
