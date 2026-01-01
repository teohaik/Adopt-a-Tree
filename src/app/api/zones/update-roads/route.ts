import { NextResponse } from 'next/server';
import { initDatabase, getAllPlantingZones, updatePlantingZone } from '@/lib/db';
import { calculateNearestRoads } from '@/lib/nearestRoads';

export async function POST() {
  try {
    await initDatabase();

    // Get all zones
    const zones = await getAllPlantingZones();

    console.log(`Updating ${zones.length} zones with nearest roads...`);

    // Update each zone with nearest roads
    const results = [];
    for (const zone of zones) {
      try {
        const nearestRoads = await calculateNearestRoads(zone.coordinates);

        await updatePlantingZone(
          zone.id,
          zone.name,
          zone.description,
          zone.coordinates,
          zone.enabled,
          nearestRoads
        );

        results.push({
          id: zone.id,
          name: zone.name,
          nearestRoads,
          success: true
        });

        console.log(`✅ Updated zone ${zone.id} (${zone.name}): ${nearestRoads}`);
      } catch (error) {
        console.error(`❌ Failed to update zone ${zone.id}:`, error);
        results.push({
          id: zone.id,
          name: zone.name,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return NextResponse.json({
      message: 'Zones updated successfully',
      results
    });
  } catch (error) {
    console.error('Error updating zones:', error);
    return NextResponse.json(
      { error: 'Failed to update zones' },
      { status: 500 }
    );
  }
}
