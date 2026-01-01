// Session configuration
export const SESSION_COOKIE_NAME = 'admin_session';
export const SESSION_DURATION = 7 * 24 * 60 * 60; // 7 days in seconds

interface SessionToken {
  exp: number;      // Expiration timestamp
  iat: number;      // Issued at timestamp
  role: 'admin';    // Fixed role
}

/**
 * Verify password against the environment variable ADMIN_PASSWORD
 */
export function verifyPassword(password: string): boolean {
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    console.error('ADMIN_PASSWORD environment variable is not set');
    return false;
  }

  // Constant-time comparison to prevent timing attacks
  return timingSafeEqual(password, adminPassword);
}

/**
 * Create a signed session token
 */
export async function createSessionToken(): Promise<string> {
  const now = Math.floor(Date.now() / 1000);

  const token: SessionToken = {
    exp: now + SESSION_DURATION,
    iat: now,
    role: 'admin',
  };

  // Create token payload
  const payload = JSON.stringify(token);
  const base64Payload = base64UrlEncode(payload);

  // Sign the token
  const signature = await signToken(base64Payload);

  // Return token in format: payload.signature
  return `${base64Payload}.${signature}`;
}

/**
 * Verify and decode a session token
 * Returns the token payload if valid, null otherwise
 */
export async function verifySessionToken(token: string): Promise<SessionToken | null> {
  try {
    // Split token into payload and signature
    const parts = token.split('.');
    if (parts.length !== 2) {
      return null;
    }

    const [base64Payload, signature] = parts;

    // Verify signature
    const expectedSignature = await signToken(base64Payload);
    if (!timingSafeEqual(signature, expectedSignature)) {
      return null;
    }

    // Decode payload
    const payload = base64UrlDecode(base64Payload);
    const tokenData: SessionToken = JSON.parse(payload);

    // Check expiration
    const now = Math.floor(Date.now() / 1000);
    if (tokenData.exp < now) {
      return null;
    }

    // Verify role
    if (tokenData.role !== 'admin') {
      return null;
    }

    return tokenData;
  } catch (error) {
    console.error('Error verifying session token:', error);
    return null;
  }
}

/**
 * Sign a token payload using HMAC-SHA256 with Web Crypto API
 */
async function signToken(payload: string): Promise<string> {
  const secret = process.env.SESSION_SECRET;

  if (!secret) {
    throw new Error('SESSION_SECRET environment variable is not set');
  }

  // Import the secret key
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  // Sign the payload
  const data = encoder.encode(payload);
  const signature = await crypto.subtle.sign('HMAC', key, data);

  // Convert to base64url
  return arrayBufferToBase64Url(signature);
}

/**
 * Constant-time string comparison to prevent timing attacks
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return result === 0;
}

/**
 * Base64 URL encode a string
 */
function base64UrlEncode(str: string): string {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  return arrayBufferToBase64Url(data);
}

/**
 * Base64 URL decode a string
 */
function base64UrlDecode(str: string): string {
  const data = base64UrlToArrayBuffer(str);
  const decoder = new TextDecoder();
  return decoder.decode(data);
}

/**
 * Convert ArrayBuffer to base64url string
 */
function arrayBufferToBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64 = btoa(binary);
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

/**
 * Convert base64url string to ArrayBuffer
 */
function base64UrlToArrayBuffer(str: string): ArrayBuffer {
  // Convert base64url to base64
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');

  // Add padding if needed
  while (base64.length % 4) {
    base64 += '=';
  }

  // Decode base64
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  return bytes.buffer;
}
