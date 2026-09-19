# Status

Hand-off file between sessions. Rewritten at the end of every session; describes the current state only.

## Merged

- Plan and design package, M0 completion report.
- M1: Astro 7 skeleton, Cloudflare adapter, mise-pinned Bun/Node, workflows. Live at https://keithhuster-com.husterk.workers.dev (no custom domain until M4).
- M2 content model: schemas and the six content files.

## Open

- M2 homepage PR: every section and scene ported from the design preview, mobile menu, Playwright at 1440/834/390 with the rider-visible assertion, axe, Lighthouse budget (100/100/100/100 locally). Matches `docs/design/png/` at all three widths.
- Worker secret sync (`wrangler secret bulk`): lands with M3 when the contact endpoint exists.

## Blocked on Keith

- **GitHub Project board.** The `gh` token still has scopes `gist, read:org, repo` (checked via the API after the re-auth). Creating the user-level Project needs the `project` scope. Run this in a normal terminal tab and tell me when it finishes:

  ```
  gh auth refresh -h github.com -s workflow,project
  ```

  I will verify with `gh api user -i | grep -i x-oauth-scopes` and then create the "keithhuster.com" Project with the Status field and add all issues.

## Repository configuration (done)

- Rebase merge only, head branches auto-deleted, wiki/discussions/projects off, vulnerability alerts, secret scanning and push protection on.
- Ruleset `main`: PR required, linear history, required status check `ci`, no force push or deletion.
- Labels, milestones M0 to M5, issues #2 to #22 (M0 issues closed), GitHub environment `production`.
