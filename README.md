# WanderEase

WanderEase is a full-stack travel planning application for discovering destinations, building trip blueprints, coordinating group travel, tracking expenses, running polls, and generating AI-assisted itineraries and packing lists.

## Features

- Weather-based destination discovery for Indian destinations
- Route planning with Mapbox geocoding and driving directions
- Budget estimates for transport, accommodation, and trip costs
- Secure cookie-based authentication with session revocation on logout
- Solo and group trips with invite codes
- Shared itineraries, expenses, and polls
- Mapbox route visualization
- Gemini-powered itinerary and packing suggestions with local fallbacks
- Responsive light and dark themes

## Architecture

```text
frontend/   React 18 + Vite + Tailwind CSS
Backend/    Express 5 + MongoDB/Mongoose API
Database    MongoDB
External    Mapbox, OpenWeatherMap, Gemini, optional Unsplash
```

The frontend communicates with the backend through Axios. Authentication uses an HttpOnly cookie, so the browser application does not read or persist JWTs directly.

## Requirements

- Node.js 18 or newer
- npm
- MongoDB 6 or newer, local or hosted
- Mapbox access token and server API key
- OpenWeatherMap API key
- Google Gemini API key (optional; local AI fallbacks are available)
- Unsplash access key (optional; used for destination images)

## Quick Start

### 1. Configure environment files

```sh
cp Backend/.env.example Backend/.env
cp frontend/.env.example frontend/.env
```

Fill in the API keys and database connection string. Never commit either `.env` file.

### 2. Start the backend

```sh
cd Backend
npm install
npm run dev
```

The API starts on `http://localhost:5000` by default. For a production-style start without automatic restarts:

```sh
npm start
```

### 3. Start the frontend

In a second terminal:

```sh
cd frontend
npm install
npm run dev
```

The frontend starts on `http://localhost:8080` by default.

## Environment Variables

### Backend

See [Backend/.env.example](Backend/.env.example).

| Variable | Required | Purpose |
| --- | --- | --- |
| `MONGO_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | Long random signing secret |
| `MAPBOX_API_KEY` | Yes | Server-side geocoding and routing |
| `OPENWEATHERMAP_API_KEY` | Yes | Destination and trip forecasts |
| `GOOGLE_GEMINI_API_KEY` | No | Gemini itinerary and packing suggestions |
| `CLIENT_URL` | Yes | Allowed frontend origin(s), comma-separated |
| `COOKIE_SAME_SITE` | Usually | `lax` locally; use `none` for cross-site HTTPS deployments |
| `PORT` | No | API port, defaults to `5000` |
| `NODE_ENV` | No | Use `production` for deployment |

### Frontend

See [frontend/.env.example](frontend/.env.example).

| Variable | Required | Purpose |
| --- | --- | --- |
| `VITE_API_URL` | Yes | Backend base URL |
| `VITE_MAPBOX_ACCESS_TOKEN` | Yes for maps | Browser Mapbox rendering token |
| `VITE_UNSPLASH_ACCESS_KEY` | No | Destination card images |

## API Overview

All protected routes require the authenticated HttpOnly session cookie.

| Area | Routes |
| --- | --- |
| Auth | `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`, `POST /api/auth/logout` |
| Discovery | `POST /api/search/discover` |
| Planning | `POST /api/plan/generate` |
| Places | `GET /api/places` |
| AI | `POST /api/ai/suggest-itinerary`, `POST /api/ai/backpack-list` |
| Trips | Create, list, view, delete, join, itinerary, expenses, polls, and voting under `/api/trips` |
| Health | `GET /health` |

## Validation

Frontend checks:

```sh
cd frontend
npm run lint
npm run build
```

Backend syntax check:

```sh
find Backend -name '*.js' -print0 | xargs -0 -n1 node --check
```

Dependency audits:

```sh
cd Backend && npm audit --omit=dev
cd ../frontend && npm audit --omit=dev
```

Tests are not currently included in the project workflow.

## Production Checklist

- Set `NODE_ENV=production`.
- Generate a long, random `JWT_SECRET`.
- Use HTTPS for both frontend and API so secure cookies work correctly.
- Set `CLIENT_URL` to the exact deployed frontend origin.
- Set `COOKIE_SAME_SITE=none` only when frontend and API are on different sites and both use HTTPS.
- Use managed MongoDB with backups and restricted network access.
- Monitor API quotas, rate limits, errors, and database health.
- Verify `GET /health` from your deployment platform.
- Build the frontend with `npm run build` and serve the generated `dist` directory.

## Known Limitations

- OpenWeatherMap's forecast endpoint provides approximately five days of forecast data. Longer trips show partial coverage rather than fabricated weather.
- Mapbox is lazy-loaded, but its dedicated map chunk remains large because of the mapping engine.
- Rate limiting is process-local. Multi-instance deployments should use a shared rate-limit store such as Redis.
- External API availability affects destination discovery, route planning, places, and forecast generation.

## Project Structure

```text
Backend/
	config/          Database connection
	controllers/     Request handlers and external API integrations
	middleware/      Authentication, CSRF, and validation middleware
	models/          User and Trip schemas
	routes/          Express route definitions
	server.js        API entry point

frontend/
	src/components/  Shared layout, map, and UI components
	src/contexts/    Authentication and theme state
	src/pages/       Application screens
	src/services/    Backend API clients
	src/lib/         Axios and shared utilities
```