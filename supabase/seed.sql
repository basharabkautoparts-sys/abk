-- ============================================================================
-- ABK Auto Parts — sample catalog seed (optional).
-- Run AFTER schema.sql. Mirrors the demo-mode data in src/lib/data/seed.ts.
-- ============================================================================
insert into public.parts
	(slug, name, part_number, oem, description, category_slug, brand_slug, featured)
values
	('toyota-hilux-front-brake-disc', 'Front Brake Disc Rotor — Hilux Revo', '43512-0K060', '43512-0K060',
	 'Genuine ventilated front brake disc for Toyota Hilux Revo. Precision-balanced for smooth, judder-free braking and long pad life.',
	 'brake-differential', 'toyota', true),

	('toyota-oil-filter-element', 'Oil Filter Element', '04152-YZZA1', '04152-YZZA1',
	 'OEM cartridge-type oil filter element for a wide range of Toyota engines. High-efficiency media protects your engine between services.',
	 'filters', 'toyota', true),

	('toyota-fortuner-shock-absorber-front', 'Front Shock Absorber — Fortuner', '48510-0K530', null,
	 'Gas-charged front shock absorber engineered for Toyota Fortuner. Restores factory ride comfort and stability under load.',
	 'suspension-steering', 'toyota', false),

	('toyota-iridium-spark-plug', 'Iridium Spark Plug (Set of 4)', '90919-01253', null,
	 'Long-life iridium spark plugs for reliable ignition, smoother idle and improved fuel economy. Sold as a set of four.',
	 'electrical-ignition', 'toyota', false),

	('isuzu-dmax-clutch-disc', 'Clutch Disc — D-Max 2.5', '8-98088-965-0', null,
	 'Genuine clutch friction disc for Isuzu D-Max 2.5 DDi. Consistent engagement and durable facing for heavy-duty use.',
	 'clutch-drivetrain', 'isuzu', true),

	('isuzu-dmax-air-filter', 'Air Filter — D-Max / MU-X', '8-98139-073-0', null,
	 'High-flow air filter for Isuzu D-Max and MU-X. Traps fine dust to protect the intake and keep the turbo breathing clean.',
	 'filters', 'isuzu', false),

	('isuzu-fuel-filter-element', 'Fuel Filter Element (Diesel)', '8-98037-014-0', null,
	 'Diesel fuel filter element that separates water and contaminants, safeguarding the common-rail injection system.',
	 'filters', 'isuzu', false),

	('isuzu-tie-rod-end', 'Tie Rod End — Outer', '8-97235-197-0', null,
	 'Outer tie rod end with hardened ball stud for precise steering response on Isuzu light trucks.',
	 'suspension-steering', 'isuzu', false),

	('mitsubishi-triton-brake-pad-set', 'Front Brake Pad Set — Triton', '4605B455', null,
	 'Genuine front brake pad set for Mitsubishi Triton. Low-noise, low-dust compound with strong stopping power.',
	 'brake-differential', 'mitsubishi', true),

	('mitsubishi-pajero-ball-joint-lower', 'Lower Ball Joint — Pajero Sport', '4013A272', null,
	 'Lower control-arm ball joint for Mitsubishi Pajero Sport. Sealed and pre-greased for long service life.',
	 'suspension-steering', 'mitsubishi', false),

	('mitsubishi-ignition-coil', 'Ignition Coil', '1832A044', null,
	 'Direct-fit ignition coil delivering a strong, stable spark for Mitsubishi petrol engines.',
	 'electrical-ignition', 'mitsubishi', false),

	('mitsubishi-cabin-air-filter', 'Cabin Air Filter', '7803A028', null,
	 'Activated cabin air filter that keeps dust, pollen and odours out of the interior airflow.',
	 'filters', 'mitsubishi', false),

	('nissan-navara-cv-joint', 'CV Joint Kit — Navara', '39100-EB70A', null,
	 'Outer constant-velocity joint kit with boot and grease for Nissan Navara. Smooth power delivery to the wheels.',
	 'clutch-drivetrain', 'nissan', true),

	('nissan-navara-coil-spring', 'Front Coil Spring — Navara', '54010-EB31A', null,
	 'Front suspension coil spring matched to Nissan Navara load ratings for consistent ride height.',
	 'suspension-steering', 'nissan', false),

	('nissan-oil-filter', 'Oil Filter — Spin-on', '15208-65F0A', null,
	 'Spin-on oil filter with anti-drainback valve for reliable cold-start protection on Nissan engines.',
	 'filters', 'nissan', false),

	('nissan-brake-master-cylinder', 'Brake Master Cylinder', '46010-EB70B', null,
	 'Genuine brake master cylinder providing firm, consistent pedal feel and reliable hydraulic pressure.',
	 'brake-differential', 'nissan', false),

	('toyota-tail-lamp-hilux', 'Tail Lamp Assembly (RH) — Hilux Revo', '81550-0K400', null,
	 'Right-hand rear tail lamp assembly for Toyota Hilux Revo. Direct OE replacement with correct fit and lens clarity.',
	 'body-parts', 'toyota', false),

	('isuzu-headlamp-dmax', 'Headlamp Assembly (LH) — D-Max', '8-98201-234-0', null,
	 'Left-hand headlamp assembly for Isuzu D-Max with precise beam pattern and OE-grade housing.',
	 'body-parts', 'isuzu', false)
on conflict (slug) do nothing;
