<script lang="ts">
	import { url } from '$lib/paths';
	import { site } from '$lib/config';
	import { t } from '$lib/i18n.svelte';
	import Seo from '$lib/components/Seo.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import { breadcrumbJsonLd } from '$lib/seo';

	/**
	 * Google's `output=embed` map takes a plain search string and needs no API
	 * key, which suits a static site with no server to hide one on. Lazy so it
	 * costs nothing — and contacts Google for nothing — until it scrolls up.
	 */
	const mapSrc = $derived(
		`https://www.google.com/maps?q=${encodeURIComponent(site.mapQuery)}&z=16&output=embed`
	);
	const mapLink = $derived(
		`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(site.mapQuery)}`
	);

	const methods = $derived([
		{
			icon: 'whatsapp',
			label: t('contact.method.whatsapp'),
			value: site.whatsappDisplay,
			href: `https://wa.me/${site.whatsappNumber}`,
			hint: t('contact.method.whatsappHint'),
			accent: 'bg-[#25D366]'
		},
		{
			icon: 'phone',
			label: t('contact.method.phone'),
			value: site.phoneDisplay,
			href: site.phoneHref,
			hint: t('contact.method.phoneHint'),
			accent: 'bg-abk-blue'
		},
		{
			icon: 'mail',
			label: t('contact.method.email'),
			value: site.email,
			href: `mailto:${site.email}`,
			hint: t('contact.method.emailHint'),
			accent: 'bg-abk-navy'
		}
	]);
</script>

<Seo
	title="Contact"
	canonical="/contact"
	description={`Contact ${site.name} — WhatsApp ${site.whatsappDisplay} or call ${site.phoneDisplay}. Genuine Japanese auto parts with worldwide export.`}
	jsonLd={[breadcrumbJsonLd([{ name: 'Home', url: '/' }, { name: 'Contact', url: '/contact' }])]}
/>

<section class="border-b border-slate-200 bg-white">
	<div class="container-page py-16">
		<div class="rule-brand mb-3"></div>
		<p class="text-sm font-bold uppercase tracking-wider text-abk-red">{t('contact.eyebrow')}</p>
		<h1 class="mt-3 text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">
			{t('contact.heading')}
		</h1>
		<p class="mt-4 max-w-2xl text-lg leading-relaxed text-slate-600">{t('contact.lead')}</p>
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
				<p dir="ltr" class="mt-1 break-all text-lg font-black text-slate-800 group-hover:text-abk-blue">
					{m.value}
				</p>
				<p class="mt-1 text-sm text-slate-500">{m.hint}</p>
			</a>
		{/each}
	</div>

	<!-- Map -->
	<div class="mt-10 overflow-hidden rounded-2xl border border-slate-200 shadow-[var(--shadow-card)]">
		<div class="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-6 py-4">
			<h2 class="flex items-center gap-2 text-lg font-bold text-slate-800">
				<Icon name="pin" size={20} class="text-abk-blue" />
				{t('contact.map.heading')}
			</h2>
			<a
				href={mapLink}
				target="_blank"
				rel="noopener"
				class="inline-flex items-center gap-1.5 text-sm font-bold text-abk-blue hover:underline"
			>
				{t('contact.map.directions')}
				<Icon name="arrow" size={16} class="rtl:-scale-x-100" />
			</a>
		</div>
		<iframe
			src={mapSrc}
			title={`${site.name} — ${t('contact.map.heading')}`}
			class="block h-[380px] w-full border-0"
			loading="lazy"
			referrerpolicy="no-referrer-when-downgrade"
			allowfullscreen
		></iframe>
	</div>

	<div class="mt-10 grid gap-6 lg:grid-cols-2">
		<div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-[var(--shadow-card)]">
			<h2 class="flex items-center gap-2 text-lg font-bold text-slate-800">
				<Icon name="clock" size={20} class="text-abk-blue" />
				{t('contact.hours')}
			</h2>
			<p class="mt-3 text-slate-600">{site.hours}</p>
			<h2 class="mt-6 flex items-center gap-2 text-lg font-bold text-slate-800">
				<Icon name="pin" size={20} class="text-abk-blue" />
				{t('contact.location')}
			</h2>
			<p class="mt-3 text-slate-600">
				{site.address.city}, {site.address.country}
			</p>
		</div>

		<div class="flex flex-col justify-center rounded-2xl bg-slate-50 p-8 text-center">
			<div class="rule-brand mx-auto mb-3 w-fit"></div>
			<h2 class="text-2xl font-black tracking-tight text-slate-800">{t('contact.ready.heading')}</h2>
			<p class="mx-auto mt-2 max-w-md text-slate-500">{t('contact.ready.lead')}</p>
			<div class="mt-6 flex flex-wrap justify-center gap-3">
				<a
					href={`https://wa.me/${site.whatsappNumber}`}
					target="_blank"
					rel="noopener"
					class="inline-flex items-center gap-2 rounded-full bg-abk-red px-6 py-3 text-sm font-bold text-white shadow-md transition hover:bg-abk-red-dark"
				>
					<Icon name="whatsapp" size={18} />
					{t('contact.ready.cta')}
				</a>
				<a
					href={url('/parts')}
					class="inline-flex items-center gap-2 rounded-full border border-slate-300 px-6 py-3 text-sm font-bold text-slate-700 transition hover:border-abk-blue hover:text-abk-blue"
				>
					{t('action.browseCatalogue')}
				</a>
			</div>
		</div>
	</div>
</section>
