# Design specification — keithhuster.com

Reference implementation: `preview/index.html` (all values below are taken from its stylesheet). Pixel references are at the 1440px desktop layout unless noted.

## 1. Tokens

### Colors

| Token | Value | Use |
|---|---|---|
| `--accent` | `#ff7a1a` | Headline accent word, primary buttons, eyebrows, result numbers, the character's bags/helmet, tent, flag, section rules. Alternates tested on the canvas: `#e8c547`, `#9fd35a`, `#5cc8d6`. |
| bone (text) | `#ebe6d8` | Primary text, character line-work, snow caps. |
| text-soft | `#d3d0c2` | Lead paragraphs. |
| text-body | `#c4c5b6` | Body copy. |
| `--mute` | `#9db0a3` | Captions, labels, stat descriptions. |
| `--line` / `--line2` / `--line3` | `rgba(235,230,216,.14 / .24 / .38)` | Hairlines, stronger rules, button outlines. |
| `--panel` | `rgba(235,230,216,.05)` | Tinted panel background (Tour Divide card). |
| bg · nav, hero, experience | `#0e1814` | Spruce. |
| bg · impact | `#0b1b22` | Lake teal. |
| bg · leadership | `#1e1a11` | Basin tan. |
| bg · patents | `#12152a` | Alpine indigo. |
| bg · beyond work | `#27150e` | Desert rust. |
| bg · contact | `#1b0f0b` | Border brown. |
| dark-on-accent | `#0e1814` | Text on orange buttons. |

Section backgrounds progress north → south with the route; each scene strip's sky is the section above it and its ground is the section below it, so the transitions are seamless.

Contrast: all text/background pairs above meet WCAG AA (bone on the darkest backgrounds ≈ 14:1; `--mute` on `#0e1814` ≈ 7:1; `#0e1814` on `#ff7a1a` ≈ 8:1).

### Typography (Google Fonts)

```
https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700&family=Barlow:wght@400;500;600&family=Spline+Sans+Mono:wght@400;500&display=swap
```

| Role | Face | Size / weight / tracking |
|---|---|---|
| Hero H1 | Barlow Condensed 700, uppercase | 148px, line-height .9, tracking −0.01em (tablet 112, phone 76) |
| Section H2 | Barlow Condensed 700, uppercase | 72px, lh .95 (tablet 56, phone 44); patents H2 60px; contact H2 112px (80 / 52) |
| Card / row titles | Barlow Condensed 600, uppercase | 34px rows, 28px cards, 32px boxes, 52px Tour Divide panel |
| Big numbers | Barlow Condensed 600 | stats 56px, leadership cells 64px, result numbers 44px; the "36" is 700 at 300px (200 / 150) |
| Hero paragraph | Barlow 400 | 20px / 1.5 |
| Lead | Barlow 400 | 19px / 1.6 |
| Body | Barlow 400 | 17px / 1.55 (phone 16) |
| Captions | Barlow 400 | 15px / 1.4 |
| Eyebrows, nav, buttons, labels | Spline Sans Mono 400/500, uppercase | 13px, tracking .1em (buttons 14px / .06em; chips 13px) |
| Brand | Barlow Condensed 700, uppercase | 24px, tracking .08em |

Use `text-wrap: pretty` on paragraphs and `text-wrap: balance` on multi-line headings.

### Spacing

| Token | Desktop | Tablet (≤1099) | Phone (≤699) |
|---|---|---|---|
| Page gutter `--pad` | 80px | 48px | 20px |
| Section padding (vertical) | 104px | 80px | 64px |
| Hero padding | 96px top / 88px bottom | 72 / 64 | 48 / 48 |
| Section heading gap (eyebrow → H2) | 14px | | |
| Grid gaps | 32px cards, 40px rows, 96px two-column sections | | |

Buttons: 18px × 28px padding (ghost 17px to allow for the 1px border), min 44px tall everywhere. Nav links have 14px vertical padding for the same reason.

## 2. Page structure

```
nav              logo + Experience · Impact · Leadership · Patents · Beyond work · [Get in touch]
hero             eyebrow, H1 "Reliable by design.", paragraph, 2 buttons; banded dawn sky + Banff scene; 4 stats on the ground
#route           01 · Experience — H2, intro, elevation-profile chart (1280×360), 4 timeline cards
strip            lake-montana
#segments        02 · Impact — H2, 5 result rows (number · title · body · result), tech chips
strip            basin-wyoming (sun, mesas, windmill)
#crew            03 · Leadership — H2, two lead paragraphs | 2×2 stat cells
strip            pass-colorado (night, Indiana Pass flag, camp)
#patents         04 · Patents — big "36" | H2, paragraph, degrees
strip            desert-new-mexico
#offclock        05 · Beyond work — H2; Tour Divide panel (with mini elevation profile) | 3 boxes
#contact         "Let's talk" eyebrow, H2, email / LinkedIn / GitHub buttons, footer line; finish-antelope-wells scene
```

Nav anchors: `#route`, `#segments`, `#crew`, `#patents`, `#offclock`, `#contact`.

## 3. Hero

- Text block is a two-column grid `720px 1fr`, `align-items: end`: eyebrow + H1 on the left, paragraph (max-width 560) + buttons on the right. Below 1100px it becomes one column.
- The scene SVG (`assets/scenes/hero-banff.svg`, 1440×1180) is absolutely positioned, anchored to the bottom of the hero, behind the content. Its bottom 210px is flat ground in the hero background color; the stats grid sits on that ground.
- A `.spacer` (500px desktop / 420 tablet / 340 phone) holds the scene open between the text and the stats.
- Bands in the hero sky: `#27383f` from y=590, `#6b4f4c` from 660, `#d98a5a` from 720 (SVG coordinates), i.e. a dawn glow just above the far ridge.
- On tablet the scene is scaled 0.75 and lifted 70px; on phone scaled 0.55, lifted 150px and focused on the rider (see §5).

## 4. Scenes

Six flat-color illustrated strips, all 1440px wide, drawn in SVG (no raster). Sky = the section above, ground = the section below.

| File | Between | Height | Sky bands (top → horizon) | Content |
|---|---|---|---|---|
| `hero-banff.svg` | (hero) | 1180 | `#27383f #6b4f4c #d98a5a` | Snow peaks, two ridges, pines, rider on the ridgeline, clouds, birds |
| `lake-montana.svg` | Experience → Impact | 380 | `#10262d #16404c #2a6a7a #6fa8a4` | Lake, reflected ridges, shore, rider on the shore slope |
| `basin-wyoming.svg` | Impact → Leadership | 370 | `#1a2a2c #4a3c2c #a8672f #e39a4a` | Big sun, mesas, sage, windmill, rider |
| `pass-colorado.svg` | Leadership → Patents | 420 | `#1a1a24 #1b1f40 #262b58 #343a70` | Night, moon, stars, Indiana Pass summit flag (11,910 ft), rider climbing, tent + campfire + seated figure + bike |
| `desert-new-mexico.svg` | Patents → Beyond work | 360 | `#251a30 #5a2a30 #b5512a #e8843a` | Setting sun, mesas, yucca, rider |
| `finish-antelope-wells.svg` | (bottom of Contact) | 400 | `#2a1410 #4a1e14 #7a2e18 #a8431e` | Border monument, bike, character with arms up, mesas |

Bands sit at 16 / 40 / 60 / 76 % of the strip height. Clouds are bone at 13% opacity; birds are bone strokes at 75%.

Small mono captions inside the scenes ("MILE 0 · BANFF, ALBERTA", "MONTANA", "WYOMING · GREAT DIVIDE BASIN", "COLORADO", "INDIANA PASS · 11,910 FT · HIGH POINT", "NEW MEXICO", "MILE 2,745 · ANTELOPE WELLS, NEW MEXICO") are shown on desktop only (`.lbl` is hidden below 1100px).

### The character

`assets/character/` holds the bikepacker in four poses. Line-work is bone at 5px (rider) / 2.4px (bike) with round caps; the frame bag, seat pack, bar roll and helmet are the accent color. Rider group origin is bottom-center between the wheels (`translate(-48,-69)` in the generator), so it can be placed on any ground line and rotated to the slope.

Positions (scene x, 1440 space) — used as phone focus points: hero 850 · lake 300 · basin 860 · pass 610 (camp at 1090–1300) · New Mexico 1000 · finish 1080.

## 5. Responsive rules

The mockup uses container queries on the page root; in the real site use ordinary media queries at the same widths.

| | Desktop ≥1100 | Tablet 700–1099 | Phone ≤699 |
|---|---|---|---|
| Scene scale `--k` | 1 | 0.58 (1440 × 0.58 ≈ 834, full width, no crop) | 0.7, cropped |
| Scene focus `--cx` | 720 | 720 | per scene = rider x (850 / 330 / 860 / 640 / 1000 / 1080) |
| Strip height | native | native × 0.58 | native × 0.7 |
| Hero scene | scale 1, bottom 0 | scale 0.75, bottom 70px | scale 0.55, bottom 150px, focus 850 |
| Nav | full links | compact links (11px, 12px gaps) | logo + **Menu** + Get in touch (menu to be built) |
| Hero eyebrow | full | full | short variant "Senior / Staff Engineer · Eng. Manager · Remote" |
| Stats | 4 columns | 2 × 2 | 2 × 2 (38px numbers) |
| Elevation chart | 1280 wide | scaled 0.575 | hidden (timeline cards carry the content) |
| Timeline cards | 4 | 2 | 1 |
| Result rows | `90px 1fr 1.3fr 240px` | number / title / body / result stacked in 2 columns | single column |
| Leadership | 2 columns | 1 column, stat cells stay 2×2 | same, 20px cells |
| Patents | `420px 1fr`, "36" at 300px | 1 column, 200px | 1 column, 150px |
| Beyond work | `1.4fr 1fr` | 1 column; 3 boxes in a row | 1 column; boxes stacked |
| Contact H2 | 112px | 80px | 52px |

Scene placement formula (from the mockup): the strip is `position: relative; overflow: hidden; height: calc(var(--h) * var(--k))`; the SVG is `position: absolute; bottom: 0; left: calc(50% - var(--cx) * var(--k)); transform: scale(var(--k)); transform-origin: 0 100%`. Setting `--cx` to the rider's x keeps the character centered at any width. An equivalent with `viewBox` + `preserveAspectRatio="xMidYMax slice"` is fine for the production build; the transform approach was used only because the design tool disallows `viewBox`.

## 6. Components

- **Button primary**: accent background, dark text, mono uppercase. **Button ghost**: 1px `--line3` border, hero-background fill, same type.
- **Stat**: number (Barlow Condensed 600) over a `--mute` caption; hairline left border between columns, hairline top border on the group.
- **Timeline card**: hairline top border (accent on the current role), mono date/place caption, condensed title, body.
- **Result row**: mono index (`SEG 01`…), condensed title, body, right-aligned accent number + caption; hairline separators.
- **Chip**: mono 13px inside a 1px `--line2` border, 8×14 padding.
- **Stat cell (leadership)**: 2×2 grid drawn with hairlines on all sides, 64px number.
- **Tour Divide panel**: `--panel` fill, 1px `--line2` border, 40px padding, mono caption, 52px title, body, mini elevation polyline (accent), mile labels.
- **Box**: 1px `--line2` border, 32px padding, mono caption, 32px title, body.
- **Elevation chart**: 1280×360 SVG, accent polyline with a `rgba(235,230,216,.05)` fill beneath, hairline horizontal grid, waypoint circles (hero-bg fill, accent stroke), condensed labels, mono year axis.

## 7. Motion (recommended, not in the mockup)

- Scenes: gentle parallax on scroll — far ridge 0.9×, near ridge 1.0×, character 1.05× — using `transform: translate3d` driven by an IntersectionObserver-scoped scroll listener; disable under `prefers-reduced-motion`.
- Rider: a subtle 1–2px bob (CSS keyframes, 1.6s) and, optionally, a slow horizontal drift while a strip is in view.
- Hero: one orchestrated reveal on load (headline, then paragraph and buttons, then the scene rising 24px into place).
- Nothing else should animate; the page reads as a poster.
