// /controllers/searchController.js
const asyncHandler = require('express-async-handler');
const axios = require('axios');

const destinationsInIndia = [ { name: 'Goa', lat: 15.2993, lon: 74.1240, tier: 1 }, { name: 'Mumbai', lat: 19.0760, lon: 72.8777, tier: 1 }, { name: 'Leh', lat: 34.1526, lon: 77.5771, tier: 1 }, { name: 'Shimla', lat: 31.1048, lon: 77.1734, tier: 2 }, { name: 'Jaipur', lat: 26.9124, lon: 75.7873, tier: 2 }, { name: 'Kochi', lat: 9.9312, lon: 76.2673, tier: 2 }, { name: 'Ooty', lat: 11.4100, lon: 76.6950, tier: 2 }, { name: 'Darjeeling', lat: 27.0410, lon: 88.2663, tier: 3 }, { name: 'Rishikesh', lat: 30.0869, lon: 78.2676, tier: 3 }, { name: 'Varanasi', lat: 25.3176, lon: 82.9739, tier: 3 }, ];
const weatherPreferences = { 'Hot': { min: 25, max: 50 }, 'Warm': { min: 15, max: 29.9 }, 'Cool': { min: 0, max: 20 }, 'Snowy': { min: -20, max: 10 }, };

const getTeaserCost = (destinationTier, duration) => {
    const baseCosts = { hotel: 2500, travelAndFood: 2000 };
    const tierMultipliers = { 1: 1.6, 2: 1.0, 3: 0.7 };
    const multiplier = tierMultipliers[destinationTier] || 1;
    const dailyCost = (baseCosts.hotel + baseCosts.travelAndFood) * multiplier;
    const totalCost = dailyCost * duration;
    return Math.round(totalCost / 100) * 100;
};

const discoverDestinations = asyncHandler(async (req, res) => {
    const { weather, duration } = req.body;
    if (!weather || !weatherPreferences[weather]) { res.status(400); throw new Error('A valid weather preference is required.'); }
    if (!duration || isNaN(duration) || duration < 1) { res.status(400); throw new Error('A valid trip duration is required.'); }
    
    const tempRange = weatherPreferences[weather];
    const apiKey = process.env.OPENWEATHERMAP_API_KEY;
    if (!apiKey) { res.status(500); throw new Error('Server configuration error: Weather API key is missing.'); }

    const weatherDataPromises = destinationsInIndia.map(dest => axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${dest.lat}&lon=${dest.lon}&appid=${apiKey}&units=metric`));
    const weatherResponses = await Promise.allSettled(weatherDataPromises);
    const matchingDestinations = [];

    weatherResponses.forEach((result, index) => {
        if (result.status === 'fulfilled') {
            const response = result.value;
            const currentTemp = response.data.main.temp;
            const currentDestination = destinationsInIndia[index];
            if (currentTemp >= tempRange.min && currentTemp <= tempRange.max) {
                matchingDestinations.push({ name: currentDestination.name, currentTemp: Math.round(currentTemp), weatherDescription: response.data.weather[0].description, estimatedCostPerPerson: getTeaserCost(currentDestination.tier, parseInt(duration)), });
            }
        } else {
            console.error(`Failed to fetch weather for ${destinationsInIndia[index].name}:`, result.reason.message);
        }
    });

    if (matchingDestinations.length > 0) {
        res.status(200).json(matchingDestinations);
    } else {
        res.status(404).json({ message: 'No destinations found matching your weather preference right now. Try another one!' });
    }
});

module.exports = { discoverDestinations };