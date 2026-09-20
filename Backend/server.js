// server.js
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Import route files
const authRoutes = require('./routes/authRoutes');
const searchRoutes = require('./routes/searchRoutes');
const tripRoutes = require('./routes/tripRoutes');
const planRoutes = require('./routes/planRoutes');
const placesRoutes = require('./routes/placesRoutes');
const aiRoutes = require('./routes/aiRoutes');

dotenv.config();
const app = express();

const allowedOrigins = process.env.CLIENT_URL
	? process.env.CLIENT_URL.split(',').map((origin) => origin.trim()).filter(Boolean)
	: true;

app.use(cors({ origin: allowedOrigins }));
app.use(express.json({ limit: '1mb' }));

// --- ROUTES ---
app.get('/', (req, res) => { res.send('API is running successfully!'); });

// Mount Routers
app.use('/api/auth', authRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/plan', planRoutes);
app.use('/api/places', placesRoutes);
app.use('/api/ai', aiRoutes);

app.use((err, req, res, next) => {
	if (res.headersSent) return next(err);
	const statusCode = res.statusCode >= 400 ? res.statusCode : 500;
	res.status(statusCode).json({ message: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
	if (!process.env.JWT_SECRET) {
		throw new Error('JWT_SECRET is not configured. Create Backend/.env from Backend/.env.example.');
	}

	await connectDB();
	app.listen(PORT, () => console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`));
};

startServer().catch((error) => {
	console.error(`Startup failed: ${error.message}`);
	process.exitCode = 1;
});

module.exports = { app, startServer };