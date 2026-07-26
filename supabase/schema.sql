-- ============================================================================
-- ABK Auto Parts — Supabase schema
-- Run in Supabase SQL Editor (or `supabase db push`). Idempotent-ish: safe to
-- re-run; drops & recreates policies.
--
-- Design note: vehicle brands and part categories are FIXED and live in the
-- app config (src/lib/config.ts). Parts store `category_slug` / `brand_slug`
-- as text, so there is a single table to manage. No separate lookup tables.
-- ============================================================================

create extension if not exists "pgcrypto";

create table if not exists public.parts (
	id            uuid primary key default gen_random_uuid(),
	slug          text not null unique,
	name          text not null,
	part_number   text not null default '',
	description   text not null default '',
	price         numeric(12, 2),
	currency      text not null default 'THB',
	condition     text not null default 'Genuine'
	              check (condition in ('Genuine', 'OEM', 'Aftermarket')),
	oem           text,
	images        text[] not null default '{}',
	in_stock      boolean not null default true,
	featured      boolean not null default false,
	published     boolean not null default true,
	category_slug text not null,
	brand_slug    text not null,
	created_at    timestamptz not null default now(),
	updated_at    timestamptz not null default now()
);

-- Helpful indexes for the catalog filters / sorts.
create index if not exists parts_category_idx on public.parts (category_slug);
create index if not exists parts_brand_idx    on public.parts (brand_slug);
create index if not exists parts_published_idx on public.parts (published);
create index if not exists parts_featured_idx  on public.parts (featured) where featured;
create index if not exists parts_created_idx   on public.parts (created_at desc);
-- Trigram search on name / part number (optional but nice for large catalogs).
create extension if not exists pg_trgm;
create index if not exists parts_name_trgm on public.parts using gin (name gin_trgm_ops);
create index if not exists parts_number_trgm on public.parts using gin (part_number gin_trgm_ops);

-- keep updated_at fresh
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
	new.updated_at = now();
	return new;
end;
$$;

drop trigger if exists parts_set_updated_at on public.parts;
create trigger parts_set_updated_at
	before update on public.parts
	for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security
--   * Anyone (anon) may read only PUBLISHED parts.
--   * Any authenticated staff member may read/write everything.
--     (Sign-ups are disabled in the Supabase dashboard, so only invited staff
--      have accounts — that is the whole access model for this catalog.)
-- ---------------------------------------------------------------------------
alter table public.parts enable row level security;

drop policy if exists "public reads published parts" on public.parts;
create policy "public reads published parts"
	on public.parts for select
	to anon, authenticated
	using (published = true);

drop policy if exists "staff reads all parts" on public.parts;
create policy "staff reads all parts"
	on public.parts for select
	to authenticated
	using (true);

drop policy if exists "staff inserts parts" on public.parts;
create policy "staff inserts parts"
	on public.parts for insert
	to authenticated
	with check (true);

drop policy if exists "staff updates parts" on public.parts;
create policy "staff updates parts"
	on public.parts for update
	to authenticated
	using (true) with check (true);

drop policy if exists "staff deletes parts" on public.parts;
create policy "staff deletes parts"
	on public.parts for delete
	to authenticated
	using (true);

-- ---------------------------------------------------------------------------
-- Storage bucket for part images: public read, staff write.
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('part-images', 'part-images', true)
on conflict (id) do nothing;

drop policy if exists "public reads part images" on storage.objects;
create policy "public reads part images"
	on storage.objects for select
	to anon, authenticated
	using (bucket_id = 'part-images');

drop policy if exists "staff writes part images" on storage.objects;
create policy "staff writes part images"
	on storage.objects for insert
	to authenticated
	with check (bucket_id = 'part-images');

drop policy if exists "staff updates part images" on storage.objects;
create policy "staff updates part images"
	on storage.objects for update
	to authenticated
	using (bucket_id = 'part-images');

drop policy if exists "staff deletes part images" on storage.objects;
create policy "staff deletes part images"
	on storage.objects for delete
	to authenticated
	using (bucket_id = 'part-images');
