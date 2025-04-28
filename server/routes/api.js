const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');
const connectDB = require('./server/config/db');
const errorHandler = require('./server/middlewares/errorHandler');
const logger = require('./server/utils/logger');
const productionConfig = require('./server/config/production');

// Load environment variables
dotenv.config({ path: './.env' });

// Connect to database
connectDB();

// Initialize express app
const app = express();

// Security middleware
app.use(helmet(productionConfig.security.helmet));

// Enable CORS
app.use(cors(productionConfig.security.cors));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Compression
app.use(compression());

// Logging
app.use(morgan('combined', { stream: logger.stream }));

// Static files
app.use(express.static(path.join(__dirname, 'client/build')));

// API routes
app.use('/api/v1', require('./server/routes/api'));  // Make sure the path is correct

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build/index.html'));
});

// Error handling
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Start the server
const server = app.listen(PORT, () => {
  logger.info(Server running in ${process.env.NODE_ENV} mode on port ${PORT});
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error(Unhandled Rejection: ${err.message});
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error(Uncaught Exception: ${err.message});
  process.exit(1);
});