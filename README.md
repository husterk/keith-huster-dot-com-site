# keithhuster.com

Source of Keith Huster's portfolio site: a static Astro 7 site with one Cloudflare Worker endpoint, content in YAML/Markdown, deployed to Cloudflare Workers from GitHub Actions.

**Status:** planning complete, implementation in progress. Track the work on the [project board](https://github.com/users/husterk/projects) and in [issues](../../issues).

| | |
|---|---|
| Design | [`docs/design/`](docs/design/README.md): spec, copy, PDFs at three widths, a standalone preview, scene and character SVGs |
| Plan | [`docs/plan/`](docs/plan/README.md): technology choices, repo structure, CI/CD and secrets, contact form, colophon, milestones, starter samples |
| Manual setup | [`docs/plan/MANUAL-SETUP.md`](docs/plan/MANUAL-SETUP.md): the accounts and secrets Keith configures by hand |

## Development (once the skeleton lands)

```sh
bun install
bun run dev        # astro dev inside workerd
bun run build && bun run preview
bun run test       # Playwright at 1440 / 834 / 390
```

Content lives in `src/content/`; see `docs/plan/02-repo-structure.md` for the content model.

## License

Code: MIT. Content and illustrations: all rights reserved. See [LICENSE](LICENSE).
