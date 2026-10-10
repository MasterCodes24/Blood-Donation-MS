require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors({
  origin: /^http:\/\/localhost:\d+$/,  // Allow any localhost port (5173, 5174, etc.)
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/donors', require('./routes/donors'));
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/donations', require('./routes/donations'));
app.use('/api/staff', require('./routes/staff'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Blood Donation API is running 🩸', timestamp: new Date() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 API health: http://localhost:${PORT}/api/health`);
});
