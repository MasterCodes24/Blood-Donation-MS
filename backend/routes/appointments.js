const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticateToken } = require('../middleware/auth');

// GET all appointments (staff only) - with donor name joined
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { status } = req.query;
    let query = `
      SELECT a.*, d.full_name, d.blood_group, d.phone, d.email
      FROM appointments a
      JOIN donors d ON a.donor_id = d.donor_id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      params.push(status);
      query += ` AND a.status = $${params.length}`;
    }

    query += ' ORDER BY a.appointment_date DESC';
    const result = await pool.query(query, params);
    res.json({ success: true, appointments: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET appointments for a specific donor (public - donor can check their own)
router.get('/donor/:donorId', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM appointments WHERE donor_id = $1 ORDER BY appointment_date DESC',
      [req.params.donorId]
    );
    res.json({ success: true, appointments: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST request a new appointment (public - donor submits)
router.post('/', async (req, res) => {
  try {
    const { donor_id, appointment_date } = req.body;

    if (!donor_id || !appointment_date) {
      return res.status(400).json({ success: false, message: 'donor_id and appointment_date are required' });
    }

    // Verify donor exists
    const donor = await pool.query('SELECT donor_id FROM donors WHERE donor_id = $1', [donor_id]);
    if (donor.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Donor not found' });
    }

    const result = await pool.query(
      `INSERT INTO appointments (donor_id, appointment_date, status)
       VALUES ($1, $2, 'requested') RETURNING *`,
      [donor_id, appointment_date]
    );

    res.status(201).json({ success: true, appointment: result.rows[0], message: 'Appointment requested successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PATCH update appointment status (staff only)
router.patch('/:id/status', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['requested', 'confirmed', 'rejected', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const result = await pool.query(
      'UPDATE appointments SET status = $1 WHERE appointment_id = $2 RETURNING *',
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    res.json({ success: true, appointment: result.rows[0], message: `Appointment ${status}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
