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

- **One real contact message, from a network without a DNS filter.** On the home network the resolver at 100.100.100.100 returns nothing for `brunhild.challenges.cloudflare.com` and refuses `static.cloudflareinsights.com`, so the Turnstile widget cannot complete and the form reports the anti-spam failure. The secret key is valid (siteverify only rejects the token). Test from a phone on cellular, or allow `challenges.cloudflare.com` and `static.cloudflareinsights.com` in the blocker. The form now says so itself when the token is missing. Then issue #14 can close.

## Done at cutover

- `www.keithhuster.com` redirects 301 to the apex with the path preserved (Bulk Redirect created by Keith; proxied placeholder `A 192.0.2.1` and `AAAA 100::` records added for `www`).
- Old site removed: the `keithhuster-sapper` and `keith-huster-portfolio-astro` Worker scripts, the `keithhuster.com/*` route, and the apex placeholder record. The remaining Workers in the account (`ghost-knl-*`, `knl-email-forwarder`) belong to the travel blog.
- LinkedIn Post Inspector shows the Open Graph card correctly. Issues #17 and #18 are closed.
- Web Analytics reports visits for keithhuster.com.

## Repository configuration (done)

- Rebase merge only, head branches auto-deleted, wiki/discussions/projects off, vulnerability alerts, secret scanning and push protection on.
- Ruleset `main`: PR required, linear history, required status check `ci`, no force push or deletion.
- Labels, milestones M0 to M5, issues #2 to #22, GitHub environment `production`, Project board https://github.com/users/husterk/projects/1 with Status (Todo / In progress / Blocked on Keith / Done).

## Things a future session should know

- `astro preview` backgrounds itself when it detects an AI agent; the Playwright config passes `--ignore-lock` to keep it in the foreground. Stop a stray one with `bunx astro preview stop`.
- `.dev.vars` must exist before `astro build` for the preview Worker to see the Turnstile test secret; CI copies `.dev.vars.example` into place. Locally run `bun run secrets:local` (needs the 1Password CLI) or copy the example.
- Worker secrets sync after `wrangler deploy`, because PR preview uploads leave a newer undeployed version and Cloudflare refuses secret edits in that state (error 10215).
- The Turnstile script loads only when the contact form nears the viewport; it was the only third-party request on first load.
