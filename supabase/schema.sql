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
returns trigger language plpgsql
set search_path = ''
as $$
begin
	new.updated_at = now();
	return new;
end;
$$;

drop trigger if exists parts_set_updated_at on public.parts;
create trigger parts_set_updated_at
	before update on public.parts
	for each row execute function public.set_updated_at();

-- ============================================================================
-- Staff allowlist + roles
--
-- Membership is keyed by EMAIL, not user id, so an account can be authorised
-- before it exists — and so revoking access never depends on finding a uuid.
--
--   root  — everything an admin can do, plus managing this list
--   admin — manage the parts catalogue
--
-- A signed-in user who is not on this list can see exactly what an anonymous
-- visitor can: published parts. That is deliberate. Disabling sign-ups is still
-- worth doing, but it is no longer the only thing between a stranger and the
-- shop.
-- ============================================================================

create table if not exists public.staff (
	email      text primary key,
	role       text not null default 'admin' check (role in ('root', 'admin')),
	note       text not null default '',
	created_at timestamptz not null default now(),
	created_by text
);

-- Emails compare case-insensitively; fold them so the primary key cannot hold
-- two spellings of the same person.
create or replace function public.staff_normalise_email()
returns trigger language plpgsql
set search_path = ''
as $$
begin
	new.email = lower(trim(new.email));
	return new;
end;
$$;

drop trigger if exists staff_normalise_email on public.staff;
create trigger staff_normalise_email
	before insert or update on public.staff
	for each row execute function public.staff_normalise_email();

-- Who is the caller?
--
-- SECURITY DEFINER so these read public.staff with RLS bypassed, which also
-- stops staff's own policies recursing through the table they guard. They live
-- in `private` rather than `public` because they are policy internals, not API:
-- PostgREST only exposes `public`, so this keeps them off /rest/v1/rpc/.
create schema if not exists private;
grant usage on schema private to anon, authenticated;

create or replace function private.current_staff_email()
returns text language sql stable
security definer set search_path = ''
as $$
	select lower(trim(coalesce(auth.jwt() ->> 'email', '')));
$$;

create or replace function private.is_staff()
returns boolean language sql stable
security definer set search_path = ''
as $$
	select exists (
		select 1 from public.staff s
		where s.email = private.current_staff_email()
		  and private.current_staff_email() <> ''
	);
$$;

create or replace function private.is_root()
returns boolean language sql stable
security definer set search_path = ''
as $$
	select exists (
		select 1 from public.staff s
		where s.email = private.current_staff_email()
		  and s.role = 'root'
		  and private.current_staff_email() <> ''
	);
$$;

-- Policy expressions run as the querying role, so it needs EXECUTE. Only
-- `authenticated` policies reference these; anon is covered by the
-- published-parts policy alone and never evaluates them.
revoke execute on function private.current_staff_email(), private.is_staff(), private.is_root()
	from public;
grant execute on function private.current_staff_email(), private.is_staff(), private.is_root()
	to authenticated;

-- Never allow the last root to be removed or demoted: that would lock the
-- allowlist permanently, recoverable only from the Supabase dashboard.
create or replace function public.staff_protect_last_root()
returns trigger language plpgsql
set search_path = ''
as $$
declare
	remaining int;
begin
	if (tg_op = 'DELETE' and old.role = 'root')
	   or (tg_op = 'UPDATE' and old.role = 'root' and new.role <> 'root') then
		select count(*) into remaining
		from public.staff
		where role = 'root' and email <> old.email;

		if remaining = 0 then
			raise exception 'Cannot remove the last root account';
		end if;
	end if;
	return coalesce(new, old);
end;
$$;

drop trigger if exists staff_protect_last_root on public.staff;
create trigger staff_protect_last_root
	before update or delete on public.staff
	for each row execute function public.staff_protect_last_root();

alter table public.staff enable row level security;

drop policy if exists "staff read the team" on public.staff;
create policy "staff read the team"
	on public.staff for select
	to authenticated
	using (private.is_staff());

drop policy if exists "root adds staff" on public.staff;
create policy "root adds staff"
	on public.staff for insert
	to authenticated
	with check (private.is_root());

drop policy if exists "root updates staff" on public.staff;
create policy "root updates staff"
	on public.staff for update
	to authenticated
	using (private.is_root()) with check (private.is_root());

drop policy if exists "root removes staff" on public.staff;
create policy "root removes staff"
	on public.staff for delete
	to authenticated
	using (private.is_root());

-- Seed the first root account.
--
-- !! EDIT THIS ADDRESS before running the file on a fresh project. The live
-- !! project is already seeded with the real owner, which is deliberately not
-- !! written down here: this repository is public, and an address in a public
-- !! file gets harvested. Look it up in the Supabase table editor, or in
-- !! /admin/staff once you are signed in.
--
-- Seeding before the account exists is intentional — the list is keyed by
-- email, so creating that user in the dashboard is all that remains.
--
-- If you do run this verbatim: add your real address as a second root, then
-- delete the placeholder. The last-root trigger permits that once two exist.
insert into public.staff (email, role, note, created_by)
values ('owner@example.com', 'root', 'Owner', 'initial setup')
on conflict (email) do update set role = 'root';

-- ---------------------------------------------------------------------------
-- Row Level Security on the catalogue
--   * Anyone (anon) may read only PUBLISHED parts.
--   * Staff may read everything and write.
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
	using (private.is_staff());

drop policy if exists "staff inserts parts" on public.parts;
create policy "staff inserts parts"
	on public.parts for insert
	to authenticated
	with check (private.is_staff());

drop policy if exists "staff updates parts" on public.parts;
create policy "staff updates parts"
	on public.parts for update
	to authenticated
	using (private.is_staff()) with check (private.is_staff());

drop policy if exists "staff deletes parts" on public.parts;
create policy "staff deletes parts"
	on public.parts for delete
	to authenticated
	using (private.is_staff());

-- ---------------------------------------------------------------------------
-- Storage bucket for part images: public read, staff write.
--
-- The bucket is public, which bypasses access control for *retrieval* — the
-- image URLs work for anyone without a SELECT policy. So the policy below is
-- scoped to staff: granting it to `anon` would add nothing for display, and
-- would let anybody enumerate the whole bucket.
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('part-images', 'part-images', true)
on conflict (id) do nothing;

drop policy if exists "public reads part images" on storage.objects;
drop policy if exists "staff lists part images" on storage.objects;
create policy "staff lists part images"
	on storage.objects for select
	to authenticated
	using (bucket_id = 'part-images' and private.is_staff());

drop policy if exists "staff writes part images" on storage.objects;
create policy "staff writes part images"
	on storage.objects for insert
	to authenticated
	with check (bucket_id = 'part-images' and private.is_staff());

drop policy if exists "staff updates part images" on storage.objects;
create policy "staff updates part images"
	on storage.objects for update
	to authenticated
	using (bucket_id = 'part-images' and private.is_staff());

drop policy if exists "staff deletes part images" on storage.objects;
create policy "staff deletes part images"
	on storage.objects for delete
	to authenticated
	using (bucket_id = 'part-images' and private.is_staff());
