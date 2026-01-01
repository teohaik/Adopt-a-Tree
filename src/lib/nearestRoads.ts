/**
 * Calculate distance between two points using Haversine formula
 */
function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

/**
 * Find the two most distant points in a polygon
 */
export function findMostDistantPoints(
  coordinates: Array<{ lat: number; lng: number }>
): [{ lat: number; lng: number }, { lat: number; lng: number }] {
  if (coordinates.length < 2) {
    throw new Error('Need at least 2 points to find distance');
  }

  let maxDistance = 0;
  let point1 = coordinates[0];
  let point2 = coordinates[1];

  // Compare all pairs of points to find the most distant
  for (let i = 0; i < coordinates.length; i++) {
    for (let j = i + 1; j < coordinates.length; j++) {
      const distance = calculateDistance(
        coordinates[i].lat,
        coordinates[i].lng,
        coordinates[j].lat,
        coordinates[j].lng
      );

      if (distance > maxDistance) {
        maxDistance = distance;
        point1 = coordinates[i];
        point2 = coordinates[j];
      }
    }
  }

  return [point1, point2];
}

/**
 * Reverse geocode a coordinate using Google Maps Geocoding API
 * Returns the street address or null if not found
 */
export async function reverseGeocode(
  lat: number,
  lng: number
): Promise<string | null> {
  try {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.error('Google Maps API key not found');
      return null;
    }

    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}&language=el`;
    const response = await fetch(url);

    if (!response.ok) {
      console.error('Geocoding API error:', response.statusText);
      return null;
    }

    const data = await response.json();

    if (data.status !== 'OK' || !data.results || data.results.length === 0) {
      console.error('Geocoding API status:', data.status);
      console.error('Error message:', data.error_message || 'No error message');
      console.error('Full response:', JSON.stringify(data));
      return null;
    }

    // Find the first result that has a street address
    for (const result of data.results) {
      // Look for route (street name) and street_number
      const routeComponent = result.address_components?.find(
        (comp: any) => comp.types.includes('route')
      );
      const streetNumberComponent = result.address_components?.find(
        (comp: any) => comp.types.includes('street_number')
      );

      if (routeComponent) {
        const streetName = routeComponent.long_name;
        const streetNumber = streetNumberComponent?.long_name || '';

        return streetNumber
          ? `${streetName} ${streetNumber}`
          : streetName;
      }
    }

    // If no route found, use the formatted address
    return data.results[0].formatted_address;
  } catch (error) {
    console.error('Error in reverse geocoding:', error);
    return null;
  }
}

/**
 * Calculate the nearest roads for a zone
 * Finds the two most distant points and geocodes them
 */
export async function calculateNearestRoads(
  coordinates: Array<{ lat: number; lng: number }>
): Promise<string> {
  try {
    if (coordinates.length < 3) {
      return 'Insufficient coordinates';
    }

    // Find the two most distant points
    const [point1, point2] = findMostDistantPoints(coordinates);

    // Geocode both points
    const [address1, address2] = await Promise.all([
      reverseGeocode(point1.lat, point1.lng),
      reverseGeocode(point2.lat, point2.lng),
    ]);

    // Format the result
    if (address1 && address2) {
      return `${address1} - ${address2}`;
    } else if (address1) {
      return address1;
    } else if (address2) {
      return address2;
    } else {
      return 'Unable to determine nearest roads';
    }
  } catch (error) {
    console.error('Error calculating nearest roads:', error);
    return 'Error calculating nearest roads';
  }
}
