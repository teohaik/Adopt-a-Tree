import { NextRequest } from 'next/server';
import { SESSION_COOKIE_NAME, verifySessionToken } from './auth';

/**
 * Verify admin authentication in API routes
 * Returns true if the request has a valid admin session
 */
export async function verifyApiAuth(request: NextRequest): Promise<boolean> {
  try {
    // Get session cookie from request
    const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME);

    if (!sessionCookie) {
      return false;
    }

    // Verify the session token
    const tokenData = await verifySessionToken(sessionCookie.value);

    return tokenData !== null;
  } catch (error) {
    console.error('Error verifying API authentication:', error);
    return false;
  }
}
