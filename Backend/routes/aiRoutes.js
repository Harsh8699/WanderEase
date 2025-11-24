// /routes/aiRoutes.js
const express = require('express');
const router = express.Router();
const { suggestItinerary, generateBackpackList } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

router.post('/suggest-itinerary', protect, suggestItinerary);
router.post('/backpack-list', protect, generateBackpackList);
module.exports = router;
