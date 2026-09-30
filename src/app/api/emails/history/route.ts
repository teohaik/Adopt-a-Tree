import { NextRequest, NextResponse } from 'next/server';
import { initDatabase, getEmailBroadcasts } from '@/lib/db';
import { verifyApiAuth } from '@/lib/apiAuth';

export async function GET(request: NextRequest) {
  if (!(await verifyApiAuth(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    await initDatabase();
    return NextResponse.json(await getEmailBroadcasts());
  } catch (error) {
    console.error('Error fetching broadcasts:', error);
    return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 });
  }
}
