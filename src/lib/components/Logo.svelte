<script lang="ts">
	import { asset } from '$lib/paths';
	import { site } from '$lib/config';

	interface Props {
		/** Height of the oval mark itself, in px. The wordmark adds to this. */
		height?: number;
		/**
		 * Show the "A.B.K. AUTO PARTS CO., LTD." line under the mark — the full
		 * company lockup, as supplied by the owner. Off by default because the
		 * header has too little vertical room for it.
		 */
		wordmark?: boolean;
		class?: string;
	}
	let { height = 46, wordmark = false, class: cls = '' }: Props = $props();

	/**
	 * The wordmark is set as text rather than shipped as a second image: it stays
	 * crisp at every size and in every pixel density, it re-colours for a dark
	 * surface, and it is one less asset to keep in step with the mark. The ratio
	 * below is what makes the line span roughly the width of the oval.
	 */
	const wordmarkSize = $derived(Math.max(7, Math.round(height * 0.235)));

	/** "A.B.K. Auto Parts Co., Ltd" → "A.B.K. AUTO PARTS CO., LTD." */
	const lockup = site.legalName.toUpperCase().replace(/\.?$/, '.');
</script>

<span class="inline-flex flex-col items-center leading-none {cls}">
	<img
		src={asset('/logo.png')}
		alt={wordmark ? '' : site.name}
		aria-hidden={wordmark ? 'true' : undefined}
		width={Math.round(height * 2.12)}
		{height}
		style="height: {height}px; width: auto;"
		decoding="async"
	/>
	{#if wordmark}
		<!-- `dir="ltr"`: the lockup is Latin, and in an Arabic (RTL) page its
		     trailing full stop would otherwise be reordered to the front. -->
		<span
			dir="ltr"
			class="abk-wordmark"
			style="font-size: {wordmarkSize}px; margin-top: {Math.round(height * 0.11)}px;"
		>
			{lockup}
		</span>
	{/if}
</span>

<style>
	/* Blue serif, letter-spaced — matching the printed lockup on the company's
	   own artwork. `currentColor` lets a dark surface override it. */
	.abk-wordmark {
		font-family: Georgia, 'Times New Roman', 'Noto Serif', serif;
		font-weight: 700;
		letter-spacing: 0.015em;
		white-space: nowrap;
		color: var(--color-abk-blue);
	}
</style>
