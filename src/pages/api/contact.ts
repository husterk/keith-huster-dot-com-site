import type { APIRoute } from 'astro';
import { getEntry } from 'astro:content';
import { env } from 'cloudflare:workers';
import { verifyTurnstile } from '../../lib/turnstile';
import { sendContactEmail } from '../../lib/resend';

export const prerender = false;

const LIMITS = { name: [1, 100], email: [3, 254], message: [10, 3000] } as const;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const POST: APIRoute = async ({ request }) => {
  const site = await getEntry('site', 'site');
  const copy = site?.data.endpoint ?? {};
  const t = (key: string) => copy[key] ?? key;
  const THANKS = t('thanks');
  const DIRECT = t('direct').replace('{email}', env.CONTACT_TO);
  const requestId = crypto.randomUUID();
  const version = env.CF_VERSION_METADATA?.id ?? 'dev';
  const wantsJson = (request.headers.get('accept') ?? '').includes('application/json');
  const started = Date.now();

  const reply = (status: number, message: string, extra: Record<string, unknown> = {}) =>
    wantsJson
      ? Response.json({ ok: status < 300, message, ...extra }, { status })
      : new Response(page(status < 300 ? t('pageThanks') : t('pageSorry'), message, site?.data), {
          status,
          headers: { 'content-type': 'text/html;charset=utf-8' },
        });
  const log = (outcome: string, extra: Record<string, unknown> = {}) =>
    console.log(
      JSON.stringify({ requestId, outcome, version, ms: Date.now() - started, ...extra }),
    );

  const contentType = request.headers.get('content-type') ?? '';
  if (
    !contentType.startsWith('application/x-www-form-urlencoded') &&
    !contentType.startsWith('multipart/form-data')
  ) {
    log('unsupported-media-type');
    return reply(415, t('unsupported'));
  }

  const origin = request.headers.get('origin') ?? referrerOrigin(request);
  const self = new URL(request.url).origin;
  if (origin !== env.SITE_ORIGIN && origin !== self) {
    log('bad-origin');
    return reply(403, t('blocked'));
  }

  const ip = request.headers.get('cf-connecting-ip') ?? 'unknown';
  const { success: withinLimit } = await env.CONTACT_RL.limit({ key: ip });
  if (!withinLimit) {
    log('rate-limited');
    return reply(429, t('rateLimited'));
  }

  const form = await request.formData();
  const field = (key: string) => String(form.get(key) ?? '').trim();
  if (field('company')) {
    log('honeypot');
    return reply(200, THANKS);
  }

  const name = field('name');
  const email = field('email');
  const message = field('message');
  const errors: Record<string, string> = {};
  if (name.length < LIMITS.name[0] || name.length > LIMITS.name[1]) errors.name = t('nameError');
  if (!EMAIL.test(email) || email.length > LIMITS.email[1]) errors.email = t('emailError');
  if (message.length < LIMITS.message[0] || message.length > LIMITS.message[1])
    errors.message = t('messageError');
  if (Object.keys(errors).length) {
    log('invalid');
    return reply(400, t('checkFields'), { errors });
  }

  const secret = env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    log('turnstile-unconfigured');
    return reply(502, t('sendFailed').replace('{direct}', DIRECT));
  }
  if (!(await verifyTurnstile(secret, field('cf-turnstile-response'), ip))) {
    log('turnstile-failed');
    return reply(400, t('turnstileFailed'));
  }

  if (env.CONTACT_DRY_RUN === '1' || !env.RESEND_API_KEY) {
    log('dry-run');
    return reply(200, THANKS);
  }

  const sent = await sendContactEmail({
    apiKey: env.RESEND_API_KEY,
    to: env.CONTACT_TO,
    replyTo: email,
    name,
    message,
    requestId,
    version,
  });
  if (!sent.ok) {
    log('resend-failed', { status: sent.status });
    return reply(502, t('sendFailed').replace('{direct}', DIRECT));
  }
  log('sent', { resendId: sent.id });
  return reply(200, THANKS);
};

export const ALL: APIRoute = () =>
  new Response('Method not allowed', { status: 405, headers: { allow: 'POST' } });

function referrerOrigin(request: Request) {
  const referer = request.headers.get('referer');
  if (!referer) return '';
  try {
    return new URL(referer).origin;
  } catch {
    return '';
  }
}

function page(
  title: string,
  message: string,
  site?: { name: string; footerLinks: { back: string } },
) {
  const name = site?.name ?? '';
  const back = site?.footerLinks.back ?? 'Back';
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escapeHtml(title)} · ${escapeHtml(name)}</title></head>
<body style="margin:0;background:#1b0f0b;color:#ebe6d8;font:19px/1.6 Barlow,system-ui,sans-serif;display:grid;place-items:center;min-height:100vh;padding:24px;box-sizing:border-box">
<main style="max-width:560px"><h1 style="font-family:'Barlow Condensed',sans-serif;text-transform:uppercase;font-size:56px;line-height:.95;margin:0 0 16px">${title}</h1>
<p>${escapeHtml(message)}</p><p><a href="/#contact" style="color:#ff7a1a">${escapeHtml(back)}</a></p></main></body></html>`;
}

function escapeHtml(text: string) {
  return text.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}
