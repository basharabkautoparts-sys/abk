<script lang="ts">
	import { asset } from '$lib/paths';
	import { t, type TranslationKey } from '$lib/i18n.svelte';

	// Same equirectangular projection as maps/world-land.svg.
	function project(lon: number, lat: number) {
		return { x: ((lon + 180) * 1000) / 360, y: ((85 - lat) * 1000) / 360 };
	}
	const origin = project(100.50, 13.75);
	const destinations = [
		{ key: 'export.saudi', lon: 46.68, lat: 24.71, labelX: 645, labelY: 225, labelWidth: 116 },
		{ key: 'export.dubai', lon: 55.27, lat: 25.20, labelX: 710, labelY: 144, labelWidth: 68 },
		{ key: 'export.yemen', lon: 44.21, lat: 15.37, labelX: 629, labelY: 270, labelWidth: 76 },
		{ key: 'export.sudan', lon: 32.53, lat: 15.50, labelX: 554, labelY: 250, labelWidth: 76 },
		{ key: 'export.libya', lon: 13.19, lat: 32.89, labelX: 486, labelY: 149, labelWidth: 66 },
		{ key: 'export.panama', lon: -79.52, lat: 8.98, labelX: 267, labelY: 241, labelWidth: 88 },
		{ key: 'export.chad', lon: 15.06, lat: 12.13, labelX: 485, labelY: 218, labelWidth: 66 },
		{ key: 'export.egypt', lon: 31.24, lat: 30.04, labelX: 555, labelY: 112, labelWidth: 72 },
		{ key: 'export.iraq', lon: 44.36, lat: 33.32, labelX: 643, labelY: 100, labelWidth: 66 },
		{ key: 'export.oman', lon: 58.41, lat: 23.59, labelX: 725, labelY: 192, labelWidth: 72 }
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

		<!-- The scrollable map needs keyboard focus so arrow keys can reveal off-screen labels. -->
		<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
		<div class="map-viewport" role="region" aria-label={t('export.mapLabel')} tabindex="0" dir="ltr">
		<svg viewBox="0 0 1000 420" role="img" aria-label={t('export.mapLabel')} class="export-map" xmlns="http://www.w3.org/2000/svg">
			<image href={asset('/maps/world-land.svg')} width="1000" height="420" />
			{#each destinations as destination}
				<path d={route(destination)} fill="none" stroke="var(--color-abk-blue)" stroke-width="1.4" opacity="0.4" />
			{/each}
			{#each destinations as destination}
				<line x1={destination.x} y1={destination.y} x2={destination.labelX} y2={destination.labelY} stroke="#64748b" stroke-width="0.8" />
			{/each}
			{#each destinations as destination}
				<circle cx={destination.x} cy={destination.y} r="3.5" fill="var(--color-abk-blue)" stroke="white" stroke-width="1">
					<title>{t(destination.key as TranslationKey)}</title>
				</circle>
			{/each}
			{#each destinations as destination}
				<g>
					<rect x={destination.labelX - destination.labelWidth / 2} y={destination.labelY - 13} width={destination.labelWidth} height="27" rx="4" fill="white" fill-opacity="0.95" />
					<text x={destination.labelX} y={destination.labelY} text-anchor="middle" dominant-baseline="central" fill="var(--color-abk-blue)" font-size="16" font-weight="600">{t(destination.key as TranslationKey)}</text>
				</g>
			{/each}
			<circle cx={origin.x} cy={origin.y} r="11" fill="var(--color-abk-red)" opacity="0.14" />
			<circle cx={origin.x} cy={origin.y} r="5.5" fill="var(--color-abk-red)" stroke="white" stroke-width="2" />
			<text x={origin.x} y={origin.y + 27} text-anchor="middle" fill="var(--color-abk-red)" font-size="16" font-weight="700" stroke="white" stroke-width="4" paint-order="stroke">{t('export.origin')}</text>
		</svg>
		</div>
		<p class="map-scroll-hint">{t('export.scrollHint')}</p>

		<div class="map-legend">
			<p class="text-abk-red"><span class="bg-abk-red"></span>{t('export.origin')}</p>
			<p class="text-abk-blue"><span class="bg-abk-blue"></span>{t('export.destinations')}</p>
		</div>
	</div>
</section>

<style>
	.map-viewport {
		margin-top: 2rem;
		overflow-x: auto;
	}
	.export-map {
		display: block;
		width: 100%;
		min-width: 48rem;
		height: auto;
	}
	.map-legend {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 0.75rem 2rem;
		margin-top: 0.75rem;
		font-size: 0.875rem;
		font-weight: 600;
	}
	.map-legend p {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}
	.map-legend span {
		width: 0.625rem;
		height: 0.625rem;
		border-radius: 50%;
	}
	.map-scroll-hint {
		margin-top: 0.75rem;
		text-align: center;
		font-size: 0.75rem;
		color: #64748b;
	}
	@media (min-width: 52rem) {
		.map-scroll-hint { display: none; }
	}
</style>
