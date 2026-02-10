import { NextRequest, NextResponse } from 'next/server';
import { createTreePin, getAllTreePins, deleteTreePin, initDatabase, getEnabledPlantingZones } from '@/lib/db';
import { verifyApiAuth } from '@/lib/apiAuth';
import { sendConfirmationEmail } from '@/lib/email';
import { isPointInPlantingZone, getZoneForPoint } from '@/lib/plantingZones';
import { translations, Language } from '@/lib/i18n/translations';

export async function POST(request: NextRequest) {
  try {
    // Initialize database if needed
    await initDatabase();

    const body = await request.json();
    const { latitude, longitude, name, email, label, lang: rawLang } = body;
    const lang: Language = rawLang === 'en' ? 'en' : 'el';
    const t = translations[lang];

    // Validate input
    if (!latitude || !longitude || !name || !email || !label) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate location is within planting zones
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    // Load zones from database
    const zones = await getEnabledPlantingZones();

    if (!isPointInPlantingZone(lat, lng, zones)) {
      const zone = getZoneForPoint(lat, lng, zones);
      return NextResponse.json(
        {
          error: t.errorRestrictedZone,
          inZone: false,
          attemptedZone: zone?.name
        },
        { status: 403 }
      );
    }

    // Create the pin in the database
    const pin = await createTreePin(
      lat,
      lng,
      name,
      email,
      label
    );

    // Send confirmation email
    await sendConfirmationEmail(email, name, label, latitude, longitude, pin.id, lang);

    return NextResponse.json(pin, { status: 201 });
  } catch (error: any) {
    console.error('Error creating pin:', error);

    // Handle unique constraint violation (duplicate location)
    if (error.message?.includes('duplicate key')) {
      return NextResponse.json(
        { error: 'A tree has already been adopted at this location' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create pin' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Initialize database if needed
    await initDatabase();

    const pins = await getAllTreePins();
    return NextResponse.json(pins);
  } catch (error) {
    console.error('Error fetching pins:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pins' },
      { status: 500 }
    );
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
      return NextResponse.json({ error: 'Missing pin ID' }, { status: 400 });
    }

    await deleteTreePin(parseInt(id, 10));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting pin:', error);
    return NextResponse.json({ error: 'Failed to delete pin' }, { status: 500 });
  }
}
