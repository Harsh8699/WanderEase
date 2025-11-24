// /routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { registerUser, loginUser, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validationMiddleware');

const registerRules = [ body('name', 'Name is required').not().isEmpty(), body('email', 'Please include a valid email').isEmail(), body('password', 'Password must be 6 or more characters').isLength({ min: 6 }), ];
router.post('/register', registerRules, validate, registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);

module.exports = router;