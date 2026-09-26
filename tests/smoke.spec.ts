import { test, expect, type Page } from '@playwright/test';

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

const heroGridWidths = [1180, 1440];

for (const width of heroGridWidths) {
  test.describe(`hero intro column at ${width}px`, () => {
    test.use({ viewport: { width, height: 900 } });

    test('the intro paragraph stays readable and the rider stays on screen', async ({ page }) => {
      await page.goto('/');
      const h1Box = (await page.locator('.hero h1').boundingBox())!;
      const pBox = (await page.locator('.hero .text p').boundingBox())!;
      expect(pBox.width, 'intro paragraph width').toBeGreaterThanOrEqual(400);
      expect(pBox.x, 'paragraph sits beside the headline').toBeGreaterThan(h1Box.x + h1Box.width);

      const rider = page.locator('.hero .rider').first();
      await rider.evaluate((el) => el.scrollIntoView({ block: 'center' }));
      const riderBox = (await rider.boundingBox())!;
      expect(riderBox.x, 'rider left edge').toBeGreaterThanOrEqual(0);
      expect(riderBox.y, 'rider top edge').toBeGreaterThanOrEqual(0);
      expect(riderBox.x + riderBox.width, 'rider right edge').toBeLessThanOrEqual(width);
      expect(riderBox.y + riderBox.height, 'rider bottom edge').toBeLessThanOrEqual(900);
    });
  });
}

test('the Tour Divide card draws the elevation profile', async ({ page }) => {
  await page.goto('/');
  const profile = page.locator('#offclock svg.tour-profile');
  await expect(profile).toHaveAttribute('aria-label', /Indiana Pass, 11,910 feet/);
  await expect(profile.locator('.tp-line')).toHaveCount(1);
  await expect(profile.locator('.tp-bands rect')).toHaveCount(7);
  await expect(profile.locator('.tp-markers circle')).toHaveCount(8);
  for (const landmark of [
    'Banff',
    'Koko Claims',
    'The Wall',
    'Fleecer Ridge',
    'Indiana Pass · 11,910 ft',
    'Pie Town',
    'Hachita',
    'Antelope Wells',
  ])
    await expect(profile.getByText(landmark, { exact: true })).toHaveCount(1);
});

test('the colophon map scrolls with the page, beside the route section', async ({ page }) => {
  await page.setViewportSize({ width: 1512, height: 860 });
  await page.goto('/colophon');
  const rail = page.locator('.route .rail');
  await expect(rail).toHaveCSS('position', 'static');
  const before = (await rail.boundingBox())!.y;
  await page.evaluate(() => scrollBy(0, 400));
  expect((await rail.boundingBox())!.y).toBeCloseTo(before - 400, 0);
});

test('the colophon map follows the Tour Divide through Wamsutter', async ({ page }) => {
  await page.goto('/colophon');
  const map = page.locator('.route-map');
  await expect(map.getByText('Wamsutter, WY')).toHaveCount(1);
  await expect(map.getByText('Rawlins')).toHaveCount(0);
  expect(await map.locator('g > path').count()).toBeGreaterThanOrEqual(10);
});

test.describe('colophon logo strip', () => {
  test('scrolls and pauses on request', async ({ page }) => {
    await page.goto('/colophon');
    const strip = page.locator('[data-marquee]');
    const track = strip.locator('.track');
    await expect(track).toHaveCSS('animation-play-state', 'running');
    const button = strip.locator('button.toggle');
    await button.click();
    await expect(strip).toHaveAttribute('data-paused', '');
    await expect(button).toHaveText('Play');
    await page.mouse.move(0, 0);
    await expect(track).toHaveCSS('animation-play-state', 'paused');
    await button.click();
    await expect(button).toHaveText('Pause');
    await page.mouse.move(0, 0);
    await expect(track).toHaveCSS('animation-play-state', 'running');
  });

  test('each logo links out, and only the visible copy takes focus', async ({ page }) => {
    await page.goto('/colophon');
    const strip = page.locator('[data-marquee]');
    const links = strip.locator('ul:not([aria-hidden]) a');
    await expect(links).toHaveCount(15);
    for (const link of await links.all()) {
      await expect(link).toHaveAttribute('href', /^https:\/\//);
      await expect(link).toHaveAttribute('target', '_blank');
      await expect(link).toHaveAttribute('rel', /noopener/);
    }
    const copies = strip.locator('ul[aria-hidden="true"] a');
    await expect(copies).toHaveCount(15);
    for (const copy of await copies.all()) await expect(copy).toHaveAttribute('tabindex', '-1');
  });

  test('resumes after a logo opens its site and the tab is closed', async ({ page, context }) => {
    await context.route(/^https:\/\/(?!localhost)/, (route) => route.fulfill({ body: 'ok' }));
    await page.goto('/colophon');
    const strip = page.locator('[data-marquee]');
    const track = strip.locator('.track');
    const opened = context.waitForEvent('page');
    await strip.locator('ul:not([aria-hidden]) a').first().click({ force: true });
    await (await opened).close();
    await page.bringToFront();
    await page.mouse.move(0, 0);
    await expect(track).toHaveCSS('animation-play-state', 'running');
  });

  test('keyboard focus on a logo pauses the strip', async ({ page }) => {
    await page.goto('/colophon');
    const strip = page.locator('[data-marquee]');
    await strip.locator('ul:not([aria-hidden]) a').first().focus();
    await page.keyboard.press('Shift+Tab');
    await page.keyboard.press('Tab');
    await expect(strip.locator('.track')).toHaveCSS('animation-play-state', 'paused');
  });

  test('holds still under reduced motion, each logo listed once', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/colophon');
    const strip = page.locator('[data-marquee]');
    await expect(strip.locator('.track')).toHaveCSS('animation-name', 'none');
    await expect(strip.locator('button.toggle')).toBeHidden();
    await expect(strip.locator('ul[aria-hidden="true"]')).toBeHidden();
    await expect(strip.locator('ul:not([aria-hidden]) li')).toHaveCount(15);
  });
});

test('every page ends with the same footer', async ({ page }) => {
  const footers: string[] = [];
  for (const path of ['/', '/resume', '/colophon', '/404']) {
    await page.goto(path);
    const footer = page.locator('footer.foot');
    await expect(footer).toHaveCount(1);
    footers.push((await footer.textContent())!.replace(/\s+/g, ' ').trim());
    const current = footer.locator('a[aria-current="page"]');
    if (path === '/resume' || path === '/colophon') {
      await expect(current).toHaveAttribute('href', path);
    } else {
      await expect(current).toHaveCount(0);
    }
  }
  expect(new Set(footers).size).toBe(1);
  expect(footers[0]).not.toContain('Back to the site');
});

test.describe('page transitions', () => {
  const recordReveal = async (page: Page) =>
    page.addInitScript(() =>
      addEventListener('pagereveal', (event) => {
        (window as unknown as { transitioned: boolean }).transitioned = !!(
          event as Event & { viewTransition: unknown }
        ).viewTransition;
      }),
    );

  test('moving between pages crossfades', async ({ page }) => {
    await recordReveal(page);
    await page.goto('/');
    await page.locator('.foot a[href="/resume"]').click();
    await expect(page).toHaveURL(/\/resume$/);
    expect(
      await page.evaluate(() => (window as unknown as { transitioned: boolean }).transitioned),
    ).toBe(true);
  });

  test('reduced motion switches pages without a transition', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await recordReveal(page);
    await page.goto('/');
    await page.locator('.foot a[href="/resume"]').click();
    await expect(page).toHaveURL(/\/resume$/);
    expect(
      await page.evaluate(() => (window as unknown as { transitioned: boolean }).transitioned),
    ).toBe(false);
  });
});

test.describe('the way to the résumé', () => {
  for (const width of widths) {
    test(`the hero button and the nav open /resume at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/');
      const hero = page.locator('.hero a.btn.ghost');
      await expect(hero).toHaveText('View résumé');
      await expect(hero).toHaveAttribute('href', '/resume');
      await expect(hero).not.toHaveAttribute('target', /./);
      if (width < 780) await page.locator('button.menu').click();
      const nav = page.locator(width < 780 ? '#mobile-menu' : 'header.nav');
      await nav.locator('a[href="/resume"]').click();
      await expect(page).toHaveURL(/\/resume$/);
      await expect(page.locator('a[download]')).toHaveAttribute('href', '/Keith-Huster-Resume.pdf');
    });
  }
});

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

test('the nav stays visible, the brand glides back to the top, and external links open in a new tab', async ({
  page,
}) => {
  await page.goto('/#contact');
  await page.waitForTimeout(300);
  expect((await page.locator('header.nav').boundingBox())!.y).toBe(0);
  await expect(page.locator('#contact')).toBeFocused();
  await page.evaluate(() => ((window as unknown as { stayed: boolean }).stayed = true));
  const start = await page.evaluate(() => scrollY);
  await page.locator('header.nav a.brand').click();
  await page.waitForTimeout(150);
  const midway = await page.evaluate(() => scrollY);
  expect(midway).toBeGreaterThan(0);
  expect(midway).toBeLessThan(start);
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
  expect(new URL(page.url()).pathname + new URL(page.url()).hash).toBe('/');
  expect(await page.evaluate(() => (window as unknown as { stayed?: boolean }).stayed)).toBe(true);
  await expect(page.locator('#main')).toBeFocused();
  await page.goBack();
  await expect(page.locator('#contact')).toBeFocused();
  await page.goForward();
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
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
      await expect.poll(() => rider(page).getAttribute('transform')).not.toBe(before);
      const low = await rider(page).getAttribute('transform');
      const legLow = await rider(page).locator('.leg').first().getAttribute('d');
      await page.mouse.wheel(0, 500);
      await expect
        .poll(async () => x(await rider(page).getAttribute('transform')))
        .toBeGreaterThan(x(low));
      const legHigh = await rider(page).locator('.leg').first().getAttribute('d');
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

test.describe('turnstile widget layout', () => {
  // Turnstile itself is blocked in headless Chromium, so these inject what
  // it injects: a flexible-size iframe inside .cf-turnstile plus the
  // interactive class the before/after-interactive callbacks toggle.
  for (const width of widths) {
    test(`the widget never overlaps the form at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/#contact');

      const hiddenHeight = await page.evaluate(
        () => document.querySelector('.cf-turnstile')!.getBoundingClientRect().height,
      );
      expect(hiddenHeight).toBeLessThanOrEqual(1);

      const boxes = await page.evaluate(() => {
        const widget = document.querySelector('.cf-turnstile')!;
        const iframe = document.createElement('iframe');
        iframe.style.cssText = 'width:100%;height:65px;display:block';
        widget.appendChild(iframe);
        widget.classList.add('interactive');
        const rect = (selector: string) => {
          const box = document.querySelector(selector)!.getBoundingClientRect();
          return { top: box.top, right: box.right, bottom: box.bottom, left: box.left };
        };
        return {
          widget: rect('.cf-turnstile'),
          textarea: rect('#contact-message'),
          submit: rect('.contact-form button[type="submit"]'),
          status: rect('.contact-form .status'),
        };
      });

      const intersects = (a: (typeof boxes)['widget'], b: (typeof boxes)['widget']) =>
        a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;

      expect(intersects(boxes.widget, boxes.textarea)).toBe(false);
      expect(intersects(boxes.widget, boxes.submit)).toBe(false);
      expect(intersects(boxes.widget, boxes.status)).toBe(false);
    });
  }
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

test.describe('scene width', () => {
  for (const width of [834, 1024, 1180, 1440, 1920]) {
    test(`every strip scene spans the viewport at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/');
      for (const scene of await page.locator('.strip .scene, .finish .scene').all()) {
        const box = (await scene.boundingBox())!;
        expect(box.x).toBeLessThanOrEqual(1);
        expect(box.x + box.width).toBeGreaterThanOrEqual(width - 1);
      }
    });
  }
});

test.describe('content security policy', () => {
  for (const path of ['/', '/colophon', '/resume', '/404']) {
    test(`${path} loads with no CSP violations, Turnstile included`, async ({ page }) => {
      const violations: string[] = [];
      page.on('console', (msg) => {
        if (/Content Security Policy/i.test(msg.text())) violations.push(msg.text());
      });
      await page.addInitScript(() => {
        document.addEventListener('securitypolicyviolation', (event) =>
          console.error(
            `Content Security Policy violation: ${event.violatedDirective} ${event.blockedURI}`,
          ),
        );
      });
      await page.goto(path);
      await expect(page.locator('meta[http-equiv="content-security-policy"]')).toHaveCount(1);
      await page.evaluate(async () => {
        for (let y = 0; y < document.body.scrollHeight; y += 600) {
          scrollTo(0, y);
          await new Promise((resolve) => setTimeout(resolve, 50));
        }
      });
      if (path === '/') {
        await page.locator('#contact-name').focus();
        await expect(page.locator('script[data-turnstile]')).toHaveCount(1);
        await page.waitForTimeout(1500);
      }
      expect(violations).toEqual([]);
    });
  }
});

test('only the 404 page is kept out of search indexes', async ({ page }) => {
  await page.goto('/404');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex');
  await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);
  for (const path of ['/', '/colophon', '/resume']) {
    await page.goto(path);
    await expect(page.locator('meta[name="robots"]')).toHaveCount(0);
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
  }
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });
  test('the contact form points to email', async ({ page }) => {
    await page.goto('/');
    const note = page.locator('.contact-form p.fallback', { hasText: 'needs JavaScript' });
    await expect(note).toBeVisible();
    await expect(note.locator('a[href^="mailto:"]')).toBeVisible();
  });
});

test.describe('link targets on the phone', () => {
  test.use({ viewport: { width: 390, height: 844 } });
  for (const path of ['/', '/colophon', '/resume', '/404']) {
    test(`standalone links on ${path} are at least 24px tall`, async ({ page }) => {
      await page.goto(path);
      const heights = await page
        .locator('.foot a, .box .mono a')
        .evaluateAll((links) => links.map((link) => link.getBoundingClientRect().height));
      expect(heights.length).toBeGreaterThan(0);
      for (const height of heights) expect(height).toBeGreaterThanOrEqual(24);
    });
  }
});

test('Google Analytics stays off outside the production domain', async ({ page }) => {
  const requests: string[] = [];
  page.on('request', (request) => {
    if (/googletagmanager|google-analytics/.test(request.url())) requests.push(request.url());
  });
  await page.goto('/');
  await expect(page.locator('meta[name="ga-measurement-id"]')).toHaveAttribute('content', /^G-/);
  await page.waitForTimeout(1000);
  expect(requests).toEqual([]);
});
