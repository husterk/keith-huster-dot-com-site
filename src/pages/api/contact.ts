import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { verifyTurnstile } from '../../lib/turnstile';
import { sendContactEmail } from '../../lib/resend';

export const prerender = false;

const LIMITS = { name: [1, 100], email: [3, 254], message: [10, 3000] } as const;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const THANKS = 'Thanks, your message is on its way. I reply to everything within a couple of days.';
const DIRECT = `Please email me directly at ${env.CONTACT_TO}.`;

export const POST: APIRoute = async ({ request }) => {
  const requestId = crypto.randomUUID();
  const version = env.CF_VERSION_METADATA?.id ?? 'dev';
  const wantsJson = (request.headers.get('accept') ?? '').includes('application/json');
  const started = Date.now();

  const reply = (status: number, message: string, extra: Record<string, unknown> = {}) =>
    wantsJson
      ? Response.json({ ok: status < 300, message, ...extra }, { status })
      : new Response(page(status < 300 ? 'Thanks' : 'Sorry', message), {
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
    return reply(415, 'Unsupported form encoding.');
  }

  const origin = request.headers.get('origin') ?? referrerOrigin(request);
  const self = new URL(request.url).origin;
  if (origin !== env.SITE_ORIGIN && origin !== self) {
    log('bad-origin');
    return reply(403, 'Request blocked.');
  }

  const ip = request.headers.get('cf-connecting-ip') ?? 'unknown';
  const { success: withinLimit } = await env.CONTACT_RL.limit({ key: ip });
  if (!withinLimit) {
    log('rate-limited');
    return reply(429, 'Too many messages in a short time. Please try again in a minute.');
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
  if (name.length < LIMITS.name[0] || name.length > LIMITS.name[1])
    errors.name = 'Please add your name.';
  if (!EMAIL.test(email) || email.length > LIMITS.email[1])
    errors.email = "That email address doesn't look right.";
  if (message.length < LIMITS.message[0] || message.length > LIMITS.message[1])
    errors.message = 'Please write at least a sentence (and under 3,000 characters).';
  if (Object.keys(errors).length) {
    log('invalid');
    return reply(400, 'Please check the highlighted fields.', { errors });
  }

  const secret = env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    log('turnstile-unconfigured');
    return reply(502, `Something went wrong sending your message. ${DIRECT}`);
  }
  if (!(await verifyTurnstile(secret, field('cf-turnstile-response'), ip))) {
    log('turnstile-failed');
    return reply(400, `The anti-spam check didn't pass. Please try again, or email me directly.`);
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
    return reply(502, `Something went wrong sending your message. ${DIRECT}`);
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

function page(title: string, message: string) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${title} · Keith Huster</title></head>
<body style="margin:0;background:#1b0f0b;color:#ebe6d8;font:19px/1.6 Barlow,system-ui,sans-serif;display:grid;place-items:center;min-height:100vh;padding:24px;box-sizing:border-box">
<main style="max-width:560px"><h1 style="font-family:'Barlow Condensed',sans-serif;text-transform:uppercase;font-size:56px;line-height:.95;margin:0 0 16px">${title}</h1>
<p>${escapeHtml(message)}</p><p><a href="/#contact" style="color:#ff7a1a">Back to the site</a></p></main></body></html>`;
}

function escapeHtml(text: string) {
  return text.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}
