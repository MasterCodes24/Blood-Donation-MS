# BloodConnect 🩸

BloodConnect is a web-based **Blood Donation Management System** designed to help blood donation centres keep donor details, manage appointment requests, and record completed donations. 

This project aims to replace scattered manual processes with a small, organized digital system that donors and centre staff can use efficiently.

## ✨ Features

### For Donors:
- **Donor Registration (Create):** Donors can securely register their details (name, blood group, contact info, area).
- **Appointment Booking (Create):** Request a donation appointment date easily.
- **Confidential Donor Portal (Read):** Donors can log in securely using their Donor ID and Email/Phone to view their appointment history and recorded donations.
- **Manage Contact Information (Update):** Donors can edit and update their phone number and email address directly from their portal.
- **Profile Removal (Delete):** Donors can delete their profile, which automatically cascades to clean up all related appointment and donation records.

### For Staff/Administrators:
- **Staff Dashboard (Read):** Comprehensive overview with live statistics (Total Donors, Donations, Pending Requests, Blood Group distribution).
- **Donor Management (Read):** Search, filter (by blood group), and view complete profiles of donors.
- **Appointment Processing & Completion (Update):** Staff can confirm, reject, cancel, or mark appointments as **Completed (Donated 🩸)**, automatically converting the pending appointment into a completed donation.
- **Donation Recording (Create):** Staff can record completed donations and link them to appointments.
- **Secure Access:** JWT-based authentication for staff and Role-Based Access (Admins can create other staff accounts).

## 🛠️ Technology Stack
- **Frontend:** React + Vite (HTML, CSS, JavaScript)
- **Backend:** Node.js + Express
- **Database:** PostgreSQL
- **Styling:** Custom CSS with Modern UI (Glassmorphism, dark theme, dynamic animations)

---

## 🚀 Local Setup Instructions

### 1. Database Setup
1. Make sure you have PostgreSQL installed.
2. Create a database named `Blood_Donation`.
3. Run the setup script provided in `database/setup.sql` in pgAdmin or psql to create the tables and seed sample data.

### 2. Backend Setup
1. Navigate to the backend folder: `cd backend`
2. Install dependencies: `npm install`
3. Edit the `.env` file with your PostgreSQL credentials:
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=Blood_Donation
   DB_USER=postgres
   DB_PASSWORD=your_password
   JWT_SECRET=your_super_secret_key
   PORT=5000
   ```
4. Create the initial admin account (runs only once):
   ```bash
   node create-admin.js
   ```
5. Start the backend server: 
   ```bash
   npm start
   ```

### 3. Frontend Setup
1. Navigate to the frontend folder: `cd frontend`
2. Install dependencies: `npm install`
3. Start the Vite development server:
   ```bash
   npm run dev
   ```

## 🔐 Default Credentials
Once both servers are running, access the app at `http://localhost:5173`. 
To access the staff dashboard (`/staff/login`), use:
- **Email:** `admin@bloodcentre.org`
- **Password:** `Admin@1234`

## ⚠️ Disclaimer
This system is an administrative prototype. It **does not** decide whether a person is medically eligible to donate, and it **does not** certify that donated blood is safe. Medical suitability and safety checks must be handled by qualified blood-service staff.
