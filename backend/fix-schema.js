require('dotenv').config();
const pool = require('./db');

async function fixAll() {
  try {
    // Fix donors table
    await pool.query(`ALTER TABLE donors ALTER COLUMN full_name TYPE VARCHAR(100)`);
    await pool.query(`ALTER TABLE donors ALTER COLUMN phone TYPE VARCHAR(20)`);
    await pool.query(`ALTER TABLE donors ALTER COLUMN email TYPE VARCHAR(100)`);
    console.log('✅ donors table columns widened');

    // Fix appointments table - check it too
    const apts = await pool.query(
      "SELECT column_name, character_maximum_length, data_type FROM information_schema.columns WHERE table_name = 'appointments' ORDER BY ordinal_position"
    );
    console.log('\nappointments table:');
    console.table(apts.rows);

    const don = await pool.query(
      "SELECT column_name, character_maximum_length, data_type FROM information_schema.columns WHERE table_name = 'donations' ORDER BY ordinal_position"
    );
    console.log('\ndonations table:');
    console.table(don.rows);

    process.exit(0);
  } catch (e) {
    console.error('❌', e.message);
    process.exit(1);
  }
}

fixAll();
