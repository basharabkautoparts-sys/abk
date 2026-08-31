<script lang="ts" module>
	/**
	 * Vehicle-brand marks — the manufacturers ABK stocks, shown so a customer can
	 * see at a glance whether their vehicle is covered.
	 *
	 * The artwork is each maker's own logo, taken from Wikimedia Commons, where
	 * all four are in the public domain: they consist of simple geometric shapes
	 * and text, which does not meet the threshold of originality for copyright.
	 * They remain registered trademarks, and are used here nominatively — to name
	 * the brands this shop supplies parts for, which is what a parts counter's
	 * badge wall does. See static/brands/SOURCES.md.
	 *
	 * `hasWordmark` says whether the artwork already spells the brand's name.
	 * Where it does, the card must not print the name underneath it as well.
	 *
	 * A brand with no file here — one added later in /admin/brands — falls back
	 * to its name set as a wordmark, so the row never renders a broken image.
	 */

	interface Logo {
		file: string;
		/** True when the artwork itself contains the brand name. */
		hasWordmark: boolean;
		/**
		 * Multiplier on the caller's `size`.
		 *
		 * These four range from about 6:1 (the Toyota and Isuzu lockups) to
		 * roughly square (the Nissan ring, the Mitsubishi diamonds). Drawn at one
		 * common height a wordmark ends up four times the width of an emblem and
		 * dwarfs it; drawn to one common width the emblems become specks. So each
		 * gets its own height, chosen to give the four similar presence on the
		 * card rather than similar dimensions.
		 */
		scale: number;
	}

	const LOGOS: Record<string, Logo> = {
		toyota: { file: 'toyota.svg', hasWordmark: true, scale: 0.55 },
		isuzu: { file: 'isuzu.svg', hasWordmark: true, scale: 0.5 },
		nissan: { file: 'nissan.svg', hasWordmark: true, scale: 1.15 },
		// The three diamonds alone; Mitsubishi's emblem carries no lettering.
		mitsubishi: { file: 'mitsubishi.svg', hasWordmark: false, scale: 1 }
	};

	/**
	 * True when something else has to supply the brand's name — either there is
	 * no logo for it, or the logo is an emblem with no lettering.
	 */
	export function needsNameLabel(slug: string): boolean {
		return !LOGOS[slug]?.hasWordmark;
	}

	/** True when no artwork exists and the name itself stands in as the mark. */
	export function isWordmark(slug: string): boolean {
		return !(slug in LOGOS);
	}
</script>

<script lang="ts">
	import { asset } from '$lib/paths';

	interface Props {
		slug: string;
		name: string;
		/** Nominal size in px; each logo's own `scale` is applied to it. */
		size?: number;
		class?: string;
	}
	let { slug, name, size = 44, class: cls = '' }: Props = $props();

	const logo = $derived(LOGOS[slug]);
	const height = $derived(logo ? Math.round(size * logo.scale) : size);
</script>

{#if logo}
	<img
		src={asset(`/brands/${logo.file}`)}
		alt={name}
		class="object-contain {cls}"
		style="height: {height}px; max-width: {Math.round(size * 3.4)}px;"
		loading="lazy"
		decoding="async"
	/>
{:else}
	<!-- No artwork for this brand: its name, set as the mark. `dir="ltr"` keeps a
	     Latin marque the right way round on the Arabic side of the site. -->
	<span
		dir="ltr"
		class="font-black uppercase leading-none {cls}"
		style="font-size: {Math.round(size * 0.5)}px; letter-spacing: 0.06em;"
	>
		{name}
	</span>
{/if}
