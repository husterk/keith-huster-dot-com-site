# 03 · CI/CD, secrets and Cloudflare configuration

## Principles

- The repository is public, so it contains **no secrets and no per-environment config values that matter**. Everything sensitive lives in 1Password; GitHub holds exactly one secret, the 1Password service-account token.
- Two workflows, both small. Nothing deploys to production except a push to `main`, and `main` only changes through pull requests (branch protection with the `ci` check required).
- Deploys are idempotent: the deploy job rebuilds from source and runs `wrangler deploy`, so re-running it is always safe.

## Secrets inventory

| Secret | Where it lives | Who reads it | Notes |
|---|---|---|---|
| `OP_SERVICE_ACCOUNT_TOKEN` | GitHub repo secret | both workflows | The only GitHub secret. Scope the service account to one vault (`keithhuster.com`), read-only. |
| `CLOUDFLARE_API_TOKEN` | 1Password vault | deploy + preview jobs | Custom token: `Workers Scripts:Edit`, `Workers Routes:Edit`, `Account Settings:Read`, and `Zone:DNS:Edit` only if you want Wrangler to manage the custom domain. Scope to the one zone. |
| `CLOUDFLARE_ACCOUNT_ID` | 1Password (not secret, but keep it out of the repo anyway) | deploy | Or set in `wrangler.jsonc`; it's not sensitive. |
| `RESEND_API_KEY` | 1Password → synced to the Worker as a secret | the Worker at runtime | Create a key restricted to "Sending access" and the one domain. |
| `TURNSTILE_SECRET_KEY` | 1Password → synced to the Worker | the Worker at runtime | Widget site key is public and lives in `site.yaml`. |
| `CONTACT_TO` | `wrangler.jsonc` `vars` (not secret) | the Worker | `husterk@gmail.com`. |

Local development: `.dev.vars` (gitignored) holds the two runtime secrets; `op inject -i .dev.vars.tpl -o .dev.vars` fills it from 1Password using your existing CLI login. `.dev.vars.example` documents the names.

## Workflow 1: `ci.yml` (pull requests and pushes to non-main branches)

1. `actions/checkout`, `oven-sh/setup-bun@v2` (version from `.bun-version`), `actions/setup-node@v7` (Node from `.nvmrc`; needed because Playwright's runner and the Astro/Wrangler CLIs run on Node under `bun run`), `bun install --frozen-lockfile`.
2. `bun run check` → `astro check` (TypeScript + content schema validation) and `prettier --check`.
3. `bun run build` → `dist/`.
4. `bunx playwright install --with-deps chromium`, then `bun run test` → Playwright starts `astro preview` (the built Worker running locally in workerd) and runs the smoke and a11y specs, so the contact endpoint is exercised too; Turnstile has a testing site key that always passes.
5. `bunx lhci autorun` against the built site with a budget (performance ≥ 95, accessibility 100, best practices ≥ 95, SEO 100; LCP < 1.5 s on the simulated mobile profile).
6. **Preview deploy** (only for PRs from the same repo, never forks): load `CLOUDFLARE_API_TOKEN` from 1Password with `1password/load-secrets-action`, run `bunx wrangler versions upload`, and post the returned preview URL as a PR comment. Preview versions serve the same secrets as production, which is fine here (the form will really email you; the message is tagged with the version so you can tell).

## Workflow 2: `deploy.yml` (push to `main`, and manual `workflow_dispatch`)

1. Same checkout/install/check/build steps (never deploy something CI didn't build).
2. Load `CLOUDFLARE_API_TOKEN`, `RESEND_API_KEY`, `TURNSTILE_SECRET_KEY` from 1Password.
3. `wrangler secret bulk` from a JSON built in the job (piped from the env, never written to disk) so Worker secrets always match 1Password. Rotate a key in 1Password, re-run the workflow, done.
4. `wrangler deploy`.
5. Smoke check: `curl -sSf https://keithhuster.com/` and a HEAD on the résumé PDF; fail the job (and notify you by email through GitHub) if either 5xx.

Concurrency group `production` with `cancel-in-progress: false` so two merges in quick succession deploy in order.

Both workflows are in `samples/github/workflows/` (copy to `.github/` in the repo). They use the current major versions of the official actions as of 2026-09-18: `actions/checkout@v6`, `actions/setup-node@v7`, `actions/upload-artifact@v7`, `actions/github-script@v9` (ESM-only), `1password/load-secrets-action@v5`. Bun is installed with `oven-sh/setup-bun@v2`. Wrangler is run with `bunx wrangler` so the version pinned in `package.json` (4.134+) is what deploys; `cloudflare/wrangler-action@v4` is an equivalent alternative.

## Cloudflare configuration

`wrangler.jsonc` (see `samples/wrangler.jsonc`):

- `name: "keithhuster-com"`, `compatibility_date` set at project start, `compatibility_flags: ["nodejs_compat"]` (required by the Astro adapter).
- `main: "@astrojs/cloudflare/entrypoints/server"` and `assets: { directory: "./dist", binding: "ASSETS", not_found_handling: "404-page" }`, which is what adapter v14 generates by default; keep the file in the repo anyway so the bindings, routes and vars are explicit.
- `routes: [{ pattern: "keithhuster.com", custom_domain: true }]` binds the apex; Cloudflare creates the DNS record and certificate.
- `ratelimits: [{ name: "CONTACT_RL", namespace_id: "1001", simple: { limit: 5, period: 60 } }]` for the contact endpoint (GA; Wrangler ≥ 4.36).
- `preview_urls: true` (the default while `workers_dev` is on) so `wrangler versions upload` returns a `<prefix>-keithhuster-com.<subdomain>.workers.dev` URL per PR.
- `vars: { CONTACT_TO: "husterk@gmail.com", TURNSTILE_SITE_KEY: "..." }`.
- `observability: { enabled: true, issues: { enabled: true } }` so Worker logs and grouped error issues (including contact-form failures) are visible in the dashboard.

`www.keithhuster.com` → apex: a Cloudflare **Bulk Redirect** (301, preserve path) is the zero-code option and survives any future rewrite of the Worker; alternatively handle it in the Worker's `run_worker_first` path. Use the Bulk Redirect.

Web Analytics: create the site in the Cloudflare dashboard and paste the beacon `<script>` into `Base.astro`. No configuration in the repo beyond the public token.

## DNS cutover from the old site

1. Deploy the Worker without the custom domain first; test on the `*.workers.dev` URL and the preview URLs.
2. Add the custom-domain route and deploy. Cloudflare replaces the apex A/CNAME record with a Worker route (it will warn if a record exists; that record points at the old host).
3. Verify `https://keithhuster.com` and `https://www.keithhuster.com`; check the old anchors `/#about`, `/#portfolio`, `/#resume` don't 404 (they won't; unknown fragments just land on the page).
4. Keep the old site's files for a month somewhere in case something was linked; then delete them.

## Renovate

Renovate is already installed on your GitHub account, so the repo only needs a `renovate.json` (see `samples/renovate.json`). It extends `config:recommended`, groups all minor and patch updates into one weekly PR (`group:allNonMajor`), keeps majors separate (Astro and Wrangler majors deserve a look at the upgrade guide), automerges patch updates of dev tooling once CI is green, runs lock-file maintenance monthly on `bun.lock` (the Bun manager is supported; the lock-file-maintenance regression was fixed), and pins GitHub Actions to major tags. CI is the gate: a Renovate PR that fails `astro check` or Playwright simply stays open.

## Repository hygiene for a public repo

- `LICENSE`: code under MIT; content and illustrations "all rights reserved" (stated in the README), since the résumé text and the scenes are yours.
- `SECURITY.md` with a contact address; `CODEOWNERS` = you.
- `.gitignore` includes `.dev.vars`, `.wrangler/`, `dist/`, `node_modules/`, `test-results/`.
- The contact endpoint never logs message bodies; it logs a request id, the Turnstile outcome and the Resend message id.
