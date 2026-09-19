# 01 · Technology plan

Guiding rule: every piece of the stack must earn its place by removing work from the person who maintains the site, not adding it. The site is one page, a colophon page, a PDF and a contact endpoint. It should still be simple in 2029.

## Summary table

| Concern | Choice | Alternatives considered |
|---|---|---|
| Site generator | **Astro 7 (7.3.x), static output** with `@astrojs/cloudflare` 14 for the one server endpoint | Plain HTML (no templating for content files), Eleventy (fine, but you already know Astro), Next.js/React (a runtime you don't need) |
| Content | **YAML data files + Markdown**, validated by Astro content collections (Zod schemas) | Headless CMS (login, hosting, another thing to break), editing HTML directly (error-prone) |
| Styling | **Plain CSS** with custom properties, one stylesheet per concern, scoped Astro `<style>` where local | Tailwind (fine, but the design spec is already expressed in tokens and hand-written CSS; nothing to gain), CSS-in-JS (no) |
| Illustrations | **Inline SVG components** (`.astro` files wrapping the six scenes and the character) | Raster images (lose crispness and the accent-color control), external `<img src>` (can't recolor, extra requests) |
| Fonts | **Self-hosted** via `@fontsource/barlow`, `@fontsource/barlow-condensed`, `@fontsource/spline-sans-mono`; preload the condensed 700 face | Google Fonts link (third-party request, layout shift, privacy) |
| Hosting | **Cloudflare Workers with static assets**, custom domain on the apex | Cloudflare Pages (still works, but Cloudflare now recommends Workers for new projects and Pages lacks newer features), GitHub Pages (no server endpoint, no CF integration) |
| Contact form | **`/api/contact` endpoint** in the same Worker: Turnstile check, rate limit, Resend email | Third-party form services (another account; less to show on the colophon), `mailto:` only (what the mockup has; keep as fallback) |
| Bot protection | **Cloudflare Turnstile** (managed, invisible for most humans) + honeypot field + **Workers rate-limiting binding** | reCAPTCHA (Google dependency), none (spam within a week) |
| Email delivery | **Resend** (you have an account), verified `keithhuster.com` sending domain | MailChannels (their free Workers path was retired), SES (more setup) |
| Analytics | **Cloudflare Web Analytics** beacon: free, cookieless, no consent banner needed | Plausible/Fathom (paid), GA (consent, weight) |
| CI/CD | **GitHub Actions**: checks on every PR, preview deploy on PR, production deploy on `main` | Cloudflare Workers Builds (Git integration; simpler but doesn't fit the 1Password requirement), manual `wrangler deploy` |
| Secrets | **1Password service account** + `1password/load-secrets-action`; Worker secrets synced from 1Password by the deploy job | GitHub encrypted secrets (fine, but you asked for 1Password; only the service-account token lives in GitHub) |
| Testing | **`astro check`** (types + content schemas), **Playwright 1.62** smoke test (runs on Node via `bunx`) at 1440/834/390 including the "rider visible" assertion, **axe** accessibility scan, **Lighthouse CI** budget | Unit tests (nothing to unit-test), visual regression (adds flake; revisit if the design churns) |
| Dependency upkeep | **Renovate** (already installed on Keith's GitHub account), `renovate.json` extending `config:recommended`, grouped minor/patch updates, automerge for patch-level dev tooling, lock-file maintenance | Dependabot (fine, but Renovate is what the rest of Keith's repos use) |
| Runtime & package manager | **Bun 1.4** for install, scripts and the lockfile; **Node 24 LTS** kept installed for the tools that need it (see below) | npm/pnpm + Node only (works, but Bun is the house standard); Bun-only with `--bun` (Playwright's runner doesn't support it) | pnpm/bun (fine, no advantage here) |

## Why Astro, and why static-first

Astro renders to plain HTML at build time and ships zero JavaScript by default. It has first-class content collections (the Content Layer API, the only kind since Astro 6): a `content.config.ts` file declares a Zod 4 schema, and every YAML/Markdown file is validated on every build, so a typo in a date or a missing field fails the build in CI instead of rendering wrong on the live site. That is the property that makes "edit a file, commit, it deploys" safe for years.

React is unnecessary: there is no interactive state beyond a menu toggle. If you ever want an island (say, an interactive elevation chart), Astro can mount a React component in one place without changing anything else.

The `@astrojs/cloudflare` adapter (v14, built on Cloudflare's official Vite plugin) is used only so that `src/pages/api/contact.ts` can be `prerender = false` and run on the Worker. Every other route is prerendered to static files, served directly from Cloudflare's asset storage without invoking the Worker (`run_worker_first` stays off), so the site is as fast and as cheap as a purely static one. A side benefit of the v14 adapter: `astro dev` runs inside `workerd`, and `astro preview` runs the built Worker locally, so the contact endpoint is exercised in development and in CI without a separate `wrangler dev` step.

Things that changed recently and are worth knowing before starting: Astro 7's Rust compiler rejects unclosed tags and no longer auto-corrects invalid HTML (good: the SVG-heavy templates get linted for free); Markdown is processed by Sätteri by default (the colophon needs nothing special); Zod 4 uses `z.email()` / `z.url()` rather than `z.string().email()`; and bindings are read with `import { env } from 'cloudflare:workers'` instead of `Astro.locals.runtime.env`.

## Bun and Node: who runs what

Bun is the package manager and script runner: `bun install` (with `bun.lock` committed), `bun run dev|build|preview|test`, `bunx wrangler …`. It's faster and it matches your other repos. Two facts shape how far it goes:

- By default `bun run` executes a package CLI whose shebang is `#!/usr/bin/env node` with **Node**, not Bun; only `bun --bun …` forces the Bun runtime. Astro, Vite, the Cloudflare Vite plugin, Wrangler and Playwright all have Node shebangs, so under `bun run` they run on Node exactly as they would with npm. That's the configuration Astro documents and the one with the fewest rough edges (Astro's own Bun recipe warns that "some integrations may not work as expected" under the Bun runtime).
- Playwright's test runner does not run under the Bun runtime; the feature request was closed as not planned. `bunx playwright test` works only because Bun defers to Node.

So: Bun everywhere as the tool, Node 24 present on the machine and in CI (both pinned in `mise.toml` and installed by `mise install`, locally and via `jdx/mise-action` in CI), no `--bun` flag anywhere. The production runtime is workerd on Cloudflare regardless, so this choice affects developer tooling only. If Playwright or the Astro tooling gains Bun-runtime support later, dropping Node is a one-line change in the workflows.

## Why Workers rather than Pages

Cloudflare's own docs say Workers is the platform going forward and recommend it for new projects; Pages remains supported but doesn't get the newer features. Practically: one `wrangler.jsonc`, one `wrangler deploy`, static assets and the API endpoint in one deployable, preview URLs per version, and it fits your existing Workers subscription. Sources: [Cloudflare: migrate from Pages to Workers](https://developers.cloudflare.com/workers/static-assets/migration-guides/migrate-from-pages/), [Cloudflare: static assets](https://developers.cloudflare.com/workers/static-assets/), [Astro: deploy to Cloudflare](https://docs.astro.build/en/guides/deploy/cloudflare/).

## What is deliberately not in the plan

- No database, KV or D1. Nothing on the site is stateful. (Rate limiting uses the Workers rate-limiting binding, which needs no storage.)
- No image pipeline. The illustrations are SVG; the only raster is the Open Graph image, generated once at build time from the hero scene.
- No i18n, no search, no comments, no newsletter.
- No client router or transitions library. Anchor links and `scroll-behavior: smooth` are enough.
- No Storybook or design-system tooling. The tokens live in one CSS file.

## Rough cost

Workers paid plan (already have it), Turnstile free, Web Analytics free, Resend free tier (3,000 emails/month; the form will send a few a month), 1Password (already have it), GitHub Actions free minutes for a public repo. Effective incremental cost: $0.
