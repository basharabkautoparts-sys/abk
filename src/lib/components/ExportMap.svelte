<script lang="ts">
	import { asset } from '$lib/paths';
	import { t, type TranslationKey } from '$lib/i18n.svelte';

	// Same equirectangular projection as maps/world-land.svg.
	function project(lon: number, lat: number) {
		return { x: ((lon + 180) * 1000) / 360, y: ((85 - lat) * 1000) / 360 };
	}
	const origin = project(100.50, 13.75);
	const destinations = [
		{ key: 'export.saudi', lon: 46.68, lat: 24.71 },
		{ key: 'export.dubai', lon: 55.27, lat: 25.20 },
		{ key: 'export.yemen', lon: 44.21, lat: 15.37 },
		{ key: 'export.sudan', lon: 32.53, lat: 15.50 },
		{ key: 'export.libya', lon: 13.19, lat: 32.89 },
		{ key: 'export.panama', lon: -79.52, lat: 8.98 },
		{ key: 'export.chad', lon: 15.06, lat: 12.13 },
		{ key: 'export.egypt', lon: 31.24, lat: 30.04 },
		{ key: 'export.iraq', lon: 44.36, lat: 33.32 },
		{ key: 'export.oman', lon: 58.41, lat: 23.59 }
	].map((destination) => ({ ...destination, ...project(destination.lon, destination.lat) }));

	function route(destination: { x: number; y: number }) {
		const midpoint = (origin.x + destination.x) / 2;
		const arcHeight = Math.max(30, Math.abs(origin.x - destination.x) * 0.24);
		return `M ${origin.x} ${origin.y} Q ${midpoint} ${Math.min(origin.y, destination.y) - arcHeight} ${destination.x} ${destination.y}`;
	}
</script>

<section class="border-t border-slate-100 bg-white py-16" aria-labelledby="export-heading">
	<div class="container-page">
		<div class="text-center">
			<div class="rule-brand mx-auto mb-3 w-fit"></div>
			<p class="text-sm font-bold uppercase tracking-wider text-abk-red">{t('export.eyebrow')}</p>
			<h2 id="export-heading" class="mt-2 text-3xl font-black tracking-tight text-slate-800">{t('export.heading')}</h2>
			<p class="mx-auto mt-3 max-w-2xl text-slate-500">{t('export.lead')}</p>
		</div>

		<svg viewBox="0 0 1000 420" role="img" aria-label={t('export.mapLabel')} class="mt-8 block h-auto w-full" xmlns="http://www.w3.org/2000/svg">
			<image href={asset('/maps/world-land.svg')} width="1000" height="420" />
			{#each destinations as destination}
				<path d={route(destination)} fill="none" stroke="var(--color-abk-blue)" stroke-width="1.4" opacity="0.55" />
				<circle cx={destination.x} cy={destination.y} r="3.5" fill="var(--color-abk-blue)" stroke="white" stroke-width="1">
					<title>{t(destination.key as TranslationKey)}</title>
				</circle>
			{/each}
			<circle cx={origin.x} cy={origin.y} r="11" fill="var(--color-abk-red)" opacity="0.14" />
			<circle cx={origin.x} cy={origin.y} r="5.5" fill="var(--color-abk-red)" stroke="white" stroke-width="2" />
			<text x={origin.x} y={origin.y + 27} text-anchor="middle" fill="var(--color-abk-red)" font-size="16" font-weight="700" stroke="white" stroke-width="4" paint-order="stroke">{t('export.origin')}</text>
		</svg>

		<div class="mt-3 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm font-semibold">
			<p class="flex items-center gap-2 text-abk-red"><span class="h-2.5 w-2.5 rounded-full bg-abk-red"></span>{t('export.origin')}</p>
			<p class="flex items-center gap-2 text-abk-blue"><span class="h-2.5 w-2.5 rounded-full bg-abk-blue"></span>{t('export.destinations')}</p>
		</div>
		<ul class="mx-auto mt-6 flex max-w-3xl flex-wrap justify-center gap-x-6 gap-y-3 text-sm text-slate-600" aria-label={t('export.destinations')}>
			{#each destinations as destination}
				<li>{t(destination.key as TranslationKey)}</li>
			{/each}
		</ul>
	</div>
</section>
