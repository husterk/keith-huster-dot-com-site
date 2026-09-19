# Status

Hand-off file between sessions. Rewritten at the end of every session; describes the current state only.

## Merged

- Plan and design package, M0 completion report.
- M1: Astro 7 skeleton, Cloudflare adapter, mise-pinned Bun/Node, workflows. Live at https://keithhuster-com.husterk.workers.dev (no custom domain until M4).
- M2 content model: schemas and the six content files.
- M2 homepage: every section and scene, mobile menu, Playwright at 1440/834/390 with the rider-visible assertion, axe, Lighthouse budget.
- M3 contact form: `/api/contact` with Turnstile, honeypot, rate limit and Resend; Worker secrets synced from 1Password on deploy.

## Open

- M4 launch prep PR: colophon at `/colophon`, Open Graph and Twitter metadata, `public/og.png` (regenerate with `bun run og`), JSON-LD Person, `robots.txt`, nav links that work from any page. The custom-domain route is a separate one-line PR at cutover time.

## Blocked on Keith

- **Résumé PDF.** Put the export at `public/Keith-Huster-Resume.pdf` on a branch (or send it to me) so the hero and contact buttons stop pointing at a 404. Keep that filename stable.
- **One real contact message.** Open https://keithhuster-com.husterk.workers.dev/#contact on your phone, send yourself a message, and confirm it arrives from `contact@keithhuster.com` with your address as reply-to. Turnstile's managed challenge is the reason I cannot do this from a headless browser.
- **Cutover (when you are ready).** Tell me where the old site is hosted and that I may replace the apex record. Then I will: (1) add `routes: [{ pattern: "keithhuster.com", custom_domain: true }]` to `wrangler.jsonc` in a one-line PR, which binds the apex and issues the certificate; (2) hand you the exact Bulk Redirect values for `www.keithhuster.com` to `https://keithhuster.com` (301, preserve path); (3) verify apex, www, the old anchors and the résumé PDF; (4) confirm Web Analytics records a visit.

- **GitHub Project board.** The `gh` token still has scopes `gist, read:org, repo` (checked via the API after the re-auth). Creating the user-level Project needs the `project` scope. Run this in a normal terminal tab and tell me when it finishes:

  ```
  gh auth refresh -h github.com -s workflow,project
  ```

  I will verify with `gh api user -i | grep -i x-oauth-scopes` and then create the "keithhuster.com" Project with the Status field and add all issues.

## Repository configuration (done)

- Rebase merge only, head branches auto-deleted, wiki/discussions/projects off, vulnerability alerts, secret scanning and push protection on.
- Ruleset `main`: PR required, linear history, required status check `ci`, no force push or deletion.
- Labels, milestones M0 to M5, issues #2 to #22 (M0 issues closed), GitHub environment `production`.
