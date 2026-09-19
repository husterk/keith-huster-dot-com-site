// src/pages/api/contact.ts — the only server route on the site. See implementation-plan/04-contact-form.md.
import type { APIRoute } from 'astro';
import { env as cfEnv } from 'cloudflare:workers';   // @astrojs/cloudflare v14: bindings/vars/secrets come from here
export const prerender = false;

type Env = {
  CONTACT_TO: string;
  SITE_ORIGIN: string;
  RESEND_API_KEY?: string;
  TURNSTILE_SECRET_KEY?: string;
  CONTACT_DRY_RUN?: string;
  CONTACT_RL: { limit: (o: { key: string }) => Promise<{ success: boolean }> };
  CF_VERSION_METADATA?: { id: string; tag?: string };
};

const LIMITS = { name: [1, 100], email: [3, 254], message: [10, 3000] } as const;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const POST: APIRoute = async ({ request }) => {
  const env = cfEnv as unknown as Env;
  const requestId = crypto.randomUUID();
  const wantsJson = (request.headers.get('accept') ?? '').includes('application/json');
  const reply = (status: number, msg: string, extra: Record<string, unknown> = {}) =>
    wantsJson
      ? new Response(JSON.stringify({ ok: status < 300, message: msg, ...extra }), { status, headers: { 'content-type': 'application/json' } })
      : new Response(page(status < 300 ? 'Thanks' : 'Sorry', msg), { status, headers: { 'content-type': 'text/html;charset=utf-8' } });
  const log = (outcome: string, extra: Record<string, unknown> = {}) =>
    console.log(JSON.stringify({ requestId, outcome, version: env.CF_VERSION_METADATA?.id, ...extra }));

  // 1. Origin
  const origin = request.headers.get('origin') ?? new URL(request.headers.get('referer') ?? 'http://x').origin;
  const allowed = origin === env.SITE_ORIGIN || /\.workers\.dev$/.test(new URL(origin).hostname);
  if (!allowed) { log('bad-origin'); return reply(403, 'Request blocked.'); }

  // 2. Rate limit (per IP, 5/min — see wrangler.jsonc)
  const ip = request.headers.get('cf-connecting-ip') ?? 'unknown';
  const { success } = await env.CONTACT_RL.limit({ key: ip });
  if (!success) { log('rate-limited'); return reply(429, 'Too many messages in a short time. Please try again in a minute.'); }

  // 3. Parse + honeypot
  const form = await request.formData();
  const get = (k: string) => String(form.get(k) ?? '').trim();
  if (get('company')) { log('honeypot'); return reply(200, 'Thanks, your message is on its way.'); }

  // 4. Validate
  const name = get('name'), email = get('email'), message = get('message');
  const errors: Record<string, string> = {};
  if (name.length < LIMITS.name[0] || name.length > LIMITS.name[1]) errors.name = 'Please add your name.';
  if (!EMAIL.test(email) || email.length > LIMITS.email[1]) errors.email = 'That email address doesn\'t look right.';
  if (message.length < LIMITS.message[0] || message.length > LIMITS.message[1]) errors.message = 'Please write at least a sentence (and under 3,000 characters).';
  if (Object.keys(errors).length) { log('invalid'); return reply(400, 'Please check the highlighted fields.', { errors }); }

  // 5. Turnstile
  const token = get('cf-turnstile-response');
  const verify = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ secret: env.TURNSTILE_SECRET_KEY, response: token, remoteip: ip }),
  }).then(r => r.json() as Promise<{ success: boolean; hostname?: string }>).catch(() => ({ success: false }));
  if (!verify.success) { log('turnstile-failed'); return reply(400, 'The anti-spam check didn\'t pass. Please try again, or email me directly.'); }

  // 6. Send
  if (env.CONTACT_DRY_RUN === '1' || !env.RESEND_API_KEY) { log('dry-run'); return reply(200, 'Thanks, your message is on its way.'); }
  const send = () => fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { authorization: `Bearer ${env.RESEND_API_KEY}`, 'content-type': 'application/json' },
    body: JSON.stringify({
      from: 'keithhuster.com <contact@keithhuster.com>',
      to: [env.CONTACT_TO],
      reply_to: email,
      subject: `Site contact: ${name}`,
      text: `${message}\n\n—\nFrom: ${name} <${email}>\nWhen: ${new Date().toISOString()}\nRequest: ${requestId}\nVersion: ${env.CF_VERSION_METADATA?.id ?? 'dev'}`,
    }),
  });
  let res = await send();
  if (res.status >= 500) res = await send();
  if (!res.ok) { log('resend-failed', { status: res.status }); return reply(502, 'Something went wrong sending your message. Please email me directly at husterk@gmail.com.'); }
  const { id } = await res.json() as { id: string };
  log('sent', { resendId: id });
  return reply(200, 'Thanks, your message is on its way. I reply to everything within a couple of days.');
};

export const ALL: APIRoute = () => new Response('Method not allowed', { status: 405 });

function page(title: string, msg: string) {
  return `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${title} · Keith Huster</title>
<body style="margin:0;background:#1b0f0b;color:#ebe6d8;font:19px/1.6 Barlow,system-ui,sans-serif;display:grid;place-items:center;min-height:100vh;padding:24px">
<main style="max-width:560px"><h1 style="font-family:'Barlow Condensed',sans-serif;text-transform:uppercase;font-size:56px;line-height:.95;margin:0 0 16px">${title}</h1>
<p>${msg}</p><p><a href="/" style="color:#ff7a1a">Back to the site</a></p></main>`;
}
