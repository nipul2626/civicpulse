require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { startQueueProcessor } = require('./services/aiQueue');
const { startDailyJobs } = require('./jobs/dailyJobs');

const app = express();
const PORT = process.env.PORT || 3001;

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({
    origin: [process.env.CLIENT_URL || 'http://localhost:5173', 'https://civicpulse.vercel.app'],
    credentials: true,
}));
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Global rate limit: 100 per 15 min
app.use('/api/', rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { error: 'Too many requests, please try again later', status: 429 },
}));

// Stricter limit on AI routes: 10 per minute
app.use('/api/ai/', rateLimit({
    windowMs: 60 * 1000,
    max: 10,
    message: { error: 'AI rate limit reached, please wait', status: 429 },
}));

// ── Routes ────────────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date(), service: 'CivicPulse API', version: '2.0.0' });
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/needs', require('./routes/needs'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/volunteers', require('./routes/volunteers'));
app.use('/api/match', require('./routes/match'));
app.use('/api/tasks', require('./routes/tasks'));

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((req, res) => {
    res.status(404).json({ error: `Route ${req.method} ${req.path} not found`, status: 404 });
});

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({ error: err.message || 'Internal server error', status: err.status || 500 });
});

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`✅ CivicPulse API v2 running on http://localhost:${PORT}`);
    startQueueProcessor();
    startDailyJobs();
});