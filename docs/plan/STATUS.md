# Status

Hand-off file between sessions. Rewritten at the end of every session; describes the current state only.

## Live

- https://keithhuster-com.husterk.workers.dev serves the full site: homepage, `/colophon`, `/api/contact`, `og.png`, `robots.txt`. No custom domain yet.
- Every merge to `main` deploys and syncs the Worker secrets from 1Password. Every PR gets a preview URL comment.

## Merged

- M0, M1, M2, M3 and the M4 launch prep (colophon, metadata, OG image, JSON-LD, robots.txt).
- Lighthouse in CI: median of three runs against 95/100/95/100. Playwright: 15 tests at 1440/834/390 including the rider-visible assertion, the phone menu, axe on three pages and the contact endpoint (405, 403, 400, honeypot, dry run, 429, no-JS HTML).

## Open

- Nothing in flight. Next PRs, in order: the résumé PDF, the custom-domain route at cutover, then M5 (parallax and rider bob, colophon numbers, first case study, Renovate's first grouped PR).

## Blocked on Keith

- **Résumé PDF.** Put the export at `public/Keith-Huster-Resume.pdf` on a branch (or hand it to me) so the hero and contact buttons stop pointing at a 404. Keep that filename stable.
- **One real contact message.** Open https://keithhuster-com.husterk.workers.dev/#contact in a real browser, send yourself a message, and confirm it arrives from `contact@keithhuster.com` with your address as reply-to. Turnstile rejects headless Chromium, so I could not do this myself; the endpoint answered every other case correctly in production. Then issue #14 can close.
- **Cutover, when you are ready.** Tell me where the old site is hosted and that I may replace the apex record. Then I will: add `routes: [{ pattern: "keithhuster.com", custom_domain: true }]` to `wrangler.jsonc` in a one-line PR (Cloudflare binds the apex and issues the certificate); hand you the exact Bulk Redirect values for `www.keithhuster.com` to `https://keithhuster.com` (301, preserve path); verify apex, www, the old anchors and the résumé PDF; confirm Web Analytics records a visit.
- **GitHub Project board.** The `gh` token still has scopes `gist, read:org, repo`. Creating the user-level Project needs `project`. Run this in a normal terminal tab and tell me when it finishes:

  ```
  gh auth refresh -h github.com -s workflow,project
  ```

## Repository configuration (done)

- Rebase merge only, head branches auto-deleted, wiki/discussions/projects off, vulnerability alerts, secret scanning and push protection on.
- Ruleset `main`: PR required, linear history, required status check `ci`, no force push or deletion.
- Labels, milestones M0 to M5, issues #2 to #22, GitHub environment `production`.

## Things a future session should know

- `astro preview` backgrounds itself when it detects an AI agent; the Playwright config passes `--ignore-lock` to keep it in the foreground. Stop a stray one with `bunx astro preview stop`.
- `.dev.vars` must exist before `astro build` for the preview Worker to see the Turnstile test secret; CI copies `.dev.vars.example` into place. Locally run `bun run secrets:local` (needs the 1Password CLI) or copy the example.
- Worker secrets sync after `wrangler deploy`, because PR preview uploads leave a newer undeployed version and Cloudflare refuses secret edits in that state (error 10215).
- The Turnstile script loads only when the contact form nears the viewport; it was the only third-party request on first load.
