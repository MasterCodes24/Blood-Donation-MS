const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');
const { authenticateToken } = require('../middleware/auth');

// POST staff login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const result = await pool.query('SELECT * FROM staff WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const staff = result.rows[0];
    const isMatch = await bcrypt.compare(password, staff.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { staff_id: staff.staff_id, email: staff.email, role: staff.role },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '8h' }
    );

    res.json({
      success: true,
      token,
      staff: {
        staff_id: staff.staff_id,
        full_name: staff.full_name,
        email: staff.email,
        role: staff.role,
      },
      message: 'Login successful',
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST register a new staff member (admin only)
router.post('/register', authenticateToken, async (req, res) => {
  try {
    if (req.staff.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only admins can create staff accounts' });
    }

    const { full_name, email, password, role } = req.body;

    if (!full_name || !email || !password) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const existing = await pool.query('SELECT staff_id FROM staff WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }

    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    const result = await pool.query(
      `INSERT INTO staff (full_name, email, password_hash, role)
       VALUES ($1, $2, $3, $4) RETURNING staff_id, full_name, email, role`,
      [full_name, email, password_hash, role || 'staff']
    );

    res.status(201).json({ success: true, staff: result.rows[0], message: 'Staff member created' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET current staff profile
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT staff_id, full_name, email, role FROM staff WHERE staff_id = $1',
      [req.staff.staff_id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Staff not found' });
    }
    res.json({ success: true, staff: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET all staff (admin only)
router.get('/', authenticateToken, async (req, res) => {
  try {
    if (req.staff.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin only' });
    }
    const result = await pool.query(
      'SELECT staff_id, full_name, email, role FROM staff ORDER BY staff_id'
    );
    res.json({ success: true, staff: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
