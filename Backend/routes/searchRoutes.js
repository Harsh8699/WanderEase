// /routes/searchRoutes.js
const express = require('express');
const router = express.Router();
const { discoverDestinations } = require('../controllers/searchController');

router.post('/discover', discoverDestinations);
module.exports = router;