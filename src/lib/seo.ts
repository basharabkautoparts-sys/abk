import { site, categories, brands } from './config';
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
	if (!title) return `${site.name} — ${site.tagline} (Toyota, Isuzu, Mitsubishi, Nissan)`;
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
		brand: brands.map((b) => ({ '@type': 'Brand', name: b.name })),
		makesOffer: categories.map((c) => ({
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
		image: part.images.length ? part.images.map(absoluteUrl) : [absoluteUrl('/og-image.jpg')],
		offers: {
			'@type': 'Offer',
			priceCurrency: part.currency,
			...(part.price != null ? { price: part.price } : {}),
			availability: part.in_stock
				? 'https://schema.org/InStock'
				: 'https://schema.org/OutOfStock',
			seller: { '@type': 'Organization', name: site.name },
			url: absoluteUrl(`/parts/${part.slug}`)
		}
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
