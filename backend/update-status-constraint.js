require('dotenv').config();
const pool = require('./db');

async function updateConstraint() {
  try {
    await pool.query('ALTER TABLE appointments DROP CONSTRAINT IF EXISTS appointments_status_check');
    await pool.query("ALTER TABLE appointments ADD CONSTRAINT appointments_status_check CHECK (status IN ('requested', 'confirmed', 'rejected', 'cancelled', 'completed'))");
    console.log('✅ appointments_status_check updated successfully to include completed!');
  } catch (err) {
    console.error('❌ Failed:', err.message);
  } finally {
    await pool.end();
  }
}

updateConstraint();
