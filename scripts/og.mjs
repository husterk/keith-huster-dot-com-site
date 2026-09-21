import { chromium } from '@playwright/test';
import { readFile, writeFile } from 'node:fs/promises';
import { parse } from 'yaml';
import { fileURLToPath } from 'node:url';

const root = new URL('../', import.meta.url);
const hero = await readFile(new URL('src/components/scenes/HeroBanff.astro', root), 'utf8');
const site = parse(await readFile(new URL('src/content/site.yaml', root), 'utf8'))[0];
const accentAt = site.headline.accent.lastIndexOf(' ');
const accentLead = site.headline.accent.slice(0, accentAt);
const accentWord = site.headline.accent.slice(accentAt + 1);
const tag = site.rolesShort.replace(/ · Remote.*$/, '');
const svg = hero.slice(hero.indexOf('<svg'), hero.lastIndexOf('</svg>') + 6);
const font = (file) =>
  readFile(new URL(`node_modules/@fontsource/barlow-condensed/files/${file}`, root)).then((b) =>
    b.toString('base64'),
  );
const condensed = await font('barlow-condensed-latin-700-normal.woff2');

const html = `<!doctype html><html><head><style>
@font-face{font-family:'Barlow Condensed';font-weight:700;src:url(data:font/woff2;base64,${condensed}) format('woff2')}
html,body{margin:0;width:1200px;height:630px;overflow:hidden;background:#0e1814;--accent:#ff7a1a}
.scene{position:absolute;left:-120px;bottom:-330px;width:1440px;height:1180px}
h1{position:absolute;left:72px;top:64px;margin:0;font:700 128px/0.9 'Barlow Condensed',sans-serif;text-transform:uppercase;letter-spacing:-0.01em;color:#ebe6d8}
h1 span{color:#ff7a1a}
.tag{position:absolute;left:72px;top:330px;margin:0;font:600 26px/1 'Barlow Condensed',sans-serif;text-transform:uppercase;letter-spacing:.06em;color:#ebe6d8}
.tag span{color:#9db0a3}
</style></head><body>
${svg.replace('class="scene"', 'class="scene"')}
<h1>${site.headline.lead}<br>${accentLead} <span>${accentWord}</span></h1>
<p class="tag">${site.name} <span>· ${tag} · ${site.location.split(' ')[0]}</span></p>
</body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.setContent(html);
await page.evaluate(() => document.fonts.ready);
const png = await page.screenshot({ type: 'png' });
await browser.close();
const out = fileURLToPath(new URL('public/og.png', root));
await writeFile(out, png);
console.log(`wrote ${out} (${png.length} bytes)`);
