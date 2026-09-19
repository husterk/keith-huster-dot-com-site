# 04 · Contact form

Purpose: let a recruiter or hiring manager reach you without leaving the page, with spam kept out and no third-party form service. It also gives the colophon something real to describe (a Worker endpoint, Turnstile, Resend, rate limiting).

## User experience

- Lives in the Contact section beside the email / LinkedIn / GitHub buttons; the `mailto:` button stays as the fallback.
- Fields: name, email, message. A hidden honeypot field (`company`) that humans never see. The Turnstile widget renders in managed mode (invisible for most people, a checkbox only when Cloudflare is unsure).
- Works without JavaScript: a plain `<form method="post" action="/api/contact">`; the endpoint returns an HTML thank-you (or error) page in that case. With JavaScript, a small script submits with `fetch`, disables the button, and swaps the form for an inline confirmation. Errors are shown inline with the message preserved.
- Confirmation copy: "Thanks, your message is on its way. I reply to everything within a couple of days." Nothing else.

## Endpoint: `POST /api/contact`

`src/pages/api/contact.ts`, `export const prerender = false`. Bindings and secrets come from `import { env } from 'cloudflare:workers'` (adapter v14). Steps, in order, each failing fast:

1. **Method and content type**: accept `application/x-www-form-urlencoded` and `multipart/form-data`; anything else → 405/415.
2. **Origin check**: `Origin`/`Referer` must be `https://keithhuster.com` (or the preview URL pattern in non-production) → 403 otherwise.
3. **Rate limit**: `env.CONTACT_RL.limit({ key: clientIp })` (Workers rate-limiting binding, 5 per minute per IP) → 429 with a friendly page.
4. **Honeypot**: if `company` is non-empty, return the success page without sending (don't tell bots they failed).
5. **Validation**: name 1–100 chars, email syntactically valid, message 10–3000 chars, all trimmed → 400 with field errors.
6. **Turnstile**: POST `cf-turnstile-response` + `secret` + `remoteip` to `https://challenges.cloudflare.com/turnstile/v0/siteverify`; require `success: true` and matching `hostname` → 400 "please try again".
7. **Send** via Resend `POST https://api.resend.com/emails`: `from: "keithhuster.com <contact@keithhuster.com>"`, `to: env.CONTACT_TO`, `reply_to: <their email>`, `subject: "Site contact: <name>"`, plain-text body with name, email, message, timestamp, request id, and the Worker version (`env.CF_VERSION_METADATA` if bound) so preview submissions are distinguishable. Retry once on a 5xx.
8. Respond 200 (JSON `{ ok: true }` for fetch, HTML page for no-JS) or 502 with a message to email you directly.

Logging: `console.log` a single JSON line per request with `requestId`, outcome, and durations; never the message body or email address. Visible under Workers observability.

## Resend setup

- Add `keithhuster.com` as a sending domain in Resend; add the three DNS records (DKIM TXT, SPF/MX for the bounce subdomain, optional DMARC) in the Cloudflare zone. Verification takes minutes.
- Create an API key with **sending access only**, restricted to that domain. Store it in 1Password; the deploy workflow syncs it to the Worker.
- Sending only to yourself keeps you comfortably inside the free tier.

## Turnstile setup

- Create a widget for `keithhuster.com` (managed mode). The site key goes in `site.yaml` (public); the secret goes to 1Password.
- For local dev and CI, use Cloudflare's testing keys (`1x0000...` site key always passes; `1x0000...` secret always verifies) via `.dev.vars` and the CI environment, so the Playwright test can submit the form end-to-end against `wrangler dev`.

## Failure modes and what the user sees

| Failure | Behaviour |
|---|---|
| Turnstile script blocked (privacy extension) | Form still submits; endpoint rejects with "please try again or email me directly" and the mailto link. Acceptable; these users are rare and have the email. |
| Resend outage | 502 page/inline error with the mailto link; the message text is preserved in the form. Logged. |
| Rate limited | 429 with a plain explanation. |
| JS disabled | Full-page responses; everything still works. |

## Tests

- Playwright (`tests/smoke.spec.ts`): submit a valid message with the Turnstile test key against `astro preview` with `RESEND_API_KEY` unset → endpoint takes a "dry run" path (`env.CONTACT_DRY_RUN = "1"` in CI) and returns 200 without calling Resend; submit an empty message → 400 with the inline error; fill the honeypot → 200 and no send.
- No test hits the real Resend API. After the first production deploy, send yourself one real message by hand.
