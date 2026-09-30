import { NextRequest, NextResponse } from 'next/server';
import { createTreePin, getAllTreePins, deleteTreePin, updateTreePinType, updateTreePinExists, updateTreePinLocation, updateTreePinContact, initDatabase, getEnabledPlantingZones } from '@/lib/db';
import { verifyApiAuth } from '@/lib/apiAuth';
import { sendConfirmationEmail } from '@/lib/email';
import { isPointInPlantingZone, getZoneForPoint } from '@/lib/plantingZones';
import { translations, Language } from '@/lib/i18n/translations';

export async function POST(request: NextRequest) {
  try {
    // Initialize database if needed
    await initDatabase();

    const body = await request.json();
    const { latitude, longitude, name, email, phone, label, lang: rawLang, treeExists } = body;
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

    // Find which zone the pin belongs to
    const zone = getZoneForPoint(lat, lng, zones);

    // Create the pin in the database
    const pin = await createTreePin(
      lat,
      lng,
      name,
      email,
      label,
      zone?.id,
      treeExists !== false,
      phone || undefined,
      lang
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

    // Admins get full records. The public map only gets what it needs to draw markers:
    // no names, emails or phone numbers. `mine` lets a visitor see their own trees
    // without the addresses of everyone else being sent to the browser.
    if (await verifyApiAuth(request)) {
      return NextResponse.json(pins);
    }

    const email = new URL(request.url).searchParams.get('email')?.trim().toLowerCase();
    return NextResponse.json(
      pins.map(p => ({
        id: p.id,
        latitude: p.latitude,
        longitude: p.longitude,
        tree_label: p.tree_label,
        mine: !!email && p.user_email.trim().toLowerCase() === email,
      }))
    );
  } catch (error) {
    console.error('Error fetching pins:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pins' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  if (!(await verifyApiAuth(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await initDatabase();
    const body = await request.json();
    const { id, tree_type_id, tree_exists, latitude, longitude, user_name, user_email, user_phone, lang: newLang } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing pin ID' }, { status: 400 });
    }

    if (user_name !== undefined || user_email !== undefined || user_phone !== undefined) {
      const name = String(user_name ?? '').trim();
      const email = String(user_email ?? '').trim();
      const phone = String(user_phone ?? '').trim();
      if (!name || !email) {
        return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
      }
      await updateTreePinContact(id, name, email, phone || null, newLang === 'en' ? 'en' : newLang === 'el' ? 'el' : undefined);
    } else if (latitude !== undefined && longitude !== undefined) {
      await updateTreePinLocation(id, parseFloat(latitude), parseFloat(longitude));
    } else if (tree_exists !== undefined) {
      await updateTreePinExists(id, Boolean(tree_exists));
    } else {
      await updateTreePinType(id, tree_type_id || null);
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating pin:', error);
    return NextResponse.json({ error: 'Failed to update pin' }, { status: 500 });
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
