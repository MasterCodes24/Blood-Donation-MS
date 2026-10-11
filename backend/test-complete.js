require('dotenv').config();
const pool = require('./db');

async function testComplete() {
  const client = await pool.connect();
  try {
    const apts = await client.query('SELECT * FROM appointments');
    console.log('All appointments in DB:');
    console.table(apts.rows);

    if (apts.rows.length === 0) {
      console.log('No appointments found.');
      return;
    }

    const apt = apts.rows[0];
    console.log('Testing with appointment ID:', apt.appointment_id);

    await client.query('BEGIN');
    const u = await client.query(
      "UPDATE appointments SET status = 'completed' WHERE appointment_id = $1 RETURNING *",
      [apt.appointment_id]
    );
    console.log('Updated appointment:', u.rows[0]);

    const d = await client.query(
      "INSERT INTO donations (donor_id, appointment_id, donation_date) VALUES ($1, $2, $3) RETURNING *",
      [apt.donor_id, apt.appointment_id, new Date().toISOString().split('T')[0]]
    );
    console.log('Inserted donation:', d.rows[0]);

    await client.query('ROLLBACK');
    console.log('Transaction succeeded (rolled back cleanly)!');
  } catch (err) {
    console.error('ERROR DETAIL:');
    console.error(err);
  } finally {
    client.release();
    await pool.end();
  }
}

testComplete();
