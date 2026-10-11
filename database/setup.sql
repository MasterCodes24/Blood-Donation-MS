-- ============================================================
-- Blood Donation Management System — Database Setup Script
-- Run this in psql or pgAdmin against your Blood_Donation DB
-- ============================================================

-- 1. CREATE TABLES (skip if already created)
CREATE TABLE IF NOT EXISTS donors (
    donor_id     SERIAL PRIMARY KEY,
    full_name    VARCHAR(100) NOT NULL,
    phone        VARCHAR(20)  NOT NULL,
    email        VARCHAR(100) UNIQUE NOT NULL,
    blood_group  VARCHAR(5)   NOT NULL,
    city_or_area VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS staff (
    staff_id      SERIAL PRIMARY KEY,
    full_name     VARCHAR(100) NOT NULL,
    email         VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role          VARCHAR(20)  NOT NULL DEFAULT 'staff'
);

CREATE TABLE IF NOT EXISTS appointments (
    appointment_id   SERIAL PRIMARY KEY,
    donor_id         INT NOT NULL REFERENCES donors(donor_id) ON DELETE CASCADE,
    appointment_date DATE NOT NULL,
    status           VARCHAR(20) NOT NULL DEFAULT 'requested'
        CHECK (status IN ('requested', 'confirmed', 'rejected', 'cancelled', 'completed'))
);

CREATE TABLE IF NOT EXISTS donations (
    donation_id      SERIAL PRIMARY KEY,
    donor_id         INT NOT NULL REFERENCES donors(donor_id) ON DELETE CASCADE,
    appointment_id   INT REFERENCES appointments(appointment_id) ON DELETE SET NULL,
    donation_date    DATE NOT NULL
);

-- ============================================================
-- 2. SEED SAMPLE DATA
-- ============================================================

-- Sample Donors
INSERT INTO donors (full_name, phone, email, blood_group, city_or_area) VALUES
  ('Aisha Patel',     '+91 9876543210', 'aisha@example.com',   'A+', 'Andheri, Mumbai'),
  ('Ravi Sharma',     '+91 9123456789', 'ravi@example.com',    'B+', 'Bandra, Mumbai'),
  ('Priya Nair',      '+91 9812345678', 'priya@example.com',   'O+', 'Koregaon Park, Pune'),
  ('Mohammed Khan',   '+91 9087654321', 'khan@example.com',    'AB+','Salt Lake, Kolkata'),
  ('Sunita Verma',    '+91 9765432109', 'sunita@example.com',  'A-', 'Connaught Place, Delhi')
ON CONFLICT (email) DO NOTHING;

-- Sample Appointments
INSERT INTO appointments (donor_id, appointment_date, status) VALUES
  (1, CURRENT_DATE + 3,  'requested'),
  (2, CURRENT_DATE + 5,  'confirmed'),
  (3, CURRENT_DATE - 10, 'confirmed'),
  (4, CURRENT_DATE - 5,  'rejected'),
  (5, CURRENT_DATE + 7,  'requested')
ON CONFLICT DO NOTHING;

-- Sample Donations (linked to past confirmed appointments)
INSERT INTO donations (donor_id, appointment_id, donation_date) VALUES
  (3, 3, CURRENT_DATE - 10),
  (2, NULL, CURRENT_DATE - 20)
ON CONFLICT DO NOTHING;

-- ============================================================
-- 3. CREATE ADMIN STAFF ACCOUNT
-- Password: Admin@1234  (bcrypt hash — 10 rounds)
-- Change the email below to your own. Change password via app.
-- ============================================================
INSERT INTO staff (full_name, email, password_hash, role) VALUES
  ('Admin User', 'admin@bloodcentre.org',
   '$2b$10$X7VB9v3Tgb8ZJaM2T4Y9CeQlNY5R7uKFzPGHnDqXvmRoL1W3sJ2aO',
   'admin')
ON CONFLICT (email) DO NOTHING;

-- NOTE: The hash above is for password: Admin@1234
-- To generate a new hash, run this Node.js snippet:
--   const bcrypt = require('bcryptjs');
--   bcrypt.hash('YourNewPassword', 10).then(console.log);
