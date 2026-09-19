# keithhuster.com — implementation plan

Plan for turning the approved design (`../design/`) into the production site. Written 2026-09-18.

## The recommendation in one paragraph

Build the site with **Astro** as a mostly static site, with every word of content in a handful of **YAML and Markdown files** validated by a schema at build time. Deploy it as a single **Cloudflare Worker with static assets** (not Cloudflare Pages), which also serves one small server endpoint, `/api/contact`, that verifies a **Turnstile** token and sends the message through **Resend**. **Bun** manages packages and runs scripts (Node 24 stays installed underneath, because Playwright's test runner and the Astro/Wrangler CLIs are Node programs that Bun hands off to by default). Build and deploy from **GitHub Actions**, pulling the Cloudflare and Resend credentials from **1Password** at run time so the repository can be public; **Renovate** (already installed on your GitHub account) keeps dependencies current. Add **Cloudflare Web Analytics** (cookieless) and a **colophon page** describing how the site was built. No database, no CMS, no React, no client-side framework: the only JavaScript shipped to browsers is a mobile-menu toggle, the Turnstile widget on the contact form, and an optional few lines of parallax.

## Documents

| File | What it covers |
|---|---|
| `01-technology-plan.md` | Each technology choice, why, and what was considered instead |
| `02-repo-structure.md` | Repository layout, the content model (what you edit to update the site), templates and styling |
| `03-ci-cd-and-secrets.md` | GitHub Actions workflows, 1Password integration, Cloudflare configuration, DNS cutover |
| `04-contact-form.md` | The contact endpoint: Turnstile, Resend, rate limiting, spam handling, failure modes |
| `05-colophon.md` | Outline and draft copy for the "How this site was built" page |
| `06-milestones.md` | Build order in six milestones, each with a definition of done |
| `samples/` | Starter files: `wrangler.jsonc`, `astro.config.mjs`, `content.config.ts`, sample content YAML, both GitHub Actions workflows, `renovate.json`, the contact endpoint, the Playwright config and smoke test |

## Versions verified on 2026-09-18

Every version below was checked against the project's own release page on the date above. Pin these (or newer) when the repo is created; Dependabot keeps them moving afterwards.

| Technology | Current | Notes |
|---|---|---|
| Astro | **7.3.3** (16 Sep 2026) | Vite 8, Rust compiler, Sätteri Markdown by default, Zod 4 schemas, Content Layer only |
| @astrojs/cloudflare | **14.x** | Built on `@cloudflare/vite-plugin`; `astro dev` runs in workerd; env via `import { env } from 'cloudflare:workers'` |
| Wrangler | **4.134.0** (17 Sep 2026) | Rate-limiting binding needs ≥ 4.36; `observability.issues.enabled` new |
| @cloudflare/vite-plugin | 1.55.0 | Installed by the adapter |
| Bun | **1.4.2** (4 Sep 2026) | Package manager, script runner, `bun.lock`. `bun run` executes Node-shebang CLIs (astro, vite, wrangler, playwright) with Node by default; `--bun` forces the Bun runtime and is not used here |
| Node.js | **24 LTS** kept alongside Bun; **26** enters LTS in Oct 2026 | Required by Playwright's test runner (Bun support closed as not planned) and used by the Astro/Wrangler CLIs under `bun run` |
| oven-sh/setup-bun | v2 | |
| Renovate | hosted app on Keith's GitHub account | Bun manager supports `bun.lock`; lock-file maintenance bug fixed |
| Playwright | 1.62.x | |
| actions/checkout | v6 | |
| actions/setup-node | v7 | |
| actions/upload-artifact | v7 | |
| actions/github-script | v9 | ESM-only; `require('@actions/github')` no longer works inside scripts |
| 1password/load-secrets-action | v5 | |
| cloudflare/wrangler-action | v4 | Installs Wrangler 4 by default (the workflows call `bunx wrangler` directly instead, so the repo's pinned version is used) |
| Cloudflare Pages | not deprecated, but the docs say "Start new projects with Workers" | Confirms the Workers choice |
| Workers rate limiting binding | GA | `ratelimits` config key, `env.X.limit({ key })` |
| Worker preview URLs | `wrangler versions upload` → `<prefix>-<worker>.<subdomain>.workers.dev`, on by default when `workers_dev` is on | Used for PR previews |

## Open decisions for you

These are the only choices left that I'd want your call on before starting; defaults are in bold.

1. Repository name and visibility: **`keithhuster.com`, public**.
2. Package manager: **Bun** (`bun.lock` committed; `bun install --frozen-lockfile` in CI).
3. The sending address for the contact form: **`contact@keithhuster.com` via a verified Resend domain** (requires three DNS records in the Cloudflare zone) versus Resend's shared test sender, which only delivers to your own address.
4. Preview deployments on pull requests: **yes**, using Worker preview URLs (free with your Workers plan), so you can review a change on your phone before merging.
5. Whether the old site's assets (photos, PDFs) need to keep working at their old URLs: **no; single 301 from `www` to the apex only**.
