# Deploying abk

Production hosting is **oxidebase** (our own platform), not GitHub Pages.
The live site is <https://abkautopart.com>; `abk.oxidebase.dev` permanently
redirects there. The README's GitHub Pages sections describe the legacy
setup and are kept for reference.

## The one thing to remember

**oxidebase builds from GitHub `main`, not from your working tree.** A
deploy ships whatever is pushed — so the sequence is always:

```sh
git push origin main
```

then trigger a build. Deploys are safe by construction: a failed build
never touches the live site (the active deployment only flips on success),
and every previous deployment stays on disk for instant rollback.

## Trigger a deploy

On the DGX there is a gitignored wrapper for all of the below:
`./deploy.sh` (push if ahead → build → wait → verify), `./deploy.sh status`
to compare local / origin / live commits. Everywhere else: either through
Studio — <https://oxidebase.dev> → project **abk** → Deployments → Deploy —
or from a shell:

```sh
# Operator API token: on the DGX it is cached at ~/.config/oxidebase/prod-token
TOKEN=$(cat ~/.config/oxidebase/prod-token)

# Kick off the build (returns the deployment id)
curl -s -X POST -H "authorization: Bearer $TOKEN" \
  https://oxidebase.dev/api/projects/abk/deployments

# Watch it (status: queued → building → ready | failed)
curl -s -H "authorization: Bearer $TOKEN" \
  https://oxidebase.dev/api/deployments/<id>

# Build log, when something goes wrong
curl -s -H "authorization: Bearer $TOKEN" \
  https://oxidebase.dev/api/deployments/<id>/logs
```

`ready` means it is already live — activation is automatic on success.
A typical build (clone + pnpm install + prerender) takes a few minutes.

## Verify

```sh
curl -s -o /dev/null -w '%{http_code}\n' https://abkautopart.com   # 200
```

Spot-check a part page and the admin login. Prerendered pages re-query
Supabase after hydration, so catalogue freshness never depends on the
deploy — only code and prerendered SEO snapshots do.

## Roll back

List deployments, then activate the previous good one — it flips a pointer,
no rebuild:

```sh
curl -s -H "authorization: Bearer $TOKEN" \
  https://oxidebase.dev/api/projects/abk/deployments
curl -s -X POST -H "authorization: Bearer $TOKEN" \
  https://oxidebase.dev/api/deployments/<previous-id>/activate
```

## Build configuration

The build command lives in the oxidebase project settings (not in this
repo) and carries the public env inline:

```
BASE_PATH= PUBLIC_SITE_URL=https://abkautopart.com \
PUBLIC_SUPABASE_URL=https://abkautopart.com \
PUBLIC_SUPABASE_ANON_KEY=<from GET /api/projects/abk/keys> \
pnpm run build
```

`PUBLIC_SUPABASE_URL` is the site's own origin because the Supabase-compatible
API (`/rest/v1`, `/auth/v1`, `/storage/v1`) is served same-origin by
oxidebase — there is no separate Supabase project and the data plane has no
CORS. Change settings with `PATCH /api/projects/abk` (`build_command`, …).

## Gotchas

- **Private repo:** this repository is under `basharabkautoparts-sys`. If it
  is private, the production server needs `OXIDEBASE_GITHUB_TOKEN`
  (contents:read on this repo) in `/opt/oxidebase/.env`, then
  `docker compose up -d` in `/opt/oxidebase`. Without it the clone fails —
  harmlessly, but the deploy goes nowhere.
- **Push first.** A "deploy" of unpushed work rebuilds the old commit and
  looks like nothing happened.
- **Backups:** the platform's nightly off-site pull (oxidebase repo,
  `deploy/backup/README.md`) covers abk's database, storage and slips —
  nothing to do here.
