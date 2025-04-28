const express = require('express');
const router = express.Router();

// @route    POST /api/v1/auth/register
// @desc     Register user
// @access   Public
router.post('/register', (req, res) => {
  res.send('Register user');
});

// @route    POST /api/v1/auth/login
// @desc     Login user
// @access   Public
router.post('/login', (req, res) => {
  res.send('Login user');
});

module.exports = router;