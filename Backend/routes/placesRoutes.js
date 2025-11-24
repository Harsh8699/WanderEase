// /routes/placesRoutes.js
const express = require('express');
const router = express.Router();
const { getPointsOfInterest } = require('../controllers/placesController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getPointsOfInterest);
module.exports = router;