import { chromium } from '@playwright/test';
import { readFile, writeFile } from 'node:fs/promises';
import { extname } from 'node:path';

const dist = new URL('../dist/client/', import.meta.url);
const origin = 'http://resume.build';
const types = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.png': 'image/png',
};

const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  await page.route(`${origin}/**`, async (route) => {
    let path = new URL(route.request().url()).pathname.slice(1);
    if (!extname(path)) path += '.html';
    try {
      const body = await readFile(new URL(path, dist));
      await route.fulfill({
        body,
        contentType: types[extname(path)] ?? 'application/octet-stream',
      });
    } catch {
      await route.fulfill({ status: 404 });
    }
  });
  await page.goto(`${origin}/resume`, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  const pdf = await page.pdf({
    format: 'Letter',
    preferCSSPageSize: true,
    printBackground: true,
    tagged: true,
    outline: true,
  });
  await writeFile(new URL('Keith-Huster-Resume.pdf', dist), pdf);
  console.log(`résumé PDF: ${pdf.length} bytes`);
} finally {
  await browser.close();
}
