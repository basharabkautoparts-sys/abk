<script lang="ts">
	import { asset } from '$lib/paths';

	interface Props {
		/** Paths under static/, in the order they should appear. */
		images: string[];
		/** Seconds for one full pass. Longer = slower. */
		duration?: number;
		label: string;
	}
	let { images, duration = 60, label }: Props = $props();

	/**
	 * The track holds the list twice. The animation travels exactly -50%, so the
	 * moment the first copy has scrolled out the second is sitting precisely
	 * where the first began — the loop has no seam and no jump. Any approach
	 * that animates a single copy has to snap back at the end.
	 */
	const track = $derived([...images, ...images]);
</script>

<!-- Bashar's own photographs of the stock he ships. Decorative movement, so it
     pauses on hover, stops entirely for anyone who asked for reduced motion,
     and the duplicated half is hidden from screen readers. -->
<section class="overflow-hidden border-y border-slate-100 bg-white py-10" aria-label={label}>
	<div class="marquee-viewport">
		<ul class="marquee-track" style="--marquee-duration: {duration}s">
			{#each track as src, i}
				<li class="shrink-0" aria-hidden={i >= images.length ? 'true' : undefined}>
					<!-- Deliberately not `loading="lazy"`: the track never stops, so a
					     frame that has not loaded yet slides into view as a hole. The
					     strip is ~750KB below the fold, and a low fetch priority keeps
					     it behind everything that matters. -->
					<img
						src={asset(src)}
						alt={i < images.length ? label : ''}
						width="800"
						height="800"
						fetchpriority="low"
						decoding="async"
						class="h-40 w-40 rounded-xl border border-slate-200 object-cover sm:h-48 sm:w-48"
					/>
				</li>
			{/each}
		</ul>
	</div>
</section>

<style>
	.marquee-viewport {
		overflow: hidden;
		/* The track always travels the same way, so the strip reads identically
		   on the Arabic (RTL) side of the site. */
		direction: ltr;
	}

	.marquee-track {
		display: flex;
		width: max-content;
		gap: 1rem;
		padding-inline: 0.5rem;
		margin: 0;
		list-style: none;
		animation: abk-marquee var(--marquee-duration) linear infinite;
	}

	.marquee-viewport:hover .marquee-track,
	.marquee-viewport:focus-within .marquee-track {
		animation-play-state: paused;
	}

	@keyframes abk-marquee {
		from {
			transform: translateX(0);
		}
		to {
			/* Exactly one copy of the list. */
			transform: translateX(-50%);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.marquee-track {
			animation: none;
		}
		/* Without the animation the strip would be a dead, clipped row, so let it
		   be scrolled by hand instead. */
		.marquee-viewport {
			overflow-x: auto;
		}
	}
</style>
