import { NextRequest, NextResponse } from 'next/server';
import { getAllTreeTypes, createTreeType, updateTreeType, deleteTreeType, initDatabase } from '@/lib/db';
import { verifyApiAuth } from '@/lib/apiAuth';

export async function GET() {
  try {
    await initDatabase();
    const types = await getAllTreeTypes();
    return NextResponse.json(types);
  } catch (error) {
    console.error('Error fetching tree types:', error);
    return NextResponse.json({ error: 'Failed to fetch tree types' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!(await verifyApiAuth(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await initDatabase();
    const { name, description } = await request.json();

    if (!name?.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const type = await createTreeType(name.trim(), description?.trim());
    return NextResponse.json(type, { status: 201 });
  } catch (error: any) {
    if (error.message?.includes('duplicate key') || error.message?.includes('unique')) {
      return NextResponse.json({ error: 'Αυτό το είδος υπάρχει ήδη' }, { status: 409 });
    }
    console.error('Error creating tree type:', error);
    return NextResponse.json({ error: 'Failed to create tree type' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  if (!(await verifyApiAuth(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await initDatabase();
    const { id, name, description } = await request.json();

    if (!id || !name?.trim()) {
      return NextResponse.json({ error: 'ID and name are required' }, { status: 400 });
    }

    const type = await updateTreeType(id, name.trim(), description?.trim());
    return NextResponse.json(type);
  } catch (error: any) {
    if (error.message?.includes('duplicate key') || error.message?.includes('unique')) {
      return NextResponse.json({ error: 'Αυτό το είδος υπάρχει ήδη' }, { status: 409 });
    }
    console.error('Error updating tree type:', error);
    return NextResponse.json({ error: 'Failed to update tree type' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  if (!(await verifyApiAuth(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await initDatabase();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing type ID' }, { status: 400 });
    }

    await deleteTreeType(parseInt(id, 10));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting tree type:', error);
    return NextResponse.json({ error: 'Failed to delete tree type' }, { status: 500 });
  }
}
