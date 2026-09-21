// /controllers/placesController.js
const asyncHandler = require('express-async-handler');
const axios = require('axios');

const getPointsOfInterest = asyncHandler(async (req, res) => {
    const { city, category } = req.query;
    if (typeof city !== 'string' || city.trim().length < 2 || city.length > 100 || typeof category !== 'string') { res.status(400); throw new Error('A valid city and category are required.'); }
    
    const mapboxApiKey = process.env.MAPBOX_API_KEY;
    if (!mapboxApiKey) { res.status(500); throw new Error('Server configuration error: Mapbox API key is missing.'); }

    const geocodeUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(city)}.json?access_token=${mapboxApiKey}&limit=1&country=IN`;
    const geocodeResponse = await axios.get(geocodeUrl);
    if (!geocodeResponse.data?.features?.length) { res.status(404); throw new Error('Could not find the city.'); }
    
    const [lon, lat] = geocodeResponse.data.features[0].center;
    const categoryMap = { 'attraction': 'tourist_attraction', 'restaurant': 'restaurant', 'cafe': 'cafe', 'hotel': 'hotel' };
    const mapboxCategory = categoryMap[category.toLowerCase()];
    if (!mapboxCategory) { res.status(400); throw new Error('Invalid category.'); }
    
    const poiUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${mapboxCategory}.json?proximity=${lon},${lat}&access_token=${mapboxApiKey}&limit=10&country=IN`;
    const poiResponse = await axios.get(poiUrl);
    if (!poiResponse.data?.features) { res.status(502); throw new Error('Places provider returned an invalid response.'); }
    
    const places = poiResponse.data.features.map(place => ({ id: place.id, name: place.text, address: place.properties.address || 'N/A', category: place.properties.category, coordinates: { lon: place.center[0], lat: place.center[1] } }));
    res.status(200).json(places);
});

module.exports = { getPointsOfInterest };