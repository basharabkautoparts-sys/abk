<script lang="ts">
	import { site } from '$lib/config';
	import { absoluteUrl, pageTitle, serializeJsonLd, type SeoInput } from '$lib/seo';

	interface Props extends SeoInput {
		/** One or more JSON-LD objects to embed. */
		jsonLd?: unknown[];
	}

	let {
		title,
		description = site.description,
		canonical,
		image = '/og-image.jpg',
		type = 'website',
		noindex = false,
		jsonLd = []
	}: Props = $props();

	const fullTitle = $derived(pageTitle(title));
	const canonicalUrl = $derived(absoluteUrl(canonical ?? '/'));
	const imageUrl = $derived(absoluteUrl(image));
</script>

<svelte:head>
	<title>{fullTitle}</title>
	<meta name="description" content={description} />
	<link rel="canonical" href={canonicalUrl} />
	{#if noindex}
		<meta name="robots" content="noindex, nofollow" />
	{:else}
		<meta name="robots" content="index, follow" />
	{/if}

	<!-- Open Graph -->
	<meta property="og:type" content={type} />
	<meta property="og:site_name" content={site.shortName} />
	<meta property="og:title" content={fullTitle} />
	<meta property="og:description" content={description} />
	<meta property="og:url" content={canonicalUrl} />
	<meta property="og:image" content={imageUrl} />
	<meta property="og:locale" content="en_US" />

	<!-- Twitter -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={fullTitle} />
	<meta name="twitter:description" content={description} />
	<meta name="twitter:image" content={imageUrl} />

	{#each jsonLd as block}
		{@html `<script type="application/ld+json">${serializeJsonLd(block)}<\/script>`}
	{/each}
</svelte:head>
