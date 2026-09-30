import { NextRequest, NextResponse } from 'next/server';
import { initDatabase, getOptedOutEmails } from '@/lib/db';
import { verifyApiAuth } from '@/lib/apiAuth';

export async function GET(request: NextRequest) {
  if (!(await verifyApiAuth(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    await initDatabase();
    return NextResponse.json(await getOptedOutEmails());
  } catch (error) {
    console.error('Error fetching opt-outs:', error);
    return NextResponse.json({ error: 'Failed to fetch opt-outs' }, { status: 500 });
  }
}
