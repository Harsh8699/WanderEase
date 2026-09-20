# WanderEase

WanderEase is a travel planning application with destination discovery, route and weather-based trip blueprints, group trip collaboration, expense tracking, polls, and AI-assisted itinerary and packing suggestions.

## Requirements

- Node.js 18 or newer
- MongoDB
- Mapbox access token and API key
- OpenWeatherMap API key
- Google Gemini API key (optional; local AI fallbacks are available)

## Setup

Create environment files from the examples:

```sh
cp Backend/.env.example Backend/.env
cp frontend/.env.example frontend/.env
```

Install and run the backend:

```sh
cd Backend
npm install
npm start
```

Install and run the frontend in a second terminal:

```sh
cd frontend
npm install
npm run dev
```

The frontend runs on `http://localhost:8080` and the API runs on `http://localhost:5000` by default.

## Validation

```sh
cd frontend
npm run build
npm run lint
```

Backend JavaScript syntax can be checked without a database:

```sh
find Backend -name '*.js' -print0 | xargs -0 -n1 node --check
```

## Environment variables

See [Backend/.env.example](Backend/.env.example) and [frontend/.env.example](frontend/.env.example). Never commit real API keys, JWT secrets, or database credentials.