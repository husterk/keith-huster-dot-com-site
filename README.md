# keithhuster.com

Source of Keith Huster's portfolio site: a static Astro 7 site with one Cloudflare Worker endpoint, content in YAML/Markdown, deployed to Cloudflare Workers from GitHub Actions.

**Status:** M1 (skeleton that deploys). See [`docs/plan/STATUS.md`](docs/plan/STATUS.md) for what is merged, open and blocked, and the [issues](../../issues) for the work items.

|              |                                                                                                                                         |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------- |
| Design       | [`docs/design/`](docs/design/README.md): spec, copy, PDFs at three widths, a standalone preview, scene and character SVGs               |
| Plan         | [`docs/plan/`](docs/plan/README.md): technology choices, repo structure, CI/CD and secrets, contact form, colophon, milestones, samples |
| Manual setup | [`docs/plan/MANUAL-SETUP.md`](docs/plan/MANUAL-SETUP.md): the accounts and secrets Keith configures by hand                             |

## Development

Tool versions are pinned in `mise.toml`; `mise install` provides Bun and Node. Bun installs packages and runs scripts, and hands the Astro, Wrangler and Playwright CLIs to Node.

```sh
mise install
bun install
bun run dev                    # astro dev inside workerd
bun run build && bun run preview
bun run check                  # astro check + prettier --check
bun run test                   # Playwright at 1440 / 834 / 390
```

Content lives in `src/content/` (from M2); see `docs/plan/02-repo-structure.md` for the content model.

## Deploying

Every pull request gets a CI run and a Worker preview URL. Merging to `main` runs `deploy.yml`, which builds, loads the Cloudflare token from 1Password and runs `wrangler deploy`. No secrets live in this repository; see `docs/plan/03-ci-cd-and-secrets.md`.

## License

Code: MIT. Content and illustrations: all rights reserved. See [LICENSE](LICENSE).
