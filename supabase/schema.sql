-- ============================================================================
-- ABK Auto Parts — Supabase schema
-- Run in Supabase SQL Editor (or `supabase db push`). Idempotent-ish: safe to
-- re-run; drops & recreates policies.
--
-- Design note: vehicle brands and part categories are managed data, edited from
-- /admin and stored in `vehicle_brands` / `part_categories`. The slug is the
-- primary key and parts reference it directly, so the taxonomy tables are pure
-- lookup: renaming a brand changes only what is displayed.
--
-- There is deliberately no price anywhere. ABK quotes per enquiry, including
-- export shipping, so a stored price could only ever be stale or misleading.
-- ============================================================================

create extension if not exists "pgcrypto";

-- ============================================================================
-- Taxonomy: vehicle brands and part categories
-- ============================================================================

create table if not exists public.vehicle_brands (
	slug       text primary key,
	name       text not null,
	sort_order int not null default 0,
	created_at timestamptz not null default now()
);

create table if not exists public.part_categories (
	slug        text primary key,
	name        text not null,
	description text not null default '',
	-- Icon keyword resolved by src/lib/components/Icon.svelte.
	icon        text not null default 'part',
	sort_order  int not null default 0,
	created_at  timestamptz not null default now()
);

-- Starting lists, matching DEFAULT_BRANDS / DEFAULT_CATEGORIES in
-- src/lib/config.ts (which is what the app falls back to before these load, and
-- what demo mode runs on). Edit them in the admin afterwards, not here.
insert into public.vehicle_brands (slug, name, sort_order) values
	('toyota',     'Toyota',     1),
	('isuzu',      'Isuzu',      2),
	('mitsubishi', 'Mitsubishi', 3),
	('nissan',     'Nissan',     4)
on conflict (slug) do nothing;

insert into public.part_categories (slug, name, description, icon, sort_order) values
	('engine-transmission', 'Engine & Transmission', 'Pistons, gaskets, timing kits, mounts and transmission components.', 'engine', 1),
	('brake-differential',  'Brake & Differential',  'Brake discs, pads, calipers, master cylinders and differential parts.', 'brake', 2),
	('suspension-steering', 'Suspension & Steering', 'Shock absorbers, coil springs, ball joints, tie rod ends and bushings.', 'suspension', 3),
	('filters',             'Filters',               'Oil, air, fuel and cabin filters for every service interval.', 'filter', 4),
	('clutch-drivetrain',   'Clutch & Drivetrain',   'Clutch discs, pressure plates, CV joints, axles and bearings.', 'clutch', 5),
	('electrical-ignition', 'Electrical & Ignition', 'Spark plugs, ignition coils, sensors, alternators and starters.', 'spark', 6),
	('body-parts',          'Body Parts',            'Lamps, mirrors, panels, grilles and exterior trim.', 'body', 7)
on conflict (slug) do nothing;

create table if not exists public.parts (
	id            uuid primary key default gen_random_uuid(),
	slug          text not null unique,
	name          text not null,
	part_number   text not null default '',
	description   text not null default '',
	-- Nullable and undefaulted on purpose: a condition shows on a part only
	-- where someone chose one in the admin. NULL means "not specified", and a
	-- CHECK passes for NULL, so the three real values stay constrained.
	condition     text check (condition in ('Genuine', 'OEM', 'Aftermarket')),
	oem           text,
	images        text[] not null default '{}',
	in_stock      boolean not null default true,
	featured      boolean not null default false,
	published     boolean not null default true,
	-- ON DELETE RESTRICT is the point of these references: a category cannot be
	-- deleted while parts still sit in it, and the admin turns that error into
	-- "move or delete those parts first". ON UPDATE CASCADE is belt-and-braces —
	-- the app treats slugs as immutable once created.
	category_slug text not null references public.part_categories (slug)
	              on update cascade on delete restrict,
	brand_slug    text not null references public.vehicle_brands (slug)
	              on update cascade on delete restrict,
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
-- Staff login management: create a login, or reset its password — one call.
--
-- This is the single privileged action the static site cannot do itself, and
-- the reason is worth stating: creating an auth account or setting a password
-- normally needs the service-role key, which must never reach the browser. So
-- it lives here as a SECURITY DEFINER function — the two checks the Edge
-- Function used to make (caller is `root`, target is on the staff list) run in
-- the database with RLS bypassed, and no service-role key exists anywhere.
--
-- The caller is identified by their own session (auth.jwt() -> private.is_root),
-- so the anon key cannot fake it. The password is stored as bcrypt
-- (pgcrypto `crypt` + `gen_salt('bf')`), which the auth plane verifies;
-- resetting revokes the target's existing refresh tokens, matching
-- PUT /auth/v1/user. Idempotent: it creates the login if absent, else resets.
--
-- Called from the browser as `supabase.rpc('admin_set_staff_password', ...)`.
-- ---------------------------------------------------------------------------
create or replace function public.admin_set_staff_password(
	target_email text,
	new_password text
) returns jsonb
language plpgsql
security definer set search_path = ''
as $fn$
declare
	clean_email text := lower(trim(coalesce(target_email, '')));
	existing_id  uuid;
begin
	-- Authorization first: only a root account, and only for a known staff
	-- member. 42501 (insufficient_privilege) surfaces as 401; a check
	-- violation surfaces as a 400 with the message — both fail closed.
	if not private.is_root() then
		raise exception 'Only a root account can manage logins.'
			using errcode = '42501';
	end if;
	if clean_email = '' or position('@' in clean_email) = 0 then
		raise exception 'A valid email is required.' using errcode = '23514';
	end if;
	if length(new_password) < 8 then
		raise exception 'Password must be at least 8 characters.'
			using errcode = '23514';
	end if;
	if not exists (select 1 from public.staff s where s.email = clean_email) then
		raise exception 'Add that email to the staff list first.'
			using errcode = '23514';
	end if;

	select u.id into existing_id
	  from auth.users u
	 where lower(u.email) = clean_email;

	if existing_id is not null then
		update auth.users
		   set encrypted_password = public.crypt(new_password, public.gen_salt('bf')),
		       updated_at = now()
		 where id = existing_id;
		update auth.refresh_tokens set revoked = true where user_id = existing_id;
		return jsonb_build_object('created', false);
	end if;

	-- No sign-up flow to confirm through: a root vouched for this address by
	-- putting it on the allowlist, so the email is confirmed on creation.
	insert into auth.users (email, encrypted_password, email_confirmed_at, raw_user_meta_data)
	values (clean_email, public.crypt(new_password, public.gen_salt('bf')), now(), '{}'::jsonb);
	return jsonb_build_object('created', true);
end;
$fn$;

-- Signed-in callers only; the function itself enforces root. anon never.
revoke all on function public.admin_set_staff_password(text, text) from public, anon;
grant execute on function public.admin_set_staff_password(text, text) to authenticated;

-- ---------------------------------------------------------------------------
-- Row Level Security on the taxonomy
--   * Anyone may read it — every visitor needs the names to read the catalogue.
--   * Staff may change it.
-- ---------------------------------------------------------------------------
alter table public.vehicle_brands  enable row level security;
alter table public.part_categories enable row level security;

drop policy if exists "anyone reads vehicle brands" on public.vehicle_brands;
create policy "anyone reads vehicle brands"
	on public.vehicle_brands for select to anon, authenticated using (true);

drop policy if exists "staff writes vehicle brands" on public.vehicle_brands;
create policy "staff writes vehicle brands"
	on public.vehicle_brands for all to authenticated
	using (private.is_staff()) with check (private.is_staff());

drop policy if exists "anyone reads part categories" on public.part_categories;
create policy "anyone reads part categories"
	on public.part_categories for select to anon, authenticated using (true);

drop policy if exists "staff writes part categories" on public.part_categories;
create policy "staff writes part categories"
	on public.part_categories for all to authenticated
	using (private.is_staff()) with check (private.is_staff());

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
