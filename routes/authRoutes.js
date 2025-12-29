const express = require('express');
const router = express.Router();
const authController = require('../src/modules/auth/authController');

// POST /api/users/register
router.post('/register', authController.register);

// POST /api/users/login
router.post('/login', authController.login);

module.exports = router;