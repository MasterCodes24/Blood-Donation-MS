/**
 * Run this once to create your first admin account:
 *   node create-admin.js
 */
require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool = require('./db');

const ADMIN = {
  full_name: 'Admin User',
  email: 'admin@bloodcentre.org',
  password: 'Admin@1234',
  role: 'admin',
};

async function createAdmin() {
  try {
    const hash = await bcrypt.hash(ADMIN.password, 10);
    const result = await pool.query(
      `INSERT INTO staff (full_name, email, password_hash, role)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash
       RETURNING staff_id, full_name, email, role`,
      [ADMIN.full_name, ADMIN.email, hash, ADMIN.role]
    );
    console.log('✅ Admin account ready:', result.rows[0]);
    console.log('📧 Email:', ADMIN.email);
    console.log('🔑 Password:', ADMIN.password);
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

createAdmin();
