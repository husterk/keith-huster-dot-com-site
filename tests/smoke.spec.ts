import { test, expect } from '@playwright/test';

const widths = [1440, 834, 390];

for (const width of widths) {
  test.describe(`at ${width}px`, () => {
    test.use({ viewport: { width, height: 900 } });

    test('renders the headline without horizontal scroll', async ({ page }) => {
      await page.goto('/');
      await expect(page.locator('h1')).toHaveText('Reliable by design.');
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
        width,
      );
    });
  });
}

test('unknown routes get the 404 page', async ({ page }) => {
  const response = await page.goto('/nope');
  expect(response?.status()).toBe(404);
  await expect(page.locator('h1')).toHaveText('Off route.');
});
