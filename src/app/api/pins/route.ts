import { NextRequest, NextResponse } from 'next/server';
import { createTreePin, getAllTreePins, initDatabase } from '@/lib/db';
import { sendConfirmationEmail } from '@/lib/email';

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

    // Create the pin in the database
    const pin = await createTreePin(
      parseFloat(latitude),
      parseFloat(longitude),
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
