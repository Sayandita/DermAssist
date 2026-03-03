import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';

import authRoutes from './routes/auth.js';
import scanRoutes from './routes/scans.js';
import aiRoutes from './routes/aiRoutes.js';

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
// Configure CORS to accept requests from localhost and production Netlify frontend
const allowedOrigins = [
    'http://localhost:5173',
    // Allow Netlify production URL
    process.env.FRONTEND_URL
].filter(Boolean); // removes undefined

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV === 'development') {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
}));

// Provide extreme limits
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/scans', scanRoutes);
app.use('/api/ai', aiRoutes);

// Root route
app.get('/', (req, res) => {
    res.send('DermAssist API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
