const VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

export async function verifyTurnstile(secret: string, token: string, remoteip: string) {
  try {
    const res = await fetch(VERIFY_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ secret, response: token, remoteip }),
    });
    const data = (await res.json()) as { success: boolean; hostname?: string };
    return data.success === true;
  } catch {
    return false;
  }
}
