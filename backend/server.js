const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

// --- CORS doit être placé AVANT helmet et rateLimit ---
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// --- Security middleware ---
app.use(helmet());

// --- Rate limiting ---
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000
});
app.use(limiter);

// --- Body parsing middleware ---
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// // Autoriser CORS sur les fichiers statiques (images)
// app.use('/uploads', (req, res, next) => {
//   res.header('Access-Control-Allow-Origin', '*');
//   next();
// });
// // app.use('/uploads', express.static('uploads'));
// // --- Static files ---
// app.use('/uploads', express.static('uploads'));
// --- Static files (images avec CORS et CORP) ---
app.use('/uploads', express.static('uploads', {
  setHeaders: (res, path, stat) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  }
}));


// --- Database connection ---
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));


// --- Routes ---
app.use('/api/auth', require('./routes/auth'));
app.use('/api/vehicles', require('./routes/vehicles'));
app.use('/api/clients', require('./routes/clients'));
app.use('/api/reservations', require('./routes/reservations'));
app.use('/api/billing', require('./routes/billing'));
app.use('/api/contracts', require('./routes/contracts'));
app.use('/api/maintenance', require('./routes/maintenance'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/invoice', require('./routes/invoice'));
app.use('/api/vehicleAdmin', require('./routes/vehicleAdmin'));

// --- Health check ---
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// --- Error handling ---
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

// --- 404 handler ---
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
