const express = require('express');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: './.env' });

// Initialize app
const app = express();

// Serve static files
app.use(express.static(path.join(__dirname, 'client/build')));

// API route example
app.get('/api/test', (req, res) => {
  res.json({ message: 'API working!' });
});

// All other routes -> React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

// Start server
const server = app.listen(PORT, () => console.log(Server running on port ${PORT}));