// Ορισμός επιτρεπόμενων περιοχών για φύτευση δέντρων
// Κάθε ζώνη ορίζεται με πολύγωνο (array of coordinates)

export interface PlantingZone {
  id: number;
  name: string;
  description: string;
  coordinates: Array<{ lat: number; lng: number }>;
  enabled: boolean;
}

// Φόρτωση ζωνών από τη βάση δεδομένων
let cachedZones: PlantingZone[] | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 5000; // 5 seconds cache

export async function loadPlantingZones(): Promise<PlantingZone[]> {
  const now = Date.now();

  // Return cached zones if still valid
  if (cachedZones && (now - lastFetchTime) < CACHE_DURATION) {
    return cachedZones;
  }

  try {
    const response = await fetch('/api/zones?enabled=true', {
      cache: 'no-store'
    });

    if (response.ok) {
      const zones = await response.json();
      cachedZones = zones;
      lastFetchTime = now;
      return zones;
    }
  } catch (error) {
    console.error('Failed to load planting zones:', error);
  }

  // Return empty array if fetch fails or no zones exist
  return cachedZones || [];
}

// Για server-side χρήση
export async function getPlantingZonesFromDB() {
  try {
    const { getEnabledPlantingZones } = await import('@/lib/db');
    return await getEnabledPlantingZones();
  } catch (error) {
    console.error('Failed to load zones from DB:', error);
    return [];
  }
}

// Έλεγχος αν ένα σημείο είναι μέσα σε επιτρεπόμενη ζώνη
export function isPointInPlantingZone(
  lat: number,
  lng: number,
  zones: PlantingZone[]
): boolean {
  // Αν δεν υπάρχουν ενεργές ζώνες, επέτρεψε παντού (για testing)
  const activeZones = zones.filter(zone => zone.enabled);
  if (activeZones.length === 0) {
    return true;
  }

  // Έλεγξε αν το σημείο είναι μέσα σε κάποια ζώνη
  return activeZones.some(zone => isPointInPolygon(lat, lng, zone.coordinates));
}

// Ray-casting algorithm για έλεγχο σημείου μέσα σε πολύγωνο
function isPointInPolygon(
  lat: number,
  lng: number,
  polygon: Array<{ lat: number; lng: number }>
): boolean {
  let inside = false;
  const x = lng;
  const y = lat;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].lng;
    const yi = polygon[i].lat;
    const xj = polygon[j].lng;
    const yj = polygon[j].lat;

    const intersect =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;

    if (intersect) {
      inside = !inside;
    }
  }

  return inside;
}

// Βρες σε ποια ζώνη ανήκει ένα σημείο (αν ανήκει)
export function getZoneForPoint(
  lat: number,
  lng: number,
  zones: PlantingZone[]
): PlantingZone | null {
  const activeZones = zones.filter(zone => zone.enabled);

  for (const zone of activeZones) {
    if (isPointInPolygon(lat, lng, zone.coordinates)) {
      return zone;
    }
  }

  return null;
}
