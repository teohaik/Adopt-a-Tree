import { NextRequest, NextResponse } from 'next/server';
import { createTreePin, getAllTreePins, initDatabase, getEnabledPlantingZones } from '@/lib/db';
import { sendConfirmationEmail } from '@/lib/email';
import { isPointInPlantingZone, getZoneForPoint } from '@/lib/plantingZones';

export async function POST(request: NextRequest) {
  try {
    // Initialize database if needed
    await initDatabase();

    const body = await request.json();
    const { latitude, longitude, name, email, label } = body;

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
          error: 'Η φύτευση δέντρων επιτρέπεται μόνο στις ορισμένες περιοχές που έχει καθορίσει ο Δήμος. Παρακαλώ επιλέξτε μια τοποθεσία εντός των πράσινων περιοχών.',
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
    await sendConfirmationEmail(email, name, label, latitude, longitude, pin.id);

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

export async function GET() {
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
