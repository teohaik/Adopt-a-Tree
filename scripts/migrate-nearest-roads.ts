import { sql } from '@vercel/postgres';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function migrate() {
  try {
    console.log('Adding nearest_roads column to planting_zones table...');

    await sql`
      ALTER TABLE planting_zones
      ADD COLUMN IF NOT EXISTS nearest_roads TEXT
    `;

    console.log('✅ Migration completed successfully!');
    console.log('The nearest_roads column has been added to the planting_zones table.');

    // Verify the column was added
    const result = await sql`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'planting_zones'
      AND column_name = 'nearest_roads'
    `;

    if (result.rows.length > 0) {
      console.log('✅ Verified: nearest_roads column exists');
      console.log('Column details:', result.rows[0]);
    } else {
      console.log('⚠️  Warning: Could not verify column existence');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrate();
