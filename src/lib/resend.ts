export interface ContactEmail {
  apiKey: string;
  to: string;
  replyTo: string;
  name: string;
  message: string;
  requestId: string;
  version: string;
}

export async function sendContactEmail(email: ContactEmail) {
  const body = JSON.stringify({
    from: 'keithhuster.com <contact@keithhuster.com>',
    to: [email.to],
    reply_to: email.replyTo,
    subject: `Site contact: ${email.name}`,
    text: `${email.message}\n\n--\nFrom: ${email.name} <${email.replyTo}>\nWhen: ${new Date().toISOString()}\nRequest: ${email.requestId}\nVersion: ${email.version}`,
  });
  const send = () =>
    fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { authorization: `Bearer ${email.apiKey}`, 'content-type': 'application/json' },
      body,
    });
  let res = await send();
  if (res.status >= 500) res = await send();
  if (!res.ok) return { ok: false as const, status: res.status };
  const { id } = (await res.json()) as { id: string };
  return { ok: true as const, id };
}
