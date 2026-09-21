// /models/Trip.js
const mongoose = require('mongoose');

const tripDetailsSchema = { origin: { type: String, required: true, maxlength: 100 }, destinationName: { type: String, required: true, maxlength: 100 }, departureDate: { type: String, required: true }, duration: { type: Number, required: true, min: 1, max: 30 }, travelers: { type: Number, required: true, min: 1, max: 50 },};
const weatherForecastSchema = [{ date: String, temp_max: Number, temp_min: Number, description: String, icon: String, }];
const transportOptionsSchema = { flight: { costPerPerson: Number, link: String }, bus: { costPerPerson: Number, link: String }, car: { totalCost: Number, link: String }, };
const accommodationSchema = { estimatedTotalCost: { type: Number }, link: { type: String }, };
const budgetSchema = { totalEstimatedCost: { type: Number }, costPerPerson: { type: Number }, };
const routeSchema = {
    distanceKm: { type: Number, min: 0 },
    origin: { name: String, lat: Number, lon: Number },
    destination: { name: String, lat: Number, lon: Number },
    geometry: {
        type: { type: String },
        coordinates: { type: [[Number]] },
    },
};
const itineraryItemSchema = new mongoose.Schema({ day: { type: Number, required: true }, title: { type: String, required: true, maxlength: 200 }, notes: { type: String, default: '', maxlength: 2000 }, addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true } });
const expenseSchema = new mongoose.Schema({ description: { type: String, required: true, maxlength: 200 }, amount: { type: Number, required: true, min: 0.01 }, paidBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, date: { type: Date, default: Date.now } });
const pollOptionSchema = new mongoose.Schema({ text: { type: String, required: true, maxlength: 100 }, votes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] });
const pollSchema = new mongoose.Schema({ title: { type: String, required: true, maxlength: 200 }, options: [pollOptionSchema], createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true } });

const tripSchema = mongoose.Schema({
    tripName: { type: String, required: true, maxlength: 120 },
    inviteCode: { type: String, unique: true, sparse: true },
    blueprint: { tripDetails: tripDetailsSchema, route: routeSchema, weatherForecast: weatherForecastSchema, forecastCoverage: { requestedDays: Number, availableDays: Number }, transportOptions: transportOptionsSchema, accommodation: accommodationSchema, budget: budgetSchema },
    tripMode: { type: String, required: true, enum: ['Solo Trip', 'Group Trip'] },
    createdBy: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    itinerary: [itineraryItemSchema],
    expenses: [expenseSchema],
    polls: [pollSchema],
}, { timestamps: true });

const Trip = mongoose.model('Trip', tripSchema);
module.exports = Trip;