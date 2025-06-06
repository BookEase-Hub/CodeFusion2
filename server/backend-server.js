const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const path = require('path');

// Load env vars
dotenv.config({ path: './config/config.env' });

// Connect to database
connectDB();

// Initialize express
const app = express();

// Body parser
app.use(express.json());

// Enable CORS
app.use(cors());

// Mount routers
app.use('/api/v1', require('./routes/api'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Server error' });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(
  PORT,
  console.log(Server running in ${process.env.NODE_ENV} mode on port ${PORT})
);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(Error: ${err.message});
  server.close(() => process.exit(1));
});