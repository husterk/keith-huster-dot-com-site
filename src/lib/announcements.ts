export const SITE_TIME_ZONE = 'America/Denver';

export interface Announcement {
  id: string;
  tag: string;
  text: string;
  link?: { label: string; href: string };
  start: string;
  end?: string;
  dismissible: boolean;
}

export interface Scheduled extends Announcement {
  from: number;
  until: number | null;
}

export interface BarLabels {
  label: string;
  dismiss: string;
}

const clock = new Intl.DateTimeFormat('en-US', {
  timeZone: SITE_TIME_ZONE,
  hourCycle: 'h23',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
});

const offsetAt = (ms: number) => {
  const p = Object.fromEntries(clock.formatToParts(ms).map((part) => [part.type, part.value]));
  return Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute, +p.second) - ms;
};

const utcDay = (day: string, plus = 0) => {
  const [y, m, d] = day.split('-').map(Number);
  return Date.UTC(y, m - 1, d + plus);
};

// Midnight in the site time zone; DST changes happen at 2 AM, so midnight always exists.
export const midnight = (day: string, plus = 0) => {
  const guess = utcDay(day, plus);
  return guess - offsetAt(guess - offsetAt(guess));
};

export const schedule = (list: Announcement[], now: number): Scheduled[] =>
  list
    .map((a) => ({ ...a, from: midnight(a.start), until: a.end ? midnight(a.end, 1) : null }))
    .filter((a) => a.until === null || a.until > now)
    .sort((a, b) => a.from - b.from);

const escape = (s: string) =>
  s.replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!,
  );

const external = (href: string) => /^https?:\/\//.test(href) && !href.includes('keithhuster.com');

// Plain HTML rather than a component so the tests can render a fixture bar with the same markup.
export const barHtml = (a: Scheduled, labels: BarLabels) => {
  const link = a.link
    ? ` <a href="${escape(a.link.href)}"${external(a.link.href) ? ' target="_blank" rel="noopener"' : ''}>${escape(a.link.label)}</a>`
    : '';
  const close = a.dismissible
    ? `<button type="button" class="ann-close" data-dismiss-announcement aria-label="${escape(labels.dismiss)}"><svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><path d="M2 2l10 10M12 2L2 12"></path></svg></button>`
    : '';
  return `<aside class="ann" data-announcement="${escape(a.id)}" aria-label="${escape(labels.label)}"><span class="ann-blaze" aria-hidden="true"></span><span class="ann-body"><span class="ann-tag">${escape(a.tag)}</span><span class="ann-text">${escape(a.text)}${link}</span></span>${close}</aside>`;
};

export const windowsJson = (list: Scheduled[]) =>
  JSON.stringify(list.map(({ id, from, until }) => ({ id, from, until })));
