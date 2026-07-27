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

/**
 * Vehicle brands and part categories are managed in the admin (Supabase tables
 * `vehicle_brands` / `part_categories`). The lists below are only the starting
 * point: they seed a fresh database, and they are what demo mode — and any page
 * rendered before the tables have loaded — falls back to. Read the live lists
 * from src/lib/taxonomy.svelte.ts, never from here.
 */
export const DEFAULT_BRANDS: Brand[] = [
	{ slug: 'toyota', name: 'Toyota', sort_order: 1 },
	{ slug: 'isuzu', name: 'Isuzu', sort_order: 2 },
	{ slug: 'mitsubishi', name: 'Mitsubishi', sort_order: 3 },
	{ slug: 'nissan', name: 'Nissan', sort_order: 4 }
];

/** Part categories. Icons map to Icon.svelte. */
export const DEFAULT_CATEGORIES: Category[] = [
	{
		slug: 'engine-transmission',
		name: 'Engine & Transmission',
		description: 'Pistons, gaskets, timing kits, mounts and transmission components.',
		icon: 'engine',
		sort_order: 1
	},
	{
		slug: 'brake-differential',
		name: 'Brake & Differential',
		description: 'Brake discs, pads, calipers, master cylinders and differential parts.',
		icon: 'brake',
		sort_order: 2
	},
	{
		slug: 'suspension-steering',
		name: 'Suspension & Steering',
		description: 'Shock absorbers, coil springs, ball joints, tie rod ends and bushings.',
		icon: 'suspension',
		sort_order: 3
	},
	{
		slug: 'filters',
		name: 'Filters',
		description: 'Oil, air, fuel and cabin filters for every service interval.',
		icon: 'filter',
		sort_order: 4
	},
	{
		slug: 'clutch-drivetrain',
		name: 'Clutch & Drivetrain',
		description: 'Clutch discs, pressure plates, CV joints, axles and bearings.',
		icon: 'clutch',
		sort_order: 5
	},
	{
		slug: 'electrical-ignition',
		name: 'Electrical & Ignition',
		description: 'Spark plugs, ignition coils, sensors, alternators and starters.',
		icon: 'spark',
		sort_order: 6
	},
	{
		slug: 'body-parts',
		name: 'Body Parts',
		description: 'Lamps, mirrors, panels, grilles and exterior trim.',
		icon: 'body',
		sort_order: 7
	}
];

/** Build a prefilled WhatsApp inquiry link for a specific part. */
export function whatsappInquiry(partName?: string, partNumber?: string): string {
	const base = `https://wa.me/${site.whatsappNumber}`;
	if (!partName) return base;
	const msg = `Hello ABK Auto Parts, I'm interested in: ${partName}${
		partNumber ? ` (Part No. ${partNumber})` : ''
	}. Is it available?`;
	return `${base}?text=${encodeURIComponent(msg)}`;
}
