# keithhuster.com

Source of Keith Huster's portfolio site at [keithhuster.com](https://keithhuster.com): a static Astro 7 site with one Cloudflare Worker endpoint for the contact form, deployed to Cloudflare Workers from GitHub Actions.

|        |                                                                                                                                     |
| ------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| Status | [`docs/plan/STATUS.md`](docs/plan/STATUS.md): what is live, what is open, and what needs Keith                                      |
| Design | [`docs/design/`](docs/design/README.md): spec, copy, PDFs at three widths, a standalone preview, scene and character SVGs           |
| Plan   | [`docs/plan/`](docs/plan/README.md): the technology choices, CI/CD and secrets, contact form and milestones the site was built from |
| Setup  | [`docs/plan/MANUAL-SETUP.md`](docs/plan/MANUAL-SETUP.md): the accounts and secrets Keith configures by hand                         |
| Work   | the [issues](../../issues)                                                                                                          |

## Content

Every word on the site lives in `src/content/*.yaml`, validated by `src/content.config.ts` at build time. The résumé is `src/content/resume.yaml`: `/resume` renders it and the build prints that page to `Keith-Huster-Resume.pdf`. Dated announcements for the bar above the nav live in `src/content/announcements.yaml`.

## Development

Tool versions are pinned in `mise.toml`; `mise install` provides Bun and Node. Bun installs packages and runs scripts, and hands the Astro, Wrangler and Playwright CLIs to Node.

```sh
mise install
bun install --frozen-lockfile
bunx playwright install chromium   # the build prints the résumé PDF with it
cp .dev.vars.example .dev.vars     # or `bun run secrets:local` with the 1Password CLI
bun run dev                        # astro dev inside workerd
bun run check                      # wrangler types, astro check, prettier --check
bun run build && bun run preview
bun run test                       # Playwright at 1440 / 834 / 390
```

## Deploying

Every pull request runs CI: format and type checks, the build, Playwright and Lighthouse. Pull requests opened by a person also get a Worker preview URL behind Cloudflare Access; Renovate's pull requests skip the preview. Merging to `main` runs `deploy.yml`, which builds, loads the Cloudflare token from 1Password, runs `wrangler deploy` and then syncs the Worker secrets. No secrets live in this repository; see [SECURITY.md](SECURITY.md).

## License

Code: MIT. Content and illustrations: all rights reserved. See [LICENSE](LICENSE).
