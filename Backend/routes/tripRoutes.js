// /routes/tripRoutes.js
const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const { createTrip, getUserTrips, getTripById, deleteTrip, addItineraryItem, deleteItineraryItem, addExpense, deleteExpense, updateExpense, createPoll, castVote, joinTrip, } = require('../controllers/tripController');
const { protect } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validationMiddleware');

router.use(protect);

const createTripRules = [ body('tripName', 'Trip name is required').not().isEmpty(), body('tripMode', 'Trip mode must be either Solo Trip or Group Trip').isIn(['Solo Trip', 'Group Trip']), body('blueprint', 'Blueprint data is required').not().isEmpty(), body('blueprint.tripDetails.destinationName', 'Destination is required').not().isEmpty(), ];
const tripIdRule = param('id', 'Trip id must be valid').isMongoId();
const nestedTripIdRule = [tripIdRule, param('itemId', 'Item id must be valid').isMongoId()];
const expenseIdRule = [tripIdRule, param('expenseId', 'Expense id must be valid').isMongoId()];
const pollIdRule = [tripIdRule, param('pollId', 'Poll id must be valid').isMongoId()];

router.route('/join').post(joinTrip);
router.route('/').post(createTripRules, validate, createTrip).get(getUserTrips);
router.route('/:id').get(tripIdRule, validate, getTripById).delete(tripIdRule, validate, deleteTrip);
router.route('/:id/itinerary').post(tripIdRule, validate, addItineraryItem);
router.route('/:id/itinerary/:itemId').delete(nestedTripIdRule, validate, deleteItineraryItem);
router.route('/:id/expenses').post(tripIdRule, validate, addExpense);
router.route('/:id/expenses/:expenseId').put(expenseIdRule, validate, updateExpense).delete(expenseIdRule, validate, deleteExpense);
router.route('/:id/polls').post(tripIdRule, validate, createPoll);
router.route('/:id/polls/:pollId/vote').put(pollIdRule, validate, castVote);

module.exports = router;