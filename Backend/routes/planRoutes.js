// /routes/planRoutes.js
const express = require('express');
const router = express.Router();
const { generateTripBlueprint } = require('../controllers/planController');
const { protect } = require('../middleware/authMiddleware');

router.post('/generate', protect, generateTripBlueprint);
module.exports = router;