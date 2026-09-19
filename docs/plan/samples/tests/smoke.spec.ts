// tests/smoke.spec.ts — Playwright starts `astro preview` (the built Worker in workerd) via playwright.config.ts webServer. Ported from design-files/generators/measure.js.
import { test, expect } from '@playwright/test';

const widths = [1440, 834, 390];

for (const width of widths) {
  test.describe(`at ${width}px`, () => {
    test.use({ viewport: { width, height: 900 } });

    test('renders without horizontal scroll and the nav fits', async ({ page }) => {
      await page.goto('/');
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
      const cta = page.locator('nav a.cta');
      await expect(cta).toBeVisible();
      const box = (await cta.boundingBox())!;
      expect(box.x + box.width).toBeLessThanOrEqual(width);
      expect(box.height).toBeGreaterThanOrEqual(44);
    });

    test('the bikepacker is fully visible in every scene', async ({ page }) => {
      await page.goto('/');
      const riders = page.locator('.rider');
      const n = await riders.count();
      expect(n).toBeGreaterThanOrEqual(6);
      for (let i = 0; i < n; i++) {
        const r = riders.nth(i);
        await r.scrollIntoViewIfNeeded();
        const b = (await r.boundingBox())!;
        expect(b.x, `rider ${i} left edge`).toBeGreaterThanOrEqual(0);
        expect(b.x + b.width, `rider ${i} right edge`).toBeLessThanOrEqual(width);
      }
    });
  });
}

test('contact form: validation, honeypot and dry-run send', async ({ page, request }) => {
  await page.goto('/');
  const post = (data: Record<string, string>) =>
    request.post('/api/contact', { form: data, headers: { accept: 'application/json', origin: 'http://localhost:4321' } });
  const base = { name: 'Test', email: 'test@example.com', message: 'Hello from the smoke test, this is a real message.', 'cf-turnstile-response': 'test' };
  expect((await post({ ...base, message: 'hi' })).status()).toBe(400);
  expect((await post({ ...base, company: 'bot' })).status()).toBe(200);
  expect((await post(base)).status()).toBe(200);   // CONTACT_DRY_RUN=1 in CI
});
