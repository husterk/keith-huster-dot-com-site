# CLAUDE.md

Agent guide for keithhuster.com. The plan lives in `docs/plan/`, the design in `docs/design/`, and the session hand-off in `docs/plan/STATUS.md`. Read STATUS.md first.

## Rules

- **Open a GitHub issue before starting any work**, including one-line fixes and docs. Give it a milestone and labels, put sub-tasks in a checkbox list, and reference it from the PR body with `Closes #N`. If the issue already exists, reuse it. Work that has no issue does not start.
- **Every change goes through a PR** from a branch off `origin/main`. The `ci` check is required; PRs are rebase-merged, never squashed. Merge your own PR once CI is green. `git push --force` is not allowed here: after a rebase, push a new branch and open a replacement PR.
- **No secrets in the repo, ever.** They live in 1Password and reach the Worker through `deploy.yml`. The only public values in the repo are the Turnstile site key and the Google Analytics measurement ID, both of which every visitor can read in the page source. Scan every diff before committing.
- **The design is the contract.** Pages must match `docs/design/png/` at 1440, 834 and 390; the rider must stay fully visible in every scene on the phone. Headline is "Reliable by design." The phone number never appears.
- **Content is data.** Copy lives in `src/content/*.yaml` and `src/content/pages/*.md`, validated by `src/content.config.ts`. Change words there, not in components.
- **Rewrite `docs/plan/STATUS.md` at the end of every session** so it describes the current state only: what is live, what merged, what is open, what needs Keith.
- Subagents run on Sonnet or Haiku, never the top model. An agent worktree starts from a stale commit: `git fetch origin && git reset --hard origin/main` first.
- Prose rules: US English, no em or en dashes, no code comments unless they explain a non-obvious why, never emoji in code.

## Commands

```sh
mise install                     # Bun and Node from mise.toml
bun install --frozen-lockfile
cp .dev.vars.example .dev.vars   # before the build: the preview Worker reads it for the contact tests
bun run check                    # wrangler types, astro check, prettier --check
bun run build
bun run test                     # Playwright: smoke at three widths, axe, contact endpoint, motion
bunx lhci autorun                # Lighthouse budget, median of three runs
bun run og                       # regenerate public/og.png after a hero change
```

`astro preview` backgrounds itself when it detects an AI agent; the Playwright config passes `--ignore-lock` to keep it in the foreground. If port 4321 is busy: `bunx astro preview stop` and `pkill -f "astro preview"`.

## Deploy

Merging to `main` builds, deploys the Worker, then syncs `RESEND_API_KEY` and `TURNSTILE_SECRET_KEY` from 1Password (after the deploy on purpose: Cloudflare refuses secret edits while a newer preview version exists). PRs from this repo get a preview URL comment. The custom domain is bound in `wrangler.jsonc`; `www` redirects through a Bulk Redirect in the Cloudflare dashboard.
