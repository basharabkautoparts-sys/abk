import type { Part, PartCondition } from '$lib/types';
import { brandBySlug, categoryBySlug } from '$lib/taxonomy.svelte';

interface RawPart {
	slug: string;
	name: string;
	part_number: string;
	oem?: string;
	description: string;
	condition?: PartCondition;
	category_slug: string;
	brand_slug: string;
	in_stock?: boolean;
	featured?: boolean;
	day: number; // day of month for a deterministic created_at
}

const RAW: RawPart[] = [
	{
		slug: 'toyota-hilux-front-brake-disc',
		name: 'Front Brake Disc Rotor — Hilux Revo',
		part_number: '43512-0K060',
		oem: '43512-0K060',
		description:
			'Genuine ventilated front brake disc for Toyota Hilux Revo. Precision-balanced for smooth, judder-free braking and long pad life.',
		category_slug: 'brake-differential',
		brand_slug: 'toyota',
		featured: true,
		day: 2
	},
	{
		slug: 'toyota-oil-filter-element',
		name: 'Oil Filter Element',
		part_number: '04152-YZZA1',
		oem: '04152-YZZA1',
		description:
			'OEM cartridge-type oil filter element for a wide range of Toyota engines. High-efficiency media protects your engine between services.',
		category_slug: 'filters',
		brand_slug: 'toyota',
		featured: true,
		day: 4
	},
	{
		slug: 'toyota-fortuner-shock-absorber-front',
		name: 'Front Shock Absorber — Fortuner',
		part_number: '48510-0K530',
		description:
			'Gas-charged front shock absorber engineered for Toyota Fortuner. Restores factory ride comfort and stability under load.',
		category_slug: 'suspension-steering',
		brand_slug: 'toyota',
		day: 6
	},
	{
		slug: 'toyota-iridium-spark-plug',
		name: 'Iridium Spark Plug (Set of 4)',
		part_number: '90919-01253',
		description:
			'Long-life iridium spark plugs for reliable ignition, smoother idle and improved fuel economy. Sold as a set of four.',
		category_slug: 'electrical-ignition',
		brand_slug: 'toyota',
		day: 8
	},
	{
		slug: 'isuzu-dmax-clutch-disc',
		name: 'Clutch Disc — D-Max 2.5',
		part_number: '8-98088-965-0',
		description:
			'Genuine clutch friction disc for Isuzu D-Max 2.5 DDi. Consistent engagement and durable facing for heavy-duty use.',
		category_slug: 'clutch-drivetrain',
		brand_slug: 'isuzu',
		featured: true,
		day: 10
	},
	{
		slug: 'isuzu-dmax-air-filter',
		name: 'Air Filter — D-Max / MU-X',
		part_number: '8-98139-073-0',
		description:
			'High-flow air filter for Isuzu D-Max and MU-X. Traps fine dust to protect the intake and keep the turbo breathing clean.',
		category_slug: 'filters',
		brand_slug: 'isuzu',
		day: 11
	},
	{
		slug: 'isuzu-fuel-filter-element',
		name: 'Fuel Filter Element (Diesel)',
		part_number: '8-98037-014-0',
		description:
			'Diesel fuel filter element that separates water and contaminants, safeguarding the common-rail injection system.',
		category_slug: 'filters',
		brand_slug: 'isuzu',
		day: 12
	},
	{
		slug: 'isuzu-tie-rod-end',
		name: 'Tie Rod End — Outer',
		part_number: '8-97235-197-0',
		description:
			'Outer tie rod end with hardened ball stud for precise steering response on Isuzu light trucks.',
		category_slug: 'suspension-steering',
		brand_slug: 'isuzu',
		day: 13
	},
	{
		slug: 'mitsubishi-triton-brake-pad-set',
		name: 'Front Brake Pad Set — Triton',
		part_number: '4605B455',
		description:
			'Genuine front brake pad set for Mitsubishi Triton. Low-noise, low-dust compound with strong stopping power.',
		category_slug: 'brake-differential',
		brand_slug: 'mitsubishi',
		featured: true,
		day: 14
	},
	{
		slug: 'mitsubishi-pajero-ball-joint-lower',
		name: 'Lower Ball Joint — Pajero Sport',
		part_number: '4013A272',
		description:
			'Lower control-arm ball joint for Mitsubishi Pajero Sport. Sealed and pre-greased for long service life.',
		category_slug: 'suspension-steering',
		brand_slug: 'mitsubishi',
		day: 15
	},
	{
		slug: 'mitsubishi-ignition-coil',
		name: 'Ignition Coil',
		part_number: '1832A044',
		description:
			'Direct-fit ignition coil delivering a strong, stable spark for Mitsubishi petrol engines.',
		category_slug: 'electrical-ignition',
		brand_slug: 'mitsubishi',
		day: 16
	},
	{
		slug: 'mitsubishi-cabin-air-filter',
		name: 'Cabin Air Filter',
		part_number: '7803A028',
		description:
			'Activated cabin air filter that keeps dust, pollen and odours out of the interior airflow.',
		category_slug: 'filters',
		brand_slug: 'mitsubishi',
		day: 17
	},
	{
		slug: 'nissan-navara-cv-joint',
		name: 'CV Joint Kit — Navara',
		part_number: '39100-EB70A',
		description:
			'Outer constant-velocity joint kit with boot and grease for Nissan Navara. Smooth power delivery to the wheels.',
		category_slug: 'clutch-drivetrain',
		brand_slug: 'nissan',
		featured: true,
		day: 18
	},
	{
		slug: 'nissan-navara-coil-spring',
		name: 'Front Coil Spring — Navara',
		part_number: '54010-EB31A',
		description:
			'Front suspension coil spring matched to Nissan Navara load ratings for consistent ride height.',
		category_slug: 'suspension-steering',
		brand_slug: 'nissan',
		day: 19
	},
	{
		slug: 'nissan-oil-filter',
		name: 'Oil Filter — Spin-on',
		part_number: '15208-65F0A',
		description:
			'Spin-on oil filter with anti-drainback valve for reliable cold-start protection on Nissan engines.',
		category_slug: 'filters',
		brand_slug: 'nissan',
		day: 20
	},
	{
		slug: 'nissan-brake-master-cylinder',
		name: 'Brake Master Cylinder',
		part_number: '46010-EB70B',
		description:
			'Genuine brake master cylinder providing firm, consistent pedal feel and reliable hydraulic pressure.',
		category_slug: 'brake-differential',
		brand_slug: 'nissan',
		day: 21
	},
	{
		slug: 'toyota-tail-lamp-hilux',
		name: 'Tail Lamp Assembly (RH) — Hilux Revo',
		part_number: '81550-0K400',
		description:
			'Right-hand rear tail lamp assembly for Toyota Hilux Revo. Direct OE replacement with correct fit and lens clarity.',
		category_slug: 'body-parts',
		brand_slug: 'toyota',
		day: 22
	},
	{
		slug: 'isuzu-headlamp-dmax',
		name: 'Headlamp Assembly (LH) — D-Max',
		part_number: '8-98201-234-0',
		description:
			'Left-hand headlamp assembly for Isuzu D-Max with precise beam pattern and OE-grade housing.',
		category_slug: 'body-parts',
		brand_slug: 'isuzu',
		day: 23
	}
];

function build(raw: RawPart): Part {
	const cat = categoryBySlug(raw.category_slug)!;
	const brand = brandBySlug(raw.brand_slug)!;
	const created = `2026-06-${String(raw.day).padStart(2, '0')}T09:00:00.000Z`;
	return {
		id: raw.slug,
		slug: raw.slug,
		name: raw.name,
		part_number: raw.part_number,
		description: raw.description,
		condition: raw.condition ?? 'Genuine',
		oem: raw.oem ?? null,
		images: [],
		in_stock: raw.in_stock ?? true,
		featured: raw.featured ?? false,
		published: true,
		category: { slug: cat.slug, name: cat.name },
		brand: { slug: brand.slug, name: brand.name },
		created_at: created,
		updated_at: created
	};
}

export const SEED_PARTS: Part[] = RAW.map(build);
