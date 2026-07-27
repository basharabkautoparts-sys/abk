# A.B.K. Auto Parts — website

Marketing + catalogue site for **A.B.K. Auto Parts Co., Ltd** — genuine Japanese
auto parts (Toyota, Isuzu, Mitsubishi, Nissan) with a WhatsApp / phone inquiry
model and a staff-only admin for managing the catalogue.

- **Framework:** SvelteKit (Svelte 5), prerendered to static HTML
- **Styling:** Tailwind CSS v4
- **Data / Auth / Storage:** Supabase (Postgres + Auth + Storage)
- **Hosting:** GitHub Pages, at
  <https://basharabkautoparts-sys.github.io/abk/> (a custom domain can be
  switched on later without touching the code — see
  [Moving to a custom domain](#moving-to-a-custom-domain))

---

## How it works on a static host

GitHub Pages serves files, not code — there is no server at runtime. The site is
built to work with that rather than around it:

| Concern | How it's handled |
| --- | --- |
| **SEO** | Every public page is **prerendered at build time**, reading the live catalogue from Supabase. Crawlers get real HTML with per-page titles, meta, canonical URLs and JSON-LD — no JavaScript required. |
| **Fresh data** | Prerendered HTML is a snapshot. Once a page hydrates it re-queries Supabase, so parts added in the admin appear immediately for visitors, without a redeploy. |
| **New part URLs** | Part pages are prerendered per slug. A part created after the last deploy has no static file yet, so Pages serves the SPA fallback (`404.html`) and the app resolves the route client-side. The nightly rebuild then gives it a real page — which is what matters for crawlers. |
| **Filtering / search** | `/parts` ships the whole published catalogue and filters in the browser. A static host cannot vary a response by query string. |
| **Admin** | Runs entirely in the browser against Supabase Auth + RLS. No server session, no form actions. |
| **Base path** | The site lives in a subdirectory (`/abk`), so internal links can't be bare absolute paths. They all go through `url()` in `src/lib/paths.ts`, which is also what makes the move to a root domain a config change rather than an edit to every link. |

**The security model:** the anon key is public by design — it ships in the
JavaScript bundle. Row Level Security is the actual boundary.

Signing in and being *authorised* are separate things. Supabase Auth says who
you are; the **`staff` table** says what you may do:

| | anonymous | signed in, not on the list | `admin` | `root` |
| --- | --- | --- | --- | --- |
| Read published parts | ✅ | ✅ | ✅ | ✅ |
| Read drafts | — | — | ✅ | ✅ |
| Add / edit / delete parts | — | — | ✅ | ✅ |
| Upload part images | — | — | ✅ | ✅ |
| See the staff list | — | — | ✅ | ✅ |
| Add / remove / change roles | — | — | — | ✅ |

A signed-in account that is not on the list gets exactly what an anonymous
visitor gets. That is enforced in Postgres, not in the UI — the admin pages just
reflect it. Every row of that table is covered by a test in the commit history.

Membership is keyed by **email**, not user id, so someone can be authorised
before their account exists, and revoking never depends on finding a uuid. The
database also refuses to remove or demote the **last root**, so the allowlist
cannot be locked shut by accident.

> ⚠️ **Sign-ups should still be disabled** (see the checklist) — but this model
> means an unexpected account is inert rather than dangerous.

---

## Quick start (demo mode — no accounts needed)

```bash
pnpm install
pnpm dev
```

Open <http://localhost:5173/abk/> — `/` redirects there. The dev server runs
under the same base path as production on purpose, so a missing `url()` shows up
locally instead of in a deploy.

With **no Supabase configured**, the site runs in **demo mode**: it serves the
bundled sample catalogue (`src/lib/data/seed.ts`) and a demo admin login. A
yellow "Demo mode" badge is shown.

**Demo admin:** go to `/admin`, sign in with the pre-filled credentials
(`admin@abkautoparts.local` / `abk-demo-admin`). You can add/edit/delete parts —
changes live in memory only and reset on a full page reload.

To work against real data, copy `.env.example` to `.env` and fill in the two
Supabase values, then restart the dev server.

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Dev server |
| `pnpm build` | Prerender the whole site into `build/` |
| `pnpm preview` | Preview the production build |
| `pnpm check` | Type-check (svelte-check) |

---

## Deployment checklist

The GitHub Actions workflow (`.github/workflows/deploy.yml`) builds and
publishes on every push to `main`, nightly, and on demand. These are the
one-time setup steps.

### 1. Supabase — already done

Applied to project `jzazeevbtgarbtxgycms`: the schema, the `staff` allowlist and
its roles, RLS policies on parts / staff / storage, the storage bucket, and 18
sample parts. `supabase/schema.sql` is the source of truth if you ever need to
rebuild it.

### 2. Create the owner's login, and disable sign-ups

The owner's address is **already authorised as `root`** in the `staff` table.
It is not written down in this repository on purpose — the repo is public, and
an email address in a public file gets harvested. Look it up in the Supabase
table editor (_Table editor → staff_).

What's missing is the Supabase account itself. Creating logins needs the admin
API, so it has to be done from the dashboard:

1. _Authentication → Users → **Add user**_ → that same address, set a password,
   tick **Auto Confirm User**. Sign in at `/admin/` and the root badge appears
   immediately.
2. _Authentication → Sign In / Providers → Email_ → turn **off** "Allow new
   users to sign up".

> 🔑 **Choose a fresh password.** Any password shared in a chat, ticket or email
> should be treated as already known. Nobody needs to tell anyone else the
> password to grant access — that's what the staff list is for.

#### Adding more people later

Two steps, in either order — access begins once both exist:

1. **Authorise the email** — `/admin/staff` in the app (root only). This is what
   grants permission, and removing someone here revokes access immediately, even
   mid-session.
2. **Create their login** — _Authentication → Users → Add user_ in Supabase.
   With sign-ups disabled, they cannot create it themselves.

Making that one step would mean an endpoint holding the service-role key, which
can create any user in the project. That's a deliberate omission, not an
oversight — say the word if you want it.

### 3. Repository variables

_Settings → Secrets and variables → Actions → **Variables** tab_ → add:

| Name | Value |
| --- | --- |
| `PUBLIC_SUPABASE_URL` | `https://jzazeevbtgarbtxgycms.supabase.co` |
| `PUBLIC_SUPABASE_ANON_KEY` | your project's publishable/anon key |

Variables rather than secrets, because both values are public — they ship in the
bundle. The workflow fails fast if either is missing, so a misconfigured build
can never publish the demo catalogue as if it were real.

### 4. Enable GitHub Pages

_Settings → Pages → Build and deployment → Source_ → **GitHub Actions**.

### 5. Push

```bash
git push origin main
```

Watch the run in the Actions tab. When it goes green the site is live at
<https://basharabkautoparts-sys.github.io/abk/>.

The URL and base path are **not hard-coded**: `actions/configure-pages` reports
what the Pages settings actually say, and the build takes `BASE_PATH` and
`PUBLIC_SITE_URL` from it. The workflow then checks the built HTML carries that
base path before publishing, because getting it wrong 404s every link.

---

## Moving to a custom domain

When you buy the domain, this is the whole procedure — **no code changes**:

1. Add these DNS records at the registrar:

   | Type | Name | Value |
   | --- | --- | --- |
   | `CNAME` | `www` | `basharabkautoparts-sys.github.io` |
   | `A` | `@` | `185.199.108.153`, `.109.153`, `.110.153`, `.111.153` |

   The apex `A` records are optional — they make the bare domain redirect to
   `www`.
2. _Settings → Pages → Custom domain_ → enter `www.abkautoparts.com` and save.
   GitHub commits a `CNAME` file for you.
3. Once DNS resolves, tick **Enforce HTTPS**.
4. Re-run the **Deploy to GitHub Pages** workflow. `configure-pages` now reports
   no base path, so links, canonical URLs and the sitemap all switch over.
5. Resubmit the sitemap in Search Console — the URLs have changed.

---

## Keeping Supabase awake

A free Supabase project pauses if it goes a week without enough activity, and a
paused project takes the catalogue down with it. Note the bar is a *volume*, not
a single heartbeat — [the docs](https://supabase.com/docs/guides/platform/free-project-pausing)
say a project is inactive without "sufficient user database activity", and that
"typically a few user requests to the database each day" is enough to avoid it.

Two independent things clear that bar:

- The **nightly deploy** reads the whole catalogue to prerender ~20 pages —
  roughly 40 queries per run.
- **`.github/workflows/keep-supabase-awake.yml`** makes 4 distinct anonymous
  reads a day. It is the backstop for when a build is broken. It uses the same
  public anon key a visitor's browser uses, so RLS means it cannot modify
  anything.

Real visitors count too, so in practice there are three sources.

### Checking it actually works

The workflow writes its outcome to the run summary, so the Actions page shows
green/red without opening a log. To check from a terminal:

```bash
# last 5 runs, newest first — look for a `schedule` event within the last day
gh run list --workflow keep-supabase-awake.yml --limit 5 \
  --json conclusion,event,createdAt \
  --jq '.[] | "\(.conclusion)\t\(.event)\t\(.createdAt)"'

# run it right now
gh workflow run keep-supabase-awake.yml
```

A failed run emails you, because GitHub notifies the workflow's author on
scheduled-run failure. Supabase also emails a warning roughly a week before it
would pause anything.

> ⚠️ **Two caveats worth knowing.**
>
> 1. GitHub disables scheduled workflows in a repository with no pushes for
>    **60 days**, and emails the owner when it does. Push any commit, or
>    re-enable them in the Actions tab, to reset that clock.
> 2. GitHub cron is best-effort — runs can be delayed under load, and
>    occasionally skipped. That is fine here: the window is a week and the
>    schedule is daily, so several misses in a row are harmless.

---

## Publishing catalogue changes

Adding a part in `/admin` writes straight to Supabase, and visitors see it as
soon as their page loads — no deploy needed.

What a rebuild adds is a **prerendered page for that part** (a static HTML file
with its own title, meta and Product JSON-LD) and its entry in `sitemap.xml`.
That's what crawlers need. It happens automatically overnight; to do it now, run
the **Deploy to GitHub Pages** workflow from the Actions tab.

---

## SEO — what's built in

- **Prerendered HTML** for every public page — real content for crawlers,
  no JavaScript required.
- Per-page `<title>`, meta description, canonical URL, Open Graph + Twitter
  cards via `src/lib/components/Seo.svelte`.
- **JSON-LD structured data:** `AutoPartsStore` + `WebSite` (home), `Product`
  with availability (part pages), and `BreadcrumbList`.
- **`/sitemap.xml`** generated from the live catalogue at build time,
  **`/robots.txt`** (disallows `/admin`), and social image `/og-image.jpg`.
- Search-result pages (`?q=`) are `noindex`.
- URLs end in a trailing slash (`/parts/`), so every route is a directory with
  an `index.html` — unambiguous on any static host. Canonical tags match.

**Known limitations**

- Category and brand views are query strings (`/parts/?category=filters`), which
  a static host cannot prerender separately. They are in the sitemap and Google
  renders JavaScript, but they are weaker landing pages than dedicated URLs
  would be. If category SEO matters, the fix is real routes
  (`/parts/category/[slug]/`), which prerender like part pages do.
- On a **project site**, crawlers read `robots.txt` from the origin root
  (`basharabkautoparts-sys.github.io/robots.txt`) — which belongs to a different
  repository — so the one this site publishes at `/abk/robots.txt` is ignored.
  It is generated correctly and starts working the moment you move to a custom
  domain. In the meantime `/admin` is kept out of the index by its `noindex`
  meta tag, and the sitemap can be submitted directly in Search Console.

**Before launch:** confirm `site.email`, `site.address` and
`site.social.facebook` in `src/lib/config.ts` — they are still placeholders.
Phone and WhatsApp are already set from the brand artwork.

---

## Editing the brand / contact details

Company name, tagline, phone, WhatsApp, email, address and navigation live in
**`src/lib/config.ts`** — changing them needs a deploy.

**Vehicle brands and part categories do not.** They are database tables
(`vehicle_brands`, `part_categories`) managed from **/admin/brands** and
**/admin/categories**. `config.ts` still carries the starting lists, as
`DEFAULT_BRANDS` / `DEFAULT_CATEGORIES`: they seed a fresh database and are what
demo mode runs on, but the live site reads `src/lib/taxonomy.svelte.ts`.

A brand or category is identified by its **slug**, which is generated from the
name when it is created and never changes afterwards — every part row points at
it. Renaming "Isuzu" changes the label everywhere; the URL
`/parts/?brand=isuzu` keeps working. A row that still has parts assigned to it
cannot be deleted: the foreign key refuses, and the admin says so.

## No prices, on purpose

The catalogue neither stores nor shows a price. ABK quotes per enquiry —
including export shipping — so the call to action is WhatsApp or a phone call,
and a stored price could only ever be stale or misleading. There is no price
field in the admin, no price column in the database, and no `price` in the
Product structured data.

## Project structure

```
src/
  lib/
    config.ts            Brand, contact, nav + the default brand/category lists
    taxonomy.svelte.ts   Live vehicle brands + part categories (load, CRUD, lookup)
    supabase.ts          Isomorphic client (build time + browser); demo-mode flag
    db.ts                Catalogue queries, mutations, client-side filtering
    auth.svelte.ts       Browser-side staff session + role (Supabase Auth or demo)
    staff.ts             Staff allowlist: list / add / remove / change role
    demo.ts              Demo-mode credentials
    resource.svelte.ts   Fetch-after-mount helper for the admin
    partForm.ts          Form parsing, validation + image upload
    paths.ts             Base-path-aware url() / asset() for every internal link
    query.ts             Prerender-safe query string + path helpers
    seo.ts               Meta + JSON-LD helpers
    types.ts             Domain types
    utils.ts             slugify, truncate
    data/seed.ts         Bundled sample catalogue (demo mode)
    components/          Header, Footer, PartCard, PartForm, Icon, Seo, …
  routes/
    +layout.ts           prerender = true, trailingSlash = 'always'
    +page.svelte         Home
    parts/               Catalogue + [slug] detail (slugs enumerated at build)
    about/  contact/
    sitemap.xml/  robots.txt/
    admin/               Login, dashboard, parts CRUD, brands, categories,
                         staff — browser-only
supabase/
  schema.sql             Tables (parts, taxonomy, staff), RLS, storage bucket
  seed.sql               Sample catalogue
static/
  .nojekyll              Stops Pages hiding the _app/ directory
.github/workflows/
  deploy.yml             Build + publish to Pages (push, nightly, on demand)
  keep-supabase-awake.yml  Daily anon read so the free project never pauses
```

---

© A.B.K. Auto Parts Co., Ltd. Built with SvelteKit, Tailwind and Supabase.
