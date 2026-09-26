# 06 · Milestones

Each milestone ends with something deployable. Estimates assume focused sessions; the whole plan is a few evenings, not a project.

## M0 · Accounts and access (≈1 hour, all in dashboards)

- GitHub repo `keith-huster-dot-com-site` (public), ruleset on `main` requiring a PR, linear history and the `ci` check.
- 1Password: vault `secrets_keith-huster-dot-com-site`; service account with read access to it; items for the Cloudflare API token, Resend key, Turnstile secret. Put `OP_SERVICE_ACCOUNT_TOKEN` in the GitHub repo secrets.
- Cloudflare: API token (scoped as in `03`), Turnstile widget, Web Analytics site.
- Resend: add and verify the `keithhuster.com` sending domain (three DNS records in Cloudflare), create the restricted API key.

**Done when:** `op read` of each item works locally with your CLI, and the GitHub secret exists.

## M1 · Skeleton that deploys (≈2 hours)

- `bun create astro@latest` (Astro 7, minimal, TypeScript strict), `bun astro add cloudflare` (adapter 14), `wrangler.jsonc` and `renovate.json` from `samples/`, `mise.toml` pinning Bun 1.4.2 and Node 24 (+ `mise.lock`), `packageManager` field, Prettier, `.dev.vars.example`. Pin the versions from the README table.
- `Base.astro` with fonts, tokens, a placeholder `index.astro` and `404.astro`.
- `ci.yml` and `deploy.yml` from `samples/`; first deploy to the `workers.dev` URL (no custom domain yet).

**Done when:** a PR gets a green check and a preview URL comment; merging deploys to `keithhuster-com.<account>.workers.dev`.

## M2 · Content model and the homepage (≈1 evening)

- `content.config.ts` and the six content files, populated from `docs/design/COPY.md` (drafts in `samples/content/`).
- Port `docs/design/preview/index.html` into components: Nav, Hero, Stats, Experience (+ElevationChart), Impact, Leadership, Patents, Beyond, Contact, Footer; scenes as components; container queries → media queries.
- Mobile menu.
- Playwright smoke test at 1440/834/390 including the rider-visible assertion; axe test; Lighthouse budget.

**Done when:** the preview matches the approved design at all three widths (compare against `docs/design/png/`), tests pass, Lighthouse ≥ 95/100/95/100.

## M3 · Contact form (≈half an evening)

- `api/contact.ts` per `04`, `ContactForm.astro`, rate-limit binding, dry-run mode for CI, Playwright coverage.
- Secrets synced by the deploy workflow; one real end-to-end message sent to yourself from the preview.

**Done when:** you receive an email from the form with `reply_to` set correctly, and a bot-style submission (honeypot filled) is silently dropped.

## M4 · Launch (≈1 hour)

- `colophon.md` first draft (from `05`), metadata, OG image, `robots.txt`, JSON-LD.
- Custom domain route, `www` bulk redirect, Web Analytics beacon.
- Cut over DNS per `03`; verify on desktop, iPad and phone; check LinkedIn's link preview renders the OG image.
- Update the résumé and LinkedIn to point at the site.

**Done when:** `https://keithhuster.com` serves the new site with a valid certificate, the old site is unreachable, and analytics shows your own visit.

## M5 · Polish (optional, later)

- Parallax and the rider bob, behind `prefers-reduced-motion`.
- Fill in the colophon's measured numbers.
- Renovate's first grouped update, to confirm the upkeep loop works.

## Ongoing upkeep (what maintenance actually looks like)

- Content edit: YAML change → PR → merge. Minutes. A résumé edit regenerates the PDF in the same build.
- Weekly: merge Renovate's grouped PR if CI is green (patch-level dev tooling automerges on its own).
- Yearly: bump `compatibility_date` in `wrangler.jsonc` and the Bun/Node versions in `.bun-version` / `.nvmrc`, rotate the Cloudflare and Resend keys in 1Password and re-run the deploy workflow.
