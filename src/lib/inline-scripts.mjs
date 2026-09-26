export function pickAnnouncement(windows, now, dismissed) {
  let pick = null;
  for (const a of windows) {
    const open = a.from <= now && (a.until === null || now < a.until);
    if (open && !dismissed.includes(a.id) && (!pick || a.from >= pick.from)) pick = a;
  }
  return pick ? pick.id : null;
}

export const headScript = `if (!matchMedia('(prefers-reduced-motion: reduce)').matches)
  document.documentElement.classList.add('rides');
(() => {
  const hash = location.hash;
  history.scrollRestoration = hash ? 'manual' : 'auto';
  if (hash) history.replaceState(null, '', location.pathname + location.search);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const top = (el) =>
    el.getBoundingClientRect().top +
    scrollY -
    parseFloat(getComputedStyle(el).scrollMarginTop);
  let frame = 0;
  const stop = () => cancelAnimationFrame(frame);
  addEventListener('wheel', stop, { passive: true });
  addEventListener('touchstart', stop, { passive: true });
  const land = (el) => {
    if (!el.hasAttribute('tabindex')) {
      el.setAttribute('tabindex', '-1');
      el.addEventListener('blur', () => el.removeAttribute('tabindex'), { once: true });
    }
    el.focus({ preventScroll: true });
  };
  const glide = (el, target = () => top(el)) => {
    stop();
    if (reduce) {
      scrollTo(0, target());
      land(el);
      return;
    }
    const from = scrollY;
    const duration = Math.min(900, 300 + Math.abs(target() - from) / 4);
    const started = performance.now();
    const step = (now) => {
      const t = Math.min(1, (now - started) / duration);
      const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      scrollTo(0, from + (target() - from) * eased);
      if (t < 1) frame = requestAnimationFrame(step);
      else land(el);
    };
    frame = requestAnimationFrame(step);
  };
  const byHash = (hash) => {
    try {
      return document.getElementById(decodeURIComponent(hash.slice(1)));
    } catch {
      return null;
    }
  };
  if (hash) {
    addEventListener('load', () => {
      history.replaceState(null, '', location.pathname + location.search + hash);
      const el = byHash(hash);
      if (!el) return;
      scrollTo(0, 0);
      glide(el);
      if (document.fonts)
        document.fonts.ready.then(() => {
          if (Math.abs(top(el) - scrollY) > 1) glide(el);
        });
    });
  }
  document.addEventListener('click', (event) => {
    const link = event.target.closest && event.target.closest('a[href]');
    if (!link) return;
    stop();
    if (link.classList.contains('skip') || event.defaultPrevented) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (link.origin !== location.origin || link.pathname !== location.pathname) return;
    const main = document.getElementById('main');
    if (link.hasAttribute('data-home') && main) {
      event.preventDefault();
      if (location.hash) history.pushState(null, '', location.pathname + location.search);
      glide(main, () => 0);
      return;
    }
    if (!link.hash) return;
    const el = byHash(link.hash);
    if (!el) return;
    event.preventDefault();
    history.pushState(null, '', link.hash);
    glide(el);
  });
  addEventListener('popstate', () => {
    if (!location.hash) {
      const main = document.getElementById('main');
      if (main) glide(main, () => 0);
      return;
    }
    const el = byHash(location.hash);
    if (el) glide(el);
  });
})();
(() => {
  const data = document.getElementById('announcements');
  if (!data) return;
  const windows = JSON.parse(data.textContent);
  const key = 'dismissed-announcements';
  let dismissed = [];
  try {
    dismissed = JSON.parse(localStorage.getItem(key) || '[]');
  } catch {}
  if (!Array.isArray(dismissed)) dismissed = [];
  let now = Date.now();
  const at = new URLSearchParams(location.search).get('announce-at');
  if (at) {
    const t = Date.parse(at.includes('T') ? at : at + 'T12:00:00-07:00');
    if (!Number.isNaN(t)) now = t;
  }
  ${pickAnnouncement}
  const id = pickAnnouncement(windows, now, dismissed);
  if (!id) return;
  try {
    const sheet = new CSSStyleSheet();
    sheet.replaceSync('.ann[data-announcement="' + id + '"] { display: flex; }');
    document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet];
  } catch {
    return;
  }
  document.addEventListener('click', (event) => {
    const button = event.target.closest && event.target.closest('[data-dismiss-announcement]');
    if (!button) return;
    const kept = dismissed.filter((d) => windows.some((w) => w.id === d));
    try {
      localStorage.setItem(key, JSON.stringify([...kept, id]));
    } catch {}
    button.closest('.ann').remove();
    const home = document.querySelector('[data-home]');
    if (home) home.focus();
  });
})();`;

export const unregisterServiceWorkers = `if ('serviceWorker' in navigator)
  navigator.serviceWorker
    .getRegistrations()
    .then((registrations) =>
      registrations.forEach((registration) => registration.unregister()),
    );`;
