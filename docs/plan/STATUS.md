# Status

Hand-off file between sessions. Rewritten at the end of every session; describes the current state only.

## Live

- https://keithhuster.com serves the new site (cut over 2026-09-19): homepage, `/colophon`, `/api/contact`, `og.png`, `robots.txt`, `Keith-Huster-Resume.pdf`. The old `keithhuster-sapper` Worker's route and the placeholder apex A record were removed; the old Worker script itself is still in the account and can be deleted after a month.
- https://keithhuster-com.husterk.workers.dev still works as a preview host.
- Every merge to `main` deploys and syncs the Worker secrets from 1Password. Every PR gets a preview URL comment.

## Merged

- M0, M1, M2, M3 and M4 (colophon, metadata, OG image, JSON-LD, robots.txt, résumé PDF, custom domain).
- Lighthouse in CI: median of three runs against 95/100/95/100. Playwright: 15 tests at 1440/834/390 including the rider-visible assertion, the phone menu, axe on three pages and the contact endpoint (405, 403, 400, honeypot, dry run, 429, no-JS HTML).

## Open

- Nothing in flight. Next: M5 (parallax and rider bob, colophon numbers, first case study, Renovate's first grouped PR).

## Blocked on Keith

- **`www` redirect.** A proxied `AAAA www 100::` record now exists so the redirect can fire, but Bulk Redirects are account-level and the API token cannot create them. In the dashboard: Account home, Bulk Redirects, Create Bulk Redirect List, name `www-to-apex`, add one URL redirect with source URL `www.keithhuster.com`, target URL `https://keithhuster.com`, status `301`, and tick Preserve query string, Subpath matching and Preserve path suffix. Then Create Bulk Redirect Rule, name `www to apex`, select that list, and enable it. Verify with `curl -sI https://www.keithhuster.com/about` (expect 301 to `https://keithhuster.com/about`). Then issue #17 can close.
- **One real contact message.** Open https://keithhuster.com/#contact in a real browser, send yourself a message, and confirm it arrives from `contact@keithhuster.com` with your address as reply-to. Turnstile rejects headless Chromium, so I could not do this myself. Then issue #14 can close.
- **Web Analytics.** Check Analytics & Logs, Web Analytics for your own visit to https://keithhuster.com. Automatic setup injects the beacon at the edge; nothing is in the repo.
- **LinkedIn.** Point the profile at https://keithhuster.com and check the link preview shows the OG image. Then issue #18 can close.

## Repository configuration (done)

- Rebase merge only, head branches auto-deleted, wiki/discussions/projects off, vulnerability alerts, secret scanning and push protection on.
- Ruleset `main`: PR required, linear history, required status check `ci`, no force push or deletion.
- Labels, milestones M0 to M5, issues #2 to #22, GitHub environment `production`, Project board https://github.com/users/husterk/projects/1 with Status (Todo / In progress / Blocked on Keith / Done).

## Things a future session should know

- `astro preview` backgrounds itself when it detects an AI agent; the Playwright config passes `--ignore-lock` to keep it in the foreground. Stop a stray one with `bunx astro preview stop`.
- `.dev.vars` must exist before `astro build` for the preview Worker to see the Turnstile test secret; CI copies `.dev.vars.example` into place. Locally run `bun run secrets:local` (needs the 1Password CLI) or copy the example.
- Worker secrets sync after `wrangler deploy`, because PR preview uploads leave a newer undeployed version and Cloudflare refuses secret edits in that state (error 10215).
- The Turnstile script loads only when the contact form nears the viewport; it was the only third-party request on first load.
