const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticateToken } = require('../middleware/auth');

// GET all donations (staff only) - joined with donor name
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT dn.*, d.full_name, d.blood_group, d.phone
      FROM donations dn
      JOIN donors d ON dn.donor_id = d.donor_id
      ORDER BY dn.donation_date DESC
    `);
    res.json({ success: true, donations: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST record a donation (staff only)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { donor_id, appointment_id, donation_date } = req.body;

    if (!donor_id || !donation_date) {
      return res.status(400).json({ success: false, message: 'donor_id and donation_date are required' });
    }

    // Verify donor exists
    const donor = await pool.query('SELECT donor_id FROM donors WHERE donor_id = $1', [donor_id]);
    if (donor.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Donor not found' });
    }

    // Verify appointment if provided
    if (appointment_id) {
      const apt = await pool.query(
        'SELECT appointment_id FROM appointments WHERE appointment_id = $1',
        [appointment_id]
      );
      if (apt.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Appointment not found' });
      }
    }

    const result = await pool.query(
      `INSERT INTO donations (donor_id, appointment_id, donation_date)
       VALUES ($1, $2, $3) RETURNING *`,
      [donor_id, appointment_id || null, donation_date]
    );

    // If linked to appointment, mark it as confirmed
    if (appointment_id) {
      await pool.query(
        "UPDATE appointments SET status = 'confirmed' WHERE appointment_id = $1",
        [appointment_id]
      );
    }

    res.status(201).json({ success: true, donation: result.rows[0], message: 'Donation recorded successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET donation stats summary (staff only)
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const totalDonors = await pool.query('SELECT COUNT(*) FROM donors');
    const totalDonations = await pool.query('SELECT COUNT(*) FROM donations');
    const totalAppointments = await pool.query('SELECT COUNT(*) FROM appointments');
    const pendingAppointments = await pool.query(
      "SELECT COUNT(*) FROM appointments WHERE status = 'requested'"
    );
    const bloodGroupStats = await pool.query(
      'SELECT blood_group, COUNT(*) as count FROM donors GROUP BY blood_group ORDER BY count DESC'
    );

    res.json({
      success: true,
      stats: {
        totalDonors: parseInt(totalDonors.rows[0].count),
        totalDonations: parseInt(totalDonations.rows[0].count),
        totalAppointments: parseInt(totalAppointments.rows[0].count),
        pendingAppointments: parseInt(pendingAppointments.rows[0].count),
        bloodGroupStats: bloodGroupStats.rows,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
