# Session handoff — keithhuster.com build

This file exists so the build can continue in a terminal Claude Code session with full GitHub access. Everything the design/planning session produced is in this repository; nothing else is needed.

**How to use it:** open a terminal in `~/git-repos/keith-huster-dot-com-site`, start `claude`, and paste everything below the line as the first message. M0 is complete (see the report at the bottom). Before starting, make sure `gh auth status` works with the `workflow` scope (`gh auth refresh -s workflow`), since the session will push `.github/workflows/`.

---

## Prompt

You are taking over the implementation of my personal portfolio site, keithhuster.com, from a Claude Cowork design-and-planning session. The repository you are in (`husterk/keith-huster-dot-com-site`, public) already contains the complete approved design and the complete implementation plan. Read them before doing anything else, in this order:

1. `docs/plan/README.md` — the recommendation in one paragraph, the document index, and a table of technology versions verified on 2026-09-18.
2. `docs/plan/01-technology-plan.md` through `06-milestones.md` — every choice, the repo structure and content model, CI/CD and secrets handling, the contact form spec, the colophon outline, and the milestone plan with definitions of done.
3. `docs/plan/samples/` — starter files (`wrangler.jsonc`, `astro.config.mjs`, `content.config.ts`, content YAML, `ci.yml`, `deploy.yml`, `renovate.json`, `package.json`, `playwright.config.ts`, `src/pages/api/contact.ts`, `tests/smoke.spec.ts`, `lighthouserc.json`, `.dev.vars.tpl`). Use them as the starting point; adapt, don't rewrite.
4. `docs/plan/MANUAL-SETUP.md` — the tasks only I can do (accounts, tokens, 1Password). I will tell you which are done.
5. `docs/design/README.md`, `docs/design/DESIGN-SPEC.md`, `docs/design/COPY.md`, `docs/design/BUILD-NOTES.md` — the approved design ("Big Sky Poster / B4 blend"), its tokens, scenes, character, responsive rules and the final copy. `docs/design/preview/index.html` is a standalone, fluid-responsive reference implementation of the whole page; `docs/design/png/` and `docs/design/pdf/` are the approved renders at 1440, 834 and 390 px; `docs/design/assets/` has the six SVG scenes and the bikepacker character; `docs/design/artboards/` is the Claude Design source.

### Hard requirements

- **This repository is public. No secrets, tokens, keys, account IDs, personal phone numbers or private information may ever be committed, printed in an issue/PR, or echoed to a log.** Secrets live in 1Password; the only GitHub secret is `OP_SERVICE_ACCOUNT_TOKEN`; runtime secrets reach the Worker via `wrangler secret bulk` in the deploy workflow. `.dev.vars`, `.env*` and `.secrets/` are gitignored; keep them that way. Before every commit, scan the diff for anything secret-shaped. The only public value that lives in the repo is the Turnstile site key (in `src/content/site.yaml` and `wrangler.jsonc`); Web Analytics uses Cloudflare's automatic injection, so no beacon token is needed.
- Follow the plan's technology decisions unless something is broken: Astro 7 (static, content collections with Zod 4 schemas), `@astrojs/cloudflare` 14, a single Cloudflare Worker with static assets (not Pages), Turnstile + honeypot + Workers rate-limit binding + Resend for `/api/contact`, plain CSS with design tokens, inline SVG components, self-hosted fonts via `@fontsource` (Barlow Condensed, Barlow, Spline Sans Mono), Cloudflare Web Analytics, a colophon page. **Bun** is the package manager and script runner (`bun.lock`, `bun install --frozen-lockfile`); **Node 24 LTS stays installed alongside** because Playwright's runner and the Astro/Wrangler CLIs are Node programs that `bun run` hands off to (never use `--bun`). **Renovate** handles dependency updates (already installed on my account; `renovate.json` is at the repo root). No React, no client-side framework; the only shipped JS is the mobile-menu toggle, the Turnstile widget and optional reduced-motion-aware parallax.
- Check the actual latest versions of Astro, the adapter, Wrangler, Bun, Playwright and the GitHub Actions before pinning; the plan's table is from 2026-09-18 and may already be behind. Update the README table if you change anything.
- The site must match the approved design at 1440, 834 and 390 px (compare against `docs/design/png/`). On the phone width the bikepacker character must be visible in every scene strip (the design centers each scene on the rider; the `--k`/`--cx` values are in `DESIGN-SPEC.md` and the preview HTML). Hero headline is "Reliable by design." Do not reintroduce "Built to stay up." The phone number is never shown.
- Work through pull requests, not direct pushes to `main`, once branch protection exists. Squash-merge. Keep PRs small enough to review.
- Stop and ask me only when a task needs my accounts or a decision the plan doesn't cover; otherwise proceed. When you need something from me, say exactly what to do, where, and how you'll verify it.

### Current state

- Local `main` has five commits ahead of `origin/main` (`a39a448` design + plan + repo hygiene, then four docs updates ending with the M0 completion report) that were never pushed because the previous session had no GitHub credentials. First action: `git status`, `git log --oneline -6`, confirm the remote is `git@github.com:husterk/keith-huster-dot-com-site.git`, then `git push -u origin main`. If GitHub already has an initial commit that conflicts, rebase ours on top of it rather than force-pushing.
- Repo contents so far: `.gitignore`, `LICENSE` (MIT for code; content and illustrations all rights reserved), `README.md`, `SECURITY.md`, `renovate.json`, `.github/CODEOWNERS`, `.github/pull_request_template.md`, `docs/design/`, `docs/plan/`. No application code yet.
- M0 status: I will state below which MANUAL-SETUP steps are complete. Treat anything not listed as not done and do not depend on it.

### Your first work session

1. Push `main` and configure the repository with `gh api` / `gh repo edit`: default branch `main`; squash merge only, auto-delete head branches; wiki, discussions and projects (classic) off; vulnerability alerts, secret scanning and push protection on; branch protection (or a ruleset) on `main` requiring a PR and the `ci` status check (add the check requirement after the first CI run so the name matches exactly). Forking cannot be disabled on a public personal repo; skip it.
2. Create labels (`milestone:M0`…`M5`, `area:content`, `area:design`, `area:ci`, `area:contact-form`, `area:infra`, `type:task`, `type:bug`, `type:docs`), milestones M0–M5 with the descriptions from `06-milestones.md`, one issue per work item in that file (checkbox lists for sub-tasks, link the relevant plan doc), and a user-level GitHub Project "keithhuster.com" with a Status field (Todo / In progress / Blocked on Keith / Done) containing all issues. Use the `project` scope (`gh auth refresh -s project`) if needed.
3. Correct `docs/plan/MANUAL-SETUP.md` §9 if anything you just did differs from what it promised, then tick off the checklist items I report as done.
4. Then start **M1** per `06-milestones.md`, in a branch, as a PR: Astro 7 skeleton with the Cloudflare adapter, `wrangler.jsonc` and `renovate.json` from samples, `.bun-version`, `.nvmrc`, Prettier, `Base.astro` with fonts and tokens, placeholder `index.astro` and `404.astro`, `ci.yml` and `deploy.yml`. The first real deploy needs the Cloudflare token in 1Password and `OP_SERVICE_ACCOUNT_TOKEN` in GitHub (MANUAL-SETUP §3–§4), which are done, so the first merge to `main` should deploy to `workers.dev`.
5. Continue with M2 (content model + homepage port from `docs/design/preview/index.html` into components, Playwright at three widths with the rider-visible assertion, axe, Lighthouse budget), M3 (contact form), M4 (launch, including the `www` bulk redirect and DNS cutover instructions for me), M5 (polish), one PR per coherent unit. Use subagents for parallelizable component work if that helps, but you own the integration.

### Reporting

At the end of each work session, update `docs/plan/STATUS.md` (create it) with: what merged, what's open, what's blocked on me and exactly what I need to do. Keep it short and current; that file is how we hand off between sessions from now on.

### M0 completion report (I fill this in before sending)

- [x] §3 1Password vault `secrets_keith-huster-dot-com-site`, items `Cloudflare API token`, `Resend`, `Turnstile`; service account; GitHub secret `OP_SERVICE_ACCOUNT_TOKEN` — done
- [x] §4 Cloudflare API token + account ID stored — done
- [x] §5 Resend domain `keithhuster.com` verified (CNAME-based records via the Cloudflare integration) + sending-only key stored — done
- [x] §6 Turnstile widget created; **site key:** `0x4AAAAAAE9H4_9aeIf8uo-Q` (public; put it in `src/content/site.yaml` and `wrangler.jsonc` vars)
- [x] §7 Web Analytics: created with **automatic setup** (Cloudflare injects the beacon at the edge for the proxied custom domain). Consequences: do **not** add a beacon `<script>` to `Base.astro`; never send `Cache-Control: no-transform` on HTML responses (it blocks the injection); analytics will not appear on `workers.dev` preview URLs, which is fine. If a manual snippet is ever wanted, the token is under Analytics & Logs → Web Analytics → Manage site.
- Old site hosting: I will tell you at M4 (the apex currently has a proxied placeholder `A 192.0.2.1` record, which the Worker custom domain will replace).

Begin by reading the documents listed above, then push `main`.
