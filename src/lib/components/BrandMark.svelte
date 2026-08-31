<script lang="ts" module>
	/**
	 * Vehicle-brand marks, drawn as inline SVG.
	 *
	 * These are the manufacturers ABK stocks, shown so a customer can see at a
	 * glance whether their vehicle is covered — nominative use, the same reason
	 * a parts counter puts the badges on the wall. They are drawn here rather
	 * than shipped as image files so they stay sharp at any size, inherit
	 * `currentColor` (one mark works on white and on a dark band), and add
	 * nothing to the asset budget.
	 *
	 * A brand with no mark below falls back to its own name set as a wordmark,
	 * so adding "Mazda" or anything else in /admin/brands renders correctly the
	 * moment it is saved — no code change, no missing-image gap.
	 */

	interface Mark {
		viewBox: string;
		/** SVG body. Stroked paths use `stroke="currentColor"` via the wrapper. */
		body: string;
		/** Stroke width in viewBox units, when the mark is drawn with strokes. */
		stroke?: number;
	}

	const MARKS: Record<string, Mark> = {
		// Three ellipses: the wide outer ring, the vertical "steering wheel",
		// and the horizontal ellipse crossing it.
		toyota: {
			viewBox: '0 0 120 82',
			stroke: 6,
			body: `
				<ellipse cx="60" cy="41" rx="56" ry="37" />
				<ellipse cx="60" cy="48" rx="17" ry="26" />
				<ellipse cx="60" cy="27" rx="38" ry="13" />`
		},

		// Three rhombi sharing the centre vertex, at 120° to each other.
		// viewBox is cropped to the drawn shape: rotating the rhombus about its
		// centre vertex puts the artwork in x 8–92, y 10–82, and a looser box
		// would render the mark visibly smaller than its neighbours.
		mitsubishi: {
			viewBox: '6 7 88 78',
			body: `
				<path d="M50 58 L28 34 L50 10 L72 34 Z" fill="currentColor" />
				<path d="M50 58 L28 34 L50 10 L72 34 Z" fill="currentColor" transform="rotate(120 50 58)" />
				<path d="M50 58 L28 34 L50 10 L72 34 Z" fill="currentColor" transform="rotate(240 50 58)" />`
		},

		// Ring crossed by a horizontal bar.
		nissan: {
			viewBox: '0 0 120 120',
			stroke: 7,
			body: `
				<circle cx="60" cy="60" r="47" />
				<path d="M4 60 H116" />`
		},

		// Outer ring with the stylised wing sweeping through it.
		mazda: {
			viewBox: '0 0 120 82',
			stroke: 6,
			body: `
				<ellipse cx="60" cy="41" rx="56" ry="37" />
				<path d="M26 30 Q60 62 94 30" />
				<path d="M60 47 Q60 32 42 26" />
				<path d="M60 47 Q60 32 78 26" />`
		},

		// "H" inside the rounded shield.
		honda: {
			viewBox: '0 0 100 82',
			stroke: 7,
			body: `
				<rect x="6" y="6" width="88" height="70" rx="16" />
				<path d="M32 24 V58 M68 24 V58 M32 41 H68" />`
		}
	};

	/**
	 * True when the mark rendered for this brand *is* its name — either because
	 * the brand's logo is a wordmark (Isuzu) or because there is no symbol for
	 * it here yet. Callers use it to avoid printing the name twice.
	 */
	export function isWordmark(slug: string): boolean {
		return !(slug in MARKS);
	}
</script>

<script lang="ts">
	interface Props {
		slug: string;
		name: string;
		/** Height of the mark in px; the width follows the mark's aspect ratio. */
		size?: number;
		class?: string;
	}
	let { slug, name, size = 44, class: cls = '' }: Props = $props();

	const mark = $derived(MARKS[slug]);
</script>

{#if mark}
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox={mark.viewBox}
		height={size}
		role="img"
		aria-label={name}
		fill="none"
		stroke="currentColor"
		stroke-width={mark.stroke ?? 0}
		stroke-linecap="round"
		stroke-linejoin="round"
		style="height: {size}px; width: auto;"
		class={cls}
	>
		<!-- eslint-disable-next-line svelte/no-at-html-tags -- static, in-module markup -->
		{@html mark.body}
	</svg>
{:else}
	<!-- No symbol for this brand: its name, set as the mark. `dir="ltr"` keeps a
	     Latin marque the right way round on the Arabic side of the site. -->
	<span
		dir="ltr"
		class="font-black uppercase leading-none {cls}"
		style="font-size: {Math.round(size * 0.5)}px; letter-spacing: 0.06em;"
	>
		{name}
	</span>
{/if}
