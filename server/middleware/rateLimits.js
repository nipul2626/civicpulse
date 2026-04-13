const rateLimit = require('express-rate-limit');
const crypto = require('crypto');
const { getQueueStatus } = require('../services/aiQueue');

// ── Submission limiter: 10 per IP per hour ────────────────────────────────────
const submitLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10,
    keyGenerator: (req) => {
        // Hash IP + date so we never store raw IP
        const date = new Date().toDateString();
        return crypto
            .createHash('sha256')
            .update(`${req.ip}${date}${process.env.RATE_LIMIT_SALT || 'civicpulse'}`)
            .digest('hex');
    },
    handler: (req, res) => {
        res.status(429).json({
            error: 'Too many submissions from your location. Please wait before submitting again.',
            retryAfter: '1 hour',
            status: 429,
        });
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// ── Bulk import limiter: 200 rows per orgId per day ───────────────────────────
const bulkImportLimiter = rateLimit({
    windowMs: 24 * 60 * 60 * 1000, // 24 hours
    max: 5, // 5 bulk import requests per org per day (each can have 200 rows = 1000 total)
    keyGenerator: (req) => {
        // Rate limit per org, not per IP
        return req.userDoc?.orgId || req.user?.uid || req.ip;
    },
    handler: (req, res) => {
        res.status(429).json({
            error: 'Bulk import limit reached for today. Maximum 5 bulk imports per organization per day.',
            retryAfter: '24 hours',
            status: 429,
        });
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// ── Auth route limiter: 10 login attempts per 15 min ─────────────────────────
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    keyGenerator: (req) => req.ip,
    handler: (req, res) => {
        res.status(429).json({
            error: 'Too many authentication attempts. Please wait 15 minutes.',
            retryAfter: '15 minutes',
            status: 429,
        });
    },
});

// ── AI route limiter: 10 per minute (already in index.js — this is per-user) ──
const aiLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 10,
    keyGenerator: (req) => req.user?.uid || req.ip, // per user when authenticated
    handler: (req, res) => {
        res.status(429).json({
            error: 'AI rate limit reached. Please wait before making more AI requests.',
            retryAfter: '1 minute',
            status: 429,
        });
    },
});

// ── Circuit breaker middleware ─────────────────────────────────────────────────
// If AI queue depth > 500, reject new submissions with 503
async function circuitBreaker(req, res, next) {
    try {
        const status = await getQueueStatus();
        if (status.pendingCount > 500) {
            const retryAfterSeconds = Math.ceil(status.avgWaitSeconds);
            res.setHeader('Retry-After', retryAfterSeconds);
            return res.status(503).json({
                error: 'System is under heavy load. Your submission will be retried automatically.',
                queueDepth: status.pendingCount,
                retryAfterSeconds,
                status: 503,
            });
        }
        next();
    } catch {
        // If we can't check queue status, allow the request through
        next();
    }
}

// ── Submitter hash helper (stored on need document for abuse investigation) ────
function generateSubmitterHash(ip) {
    const date = new Date().toDateString();
    return crypto
        .createHash('sha256')
        .update(`${ip}${date}${process.env.RATE_LIMIT_SALT || 'civicpulse'}`)
        .digest('hex')
        .substring(0, 16); // short hash, not reversible
}

module.exports = {
    submitLimiter,
    bulkImportLimiter,
    authLimiter,
    aiLimiter,
    circuitBreaker,
    generateSubmitterHash,
};