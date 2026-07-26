import type { Brand, Category } from './types';

/**
 * Central brand + contact configuration for A.B.K. Auto Parts.
 * Values marked TODO are placeholders (not present on the source artwork) —
 * fill them with the real business details before launch.
 */
export const site = {
	name: 'A.B.K. Auto Parts Co., Ltd',
	shortName: 'ABK Auto Parts',
	legalName: 'A.B.K. Auto Parts Co., Ltd',
	tagline: 'Genuine Japanese Parts',
	slogan: 'Quality you can trust, service you can rely on.',
	description:
		'A.B.K. Auto Parts Co., Ltd supplies 100% genuine Japanese auto parts for Toyota, Isuzu, Mitsubishi and Nissan, with fast and reliable global export from Thailand.',

	/**
	 * Origin the site is served from, with no trailing slash and no base path —
	 * `absoluteUrl()` adds the base path. Set `PUBLIC_SITE_URL` at build time;
	 * the default is the GitHub Pages project site.
	 */
	url: import.meta.env.PUBLIC_SITE_URL || 'https://basharabkautoparts-sys.github.io',

	// --- Contact (from the brand artwork) ---
	phoneDisplay: '065-581-2720',
	phoneHref: 'tel:+66655812720',
	whatsappNumber: '66655812720', // digits only, for wa.me links
	whatsappDisplay: '+66 65-581-2720',

	// --- TODO: confirm these before launch (not on the artwork) ---
	email: 'info@abkautoparts.com',
	address: {
		line1: '',
		city: 'Bangkok',
		region: '',
		postalCode: '',
		country: 'Thailand',
		countryCode: 'TH'
	},

	social: {
		facebook: '' // TODO: add the ABK Facebook page URL
	},

	hours: 'Mon–Sat, 8:00–18:00 (ICT)'
} as const;

/** Selling points shown on the hero / feature strip (from the artwork). */
export const features = [
	{
		icon: 'shield',
		title: '100% Genuine',
		text: 'Authentic Japanese parts, sourced and verified — no imitations.'
	},
	{
		icon: 'globe',
		title: 'Global Export',
		text: 'Fast, reliable worldwide shipping direct from Thailand.'
	},
	{
		icon: 'medal',
		title: 'Premium Quality',
		text: 'Trusted service and quality you can rely on, order after order.'
	}
] as const;

/** Primary top navigation. */
export const nav = [
	{ label: 'Home', href: '/' },
	{ label: 'All Parts', href: '/parts' },
	{ label: 'About', href: '/about' },
	{ label: 'Contact', href: '/contact' }
] as const;

/** Vehicle brands ABK supplies (from the artwork). */
export const brands: Brand[] = [
	{ id: 'toyota', slug: 'toyota', name: 'Toyota' },
	{ id: 'isuzu', slug: 'isuzu', name: 'Isuzu' },
	{ id: 'mitsubishi', slug: 'mitsubishi', name: 'Mitsubishi' },
	{ id: 'nissan', slug: 'nissan', name: 'Nissan' }
];

/** Part categories. Icons map to CategoryIcon.svelte. */
export const categories: Category[] = [
	{
		id: 'engine-transmission',
		slug: 'engine-transmission',
		name: 'Engine & Transmission',
		description: 'Pistons, gaskets, timing kits, mounts and transmission components.',
		icon: 'engine',
		sort_order: 1
	},
	{
		id: 'brake-differential',
		slug: 'brake-differential',
		name: 'Brake & Differential',
		description: 'Brake discs, pads, calipers, master cylinders and differential parts.',
		icon: 'brake',
		sort_order: 2
	},
	{
		id: 'suspension-steering',
		slug: 'suspension-steering',
		name: 'Suspension & Steering',
		description: 'Shock absorbers, coil springs, ball joints, tie rod ends and bushings.',
		icon: 'suspension',
		sort_order: 3
	},
	{
		id: 'filters',
		slug: 'filters',
		name: 'Filters',
		description: 'Oil, air, fuel and cabin filters for every service interval.',
		icon: 'filter',
		sort_order: 4
	},
	{
		id: 'clutch-drivetrain',
		slug: 'clutch-drivetrain',
		name: 'Clutch & Drivetrain',
		description: 'Clutch discs, pressure plates, CV joints, axles and bearings.',
		icon: 'clutch',
		sort_order: 5
	},
	{
		id: 'electrical-ignition',
		slug: 'electrical-ignition',
		name: 'Electrical & Ignition',
		description: 'Spark plugs, ignition coils, sensors, alternators and starters.',
		icon: 'spark',
		sort_order: 6
	},
	{
		id: 'body-parts',
		slug: 'body-parts',
		name: 'Body Parts',
		description: 'Lamps, mirrors, panels, grilles and exterior trim.',
		icon: 'body',
		sort_order: 7
	}
];

export const categoryBySlug = (slug: string) => categories.find((c) => c.slug === slug);
export const brandBySlug = (slug: string) => brands.find((b) => b.slug === slug);

/** Build a prefilled WhatsApp inquiry link for a specific part. */
export function whatsappInquiry(partName?: string, partNumber?: string): string {
	const base = `https://wa.me/${site.whatsappNumber}`;
	if (!partName) return base;
	const msg = `Hello ABK Auto Parts, I'm interested in: ${partName}${
		partNumber ? ` (Part No. ${partNumber})` : ''
	}. Is it available?`;
	return `${base}?text=${encodeURIComponent(msg)}`;
}
