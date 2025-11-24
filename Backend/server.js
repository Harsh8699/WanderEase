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
connectDB();
const app = express();

app.use(cors());
app.use(express.json());

// --- ROUTES ---
app.get('/', (req, res) => { res.send('API is running successfully!'); });

// Mount Routers
app.use('/api/auth', authRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/plan', planRoutes);
app.use('/api/places', placesRoutes);
app.use('/api/ai', aiRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`));