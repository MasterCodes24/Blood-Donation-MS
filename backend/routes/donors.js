const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticateToken } = require('../middleware/auth');

// GET all donors (with optional search by blood_group or city_or_area) - staff only
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { blood_group, city_or_area, search } = req.query;
    let query = 'SELECT * FROM donors WHERE 1=1';
    const params = [];

    if (blood_group) {
      params.push(blood_group);
      query += ` AND blood_group = $${params.length}`;
    }
    if (city_or_area) {
      params.push(`%${city_or_area}%`);
      query += ` AND city_or_area ILIKE $${params.length}`;
    }
    if (search) {
      params.push(`%${search}%`);
      query += ` AND (full_name ILIKE $${params.length} OR email ILIKE $${params.length} OR phone ILIKE $${params.length})`;
    }

    query += ' ORDER BY donor_id DESC';
    const result = await pool.query(query, params);
    res.json({ success: true, donors: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET single donor by ID (with their appointments & donations) - staff only
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const donorResult = await pool.query('SELECT * FROM donors WHERE donor_id = $1', [id]);
    if (donorResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Donor not found' });
    }

    const appointmentsResult = await pool.query(
      'SELECT * FROM appointments WHERE donor_id = $1 ORDER BY appointment_date DESC',
      [id]
    );
    const donationsResult = await pool.query(
      'SELECT * FROM donations WHERE donor_id = $1 ORDER BY donation_date DESC',
      [id]
    );

    res.json({
      success: true,
      donor: donorResult.rows[0],
      appointments: appointmentsResult.rows,
      donations: donationsResult.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST donor status lookup (public - requires donor_id and email/phone)
router.post('/status', async (req, res) => {
  try {
    const { donor_id, contact } = req.body;
    
    if (!donor_id || !contact) {
      return res.status(400).json({ success: false, message: 'Donor ID and Email/Phone are required' });
    }

    // Verify donor ID and contact (email or phone)
    const donorResult = await pool.query(
      'SELECT * FROM donors WHERE donor_id = $1 AND (email = $2 OR phone = $2)', 
      [donor_id, contact]
    );
    
    if (donorResult.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid Donor ID or Contact Info' });
    }

    const appointmentsResult = await pool.query(
      'SELECT * FROM appointments WHERE donor_id = $1 ORDER BY appointment_date DESC',
      [donor_id]
    );
    const donationsResult = await pool.query(
      'SELECT * FROM donations WHERE donor_id = $1 ORDER BY donation_date DESC',
      [donor_id]
    );

    res.json({
      success: true,
      donor: donorResult.rows[0],
      appointments: appointmentsResult.rows,
      donations: donationsResult.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST register a new donor
router.post('/register', async (req, res) => {
  try {
    const { full_name, phone, email, blood_group, city_or_area } = req.body;

    if (!full_name || !phone || !email || !blood_group || !city_or_area) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    // Check for duplicate email
    const existing = await pool.query('SELECT donor_id FROM donors WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }

    const result = await pool.query(
      `INSERT INTO donors (full_name, phone, email, blood_group, city_or_area)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [full_name, phone, email, blood_group, city_or_area]
    );

    res.status(201).json({ success: true, donor: result.rows[0], message: 'Donor registered successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUT update donor details
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { full_name, phone, email, blood_group, city_or_area } = req.body;

    const result = await pool.query(
      `UPDATE donors SET full_name=$1, phone=$2, email=$3, blood_group=$4, city_or_area=$5
       WHERE donor_id=$6 RETURNING *`,
      [full_name, phone, email, blood_group, city_or_area, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Donor not found' });
    }
    res.json({ success: true, donor: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
