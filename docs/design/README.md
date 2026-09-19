# keithhuster.com — design package

Final design for the new portfolio site ("The Divide · Big Sky Poster" with the "B4 · blend" copy), captured on 2026-09-18 from the Claude design canvas. Everything needed to rebuild the site for real lives in this folder.

## What's here

| Folder | Contents |
|---|---|
| `pdf/` | Full-page PDF captures at desktop 1440px, tablet 834px (iPad portrait) and phone 390px (iPhone). Each is a single tall page. |
| `png/` | The same three captures as PNG, handy for quick reference and diffing. |
| `preview/index.html` | A standalone, fluid, responsive HTML page of the final design (fonts from Google Fonts, no other dependencies). Open it in a browser and resize the window: this is the closest thing to a working v0 of the site and the intended starting point for the real build. |
| `DESIGN-SPEC.md` | Design tokens, typography, layout, breakpoints, scene mechanics, component inventory and responsive rules. |
| `COPY.md` | Every word on the page, section by section, with the résumé facts each claim comes from. |
| `BUILD-NOTES.md` | Recommended repo structure, build steps, things to wire up that the mockup only stubs, and known gotchas. |
| `assets/scenes/` | The six illustrated scenes as standalone SVG files (1440px wide), in route order from Banff to Antelope Wells. |
| `assets/character/` | The bikepacker character in each pose, plus the bike on its own. |
| `artboards/` | Source of the four final canvas artboards (`B4-Blend`, `R-Desktop`, `R-Tablet`, `R-Phone`) plus the canvas index. These are in the design tool's `.dc.html` format; the `{{accent}}` placeholder is the accent-color control and should be read as `#ff7a1a`. |
| *(not in this repo)* | The 15 earlier-round artboards and the Python/Node generator scripts that drew the scenes stay in Keith's local design archive. |

## Decision trail (short)

1. Three directions → **The Divide** (dark spruce, topographic, career as an elevation profile).
2. Illustrated variants → **Border to Border** (scene strips following the Tour Divide north to south, section colors shifting by biome, recurring bikepacker).
3. Alternatives → **Park Poster** (flat banded skies, taller scenes, clouds/birds/windmill).
4. Above-the-fold heroes → **Big Sky Poster** (headline top-left, paragraph beside it, 1.7× mountains and rider in the first view, stats on the ground).
5. Copy → **B1 Outcomes first**, then **B4 the blend** (B1's outcome headings and stats, B2's leadership paragraphs, B3's dates and exact figures). Hero headline: **"Reliable by design."**
6. Responsive build verified at 1440 / 834 / 390 with the bikepacker centered in every scene on phone.

## Facts and sources

All copy is drawn from `Keith Huster - Resume - 2026.pdf` and the old keithhuster.com (the "ten products commercialized" and hospital-bed product names). The phone number is intentionally omitted. LinkedIn was not used (blocked to automated readers).
