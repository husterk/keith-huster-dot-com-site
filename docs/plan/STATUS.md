# Status

Hand-off file between sessions. Rewritten at the end of every session; describes the current state only.

## Live

- https://keithhuster.com serves the new site (cut over 2026-09-19): homepage, `/colophon`, `/api/contact`, `og.png`, `robots.txt`, `Keith-Huster-Resume.pdf`. The old `keithhuster-sapper` Worker's route and the placeholder apex A record were removed; the old Worker script itself is still in the account and can be deleted after a month.
- https://keithhuster-com.husterk.workers.dev still works as a preview host.
- Every merge to `main` deploys and syncs the Worker secrets from 1Password. Every PR gets a preview URL comment.

## Merged

- M0 through M5: everything in docs/plan/06-milestones.md except the first case-study page (#21), parked at Keith's request. M5 added the rider bob and, replacing the first parallax, a rider that travels the ground path as each strip scrolls, pedaling as it goes, with the hero rider crossing from the left until it leaves the view (#44, #49), both behind prefers-reduced-motion, the colophon's measured numbers, and confirmed Renovate's upkeep loop (lock-file PR #39 went through CI and merged on its own; Renovate ignores docs/).
- Lighthouse in CI: median of three runs against 95/100/95/100. Playwright: 21 tests at 1440/834/390 including the rider-visible assertion, the phone menu, axe on three pages, the contact endpoint (405, 403, 400, honeypot, dry run, 429, no-JS HTML), rider motion under both motion preferences, and the eased hash scroll.

## Open

- Nothing in flight. Fixes merged 2026-09-20: the scene scale is a CSS clamp on the viewport (no resize script), so every strip fills any width up to the 1920px cap; the Turnstile slot is clipped to zero height until the widget turns interactive, so it never overlaps the textarea; the hero keeps two columns down to 1150px with proportional tracks and a scaled headline, and goes single-column from 1100px to 1149px. Keith owns #100, a review of every content file. The career elevation chart was rebuilt 2026-09-20: src/content/chart.yaml is now one row per position (org, title, team, start, end) and ElevationChart.astro derives the waypoints from the dates, generates the profile, lays out sky labels in tiers that never collide at 1100px and up, and shows a numbered profile with a legend below that width, so the chart is no longer hidden on phones. Polish merged 2026-09-19 after the improvements batch: riders no longer flash on load (the hero pose is baked, strip riders stay hidden until placed), the contact form sits in a right column with an intro line and an interaction-only Turnstile, and a hashed URL glides from the top onto its section with ease-in-out instead of jumping (the head script in src/layouts/Base.astro strips the hash before the browser can act on it; same-page links and back/forward use the same glide). Site improvements batch merged 2026-09-19: sticky nav with a home link, scenes that fill wide screens, responsive elevation chart with company/position labels, footer cleanup, external links in new tabs, a 404 page with the rider at a fork, the résumé button opening in a new tab, and the colophon rebuilt around a projected Tour Divide route map with content in src/content/colophon.yaml (wide-screen rail, separated decisions, a theme note). Company and product names in body copy link to their sites through the lookup in src/lib/links.ts. The only open work item is #21 (first case-study page); the pages collection and the [slug] route are ready for it. Renovate's weekly grouped PR lands Monday before 6am Denver time; patch updates of dev tooling automerge, everything else waits for a merge.

## Blocked on Keith

- Nothing. M0 through M5 are complete and verified.

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

- Pages build as files (`colophon.html`, `404.html`) so `/colophon` serves without a trailing-slash redirect; canonical URLs strip the extension. Lighthouse CI pins Lighthouse 12 through @lhci/cli; spot-check new audits with `bunx lighthouse@13 <url> --preset=desktop`. Lighthouse cannot score a real 404 response, so audit the 404 page at `/404`, which serves it with status 200.
- `astro preview` backgrounds itself when it detects an AI agent; the Playwright config passes `--ignore-lock` to keep it in the foreground. Stop a stray one with `bunx astro preview stop`.
- `.dev.vars` must exist before `astro build` for the preview Worker to see the Turnstile test secret; CI copies `.dev.vars.example` into place. Locally run `bun run secrets:local` (needs the 1Password CLI) or copy the example.
- Worker secrets sync after `wrangler deploy`, because PR preview uploads leave a newer undeployed version and Cloudflare refuses secret edits in that state (error 10215).
- The Turnstile script loads only when the contact form nears the viewport; it was the only third-party request on first load. The widget renders in execute mode and runs its challenge only when the visitor submits, so every token issued is followed by a siteverify call (the dashboard warned when tokens outnumbered verifications). It shows its error code with a Retry button when it fails. The widget's allowed hostnames are keithhuster.com, husterk.workers.dev (covers PR previews) and localhost.
- Returning visitors of the old Sapper site kept its service worker, whose CSP blocked Turnstile and analytics. `public/service-worker.js` is a kill switch served with no-cache headers, and every page unregisters any worker on load. Keep that file until the old registrations have had months to die; do not add a service worker of our own without replacing it deliberately.
