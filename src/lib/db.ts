import { sql } from '@vercel/postgres';

export async function initDatabase() {
  await sql`
    CREATE TABLE IF NOT EXISTS tree_pins (
      id SERIAL PRIMARY KEY,
      latitude DECIMAL(10, 8) NOT NULL,
      longitude DECIMAL(11, 8) NOT NULL,
      user_name VARCHAR(255) NOT NULL,
      user_email VARCHAR(255) NOT NULL,
      tree_label VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(latitude, longitude)
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS planting_zones (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      coordinates JSONB NOT NULL,
      enabled BOOLEAN DEFAULT true,
      nearest_roads TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  // Add nearest_roads column if it doesn't exist (migration for existing tables)
  try {
    await sql`
      ALTER TABLE planting_zones
      ADD COLUMN IF NOT EXISTS nearest_roads TEXT
    `;
  } catch (error) {
    // Column might already exist, ignore error
  }
}

export interface TreePin {
  id: number;
  latitude: number;
  longitude: number;
  user_name: string;
  user_email: string;
  tree_label: string;
  created_at: Date;
}

export async function createTreePin(
  latitude: number,
  longitude: number,
  userName: string,
  userEmail: string,
  treeLabel: string
): Promise<TreePin> {
  const result = await sql`
    INSERT INTO tree_pins (latitude, longitude, user_name, user_email, tree_label)
    VALUES (${latitude}, ${longitude}, ${userName}, ${userEmail}, ${treeLabel})
    RETURNING *
  `;
  return result.rows[0] as TreePin;
}

export async function getAllTreePins(): Promise<TreePin[]> {
  const result = await sql`
    SELECT * FROM tree_pins ORDER BY created_at DESC
  `;
  return result.rows as TreePin[];
}

// Planting Zones
export interface PlantingZone {
  id: number;
  name: string;
  description: string;
  coordinates: Array<{ lat: number; lng: number }>;
  enabled: boolean;
  nearest_roads: string | null;
  created_at: Date;
  updated_at: Date;
}

export async function createPlantingZone(
  name: string,
  description: string,
  coordinates: Array<{ lat: number; lng: number }>,
  nearestRoads?: string
): Promise<PlantingZone> {
  const result = await sql`
    INSERT INTO planting_zones (name, description, coordinates, nearest_roads)
    VALUES (${name}, ${description}, ${JSON.stringify(coordinates)}, ${nearestRoads || null})
    RETURNING *
  `;
  const zone = result.rows[0];
  return {
    ...zone,
    coordinates: typeof zone.coordinates === 'string'
      ? JSON.parse(zone.coordinates)
      : zone.coordinates
  } as PlantingZone;
}

export async function getAllPlantingZones(): Promise<PlantingZone[]> {
  const result = await sql`
    SELECT * FROM planting_zones ORDER BY created_at DESC
  `;
  return result.rows.map(zone => ({
    ...zone,
    coordinates: typeof zone.coordinates === 'string'
      ? JSON.parse(zone.coordinates)
      : zone.coordinates
  })) as PlantingZone[];
}

export async function getEnabledPlantingZones(): Promise<PlantingZone[]> {
  const result = await sql`
    SELECT * FROM planting_zones WHERE enabled = true ORDER BY created_at DESC
  `;
  return result.rows.map(zone => ({
    ...zone,
    coordinates: typeof zone.coordinates === 'string'
      ? JSON.parse(zone.coordinates)
      : zone.coordinates
  })) as PlantingZone[];
}

export async function updatePlantingZone(
  id: number,
  name: string,
  description: string,
  coordinates: Array<{ lat: number; lng: number }>,
  enabled: boolean,
  nearestRoads: string
): Promise<PlantingZone> {
  const result = await sql`
    UPDATE planting_zones
    SET name = ${name},
        description = ${description},
        coordinates = ${JSON.stringify(coordinates)},
        enabled = ${enabled},
        nearest_roads = ${nearestRoads},
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ${id}
    RETURNING *
  `;
  const zone = result.rows[0];
  return {
    ...zone,
    coordinates: typeof zone.coordinates === 'string'
      ? JSON.parse(zone.coordinates)
      : zone.coordinates
  } as PlantingZone;
}

export async function deletePlantingZone(id: number): Promise<void> {
  await sql`
    DELETE FROM planting_zones WHERE id = ${id}
  `;
}

export async function togglePlantingZone(id: number, enabled: boolean): Promise<PlantingZone> {
  const result = await sql`
    UPDATE planting_zones
    SET enabled = ${enabled}, updated_at = CURRENT_TIMESTAMP
    WHERE id = ${id}
    RETURNING *
  `;
  const zone = result.rows[0];
  return {
    ...zone,
    coordinates: typeof zone.coordinates === 'string'
      ? JSON.parse(zone.coordinates)
      : zone.coordinates
  } as PlantingZone;
}
