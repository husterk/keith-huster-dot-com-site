# Status

Hand-off file between sessions. Rewritten at the end of every session; describes the current state only.

## Live

- https://keithhuster.com serves the new site (cut over 2026-09-19): homepage, `/colophon`, `/api/contact`, `og.png`, `robots.txt`, `Keith-Huster-Resume.pdf`. The old `keithhuster-sapper` Worker's route and the placeholder apex A record were removed; the old Worker script itself is still in the account and can be deleted after a month.
- https://keithhuster-com.husterk.workers.dev still works as a preview host.
- Every merge to `main` deploys and syncs the Worker secrets from 1Password. Every PR gets a preview URL comment.

## Merged

- M0 through M5: everything in docs/plan/06-milestones.md except the first case-study page (#21), parked at Keith's request. M5 added the rider bob and, replacing the first parallax, a rider that travels the ground path as each strip scrolls (#44), both behind prefers-reduced-motion, the colophon's measured numbers, and confirmed Renovate's upkeep loop (lock-file PR #39 went through CI and merged on its own; Renovate ignores docs/).
- Lighthouse in CI: median of three runs against 95/100/95/100. Playwright: 15 tests at 1440/834/390 including the rider-visible assertion, the phone menu, axe on three pages and the contact endpoint (405, 403, 400, honeypot, dry run, 429, no-JS HTML).

## Open

- Nothing in flight. A root CLAUDE.md now requires a GitHub issue before any work (#45). The only open work item is #21 (first case-study page); the pages collection and the [slug] route are ready for it. Renovate's weekly grouped PR lands Monday before 6am Denver time; patch updates of dev tooling automerge, everything else waits for a merge.

## Blocked on Keith

- Nothing. M0 through M4 are complete and verified.

## Done at cutover

- `www.keithhuster.com` redirects 301 to the apex with the path preserved (Bulk Redirect created by Keith; proxied placeholder `A 192.0.2.1` and `AAAA 100::` records added for `www`).
- Old site removed: the `keithhuster-sapper` and `keith-huster-portfolio-astro` Worker scripts, the `keithhuster.com/*` route, and the apex placeholder record. The remaining Workers in the account (`ghost-knl-*`, `knl-email-forwarder`) belong to the travel blog.
- LinkedIn Post Inspector shows the Open Graph card correctly. Issues #17 and #18 are closed.
- Web Analytics reports visits for keithhuster.com.
- Contact form verified end to end from a real browser: Turnstile passed, Resend delivered, the email arrived from contact@keithhuster.com. Note for home-network testing: NextDNS must allow `*.cloudflare.com` and `*.cloudflareinsights.com`.

## Repository configuration (done)

- Rebase merge only, head branches auto-deleted, wiki/discussions/projects off, vulnerability alerts, secret scanning and push protection on.
- Ruleset `main`: PR required, linear history, required status check `ci`, no force push or deletion.
- Labels, milestones M0 to M5, issues #2 to #22, GitHub environment `production`, Project board https://github.com/users/husterk/projects/1 with Status (Todo / In progress / Blocked on Keith / Done).

## Things a future session should know

- `astro preview` backgrounds itself when it detects an AI agent; the Playwright config passes `--ignore-lock` to keep it in the foreground. Stop a stray one with `bunx astro preview stop`.
- `.dev.vars` must exist before `astro build` for the preview Worker to see the Turnstile test secret; CI copies `.dev.vars.example` into place. Locally run `bun run secrets:local` (needs the 1Password CLI) or copy the example.
- Worker secrets sync after `wrangler deploy`, because PR preview uploads leave a newer undeployed version and Cloudflare refuses secret edits in that state (error 10215).
- The Turnstile script loads only when the contact form nears the viewport; it was the only third-party request on first load.
