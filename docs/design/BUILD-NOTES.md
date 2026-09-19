# Build notes — turning the design into the real keithhuster.com

## Starting point

`preview/index.html` is a complete, fluid, dependency-free page (HTML + one `<style>` block + inline SVG; fonts from Google Fonts). It already responds correctly at 1440 / 834 / 390 using container queries. The fastest path to a real site is to split that file into a template, a stylesheet and the SVG partials rather than rebuilding from the spec.

## Suggested repository layout

```
keith-huster-portfolio-site/
├── design-files/            ← this package (keep for reference)
├── src/
│   ├── index.html           ← or an Astro/Eleventy template; sections as partials
│   ├── styles/
│   │   ├── tokens.css       ← §1 of DESIGN-SPEC.md as custom properties
│   │   ├── base.css         ← type, buttons, nav
│   │   ├── sections.css     ← hero, route, segments, crew, patents, off, contact
│   │   └── responsive.css   ← the two breakpoints
│   ├── scenes/              ← the six SVGs from assets/scenes (inline them at build time)
│   ├── character/           ← assets/character
│   └── scripts/
│       ├── menu.js          ← mobile menu
│       └── parallax.js      ← optional scene motion
├── public/
│   └── Keith-Huster-Resume.pdf
└── README.md
```

A static-site generator is optional; the page is a single HTML document. If one is used, Astro or Eleventy keep the output static and let the scenes be partials. No client-side framework is needed.

## Things the mockup only stubs

1. **Mobile menu.** The phone nav shows a `Menu` button; wire it to a full-screen overlay listing the five anchors and Get in touch. Use a real `<button aria-expanded>` and trap focus while open.
2. **Résumé download.** Both "Download résumé" (hero) and the contact block should link to the PDF in `public/`. Keep the filename stable so it can be linked from LinkedIn.
3. **Container queries → media queries.** The mockup queries the page container; on the real site plain `@media (max-width: 1099px)` and `(max-width: 699px)` are simpler and equivalent.
4. **Scene captions** (`.lbl`) are hidden below 1100px in the mockup; keep that.
5. **Scene scaling.** Either keep the `transform: scale(var(--k))` + focus-point technique from the mockup, or give each scene a `viewBox="0 0 1440 H"` with `preserveAspectRatio="xMidYMax slice"` and set `--cx` via `viewBox` offsets. The transform approach is already tuned and verified; the viewBox approach is cleaner CSS.
6. **Motion.** See DESIGN-SPEC §7. Everything must respect `prefers-reduced-motion`.
7. **Metadata.** `<title>Keith Huster · Reliable by design</title>`, a meta description drawn from the hero paragraph, Open Graph image (a crop of the hero scene at 1200×630 works well), favicon from the three-peak mark in the nav.
8. **Fonts.** Self-host Barlow, Barlow Condensed and Spline Sans Mono (e.g. `@fontsource/*` packages, which the preview renderer used) to avoid the Google Fonts request and layout shift; preload the Condensed 700 face used by the H1.
9. **Analytics / contact.** The contact block is mailto + LinkedIn + GitHub by design; a form is not needed.
10. **Old site.** keithhuster.com currently hosts the 2015-era portfolio; plan a 301-safe cutover (same root URL, drop the old anchors `#skills`, `#portfolio`, `#resume` or map them to the new ones).

## Verification checklist (what was checked on the mockup, to repeat on the build)

- Page renders at 1440, 834 and 390 without horizontal scroll.
- The bikepacker is fully visible in every scene at every width (measured programmatically in the mockup; see `generators/measure.js`).
- Nav fits on one line at each width; buttons have ≥44px hit height.
- Text/background contrast ≥ 4.5:1 (all pairs in the palette pass).
- Section backgrounds match the adjoining scene's sky (above) and ground (below) exactly, so no seams show.
- Board heights: on the design canvas every artboard's root height had to equal its frame; on the web this does not apply.

## Regenerating the artboards (only if the design canvas is revisited)

`generators/gen7.py` builds the three responsive artboards from the scene functions in `gen.py`/`gen3.py`/`gen4.py`; it expects the `project/` folder of `.dc.html` files beside it (copy `artboards/final` and `artboards/earlier-rounds` into a `project/` folder). `shot3.js` renders local previews with `fonts.css` (paths point at `node_modules/@fontsource/...`; `npm i @fontsource/barlow @fontsource/barlow-condensed @fontsource/spline-sans-mono playwright`), `measure.js` reports rider positions, and `pdf.js` exports the PDFs and PNGs.
