import { NextRequest, NextResponse } from 'next/server';
import {
  createPlantingZone,
  getAllPlantingZones,
  getEnabledPlantingZones,
  updatePlantingZone,
  deletePlantingZone,
  togglePlantingZone,
  initDatabase
} from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    await initDatabase();

    const { searchParams } = new URL(request.url);
    const enabledOnly = searchParams.get('enabled') === 'true';

    const zones = enabledOnly
      ? await getEnabledPlantingZones()
      : await getAllPlantingZones();

    return NextResponse.json(zones);
  } catch (error) {
    console.error('Error fetching zones:', error);
    return NextResponse.json(
      { error: 'Failed to fetch zones' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await initDatabase();

    const body = await request.json();
    const { name, description, coordinates } = body;

    // Validate input
    if (!name || !coordinates || !Array.isArray(coordinates) || coordinates.length < 3) {
      return NextResponse.json(
        { error: 'Invalid input. Name and at least 3 coordinates are required.' },
        { status: 400 }
      );
    }

    // Validate coordinates format
    const validCoordinates = coordinates.every(
      coord => typeof coord.lat === 'number' && typeof coord.lng === 'number'
    );

    if (!validCoordinates) {
      return NextResponse.json(
        { error: 'Invalid coordinates format' },
        { status: 400 }
      );
    }

    const zone = await createPlantingZone(name, description || '', coordinates);

    return NextResponse.json(zone, { status: 201 });
  } catch (error) {
    console.error('Error creating zone:', error);
    return NextResponse.json(
      { error: 'Failed to create zone' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await initDatabase();

    const body = await request.json();
    const { id, name, description, coordinates, enabled } = body;

    if (!id || !name || !coordinates || !Array.isArray(coordinates) || coordinates.length < 3) {
      return NextResponse.json(
        { error: 'Invalid input' },
        { status: 400 }
      );
    }

    const zone = await updatePlantingZone(
      id,
      name,
      description || '',
      coordinates,
      enabled !== undefined ? enabled : true
    );

    return NextResponse.json(zone);
  } catch (error) {
    console.error('Error updating zone:', error);
    return NextResponse.json(
      { error: 'Failed to update zone' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await initDatabase();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Zone ID is required' },
        { status: 400 }
      );
    }

    await deletePlantingZone(parseInt(id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting zone:', error);
    return NextResponse.json(
      { error: 'Failed to delete zone' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await initDatabase();

    const body = await request.json();
    const { id, enabled } = body;

    if (!id || enabled === undefined) {
      return NextResponse.json(
        { error: 'Zone ID and enabled status are required' },
        { status: 400 }
      );
    }

    const zone = await togglePlantingZone(id, enabled);

    return NextResponse.json(zone);
  } catch (error) {
    console.error('Error toggling zone:', error);
    return NextResponse.json(
      { error: 'Failed to toggle zone' },
      { status: 500 }
    );
  }
}
