import { site } from './config';
import { taxonomy } from './taxonomy.svelte';
import { url } from './paths';
import type { Part } from './types';

export interface SeoInput {
	title?: string;
	description?: string;
	/** Path (e.g. "/parts") or absolute URL. */
	canonical?: string;
	/** Path or absolute URL to the social image. */
	image?: string;
	type?: 'website' | 'article' | 'product';
	noindex?: boolean;
}

/** "<page> | ABK Auto Parts" — or the branded default for the home page. */
export function pageTitle(title?: string): string {
	if (!title) {
		const brandList = taxonomy.brands.map((b) => b.name).join(', ');
		return `${site.name} — ${site.tagline}${brandList ? ` (${brandList})` : ''}`;
	}
	return `${title} | ${site.shortName}`;
}

/**
 * Resolve a base-less internal path to an absolute URL — origin, plus the
 * deployment's base path, plus the path itself. Used for canonical URLs, Open
 * Graph tags, JSON-LD and the sitemap, so these must be the URLs a visitor
 * actually lands on.
 */
export function absoluteUrl(pathOrUrl = '/'): string {
	if (/^https?:\/\//.test(pathOrUrl)) return pathOrUrl;
	const path = pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`;
	return `${site.url.replace(/\/$/, '')}${url(path)}`;
}

/** Escape a string for safe embedding inside a <script type="application/ld+json"> tag. */
export function serializeJsonLd(data: unknown): string {
	return JSON.stringify(data).replace(/</g, '\\u003c');
}

export function organizationJsonLd() {
	return {
		'@context': 'https://schema.org',
		'@type': 'AutoPartsStore',
		name: site.name,
		description: site.description,
		url: site.url,
		logo: absoluteUrl('/logo.png'),
		image: absoluteUrl('/og-image.jpg'),
		telephone: site.phoneHref.replace('tel:', ''),
		slogan: site.slogan,
		address: {
			'@type': 'PostalAddress',
			addressLocality: site.address.city,
			addressCountry: site.address.countryCode
		},
		brand: taxonomy.brands.map((b) => ({ '@type': 'Brand', name: b.name })),
		makesOffer: taxonomy.categories.map((c) => ({
			'@type': 'Offer',
			itemOffered: { '@type': 'Product', category: c.name }
		}))
	};
}

export function websiteJsonLd() {
	return {
		'@context': 'https://schema.org',
		'@type': 'WebSite',
		name: site.name,
		url: site.url,
		potentialAction: {
			'@type': 'SearchAction',
			target: `${site.url}/parts?q={search_term_string}`,
			'query-input': 'required name=search_term_string'
		}
	};
}

export function productJsonLd(part: Part) {
	return {
		'@context': 'https://schema.org',
		'@type': 'Product',
		name: part.name,
		sku: part.part_number,
		mpn: part.oem ?? part.part_number,
		category: part.category.name,
		brand: { '@type': 'Brand', name: part.brand.name },
		description: part.description,
		image: part.images.length ? part.images.map(absoluteUrl) : [absoluteUrl('/og-image.jpg')]
		// No `offers`, deliberately: ABK quotes per enquiry, including export
		// shipping, so there is no price to publish, and an Offer without one is
		// not valid structured data — Google's Product guidelines require price
		// for the Offer to be eligible at all. Availability and a URL alone don't
		// add up to a valid Offer, so we drop the block entirely rather than
		// publish a broken one; the rest of the Product schema stands on its own.
	};
}

export function breadcrumbJsonLd(items: { name: string; url: string }[]) {
	return {
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		itemListElement: items.map((item, i) => ({
			'@type': 'ListItem',
			position: i + 1,
			name: item.name,
			item: absoluteUrl(item.url)
		}))
	};
}
