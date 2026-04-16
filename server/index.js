require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

const { startQueueProcessor } = require('./services/aiQueue');
const { startDailyJobs } = require('./jobs/dailyJobs');
const { initRedis } = require('./services/cacheService');
const { initTaskQueue } = require('./queues/taskQueue');
const { authLimiter, aiLimiter } = require('./middleware/rateLimits');
const { checkOllamaHealth } = require('./services/ollamaService');
const { startFirestoreListeners, stopFirestoreListeners } = require('./services/sseService');

const app = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(compression()); // ✅ MUST be first (before routes)

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



// ── Routes ────────────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date(),
        service: 'CivicPulse API',
        version: '3.0.0'   // ✅ updated
    });
});

app.use('/api/auth',          require('./routes/auth'));
app.use('/api/needs',         require('./routes/needs'));
app.use('/api/ai',            require('./routes/ai'));
app.use('/api/volunteers',    require('./routes/volunteers'));
app.use('/api/match',         require('./routes/match'));
app.use('/api/tasks',         require('./routes/tasks'));
app.use('/api/impact',        require('./routes/impact'));
app.use('/api/donor',         require('./routes/donor'));
app.use('/api/resources',     require('./routes/resources'));
app.use('/api/organizations', require('./routes/organizations'));
app.use('/api/predictions',   require('./routes/predictions'));
app.use('/api/sse', require('./routes/sse'));
app.use('/api/auth/', authLimiter);
app.use('/api/ai/', aiLimiter);

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((req, res) => {
    res.status(404).json({
        error: `Route ${req.method} ${req.path} not found`,
        status: 404
    });
});

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        error: err.message || 'Internal server error',
        status: err.status || 500
    });
});

// ── Start Server ──────────────────────────────────────────────────────────────
app.listen(PORT, async () => {
    console.log(`✅ CivicPulse API v3 running on http://localhost:${PORT}`);
    await initRedis();
    startQueueProcessor();
    startDailyJobs();
    initTaskQueue();
    startFirestoreListeners();

    // Check Ollama availability (will log if found, silent if not configured)
    const ollamaReady = await checkOllamaHealth();
    if (ollamaReady) {
        console.log(`🦙 Ollama layer active — self-hosted AI enabled`);
    } else {
        console.log(`ℹ️  Ollama not configured — using Groq + Gemini (set OLLAMA_URL to enable)`);
    }
});
process.on('SIGTERM', () => {
    console.log('SIGTERM received — shutting down gracefully');
    stopFirestoreListeners();
    process.exit(0);
});
process.on('SIGINT', () => {
    console.log('SIGINT received — shutting down gracefully');
    stopFirestoreListeners();
    process.exit(0);
});