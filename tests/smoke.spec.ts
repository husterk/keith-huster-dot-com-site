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
        for (const nudge of [0, 350, -700]) {
          if (nudge === 0) await rider.evaluate((el) => el.scrollIntoView({ block: 'center' }));
          else await page.mouse.wheel(0, nudge);
          await page.waitForTimeout(150);
          const b = (await rider.boundingBox())!;
          expect(b.x, `rider ${i} left edge after ${nudge}`).toBeGreaterThanOrEqual(-1);
          expect(b.x + b.width, `rider ${i} right edge after ${nudge}`).toBeLessThanOrEqual(
            width + 1,
          );
        }
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
    await expect(menu.locator('a[href="/#segments"]')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(button).toHaveAttribute('aria-expanded', 'false');
    await expect(menu).toBeHidden();
  });
});

test('the nav stays visible, the brand returns to the top, and external links open in a new tab', async ({
  page,
}) => {
  await page.goto('/#contact');
  await page.waitForTimeout(300);
  expect((await page.locator('header.nav').boundingBox())!.y).toBe(0);
  await page.locator('header.nav a.brand').click();
  await page.waitForLoadState('load');
  expect(new URL(page.url()).pathname + new URL(page.url()).hash).toBe('/');
  expect(await page.evaluate(() => scrollY)).toBe(0);
  const external = page.locator('a[href^="http"]:not([href*="keithhuster.com"])');
  expect(await external.count()).toBeGreaterThan(0);
  for (const link of await external.all()) {
    expect(await link.getAttribute('target')).toBe('_blank');
    expect(await link.getAttribute('rel')).toContain('noopener');
  }
  await page.goto('/colophon');
  for (const link of await page
    .locator('main a[href^="http"]:not([href*="keithhuster.com"])')
    .all())
    expect(await link.getAttribute('target')).toBe('_blank');
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

test.describe('motion', () => {
  const rider = (page: import('@playwright/test').Page) =>
    page.locator('.rider[data-rides]').nth(1);
  const x = (t: string | null) => Number(/translate\(([-\d.]+),/.exec(t ?? '')?.[1]);

  test.describe('reduced motion', () => {
    test.use({ reducedMotion: 'reduce' });

    test('the rider neither bobs nor moves on scroll', async ({ page }) => {
      await page.goto('/');
      const before = await rider(page).getAttribute('transform');
      expect(
        await rider(page).evaluate((el) => getComputedStyle(el.children[0]).animationName),
      ).toBe('none');
      const leg = await rider(page).locator('.leg').first().getAttribute('d');
      await rider(page).evaluate((el) => el.scrollIntoView({ block: 'center' }));
      await page.mouse.wheel(0, 400);
      await page.waitForTimeout(200);
      expect(await rider(page).getAttribute('transform')).toBe(before);
      expect(await rider(page).locator('.leg').first().getAttribute('d')).toBe(leg);
    });
  });

  test.describe('no motion preference', () => {
    test.use({ reducedMotion: 'no-preference' });

    test('the rider bobs and travels the ground as the strip scrolls', async ({ page }) => {
      await page.goto('/');
      const before = await rider(page).getAttribute('transform');
      expect(
        await rider(page).evaluate((el) => getComputedStyle(el.children[0]).animationName),
      ).toBe('bob');
      await rider(page).evaluate((el) => el.scrollIntoView({ block: 'end' }));
      await page.waitForTimeout(200);
      const low = await rider(page).getAttribute('transform');
      const legLow = await rider(page).locator('.leg').first().getAttribute('d');
      await page.mouse.wheel(0, 500);
      await page.waitForTimeout(200);
      const high = await rider(page).getAttribute('transform');
      const legHigh = await rider(page).locator('.leg').first().getAttribute('d');
      expect(low).not.toBe(before);
      expect(high).not.toBe(low);
      expect(x(high)).toBeGreaterThan(x(low));
      expect(legHigh).not.toBe(legLow);
    });
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

test.describe('hash scroll', () => {
  test.use({ viewport: { width: 1440, height: 900 }, reducedMotion: 'no-preference' });
  const top = (page: import('@playwright/test').Page, id: string) =>
    page.evaluate((id) => document.getElementById(id)!.getBoundingClientRect().top, id);

  test('a hashed load starts at the top and eases onto its section', async ({ page }) => {
    await page.goto('/#crew');
    await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(0);
    const early = await page.evaluate(() => scrollY);
    await page.waitForTimeout(1200);
    expect(await page.evaluate(() => scrollY)).toBeGreaterThan(early);
    expect(Math.abs((await top(page, 'crew')) - 104)).toBeLessThanOrEqual(1);
    expect(page.url()).toContain('#crew');
    await page.reload();
    await page.waitForTimeout(1500);
    expect(Math.abs((await top(page, 'crew')) - 104)).toBeLessThanOrEqual(1);
  });

  test('a nav click eases to its section and updates the hash', async ({ page }) => {
    await page.goto('/');
    await page.locator('header.nav a[href="/#segments"]').click();
    await page.waitForTimeout(1200);
    expect(Math.abs((await top(page, 'segments')) - 104)).toBeLessThanOrEqual(1);
    expect(new URL(page.url()).hash).toBe('#segments');
    await page.goBack();
    await page.waitForTimeout(1200);
    expect(await page.evaluate(() => scrollY)).toBe(0);
  });

  test.describe('reduced motion', () => {
    test.use({ reducedMotion: 'reduce' });
    test('a hashed load lands at once', async ({ page }) => {
      await page.goto('/#segments');
      await page.waitForTimeout(100);
      expect(Math.abs((await top(page, 'segments')) - 104)).toBeLessThanOrEqual(1);
    });
  });
});

test.describe('career chart', () => {
  test('wide screens get labeled waypoints, narrow screens get a numbered legend', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    await expect(page.locator('.chart-wide')).toBeVisible();
    await expect(page.locator('.chart-wide .org')).toHaveCount(7);
    await expect(page.locator('.chart-legend')).toBeHidden();
    await page.setViewportSize({ width: 390, height: 844 });
    await expect(page.locator('.chart-wide')).toBeHidden();
    await expect(page.locator('.chart-narrow')).toBeVisible();
    await expect(page.locator('.chart-legend li')).toHaveCount(7);
    await expect(page.locator('.chart-legend li').first()).toContainText('Hill-Rom');
  });
});
