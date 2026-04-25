import { NextRequest, NextResponse } from 'next/server';
import {
  initDatabase,
  createZoneSuggestion,
  getAllZoneSuggestions,
  getZoneSuggestionById,
  deleteZoneSuggestion,
  updateZoneSuggestionStatus,
} from '@/lib/db';
import { verifyApiAuth } from '@/lib/apiAuth';
import { sendZoneApprovalEmail } from '@/lib/email';

export async function GET(request: NextRequest) {
  const isAdmin = await verifyApiAuth(request);
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await initDatabase();
  const suggestions = await getAllZoneSuggestions();
  return NextResponse.json(suggestions);
}

export async function POST(request: NextRequest) {
  try {
    await initDatabase();
    const body = await request.json();
    const { latitude, longitude, user_name, user_email, description } = body;

    if (!latitude || !longitude || !user_name || !user_email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const suggestion = await createZoneSuggestion(
      parseFloat(latitude),
      parseFloat(longitude),
      user_name,
      user_email,
      description
    );

    return NextResponse.json(suggestion, { status: 201 });
  } catch (error) {
    console.error('Failed to create zone suggestion:', error);
    return NextResponse.json({ error: 'Failed to submit suggestion' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const isAdmin = await verifyApiAuth(request);
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, status } = body;
    if (!id || !status) {
      return NextResponse.json({ error: 'Missing id or status' }, { status: 400 });
    }

    const suggestion = await getZoneSuggestionById(parseInt(id, 10));
    if (!suggestion) {
      return NextResponse.json({ error: 'Suggestion not found' }, { status: 404 });
    }

    await updateZoneSuggestionStatus(id, status);

    if (status === 'reviewed' && suggestion.status === 'pending') {
      await sendZoneApprovalEmail(
        suggestion.user_email,
        suggestion.user_name,
        Number(suggestion.latitude),
        Number(suggestion.longitude),
        suggestion.description
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update suggestion:', error);
    return NextResponse.json({ error: 'Failed to update suggestion' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const isAdmin = await verifyApiAuth(request);
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }

  await deleteZoneSuggestion(parseInt(id, 10));
  return NextResponse.json({ success: true });
}
