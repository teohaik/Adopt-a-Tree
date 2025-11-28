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
