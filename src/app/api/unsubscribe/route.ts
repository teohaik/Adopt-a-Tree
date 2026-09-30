import { NextRequest, NextResponse } from 'next/server';
import { initDatabase, addEmailOptOut } from '@/lib/db';
import { verifyUnsubscribeToken } from '@/lib/unsubscribe';

// GET only shows the confirmation page: mail scanners that prefetch links must not unsubscribe anyone.
export async function GET(request: NextRequest) {
  const url = new URL('/unsubscribe', request.url);
  url.search = new URL(request.url).search;
  return NextResponse.redirect(url);
}

// POST performs the opt-out. Handles both the page's JSON body and the mail client's
// one-click request (List-Unsubscribe-Post), where e and t come from the query string.
export async function POST(request: NextRequest) {
  try {
    const params = new URL(request.url).searchParams;
    let email = params.get('e');
    let token = params.get('t');

    if (!email || !token) {
      const body = await request.json().catch(() => ({}));
      email = body.e ?? null;
      token = body.t ?? null;
    }

    if (!email || !token || !(await verifyUnsubscribeToken(email, token))) {
      return NextResponse.json({ error: 'Invalid link' }, { status: 400 });
    }

    await initDatabase();
    await addEmailOptOut(email);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error unsubscribing:', error);
    return NextResponse.json({ error: 'Failed to unsubscribe' }, { status: 500 });
  }
}
