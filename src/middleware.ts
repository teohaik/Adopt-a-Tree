import { NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE_NAME, verifySessionToken } from './lib/auth';

export async function middleware(request: NextRequest) {
  // Allow access to the login page without authentication
  if (request.nextUrl.pathname === '/admin/login') {
    return NextResponse.next();
  }

  // Check for session cookie
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME);

  // Verify session token
  const tokenData = sessionCookie ? await verifySessionToken(sessionCookie.value) : null;
  const isAuthenticated = tokenData !== null;

  if (!isAuthenticated) {
    // Redirect to login page with returnUrl parameter
    const loginUrl = new URL('/admin/login', request.url);
    loginUrl.searchParams.set('returnUrl', request.nextUrl.pathname + request.nextUrl.search);
    return NextResponse.redirect(loginUrl);
  }

  // Allow the request to proceed
  return NextResponse.next();
}

// Configure which routes to apply middleware to
export const config = {
  matcher: '/admin/:path*',
};
