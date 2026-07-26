# A.B.K. Auto Parts — website

Marketing + catalogue site for **A.B.K. Auto Parts Co., Ltd** — genuine Japanese
auto parts (Toyota, Isuzu, Mitsubishi, Nissan) with a WhatsApp / phone inquiry
model and a staff-only admin for managing the catalogue.

- **Framework:** SvelteKit (Svelte 5) — server-rendered for SEO
- **Styling:** Tailwind CSS v4
- **Data / Auth / Storage:** Supabase (Postgres + Auth + Storage)
- **Hosting:** Cloudflare Pages (via `@sveltejs/adapter-cloudflare`)

> **Why SvelteKit, not plain Svelte?** Plain Svelte builds a client-only SPA —
> crawlers see an empty shell. SvelteKit renders real HTML on the server, adds
> per-page `<title>`/meta, a sitemap, and JSON-LD structured data — everything
> the SEO goal needs — and deploys straight to Cloudflare.

---

## Quick start (demo mode — no accounts needed)

```bash
pnpm install
pnpm dev
```

Open <http://localhost:5173>. With **no Supabase configured**, the site runs in
**demo mode**: it serves the bundled sample catalogue (`src/lib/data/seed.ts`)
and a demo admin login. A yellow “Demo mode” badge is shown.

**Demo admin:** go to `/admin`, sign in with the pre-filled credentials
(`admin@abkautoparts.local` / `abk-demo-admin`). You can add/edit/delete parts —
changes live in memory only and reset when the dev server restarts.

Useful scripts:

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Dev server |
| `pnpm build` | Production build (Cloudflare output) |
| `pnpm preview` | Preview the production build |
| `pnpm check` | Type-check (svelte-check) |
| `pnpm deploy` | Build + `wrangler pages deploy` |

---

## Going live with Supabase

1. **Create a project** at [supabase.com](https://supabase.com).
2. **Run the schema:** open the SQL Editor and run `supabase/schema.sql`
   (creates the `parts` table, RLS policies and the `part-images` storage
   bucket). Optionally run `supabase/seed.sql` for the sample catalogue.
3. **Disable public sign-ups:** _Authentication → Providers → Email_ → turn off
   “Allow new users to sign up”. This makes the site staff-only.
4. **Create staff accounts:** _Authentication → Users → Add user_ (with a
   password). These are your admin logins.
5. **Add environment variables** — copy `.env.example` to `.env` and fill in:

   ```bash
   PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
   PUBLIC_SUPABASE_ANON_KEY=YOUR-ANON-KEY
   ```

   Restart `pnpm dev`. The “Demo mode” badge disappears and the site now reads
   and writes live Supabase data. `/admin` now uses real Supabase Auth.

**How access works:** the public catalogue is read with the anon key and only
sees `published = true` rows (enforced by Row Level Security). Any signed-in
staff member can read everything and create/update/delete — there is no
service-role key in the app, so nothing privileged ships to the browser or the
edge worker.

---

## Deploying to Cloudflare Pages

**Option A — Git integration (recommended)**

1. Push this repo to GitHub/GitLab.
2. Cloudflare dashboard → _Workers & Pages → Create → Pages_ → connect the repo.
3. Build settings:
   - **Build command:** `pnpm build`
   - **Build output directory:** `.svelte-kit/cloudflare`
4. Add the environment variables (`PUBLIC_SUPABASE_URL`,
   `PUBLIC_SUPABASE_ANON_KEY`) under _Settings → Environment variables_ for both
   Production and Preview.
5. Deploy. `nodejs_compat` is already set in `wrangler.jsonc`.

**Option B — CLI**

```bash
pnpm build
npx wrangler pages deploy .svelte-kit/cloudflare
# set secrets:
npx wrangler pages secret put PUBLIC_SUPABASE_ANON_KEY
```

After deploying, set your real domain in `src/lib/config.ts` (`site.url`) so
canonical URLs, the sitemap and social tags use it.

---

## SEO — what's built in

- **Server-side rendering** of every public page (real HTML for crawlers).
- Per-page `<title>`, meta description, canonical URL, Open Graph + Twitter
  cards via `src/lib/components/Seo.svelte`.
- **JSON-LD structured data:** `AutoPartsStore` + `WebSite` (home), `Product`
  with price/availability (part pages), and `BreadcrumbList`.
- **`/sitemap.xml`** generated from live catalogue data, **`/robots.txt`**
  (disallows `/admin`), and social image `/og-image.jpg`.
- Search-result pages (`?q=`) are `noindex`; category pages are indexable
  landing pages.

**Before launch:** update `site.url`, `site.email`, `site.address` and
`site.social.facebook` in `src/lib/config.ts` (phone + WhatsApp are already set
from the brand artwork). Then submit the sitemap in Google Search Console.

---

## Editing the brand / contact details

Everything brand-specific lives in **`src/lib/config.ts`**: company name,
tagline, phone, WhatsApp, email, address, vehicle brands, part categories and
navigation. The part **categories** and vehicle **brands** are intentionally
fixed here (not database tables), so the `parts` table stays the single thing
you manage.

## Project structure

```
src/
  lib/
    config.ts            Brand, contact, categories, brands, nav
    seo.ts               Meta + JSON-LD helpers
    types.ts             Domain types
    utils.ts             slugify, price formatting
    data/seed.ts         Bundled sample catalogue (demo mode)
    components/          Header, Footer, PartCard, PartForm, Icon, Seo, …
    server/
      config.ts          Env detection (Supabase configured?)
      db.ts              Data access — Supabase OR in-memory demo fallback
      auth.ts            Demo-mode session helpers
      partForm.ts        Form parsing, validation + image upload
  routes/
    +page.svelte         Home
    parts/               Catalogue + [slug] detail
    about/  contact/
    sitemap.xml/  robots.txt/
    admin/               Login, dashboard, parts CRUD (staff only)
  hooks.server.ts        Per-request Supabase client + auth
supabase/
  schema.sql             Tables, RLS, storage bucket
  seed.sql               Sample catalogue
static/                  Logo, banners, favicon, OG image
```

---

© A.B.K. Auto Parts Co., Ltd. Built with SvelteKit, Tailwind, Supabase and
Cloudflare.
