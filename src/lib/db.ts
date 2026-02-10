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

  // Add zone_id column to tree_pins if it doesn't exist
  try {
    await sql`
      ALTER TABLE tree_pins
      ADD COLUMN IF NOT EXISTS zone_id INTEGER REFERENCES planting_zones(id) ON DELETE SET NULL
    `;
  } catch (error) {
    // Column might already exist, ignore error
  }

  // Tree types table
  await sql`
    CREATE TABLE IF NOT EXISTS tree_types (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  // Add description column if it doesn't exist (migration for existing tables)
  try {
    await sql`
      ALTER TABLE tree_types
      ADD COLUMN IF NOT EXISTS description TEXT
    `;
  } catch (error) {
    // Column might already exist, ignore error
  }

  // Seed initial tree types
  const initialTypes = ['Λιριόδενδρο', 'Λικιδάμβαρη', 'Φράξος', 'Πλατανομουριά'];
  for (const typeName of initialTypes) {
    await sql`
      INSERT INTO tree_types (name) VALUES (${typeName}) ON CONFLICT (name) DO NOTHING
    `;
  }

  // Add tree_type_id column to tree_pins if it doesn't exist
  try {
    await sql`
      ALTER TABLE tree_pins
      ADD COLUMN IF NOT EXISTS tree_type_id INTEGER REFERENCES tree_types(id) ON DELETE SET NULL
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
  zone_id: number | null;
  zone_name: string | null;
  tree_type_id: number | null;
  tree_type_name: string | null;
  created_at: Date;
}

// Tree Types
export interface TreeType {
  id: number;
  name: string;
  description: string | null;
  created_at: Date;
}

export async function createTreePin(
  latitude: number,
  longitude: number,
  userName: string,
  userEmail: string,
  treeLabel: string,
  zoneId?: number | null
): Promise<TreePin> {
  const result = await sql`
    INSERT INTO tree_pins (latitude, longitude, user_name, user_email, tree_label, zone_id)
    VALUES (${latitude}, ${longitude}, ${userName}, ${userEmail}, ${treeLabel}, ${zoneId || null})
    RETURNING *
  `;
  return result.rows[0] as TreePin;
}

export async function getAllTreePins(): Promise<TreePin[]> {
  const result = await sql`
    SELECT tp.*, pz.name as zone_name, tt.name as tree_type_name
    FROM tree_pins tp
    LEFT JOIN planting_zones pz ON tp.zone_id = pz.id
    LEFT JOIN tree_types tt ON tp.tree_type_id = tt.id
    ORDER BY tp.created_at DESC
  `;
  return result.rows as TreePin[];
}

export async function deleteTreePin(id: number): Promise<void> {
  await sql`
    DELETE FROM tree_pins WHERE id = ${id}
  `;
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

// Tree Types
export async function getAllTreeTypes(): Promise<TreeType[]> {
  const result = await sql`
    SELECT * FROM tree_types ORDER BY name ASC
  `;
  return result.rows as TreeType[];
}

export async function createTreeType(name: string, description?: string): Promise<TreeType> {
  const result = await sql`
    INSERT INTO tree_types (name, description) VALUES (${name}, ${description || null}) RETURNING *
  `;
  return result.rows[0] as TreeType;
}

export async function updateTreeType(id: number, name: string, description?: string): Promise<TreeType> {
  const result = await sql`
    UPDATE tree_types SET name = ${name}, description = ${description || null} WHERE id = ${id} RETURNING *
  `;
  return result.rows[0] as TreeType;
}

export async function deleteTreeType(id: number): Promise<void> {
  await sql`
    DELETE FROM tree_types WHERE id = ${id}
  `;
}

export async function updateTreePinType(pinId: number, typeId: number | null): Promise<void> {
  await sql`
    UPDATE tree_pins SET tree_type_id = ${typeId} WHERE id = ${pinId}
  `;
}
