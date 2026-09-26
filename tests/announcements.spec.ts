import { test, expect, type Page } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { parse } from 'yaml';
import { barHtml, midnight, schedule, windowsJson, type Scheduled } from '../src/lib/announcements';
import { pickAnnouncement } from '../src/lib/inline-scripts.mjs';

const hour = 3_600_000;
const labels = { label: 'Announcement', dismiss: 'Dismiss announcement' };
const base = { tag: 'News', text: 'Fixture announcement.', dismissible: true };

test('days start at midnight Mountain Time on both sides of a DST change', () => {
  expect(midnight('2026-03-08')).toBe(Date.UTC(2026, 2, 8, 7));
  expect(midnight('2026-03-09')).toBe(Date.UTC(2026, 2, 9, 6));
  expect(midnight('2026-11-01')).toBe(Date.UTC(2026, 10, 1, 6));
  expect(midnight('2026-11-02')).toBe(Date.UTC(2026, 10, 2, 7));
  expect(midnight('2026-12-31', 1)).toBe(Date.UTC(2027, 0, 1, 7));
});

test('the build drops expired announcements and keeps open-ended ones in start order', () => {
  const now = midnight('2026-10-10');
  const list = schedule(
    [
      { ...base, id: 'open', start: '2026-10-05' },
      { ...base, id: 'expired', start: '2026-09-01', end: '2026-10-09' },
      { ...base, id: 'last-day', start: '2026-09-20', end: '2026-10-10' },
      { ...base, id: 'future', start: '2026-12-01', end: '2026-12-02' },
    ],
    now,
  );
  expect(list.map((a) => a.id)).toEqual(['last-day', 'open', 'future']);
  expect(list[0].until).toBe(midnight('2026-10-11'));
  expect(list[1].until).toBeNull();
});

test('the page picks the open window with the latest start and skips dismissed ones', () => {
  const windows = [
    { id: 'a', from: 0, until: 10 * hour },
    { id: 'b', from: 5 * hour, until: null },
  ];
  expect(pickAnnouncement(windows, -1, [])).toBeNull();
  expect(pickAnnouncement(windows, 0, [])).toBe('a');
  expect(pickAnnouncement(windows, 5 * hour, [])).toBe('b');
  expect(pickAnnouncement(windows, 5 * hour, ['b'])).toBe('a');
  expect(pickAnnouncement(windows, 10 * hour, ['b'])).toBeNull();
});

test('announcement ids are unique slugs and internal links resolve', async () => {
  const list =
    parse(await readFile(new URL('../src/content/announcements.yaml', import.meta.url), 'utf8')) ??
    [];
  const ids = list.map((a: { id: string }) => a.id);
  expect(new Set(ids).size).toBe(ids.length);
  for (const id of ids) expect(id).toMatch(/^[a-z0-9-]+$/);
  for (const { link } of list) {
    if (!link || /^https?:\/\//.test(link.href)) continue;
    const [path, anchor] = link.href.split('#');
    const file = path === '/' || path === '' ? 'index' : path.replace(/^\//, '');
    const html = await readFile(new URL(`../dist/client/${file}.html`, import.meta.url), 'utf8');
    if (anchor) expect(html, link.href).toContain(`id="${anchor}"`);
  }
});

const fixture = (announcements: Scheduled[]) => async (page: Page, url: string | RegExp) => {
  await page.route(url, async (route) => {
    const response = await route.fetch();
    const html = (await response.text())
      .replace(/<script type="application\/json" id="announcements">[^<]*<\/script>/, '')
      .replace(/<aside class="ann"[\s\S]*?<\/aside>/g, '')
      .replace(
        '<head>',
        `<head><script type="application/json" id="announcements">${windowsJson(announcements)}</script>`,
      )
      .replace(
        /(<a class="skip"[\s\S]*?<\/a>)/,
        `$1${announcements.map((a) => barHtml(a, labels)).join('')}`,
      );
    await route.fulfill({ response, body: html });
  });
};

const now = Date.now();
const live = (id: string, extra: Partial<Scheduled> = {}): Scheduled => ({
  ...base,
  id,
  start: '2026-01-01',
  from: now - hour,
  until: now + hour,
  ...extra,
});

for (const width of [1440, 390]) {
  test(`an active announcement shows above the nav at ${width}px without shifting the page`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await fixture([
      live('shown', { link: { label: 'Read more', href: 'https://example.com/post' } }),
      live('upcoming', { from: now + hour, until: null }),
    ])(page, '/');
    await page.goto('/');
    const bar = page.locator('.ann:visible');
    await expect(bar).toHaveCount(1);
    await expect(bar).toHaveAttribute('data-announcement', 'shown');
    const barBox = (await bar.boundingBox())!;
    const navBox = (await page.locator('.nav').boundingBox())!;
    expect(barBox.y).toBe(0);
    expect(barBox.width).toBe(width);
    expect(navBox.y).toBeCloseTo(barBox.height, 0);
    await expect(bar.locator('a')).toHaveAttribute('target', '_blank');
    const shift = await page.evaluate(
      () =>
        new Promise<number>((resolve) => {
          new PerformanceObserver((list) =>
            resolve(
              list
                .getEntries()
                .filter(
                  (e) =>
                    (e as PerformanceEntry & { hadRecentInput: boolean }).hadRecentInput === false,
                )
                .filter((e) =>
                  ((e as PerformanceEntry & { sources: { node?: Node }[] }).sources ?? []).some(
                    (s) => s.node && (s.node as Element).closest?.('.ann, .nav'),
                  ),
                )
                .reduce((sum, e) => sum + (e as PerformanceEntry & { value: number }).value, 0),
            ),
          ).observe({ type: 'layout-shift', buffered: true });
          setTimeout(() => resolve(0), 500);
        }),
    );
    // A bar shown after first paint would push the page down its full height (about 0.06 at
    // 1440px); a web font swapping in reflows the text by far less.
    expect(shift).toBeLessThan(0.01);
  });
}

test('a dismissed announcement stays dismissed and focus moves to the nav', async ({ page }) => {
  await fixture([live('dismiss-me')])(page, '/colophon');
  await page.goto('/colophon');
  await page.getByRole('button', { name: labels.dismiss }).click();
  await expect(page.locator('.ann')).toHaveCount(0);
  await expect(page.locator('[data-home]')).toBeFocused();
  await page.reload();
  await expect(page.locator('.ann:visible')).toHaveCount(0);
});

test('announce-at previews a date, and a non-dismissible bar has no close button', async ({
  page,
}) => {
  await fixture([
    live('later', {
      dismissible: false,
      from: midnight('2030-05-01'),
      until: midnight('2030-05-02'),
    }),
  ])(page, /\/resume/);
  await page.goto('/resume');
  await expect(page.locator('.ann:visible')).toHaveCount(0);
  await page.goto('/resume?announce-at=2030-05-01');
  await expect(page.locator('.ann:visible')).toHaveCount(1);
  await expect(page.locator('.ann-close')).toHaveCount(0);
  await page.goto('/resume?announce-at=2030-05-02');
  await expect(page.locator('.ann:visible')).toHaveCount(0);
  await page.goto('/resume?announce-at=2030-05-01');
  await page.emulateMedia({ media: 'print' });
  await expect(page.locator('.ann:visible')).toHaveCount(0);
});
