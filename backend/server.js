require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Connect to MongoDB
connectDB();

const app = express();

// ─── Middleware ────────────────────────────────────────────
app.use(cors({
  origin: '*', // In production, restrict to your frontend domain
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ─── Static file serving ──────────────────────────────────
// Serve uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// Serve frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// ─── API Routes ───────────────────────────────────────────
app.use('/api/auth', require('./routes/auth'));
app.use('/api/bikes', require('./routes/bikes'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/services', require('./routes/services'));
app.use('/api/contact', require('./routes/contact'));

// ─── Health Check ─────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Motorbike Showroom API is running 🏍️', timestamp: new Date() });
});

// ─── Serve Frontend for non-API routes ────────────────────
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
  }
});

// ─── Error Handler (must be last) ─────────────────────────
app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`
  ╔═══════════════════════════════════════════╗
  ║   🏍️  Motorbike Showroom API Running       ║
  ║   Port: ${PORT}                              ║
  ║   Mode: ${process.env.NODE_ENV || 'development'}                     ║
  ║   URL:  http://localhost:${PORT}             ║
  ╚═══════════════════════════════════════════╝
  `);
});

module.exports = app;
