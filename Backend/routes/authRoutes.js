// /routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { registerUser, loginUser, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validationMiddleware');

const registerRules = [ body('name', 'Name is required').trim().isLength({ min: 1, max: 80 }), body('email', 'Please include a valid email').trim().isEmail(), body('password', 'Password must be 6 or more characters').isLength({ min: 6, max: 128 }), ];
router.post('/register', registerRules, validate, registerUser);
router.post('/login', [body('email').trim().isEmail(), body('password').isLength({ min: 1 })], validate, loginUser);
router.get('/me', protect, getMe);

module.exports = router;