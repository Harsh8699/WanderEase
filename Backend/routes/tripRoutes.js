// /routes/tripRoutes.js
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { createTrip, getUserTrips, getTripById, addItineraryItem, deleteItineraryItem, addExpense, deleteExpense, updateExpense, createPoll, castVote, joinTrip, } = require('../controllers/tripController');
const { protect } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validationMiddleware');

router.use(protect);

const createTripRules = [ body('tripName', 'Trip name is required').not().isEmpty(), body('tripMode', 'Trip mode must be either Solo Trip or Group Trip').isIn(['Solo Trip', 'Group Trip']), body('blueprint', 'Blueprint data is required').not().isEmpty(), body('blueprint.tripDetails.destinationName', 'Destination is required').not().isEmpty(), ];

router.route('/join').post(joinTrip);
router.route('/').post(createTripRules, validate, createTrip).get(getUserTrips);
router.route('/:id').get(getTripById);
router.route('/:id/itinerary').post(addItineraryItem);
router.route('/:id/itinerary/:itemId').delete(deleteItineraryItem);
router.route('/:id/expenses').post(addExpense);
router.route('/:id/expenses/:expenseId').put(updateExpense).delete(deleteExpense);
router.route('/:id/polls').post(createPoll);
router.route('/:id/polls/:pollId/vote').put(castVote);

module.exports = router;