<script lang="ts">
	import { asset } from '$lib/paths';
	import { i18n, t, type TranslationKey } from '$lib/i18n.svelte';

	// Same equirectangular projection as maps/world-land.svg.
	function project(lon: number, lat: number) {
		return { x: ((lon + 180) * 1000) / 360, y: ((85 - lat) * 1000) / 360 };
	}
	const origin = project(100.50, 13.75);
	const destinations = [
		{ key: 'export.saudi', lon: 46.68, lat: 24.71, labelX: 622, labelY: 176, anchor: 'middle' },
		{ key: 'export.dubai', lon: 55.27, lat: 25.20, labelX: 660, labelY: 156, anchor: 'start' },
		{ key: 'export.yemen', lon: 44.21, lat: 15.37, labelX: 630, labelY: 212, anchor: 'middle' },
		{ key: 'export.sudan', lon: 32.53, lat: 15.50, labelX: 579, labelY: 208, anchor: 'middle' },
		{ key: 'export.libya', lon: 13.19, lat: 32.89, labelX: 530, labelY: 164, anchor: 'middle' },
		{ key: 'export.panama', lon: -79.52, lat: 8.98, labelX: 279, labelY: 231, anchor: 'middle' },
		{ key: 'export.chad', lon: 15.06, lat: 12.13, labelX: 530, labelY: 222, anchor: 'middle' },
		{ key: 'export.egypt', lon: 31.24, lat: 30.04, labelX: 585, labelY: 140, anchor: 'middle' },
		{ key: 'export.iraq', lon: 44.36, lat: 33.32, labelX: 623, labelY: 132, anchor: 'middle' },
		{ key: 'export.oman', lon: 58.41, lat: 23.59, labelX: 671, labelY: 184, anchor: 'start' }
	].map((destination) => ({ ...destination, ...project(destination.lon, destination.lat) }));

	function labelLines(key: string): string[] {
		const label = t(key as TranslationKey);
		// Two short lines keep Saudi Arabia close to its marker in the Gulf cluster.
		return key === 'export.saudi' && i18n.lang === 'en' ? label.split(' ') : [label];
	}

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
				<path d={route(destination)} fill="none" stroke="var(--color-abk-blue)" stroke-width="1.1" opacity="0.2" />
			{/each}
			{#each destinations as destination}
				<circle cx={destination.x} cy={destination.y} r="3" fill="var(--color-abk-blue)" stroke="white" stroke-width="1">
					<title>{t(destination.key as TranslationKey)}</title>
				</circle>
			{/each}
			{#each destinations as destination}
				<text
					x={destination.labelX}
					y={destination.labelY}
					text-anchor={destination.anchor}
					class="destination-label"
				>
					{#each labelLines(destination.key) as line, index}
						<tspan x={destination.labelX} dy={index === 0 ? 0 : 13}>{line}</tspan>
					{/each}
				</text>
			{/each}
			<circle cx={origin.x} cy={origin.y} r="9" fill="var(--color-abk-red)" opacity="0.14" />
			<circle cx={origin.x} cy={origin.y} r="4.5" fill="var(--color-abk-red)" stroke="white" stroke-width="2" />
			<text x={origin.x} y={origin.y + 27} text-anchor="middle" fill="var(--color-abk-red)" font-size="16" font-weight="700" stroke="white" stroke-width="2" paint-order="stroke">{t('export.origin')}</text>
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
	.destination-label {
		fill: var(--color-abk-navy);
		font-size: 13px;
		font-weight: 500;
		stroke: white;
		stroke-width: 2px;
		stroke-linejoin: round;
		paint-order: stroke;
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
