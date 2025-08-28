const express = require('express');
const router = express.Router();
const AuthController = require('../controller/authController');

// Register
router.get('/register', AuthController.registerForm);
router.post('/register', AuthController.register);

// Login
router.get('/login', AuthController.loginForm);
router.post('/login', AuthController.login);

// Logout
router.get('/logout', AuthController.logout);

module.exports = router;
