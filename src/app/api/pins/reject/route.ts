import { NextRequest, NextResponse } from 'next/server';
import { getTreePinById, deleteTreePin, initDatabase } from '@/lib/db';
import { verifyApiAuth } from '@/lib/apiAuth';
import { sendRejectionEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  if (!(await verifyApiAuth(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await initDatabase();

    const body = await request.json();
    const { id, reason } = body;

    if (!id || !reason?.trim()) {
      return NextResponse.json({ error: 'Missing id or reason' }, { status: 400 });
    }

    const pin = await getTreePinById(parseInt(id, 10));
    if (!pin) {
      return NextResponse.json({ error: 'Pin not found' }, { status: 404 });
    }

    await sendRejectionEmail(pin.user_email, pin.user_name, pin.tree_label, reason.trim());
    await deleteTreePin(pin.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error rejecting pin:', error);
    return NextResponse.json({ error: 'Failed to reject adoption' }, { status: 500 });
  }
}
