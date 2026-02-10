import { NextRequest, NextResponse } from 'next/server';
import { initDatabase, getPinsWithoutZone, updateTreePinZone, getEnabledPlantingZones } from '@/lib/db';
import { verifyApiAuth } from '@/lib/apiAuth';
import { getZoneForPoint } from '@/lib/plantingZones';

export async function POST(request: NextRequest) {
  if (!(await verifyApiAuth(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await initDatabase();

    const zones = await getEnabledPlantingZones();
    const pinsWithoutZone = await getPinsWithoutZone();

    let updated = 0;
    for (const pin of pinsWithoutZone) {
      const lat = typeof pin.latitude === 'string' ? parseFloat(pin.latitude) : pin.latitude;
      const lng = typeof pin.longitude === 'string' ? parseFloat(pin.longitude) : pin.longitude;
      const zone = getZoneForPoint(lat, lng, zones);
      if (zone) {
        await updateTreePinZone(pin.id, zone.id);
        updated++;
      }
    }

    return NextResponse.json({
      total: pinsWithoutZone.length,
      updated,
      skipped: pinsWithoutZone.length - updated,
    });
  } catch (error) {
    console.error('Error backfilling zones:', error);
    return NextResponse.json({ error: 'Failed to backfill zones' }, { status: 500 });
  }
}
