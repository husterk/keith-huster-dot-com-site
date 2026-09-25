import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import { parse } from 'yaml';

const pdfPath = new URL('../dist/client/Keith-Huster-Resume.pdf', import.meta.url);
const MAX_BYTES = 150 * 1024;

const load = async () => {
  const bytes = await readFile(pdfPath);
  const doc = await getDocument({ data: new Uint8Array(bytes), verbosity: 0 }).promise;
  const pages = [];
  for (let n = 1; n <= doc.numPages; n += 1) {
    const page = await doc.getPage(n);
    const content = await page.getTextContent();
    pages.push({
      text: content.items.map((item) => ('str' in item ? item.str : '')).join(' '),
      links: (await page.getAnnotations()).map((a) => a.url as string | undefined).filter(Boolean),
    });
  }
  return { bytes, doc, pages, text: pages.map((p) => p.text).join(' ') };
};

test.describe('generated résumé PDF', () => {
  test('is two tagged pages under the size budget', async () => {
    const { bytes, doc } = await load();
    expect(doc.numPages).toBe(2);
    expect(bytes.length).toBeLessThan(MAX_BYTES);
    const markInfo: unknown = await doc.getMarkInfo();
    const marked =
      markInfo instanceof Map ? markInfo.get('Marked') : (markInfo as { Marked?: boolean })?.Marked;
    expect(marked).toBe(true);
  });

  test('carries the name, the current position and working profile links', async () => {
    const { text, pages } = await load();
    const site = parse(
      await readFile(new URL('../src/content/site.yaml', import.meta.url), 'utf8'),
    )[0];
    const resume = parse(
      await readFile(new URL('../src/content/resume.yaml', import.meta.url), 'utf8'),
    )[0];
    const current = resume.positions[0];
    const squash = (s: string) => s.replace(/\s+/g, '');
    for (const expected of [site.name.toUpperCase(), current.title, current.org, current.team]) {
      expect(squash(text)).toContain(squash(expected));
    }
    expect(pages[0].links).toEqual(
      expect.arrayContaining([
        `mailto:${site.links.email}`,
        site.links.linkedin,
        site.links.github,
      ]),
    );
  });

  test('contains no phone number', async () => {
    const { text } = await load();
    expect(text).not.toMatch(/\(?\d{3}\)?[\s.-]*\d{3}[\s.-]+\d{4}/);
  });
});
