// /controllers/aiController.js
const asyncHandler = require('express-async-handler');
const axios = require('axios');

// --- Helpers: Gemini client & JSON extraction ---
const callGemini = async (prompt) => {
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error('Server configuration error: GOOGLE_GEMINI_API_KEY is missing.');
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;
    const response = await axios.post(url, {
        contents: [
            {
                role: 'user',
                parts: [{ text: prompt }],
            },
        ],
    });

    const parts = response.data?.candidates?.[0]?.content?.parts || [];
    const text = parts.map((p) => p.text || '').join(' ').trim();
    if (!text) {
        throw new Error('Empty response from Gemini');
    }
    return text;
};

const extractJson = (text) => {
    // Handle fenced code blocks like ```json ... ``` or plain JSON
    const fenceMatch = text.match(/```json([\s\S]*?)```/i) || text.match(/```([\s\S]*?)```/);
    const jsonString = fenceMatch ? fenceMatch[1] : text;
    return JSON.parse(jsonString.trim());
};

// --- MOCK fallback itinerary generator ---
// When Gemini is unavailable, we generate WEATHER-AWARE, RANDOM itineraries
// from a relatively large in-memory dataset. Each day gets AT LEAST 4
// activity suggestions tailored to the forecast where possible.
const generateMockItinerary = (destinationName, duration, weatherForecast = []) => {
    const safeDestination = destinationName || 'your destination';

    const ACTIVITY_LIBRARY = {
        any: [
            'Explore a popular local market and try street food',
            'Join a guided city walking tour to learn local history',
            'Visit a landmark viewpoint for sunset photos',
            'Try a highly rated local restaurant for dinner',
            'Discover a less touristy neighborhood on foot',
            'Visit a local art gallery or cultural center',
            'Take an evening food crawl in a busy area',
            'Relax at a café and journal about your trip so far',
            'Join a small-group experience (workshop, tasting, or class)',
            'Walk along the main city promenade or riverfront',
        ],
        clear: [
            'Early morning walk or run in a scenic park',
            'Sunrise viewpoint overlooking {destination}',
            'Open-top bus or tuktuk tour around {destination}',
            'Golden-hour photo walk near the old town area',
            'Rooftop café visit with views over {destination}',
            'Outdoor street-food hop in the evening',
        ],
        cloudy: [
            'Leisurely photo walk around the historic center of {destination}',
            'Visit a calm lakeside or riverside promenade',
            'Coffee hopping between two or three interesting cafés',
            'Slow walk through a residential neighborhood to see local life',
        ],
        rainy: [
            'Visit the main city museum or history museum (indoor)',
            'Spend a few hours at a large shopping mall or bazaar (mostly indoor)',
            'Find a cosy café with board games or books',
            'Watch a movie in a local cinema or multiplex',
            'Indoor food-court tasting tour',
            'Take a short cab ride to a famous indoor temple/church/mosque',
        ],
        cold: [
            'Short scenic walk followed by hot tea or coffee at a nearby café',
            'Visit an indoor viewpoint or observatory if available',
            'Try a hearty local soup or winter-special dish',
            'Browse a covered market for warm clothes and souvenirs',
        ],
        hot: [
            'Start the day early with a short outdoor walk before it gets too hot',
            'Midday break at an air-conditioned mall or café',
            'Evening riverside or seafront walk when it is cooler',
            'Try a popular local ice-cream or cold dessert spot',
        ],
        snowy: [
            'Snow walk or light hike with proper winter gear around {destination}',
            'Visit a viewpoint for snowy landscape photos',
            'Warm up at a café with hot chocolate or chai',
            'Indoor cultural show or local performance in the evening',
        ],
        stormy: [
            'Stay mostly indoor at a safe, cosy café or coworking space',
            'Visit a nearby indoor attraction reachable by short taxi ride',
            'Have a long lunch at a well-reviewed restaurant',
            'Relax at the hotel and plan the next days of the trip in detail',
        ],
    };

    const classifyWeatherTags = (dayWeather = {}) => {
        const desc = (dayWeather.description || '').toLowerCase();
        const tMax = typeof dayWeather.temp_max === 'number' ? dayWeather.temp_max : undefined;
        const tMin = typeof dayWeather.temp_min === 'number' ? dayWeather.temp_min : undefined;

        const tags = ['any'];

        if (desc.includes('rain') || desc.includes('drizzle') || desc.includes('shower')) tags.push('rainy');
        if (desc.includes('snow') || desc.includes('sleet')) tags.push('snowy');
        if (desc.includes('storm') || desc.includes('thunder')) tags.push('stormy');
        if (desc.includes('cloud') || desc.includes('overcast') || desc.includes('fog') || desc.includes('mist')) {
            tags.push('cloudy');
        }
        if (desc.includes('clear') || desc.includes('sun')) tags.push('clear');

        if (typeof tMax === 'number') {
            if (tMax >= 30) tags.push('hot');
            if (tMax <= 10) tags.push('cold');
        }
        if (typeof tMin === 'number' && tMin <= 5 && !tags.includes('cold')) tags.push('cold');

        return Array.from(new Set(tags));
    };

    const pickRandom = (arr, count) => {
        if (!Array.isArray(arr) || arr.length === 0) return [];
        const copy = [...arr];
        const result = [];
        while (copy.length > 0 && result.length < count) {
            const idx = Math.floor(Math.random() * copy.length);
            result.push(copy[idx]);
            copy.splice(idx, 1);
        }
        return result;
    };

    const suggestions = [];

    for (let i = 1; i <= duration; i++) {
        const dayWeather = Array.isArray(weatherForecast) && weatherForecast[i - 1]
            ? weatherForecast[i - 1]
            : (weatherForecast[0] || {});

        const tags = classifyWeatherTags(dayWeather);

        let pool = [...ACTIVITY_LIBRARY.any];
        if (tags.includes('clear')) pool = pool.concat(ACTIVITY_LIBRARY.clear);
        if (tags.includes('cloudy')) pool = pool.concat(ACTIVITY_LIBRARY.cloudy);
        if (tags.includes('rainy')) pool = pool.concat(ACTIVITY_LIBRARY.rainy);
        if (tags.includes('cold')) pool = pool.concat(ACTIVITY_LIBRARY.cold);
        if (tags.includes('hot')) pool = pool.concat(ACTIVITY_LIBRARY.hot);
        if (tags.includes('snowy')) pool = pool.concat(ACTIVITY_LIBRARY.snowy);
        if (tags.includes('stormy')) pool = pool.concat(ACTIVITY_LIBRARY.stormy);

        // Ensure we have a reasonably sized pool.
        if (pool.length === 0) {
            pool = [...ACTIVITY_LIBRARY.any];
        }

        const templates = pickRandom(pool, 4); // 4 different suggestions per day
        const activities = templates.map((tpl) =>
            String(tpl).replace(/\{destination\}/g, safeDestination)
        );

        suggestions.push({
            day: i,
            activities,
        });
    }

    return { suggestions };
};


// @desc    Suggest an itinerary based on destination and weather (Gemini with mock fallback)
// @route   POST /api/ai/suggest-itinerary
// @access  Private
const suggestItinerary = asyncHandler(async (req, res) => {
    const { destinationName, duration, weatherForecast } = req.body;

    if (!destinationName || !duration || !weatherForecast) {
        res.status(400);
        throw new Error('Destination, duration, and weather forecast are required.');
    }

    const days = parseInt(duration, 10) || 1;
    const weatherSummary = Array.isArray(weatherForecast)
        ? weatherForecast
              .map(
                  (d, index) =>
                      `Day ${index + 1}: ${d.date || ''} - ${d.description || ''} (high ${d.temp_max}°C, low ${d.temp_min}°C)`,
              )
              .join('\n')
        : '';

    const prompt = `You are an expert travel planner.
Destination: ${destinationName}.
Trip length: ${days} days.
Weather forecast by day (if available):\n${weatherSummary || 'not available'}.

Create a practical, fun itinerary. For each day 1 to ${days}, propose 2–4 short activity descriptions.
Respond ONLY as valid JSON in this exact format:
{
  "suggestions": [
    { "day": 1, "activities": ["activity 1", "activity 2"] },
    { "day": 2, "activities": ["..."] }
  ]
}
Do not include any explanation or text outside of the JSON.`;

    try {
        const text = await callGemini(prompt);
        const data = extractJson(text);

        if (!data || !Array.isArray(data.suggestions)) {
            throw new Error('Unexpected Gemini itinerary format');
        }

        // Normalize days to 1..days
        const normalized = data.suggestions
            .filter((s) => s && typeof s.day === 'number' && Array.isArray(s.activities))
            .map((s) => ({
                day: s.day,
                activities: s.activities.map((a) => String(a)),
            }));

        if (normalized.length === 0) {
            throw new Error('Empty suggestions from Gemini');
        }

        return res.status(200).json({ suggestions: normalized });
    } catch (err) {
        console.error('Gemini itinerary failed, using mock fallback:', err.message || err);
        const mockResponse = generateMockItinerary(destinationName, days, weatherForecast || []);
        return res.status(200).json(mockResponse);
    }
});

// --- MOCK fallback backpack list generator ---
// Weather-aware, randomised packing list built from a larger dataset.
const generateMockBackpackList = (destinationName, duration, travelers, weatherForecast = []) => {
    const days = parseInt(duration, 10) || 1;
    const people = parseInt(travelers, 10) || 1;

    const anyCold = weatherForecast.some((d) => {
        const tMax = typeof d.temp_max === 'number' ? d.temp_max : undefined;
        const tMin = typeof d.temp_min === 'number' ? d.temp_min : undefined;
        return (typeof tMax === 'number' && tMax <= 15) || (typeof tMin === 'number' && tMin <= 8);
    });

    const anyHot = weatherForecast.some((d) => {
        const tMax = typeof d.temp_max === 'number' ? d.temp_max : undefined;
        return typeof tMax === 'number' && tMax >= 30;
    });

    const anyRainy = weatherForecast.some((d) =>
        String(d.description || '').toLowerCase().match(/rain|drizzle|shower/)
    );

    const BASE_PACKING_LIBRARY = {
        Clothing: {
            base: [
                `${days}x comfortable T-shirts`,
                `${Math.max(2, Math.ceil(days / 2))}x pants / jeans`,
                `${Math.max(2, days)}x sets of socks & underwear`,
                'Comfortable walking shoes',
                'Sleepwear or night dress',
            ],
            cold: [
                'Warm jacket or fleece',
                'Thermal inner layers',
                'Beanie / woolen cap',
                'Gloves and warm socks',
            ],
            hot: [
                'Light cotton shirts or kurtas',
                'Breathable shorts or linen pants',
                'Cap or hat for sun protection',
            ],
            rainy: [
                'Lightweight rain jacket or poncho',
                'Quick-dry clothes',
                'Waterproof footwear or sandals',
            ],
        },
        Toiletries: {
            base: [
                'Toothbrush & toothpaste',
                'Face wash & moisturizer',
                'Deodorant / perfume',
                'Hairbrush or comb',
                'Travel-size shampoo & conditioner',
                'Soap / body wash',
            ],
            hot: ['High SPF sunscreen', 'Aloe vera gel (after-sun care)'],
            cold: ['Lip balm (for dry weather)', 'Heavy moisturizer'],
        },
        'Documents & Money': {
            base: [
                'Government ID / Passport',
                'Tickets & booking confirmations (printed or digital)',
                'Wallet with cards & some cash',
                'Emergency cash hidden separately',
                'Travel insurance details (if any)',
            ],
        },
        Electronics: {
            base: [
                'Phone & charger',
                'Power bank',
                'Earphones / headphones',
                'Universal travel adapter (if needed)',
                'Charging cables for all devices',
            ],
            any: ['Optional: camera with extra battery & memory card'],
        },
        'Health & Safety': {
            base: [
                'Basic medicines (fever, cold, stomach, pain relief)',
                'Any personal prescription medicines',
                'Band-aids / basic first-aid kit',
                'Reusable water bottle',
                'Hand sanitizer & wet wipes',
                'Small pack of tissues / napkins',
            ],
            rainy: ['Small umbrella or compact rain poncho'],
            hot: ['Electrolyte packets OR ORS sachets'],
        },
        'Extras (Optional)': {
            base: [
                'Small backpack / daypack for daily use',
                'Sunglasses',
                'Reusable shopping bag',
                'Notebook & pen',
                `Snacks for ${people} traveler(s)` ,
            ],
        },
    };

    const pickRandom = (arr, min, max) => {
        if (!Array.isArray(arr) || arr.length === 0) return [];
        const count = Math.min(arr.length, Math.max(min, Math.min(max, arr.length)));
        const copy = [...arr];
        const result = [];
        while (copy.length > 0 && result.length < count) {
            const idx = Math.floor(Math.random() * copy.length);
            result.push(copy[idx]);
            copy.splice(idx, 1);
        }
        return result;
    };

    const buildCategoryItems = (name, config) => {
        const itemsSet = new Set();

        (config.base || []).forEach((i) => itemsSet.add(i));
        if (anyCold && config.cold) config.cold.forEach((i) => itemsSet.add(i));
        if (anyHot && config.hot) config.hot.forEach((i) => itemsSet.add(i));
        if (anyRainy && config.rainy) config.rainy.forEach((i) => itemsSet.add(i));
        if (config.any) config.any.forEach((i) => itemsSet.add(i));

        const allItems = Array.from(itemsSet);
        const sampled = pickRandom(allItems, 4, 10); // 4–10 items per category
        return {
            category: name,
            items: sampled,
        };
    };

    const categories = Object.entries(BASE_PACKING_LIBRARY).map(([name, config]) =>
        buildCategoryItems(name, config)
    );

    return { categories };
};

// @desc    Generate smart backpack list using Gemini
// @route   POST /api/ai/backpack-list
// @access  Private
const generateBackpackList = asyncHandler(async (req, res) => {
    const { destinationName, duration, travelers, weatherForecast } = req.body;

    if (!destinationName || !duration || !travelers) {
        res.status(400);
        throw new Error('Destination, duration, and travelers are required.');
    }

    const days = parseInt(duration, 10) || 1;
    const people = parseInt(travelers, 10) || 1;

    const weatherSummary = Array.isArray(weatherForecast)
        ? weatherForecast
              .map(
                  (d, index) =>
                      `Day ${index + 1}: ${d.date || ''} - ${d.description || ''} (high ${d.temp_max}°C, low ${d.temp_min}°C)`,
              )
              .join('\n')
        : '';

    const prompt = `You are a smart travel packing assistant.
Destination: ${destinationName}.
Trip length: ${days} days.
Number of travelers: ${people}.
Weather forecast by day (if available):\n${weatherSummary || 'not available'}.

Suggest a smart backpack packing list grouped by category. Think about clothing, footwear, toiletries, electronics, documents, medicines, and optional items.
Respond ONLY as valid JSON in this exact format:
{
  "categories": [
    { "category": "Clothing", "items": ["T-shirts", "Jeans", "Jacket"] },
    { "category": "Toiletries", "items": ["Toothbrush", "Toothpaste"] }
  ]
}
Do not include any explanation or text outside of the JSON.`;

    try {
        const text = await callGemini(prompt);
        const data = extractJson(text);

        if (!data || !Array.isArray(data.categories)) {
            throw new Error('Unexpected Gemini backpack format');
        }

        const normalized = data.categories
            .filter((c) => c && c.category && Array.isArray(c.items))
            .map((c) => ({
                category: String(c.category),
                items: c.items.map((i) => String(i)),
            }));

        return res.status(200).json({ categories: normalized });
    } catch (err) {
        console.error('Gemini backpack list failed, using mock fallback:', err.message || err);
        const mock = generateMockBackpackList(destinationName, days, people, weatherForecast || []);
        return res.status(200).json(mock);
    }
});

module.exports = {
    suggestItinerary,
    generateBackpackList,
};
