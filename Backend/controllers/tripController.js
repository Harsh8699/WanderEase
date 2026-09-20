// /controllers/tripController.js
const asyncHandler = require('express-async-handler');
const Trip = require('../models/Trip.js');
const crypto = require('crypto');

const isMember = (trip, userId) => trip.members.some((memberId) => memberId.equals(userId));
const createInviteCode = () => crypto.randomBytes(4).toString('hex').slice(0, 6).toUpperCase();

const createTrip = asyncHandler(async (req, res) => {
    const { tripName, tripMode, blueprint } = req.body;
    if (!tripName?.trim() || !tripMode || !blueprint?.tripDetails?.destinationName) { res.status(400); throw new Error('Trip name, mode, and destination are required.'); }
    const tripData = { tripName, tripMode, blueprint, createdBy: req.user._id, members: [req.user._id], };
    if (tripMode === 'Group Trip') { tripData.inviteCode = createInviteCode(); }
    const trip = new Trip(tripData);
    const createdTrip = await trip.save();
    res.status(201).json(createdTrip);
});

const getUserTrips = asyncHandler(async (req, res) => {
    const trips = await Trip.find({ members: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(trips);
});

const getTripById = asyncHandler(async (req, res) => {
    const trip = await Trip.findById(req.params.id).populate('members', 'name email');
    if (!trip) { res.status(404); throw new Error('Trip not found.'); }
    if (!trip.members.some(member => member._id.equals(req.user._id))) { res.status(403); throw new Error('User not authorized.'); }
    res.status(200).json(trip);
});

const joinTrip = asyncHandler(async (req, res) => {
    const { inviteCode } = req.body;
    if (!inviteCode?.trim()) { res.status(400); throw new Error('Invite code is required.'); }
    const trip = await Trip.findOne({ inviteCode: inviteCode.trim().toUpperCase() });
    if (!trip) { res.status(404); throw new Error('Trip not found with this invite code.'); }
    if (isMember(trip, req.user._id)) { res.status(400); throw new Error('User is already a member.'); }
    trip.members.push(req.user._id);
    await trip.save();
    const updatedTrip = await Trip.findById(trip._id).populate('members', 'name email');
    res.status(200).json(updatedTrip);
});

const addItineraryItem = asyncHandler(async (req, res) => {
    const { day, title, notes } = req.body;
    const trip = await Trip.findById(req.params.id);
    if (!trip || !isMember(trip, req.user._id)) { res.status(403); throw new Error('User not authorized.'); }
    if (!Number.isInteger(day) || day < 1 || day > trip.blueprint.tripDetails.duration || !title?.trim()) { res.status(400); throw new Error('A valid trip day and title are required.'); }
    const newItem = { day, title: title.trim(), notes: notes?.trim() || '', addedBy: req.user._id, };
    trip.itinerary.push(newItem);
    await trip.save();
    const updatedTrip = await Trip.findById(req.params.id).populate('members', 'name email');
    res.status(201).json(updatedTrip);
});

const deleteItineraryItem = asyncHandler(async (req, res) => {
    const trip = await Trip.findById(req.params.id);
    if (!trip || !isMember(trip, req.user._id)) { res.status(403); throw new Error('User not authorized.'); }
    const itemToDelete = trip.itinerary.id(req.params.itemId);
    if (!itemToDelete) { res.status(404); throw new Error('Itinerary item not found.'); }
    itemToDelete.deleteOne();
    await trip.save();
    const updatedTrip = await Trip.findById(req.params.id).populate('members', 'name email');
    res.status(200).json(updatedTrip);
});

const addExpense = asyncHandler(async (req, res) => {
    const { description, amount } = req.body;
    if (!description?.trim() || !Number.isFinite(amount) || amount <= 0) { res.status(400); throw new Error('A description and a positive amount are required.'); }
    const trip = await Trip.findById(req.params.id);
    if (!trip || !isMember(trip, req.user._id)) { res.status(403); throw new Error('User not authorized.'); }
    const newExpense = { description: description.trim(), amount, paidBy: req.user._id, };
    trip.expenses.push(newExpense);
    await trip.save();
    const updatedTrip = await Trip.findById(req.params.id).populate('members', 'name email').populate('expenses.paidBy', 'name');
    res.status(201).json(updatedTrip);
});
const deleteExpense = asyncHandler(async (req, res) => {
    const trip = await Trip.findById(req.params.id);
    if (!trip) { res.status(404); throw new Error('Trip not found'); }

    // Only organizer can delete
    if (!trip.createdBy.equals(req.user._id)) {
        res.status(403);
        throw new Error('Only the organizer can delete expenses.');
    }

    const expenseToDelete = trip.expenses.id(req.params.expenseId);
    if (!expenseToDelete) { res.status(404); throw new Error('Expense not found.'); }

    expenseToDelete.deleteOne();
    await trip.save();

    const updatedTrip = await Trip.findById(req.params.id)
        .populate('members', 'name email')
        .populate('expenses.paidBy', 'name');

    res.status(200).json(updatedTrip);
});

const updateExpense = asyncHandler(async (req, res) => {
    const { description, amount } = req.body;
    const trip = await Trip.findById(req.params.id);
    if (!trip || !isMember(trip, req.user._id)) { res.status(403); throw new Error('User not authorized.'); }

    const expense = trip.expenses.id(req.params.expenseId);
    if (!expense) { res.status(404); throw new Error('Expense not found.'); }

    // Only creator/payer can edit
    if (!expense.paidBy.equals(req.user._id)) {
        res.status(403);
        throw new Error('Only the person who added this expense can edit it.');
    }

    if (description !== undefined && !description.trim()) { res.status(400); throw new Error('Description cannot be empty.'); }
    if (amount !== undefined && (!Number.isFinite(amount) || amount <= 0)) { res.status(400); throw new Error('Amount must be positive.'); }
    if (description !== undefined) expense.description = description.trim();
    if (amount !== undefined) expense.amount = amount;

    await trip.save();
    const updatedTrip = await Trip.findById(req.params.id)
        .populate('members', 'name email')
        .populate('expenses.paidBy', 'name');
    res.status(200).json(updatedTrip);
});

const createPoll = asyncHandler(async (req, res) => {
    const { title, options } = req.body;
    const cleanOptions = Array.isArray(options) ? options.map((option) => String(option).trim()).filter(Boolean) : [];
    if (!title?.trim() || cleanOptions.length < 2 || new Set(cleanOptions.map((option) => option.toLowerCase())).size !== cleanOptions.length) { res.status(400); throw new Error('A poll requires a title and at least two unique options.'); }
    const trip = await Trip.findById(req.params.id);
    if (!trip || !isMember(trip, req.user._id)) { res.status(403); throw new Error('User not authorized.'); }
    const newPoll = { title: title.trim(), options: cleanOptions.map((optionText) => ({ text: optionText, votes: [] })), createdBy: req.user._id, };
    trip.polls.push(newPoll);
    await trip.save();
    const updatedTrip = await Trip.findById(req.params.id).populate('polls.options.votes', 'name');
    res.status(201).json(updatedTrip);
});

const castVote = asyncHandler(async (req, res) => {
    const { optionId } = req.body;
    if (!optionId) { res.status(400); throw new Error('An optionId is required.'); }
    const trip = await Trip.findById(req.params.id);
    if (!trip || !isMember(trip, req.user._id)) { res.status(403); throw new Error('User must be a member to vote.'); }
    const poll = trip.polls.id(req.params.pollId);
    if (!poll) { res.status(404); throw new Error('Poll not found.'); }
    poll.options.forEach(option => { option.votes.pull(req.user._id); });
    const selectedOption = poll.options.id(optionId);
    if (!selectedOption) { res.status(404); throw new Error('Selected option not found.'); }
    selectedOption.votes.push(req.user._id);
    await trip.save();
    const updatedTrip = await Trip.findById(req.params.id).populate('polls.options.votes', 'name').populate('polls.createdBy', 'name');
    res.status(200).json(updatedTrip);
});

module.exports = { createTrip, getUserTrips, getTripById, joinTrip, addItineraryItem, deleteItineraryItem, addExpense, deleteExpense, updateExpense, createPoll, castVote };
