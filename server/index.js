require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const { initSentry, Sentry } = require('./services/sentryService');
const logger = require('./services/logger');
const { startQueueProcessor } = require('./services/aiQueue');
const { startDailyJobs } = require('./jobs/dailyJobs');
const { initRedis } = require('./services/cacheService');
const { initTaskQueue } = require('./queues/taskQueue');
const { startFirestoreListeners, stopFirestoreListeners } = require('./services/sseService');
const { checkOllamaHealth } = require('./services/ollamaService');
const { authLimiter, aiLimiter } = require('./middleware/rateLimits');

initSentry();

const app = express();
app.set('trust proxy', 1);
const PORT = process.env.PORT || 5000;

app.use(Sentry.Handlers.requestHandler());
app.use((req, res, next) => {
    if (req.path.startsWith('/api/sse')) {
        req.headers['x-no-compression'] = true;
    }
    next();
});
app.use(compression({
    filter: (req, res) => {
        if (req.headers['x-no-compression']) return false;
        return compression.filter(req, res);
    }
}));
app.use(cors({
    origin: [
        process.env.CLIENT_URL || 'http://localhost:5173',
        'https://civicpulse.vercel.app',
    ],
    credentials: true,
}));
app.use(helmet());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// HTTP request logging
app.use((req, res, next) => {
    logger.info({ method: req.method, url: req.url }, 'Request');
    next();
});

// Rate limiters
app.use('/api/', rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { success: false, error: 'Too many requests', status: 429 },
}));
app.use('/api/auth/', authLimiter);
app.use('/api/ai/',   aiLimiter);

// Health check
app.get('/api/health', async (req, res) => {
    const { get } = require('./services/cacheService');
    const redisOk     = await get('__health__').then(() => true).catch(() => false);
    const firestoreOk = await require('./services/firebase').db
        .collection('_health').limit(1).get()
        .then(() => true).catch(() => false);

    res.json({
        success: true,
        data: {
            status: redisOk && firestoreOk ? 'ok' : 'degraded',
            redis: redisOk ? 'connected' : 'unavailable',
            firestore: firestoreOk ? 'connected' : 'unavailable',
            uptime: Math.round(process.uptime()),
            version: '4.0.0',
            timestamp: new Date().toISOString(),
        },
    });
});

// Routes
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
app.use('/api/sse',           require('./routes/sse'));
app.use('/api/whatsapp',      require('./routes/whatsapp'));
app.use('/api/pwa',           require('./routes/pwa'));
app.use('/api/analytics',     require('./routes/analytics'));
app.use('/api/demo',          require('./routes/demo'));

app.use(Sentry.Handlers.errorHandler());

app.use((req, res) => {
    res.status(404).json({ success: false, error: `${req.method} ${req.path} not found`, status: 404 });
});

app.use((err, req, res, next) => {
    logger.error({ err, url: req.url }, 'Unhandled error');
    res.status(err.status || 500).json({ success: false, error: err.message || 'Internal server error', status: err.status || 500 });
});

app.listen(PORT, async () => {
    logger.info(`CivicPulse API v4 running on port ${PORT}`);
    await initRedis();
    startQueueProcessor();
    startDailyJobs();
    initTaskQueue();
    startFirestoreListeners();
    const ollamaReady = await checkOllamaHealth();
    logger.info(ollamaReady ? '🦙 Ollama active' : 'ℹ️  Using Groq + Gemini');
});

process.on('SIGTERM', () => {
    logger.info('SIGTERM — shutting down');
    stopFirestoreListeners();
    process.exit(0);
});
process.on('SIGINT', () => {
    logger.info('SIGINT — shutting down');
    stopFirestoreListeners();
    process.exit(0);
});