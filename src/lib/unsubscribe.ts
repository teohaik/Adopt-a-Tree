// Signed unsubscribe tokens (HMAC-SHA256, Web Crypto) so nobody can opt out someone else's address.

async function sign(email: string): Promise<string> {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error('SESSION_SECRET environment variable is not set');

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  // "unsubscribe:" prefix keeps these signatures distinct from admin session tokens
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(`unsubscribe:${email.toLowerCase()}`));
  const bytes = new Uint8Array(signature);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

export async function createUnsubscribeToken(email: string): Promise<string> {
  return sign(email);
}

export async function verifyUnsubscribeToken(email: string, token: string): Promise<boolean> {
  try {
    const expected = await sign(email);
    if (expected.length !== token.length) return false;
    let result = 0;
    for (let i = 0; i < expected.length; i++) result |= expected.charCodeAt(i) ^ token.charCodeAt(i);
    return result === 0;
  } catch {
    return false;
  }
}

function appUrl(): string {
  return (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/$/, '');
}

export async function buildUnsubscribeUrls(email: string): Promise<{ page: string; api: string }> {
  const token = await createUnsubscribeToken(email);
  const query = `e=${encodeURIComponent(email)}&t=${encodeURIComponent(token)}`;
  return {
    page: `${appUrl()}/unsubscribe?${query}`,
    api: `${appUrl()}/api/unsubscribe?${query}`,
  };
}
