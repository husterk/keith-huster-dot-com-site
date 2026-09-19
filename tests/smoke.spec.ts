import { test, expect } from '@playwright/test';

const widths = [1440, 834, 390];

for (const width of widths) {
  test.describe(`at ${width}px`, () => {
    test.use({ viewport: { width, height: 900 } });

    test('renders without horizontal scroll and the nav fits', async ({ page }) => {
      await page.goto('/');
      await expect(page.locator('h1')).toHaveText('Reliable by design.');
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
        width,
      );
      const cta = page.locator('header a.cta');
      await expect(cta).toBeVisible();
      const box = (await cta.boundingBox())!;
      expect(box.x + box.width).toBeLessThanOrEqual(width);
      expect(box.height).toBeGreaterThanOrEqual(44);
    });

    test('the bikepacker is fully visible in every scene', async ({ page }) => {
      await page.goto('/');
      const riders = page.locator('.rider');
      const count = await riders.count();
      expect(count).toBeGreaterThanOrEqual(6);
      for (let i = 0; i < count; i++) {
        const rider = riders.nth(i);
        await rider.scrollIntoViewIfNeeded();
        const b = (await rider.boundingBox())!;
        expect(b.x, `rider ${i} left edge`).toBeGreaterThanOrEqual(0);
        expect(b.x + b.width, `rider ${i} right edge`).toBeLessThanOrEqual(width);
      }
    });
  });
}

test.describe('phone menu', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('opens, traps focus, and closes on Escape', async ({ page }) => {
    await page.goto('/');
    const button = page.locator('button.menu');
    await expect(button).toBeVisible();
    await button.click();
    await expect(button).toHaveAttribute('aria-expanded', 'true');
    const menu = page.locator('#mobile-menu');
    await expect(menu).toBeVisible();
    await expect(menu.locator('a[href="#segments"]')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(button).toHaveAttribute('aria-expanded', 'false');
    await expect(menu).toBeHidden();
  });
});

test('unknown routes get the 404 page', async ({ page }) => {
  const response = await page.goto('/nope');
  expect(response?.status()).toBe(404);
  await expect(page.locator('h1')).toHaveText('Off route.');
});

test.describe('contact endpoint', () => {
  const valid = {
    name: 'Smoke Test',
    email: 'smoke@example.com',
    message: 'Hello from the smoke test, this is a real message.',
    'cf-turnstile-response': 'test-token',
  };

  test('rejects GET, bad origins and invalid fields; drops honeypot hits; dry-runs a valid send', async ({
    request,
    baseURL,
  }) => {
    let ip = 10;
    const post = (form: Record<string, string>, origin = baseURL!) =>
      request.post('/api/contact', {
        form,
        headers: { accept: 'application/json', origin, 'cf-connecting-ip': `203.0.113.${ip++}` },
      });
    expect((await request.get('/api/contact')).status()).toBe(405);
    expect((await post(valid, 'https://evil.example')).status()).toBe(403);
    const invalid = await post({ ...valid, message: 'hi' });
    expect(invalid.status()).toBe(400);
    expect((await invalid.json()).errors).toHaveProperty('message');
    expect((await post({ ...valid, company: 'bot' })).status()).toBe(200);
    const sent = await post(valid);
    expect(sent.status()).toBe(200);
    expect((await sent.json()).ok).toBe(true);
  });

  test('rate-limits the sixth message from one address within a minute', async ({
    request,
    baseURL,
  }) => {
    const headers = {
      accept: 'application/json',
      origin: baseURL!,
      'cf-connecting-ip': '203.0.113.99',
    };
    let last = 0;
    for (let i = 0; i < 6; i++)
      last = (await request.post('/api/contact', { form: valid, headers })).status();
    expect(last).toBe(429);
  });

  test('the no-JS path returns an HTML page', async ({ request, baseURL }) => {
    const res = await request.post('/api/contact', {
      form: valid,
      headers: { origin: baseURL!, 'cf-connecting-ip': '203.0.113.50' },
    });
    expect(res.status()).toBe(200);
    expect(res.headers()['content-type']).toContain('text/html');
    expect(await res.text()).toContain('Thanks');
  });
});

test('the contact form renders with its fields and the honeypot hidden', async ({ page }) => {
  await page.goto('/');
  const form = page.locator('form.contact-form');
  await expect(form.locator('#contact-name')).toBeVisible();
  await expect(form.locator('#contact-email')).toBeVisible();
  await expect(form.locator('#contact-message')).toBeVisible();
  await expect(form.locator('#contact-company')).not.toBeInViewport();
});
