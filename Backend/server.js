// server.js
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const axios = require('axios');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const { csrfProtection } = require('./middleware/csrfMiddleware');

// Import route files
const authRoutes = require('./routes/authRoutes');
const searchRoutes = require('./routes/searchRoutes');
const tripRoutes = require('./routes/tripRoutes');
const planRoutes = require('./routes/planRoutes');
const placesRoutes = require('./routes/placesRoutes');
const aiRoutes = require('./routes/aiRoutes');

dotenv.config();
const app = express();
axios.defaults.timeout = 10000;
// Render terminates the public connection and forwards one proxy hop.
app.set('trust proxy', 1);

const allowedOrigins = process.env.CLIENT_URL
	? process.env.CLIENT_URL.split(',').map((origin) => origin.trim()).filter(Boolean)
	: ['http://localhost:8080'];

app.use(cors({
	origin: (origin, callback) => {
		if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
		return callback(new Error('Origin is not allowed by CORS'));
	},
	credentials: true,
}));
app.use(helmet());
app.use(cookieParser());
app.use(express.json({ limit: '1mb' }));
app.use(csrfProtection);

const apiLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 300,
	standardHeaders: true,
	legacyHeaders: false,
});
const authLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 20,
	standardHeaders: true,
	legacyHeaders: false,
});
const discoveryLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 60,
	standardHeaders: true,
	legacyHeaders: false,
});
const aiLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 30,
	standardHeaders: true,
	legacyHeaders: false,
});

// --- ROUTES ---
app.get('/', (req, res) => { res.send('API is running successfully!'); });
app.get('/health', (req, res) => {
	const databaseConnected = mongoose.connection.readyState === 1;
	return res.status(databaseConnected ? 200 : 503).json({
	status: 'ok',
	database: databaseConnected ? 'connected' : 'disconnected',
	});
});

// Mount Routers
app.use('/api', apiLimiter);
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/search', discoveryLimiter, searchRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/plan', planRoutes);
app.use('/api/places', placesRoutes);
app.use('/api/ai', aiLimiter, aiRoutes);

app.use((err, req, res, next) => {
	if (res.headersSent) return next(err);
	let statusCode = res.statusCode >= 400 ? res.statusCode : 500;
	if (err.name === 'ValidationError' || err.name === 'CastError') statusCode = 400;
	if (err.code === 11000) statusCode = 409;
	const message = statusCode >= 500 && process.env.NODE_ENV === 'production'
		? 'Internal server error'
		: (err.code === 11000 ? 'A record with that value already exists.' : (err.message || 'Internal server error'));
	res.status(statusCode).json({ message });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
	if (!process.env.JWT_SECRET) {
		throw new Error('JWT_SECRET is not configured. Create Backend/.env from Backend/.env.example.');
	}

	await connectDB();
	const server = app.listen(PORT, () => console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`));
	const shutdown = (signal) => {
		console.log(`${signal} received. Closing server.`);
		const forceExit = setTimeout(() => process.exit(1), 10000);
		server.close(async () => {
			clearTimeout(forceExit);
			await mongoose.connection.close();
			process.exit(0);
		});
	};
	process.once('SIGINT', shutdown);
	process.once('SIGTERM', shutdown);
};

startServer().catch((error) => {
	console.error(`Startup failed: ${error.message}`);
	process.exitCode = 1;
});

module.exports = { app, startServer };