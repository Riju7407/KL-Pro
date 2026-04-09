const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
// CORS Configuration - Allow requests from frontend
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5000',
      'https://kl-pro.vercel.app',
      'https://kl-pro-client.vercel.app',
      origin // Allow current origin in development
    ];
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true); // Allow all for now
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// Custom middleware to handle both JSON and FormData
app.use((req, res, next) => {
  // Skip body parsers for multipart/form-data requests (they'll be handled by multer)
  if (req.is('multipart/form-data')) {
    return next();
  }
  express.json()(req, res, next);
});

app.use((req, res, next) => {
  // Skip urlencoded for multipart/form-data requests
  if (req.is('multipart/form-data')) {
    return next();
  }
  express.urlencoded({ extended: true })(req, res, next);
});

// Database Connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/kl-services', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

connectDB();

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/users', require('./routes/users'));
app.use('/api/services', require('./routes/services'));
app.use('/api/professionals', require('./routes/professionals'));
app.use('/api/bookings', require('./routes/bookings'));

// Health Check
app.get('/', (req, res) => {
  res.json({ message: 'KLPro Pvt Ltd API is running' });
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    success: false,
    error: err.message || 'Internal server error',
  });
});

// 404 Handler - must be last
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
