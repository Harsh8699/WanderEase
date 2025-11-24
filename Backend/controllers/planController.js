// /controllers/planController.js
const asyncHandler = require('express-async-handler');
const axios = require('axios');

// ✈ Flight Pricing (Domestic, economy)
const simulateFlightCost = (distanceKm) => {
  if (distanceKm < 250) return null; // short trips usually not worth flights

  const baseFare = 2800; // typical starting fare
  const perKmCost = 4.8; // average domestic airfare/km in India
  let cost = baseFare + distanceKm * perKmCost;

  // Fuel surcharge & airport fee approx
  cost += 500;

  return Math.round(cost / 100) * 100;
};


// 🚌 Bus Pricing (AC Sleeper or Semi-Sleeper)
const simulateBusCost = (distanceKm) => {
  if (distanceKm < 50) return null;

  const perKmCost = 2.2; // average AC sleeper fare
  let cost = distanceKm * perKmCost;

  // round off to nearest 50
  return Math.round(cost / 50) * 50;
};


// 🚗 Car / Cab Pricing (Outstation rental norms in India)
const simulateCarCost = (distanceKm, days = 1, carType = "sedan") => {
  const ratePerKm = {
    hatchback: 12,
    sedan: 14,
    suv: 18
  };

  const minDailyKm = 250; // Outstation rule
  const driverAllowance = 400; // per day
  const perKmCost = ratePerKm[carType] || 14;

  // Outstation taxis count *return distance*
  const billableDistance = Math.max(distanceKm * 2, minDailyKm * days);

  let cost = billableDistance * perKmCost + driverAllowance * days;

  // round off to nearest 100
  return Math.round(cost / 100) * 100;
};


// 🏨 Hotel Pricing (Tier-wise)
const simulateHotelCost = (destinationTier, duration, roomType = "standard") => {
  // tier: 1 = metro, 2 = tourist city, 3 = small cities
  const tierBaseRate = {
    1: 3500,  // Delhi, Mumbai, Bangalore
    2: 2500,  // Goa, Jaipur, Manali, Coorg
    3: 1200   // Towns & smaller tourist spots
  };

  const roomMultiplier = {
    standard: 1,
    deluxe: 1.6,
    luxury: 2.4
  };

  const baseRate = tierBaseRate[destinationTier] || 2000;
  const multiplier = roomMultiplier[roomType] || 1;

  return Math.round(baseRate * multiplier * duration / 100) * 100;
};

// Fetch real weather forecast using OpenWeatherMap 5-day/3-hour API
const fetchWeatherForecast = async (lat, lon, departureDate, duration) => {
    const apiKey = process.env.OPENWEATHERMAP_API_KEY;
    if (!apiKey) {
        throw new Error('Server configuration error: OpenWeatherMap API key is missing.');
    }

    // Clamp duration to the 5-day forecast window supported by this endpoint
    const days = Math.min(parseInt(duration, 10) || 1, 5);

    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
    const response = await axios.get(url);

    const startDate = new Date(departureDate);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + days);

    const dailyData = {};

    for (const entry of response.data.list || []) {
        const dt = new Date(entry.dt * 1000);
        if (dt < startDate || dt >= endDate) continue;

        const dayKey = dt.toISOString().split('T')[0];
        const tempMax = entry.main?.temp_max;
        const tempMin = entry.main?.temp_min;
        const weather = (entry.weather && entry.weather[0]) || {};

        if (!dailyData[dayKey]) {
            dailyData[dayKey] = {
                date: dayKey,
                temp_max: tempMax,
                temp_min: tempMin,
                descriptions: [weather.description || ''],
                icon: weather.icon || '02d',
            };
        } else {
            dailyData[dayKey].temp_max = Math.max(dailyData[dayKey].temp_max, tempMax);
            dailyData[dayKey].temp_min = Math.min(dailyData[dayKey].temp_min, tempMin);
            dailyData[dayKey].descriptions.push(weather.description || '');
        }
    }

    let sortedDays = Object.values(dailyData).sort((a, b) => a.date.localeCompare(b.date));

    // If there is no data exactly for the requested date range (e.g. departure date is too far
    // in the future or in the past), fall back to the earliest available forecast days
    if (sortedDays.length === 0) {
        const fallbackDailyData = {};
        for (const entry of response.data.list || []) {
            const dt = new Date(entry.dt * 1000);
            const dayKey = dt.toISOString().split('T')[0];
            const tempMax = entry.main?.temp_max;
            const tempMin = entry.main?.temp_min;
            const weather = (entry.weather && entry.weather[0]) || {};

            if (!fallbackDailyData[dayKey]) {
                fallbackDailyData[dayKey] = {
                    date: dayKey,
                    temp_max: tempMax,
                    temp_min: tempMin,
                    descriptions: [weather.description || ''],
                    icon: weather.icon || '02d',
                };
            } else {
                fallbackDailyData[dayKey].temp_max = Math.max(fallbackDailyData[dayKey].temp_max, tempMax);
                fallbackDailyData[dayKey].temp_min = Math.min(fallbackDailyData[dayKey].temp_min, tempMin);
                fallbackDailyData[dayKey].descriptions.push(weather.description || '');
            }
        }

        sortedDays = Object.values(fallbackDailyData).sort((a, b) => a.date.localeCompare(b.date));
    }

    // If still nothing, return a single placeholder day
    if (sortedDays.length === 0) {
        const fallbackDate = new Date().toISOString().split('T')[0];
        return [{
            date: fallbackDate,
            temp_max: 25,
            temp_min: 15,
            description: 'No forecast data available',
            icon: '02d',
        }];
    }

    // Normalize to the requested number of days, reusing the last available day if needed
    const result = [];
    for (let i = 0; i < days; i++) {
        if (sortedDays[i]) {
            const day = sortedDays[i];
            result.push({
                date: day.date,
                temp_max: day.temp_max,
                temp_min: day.temp_min,
                description: day.descriptions.find(Boolean) || 'clear sky',
                icon: day.icon,
            });
        } else {
            const last = sortedDays[sortedDays.length - 1];
            result.push({
                date: last.date,
                temp_max: last.temp_max,
                temp_min: last.temp_min,
                description: last.descriptions.find(Boolean) || 'clear sky',
                icon: last.icon,
            });
        }
    }

    return result;
};

const formatCityForUrl = (cityName) => cityName.toLowerCase().replace(/\s+/g, '-');
const getTierForCity = (mapboxContext) => { if (!mapboxContext) return 2; const majorMetros = /Mumbai|Delhi|Bangalore|Chennai|Kolkata|Hyderabad|Goa/i; for (const context of mapboxContext) { if (context.id.startsWith('place') && context.text.match(majorMetros)) { return 1; } if (context.id.startsWith('place')) { return 2; } } return 3; };

const generateTripBlueprint = asyncHandler(async (req, res) => {
    const { origin, destinationName, departureDate, duration, travelers } = req.body;
    if (!origin || !destinationName || !departureDate || !duration || !travelers) { res.status(400); throw new Error('Missing required fields'); }

    const mapboxApiKey = process.env.MAPBOX_API_KEY;
    if (!mapboxApiKey) { res.status(500); throw new Error('Server configuration error: Mapbox API key is missing.'); }

    const destGeocodeUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(destinationName)}.json?access_token=${mapboxApiKey}&limit=1&country=IN`;
    const destGeocodeResponse = await axios.get(destGeocodeUrl);
    if (!destGeocodeResponse.data || destGeocodeResponse.data.features.length === 0) { res.status(404); throw new Error('Could not find the destination city.'); }
    
    const destinationFeature = destGeocodeResponse.data.features[0];
    const destination = { name: destinationFeature.text, lon: destinationFeature.center[0], lat: destinationFeature.center[1], tier: getTierForCity(destinationFeature.context) };
    
    const originGeocodeUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(origin)}.json?access_token=${mapboxApiKey}&limit=1&country=IN`;
    const originGeocodeResponse = await axios.get(originGeocodeUrl);
    if (!originGeocodeResponse.data || originGeocodeResponse.data.features.length === 0) { res.status(400); throw new Error('Could not find the origin city.'); }
    
    const originCoords = originGeocodeResponse.data.features[0].center;
    const directionsUrl = `https://api.mapbox.com/directions/v5/mapbox/driving/${originCoords.join(',')};${destination.lon},${destination.lat}?geometries=geojson&access_token=${mapboxApiKey}`;
    const directionsResult = await axios.get(directionsUrl);
    
    const primaryRoute = directionsResult.data.routes[0];
    const distanceKm = primaryRoute.distance / 1000;

    // Use real weather forecast based on destination coordinates and trip dates
    const forecast = await fetchWeatherForecast(destination.lat, destination.lon, departureDate, duration);

    const flightCost = simulateFlightCost(distanceKm);
    const busCost = simulateBusCost(distanceKm);
    const carCost = simulateCarCost(distanceKm);
    const hotelCost = simulateHotelCost(destination.tier, duration);
    
    const originUrl = formatCityForUrl(origin);
    const destUrl = formatCityForUrl(destination.name);

    const transportOptions = { flight: { costPerPerson: flightCost, link: `https://www.skyscanner.co.in/transport/flights-from/${originUrl}-to/${destUrl}` }, bus: { costPerPerson: busCost, link: `https://www.redbus.in/bus-tickets/${originUrl}-to-${destUrl}` }, car: { totalCost: carCost, link: `https://www.olacabs.com/outstation` }, };
    const accommodation = { estimatedTotalCost: hotelCost, link: `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(destination.name)}` };
    
    const totalHotelCost = hotelCost;
    const otherCosts = (1500 * destination.tier) * duration * travelers;
    const cheapestTransport = Math.min((flightCost || Infinity) * travelers, (busCost || Infinity) * travelers, carCost || Infinity);
    const totalEstimatedCost = totalHotelCost + otherCosts + cheapestTransport;

    const blueprint = {
        tripDetails: { origin, destinationName: destination.name, departureDate, duration, travelers },
        route: {
            distanceKm,
            origin: { name: origin, lon: originCoords[0], lat: originCoords[1] },
            destination: { name: destination.name, lon: destination.lon, lat: destination.lat },
            geometry: primaryRoute.geometry, // GeoJSON LineString
        },
        weatherForecast: forecast,
        transportOptions,
        accommodation,
        budget: {
            totalEstimatedCost: Math.round(totalEstimatedCost / 100) * 100,
            costPerPerson: Math.round(totalEstimatedCost / travelers / 100) * 100,
        },
    };
    res.status(200).json(blueprint);
});

module.exports = { generateTripBlueprint };