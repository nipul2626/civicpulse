const express = require('express');
const router = express.Router();
const { db } = require('../services/firebase');
const cache = require('../services/cacheService');
const { ok, fail } = require('../utils/response');

const DEMO_SECRET = process.env.DEMO_RESET_SECRET || 'civicpulse-demo-2026';

// POST /api/demo/reset — clears seeded data and re-seeds
// Protected by a simple secret header so judges can reset between demos
router.post('/reset', async (req, res) => {
    const secret = req.headers['x-demo-secret'] || req.body.secret;
    if (secret !== DEMO_SECRET) {
        return fail(res, 403, 'Invalid demo secret');
    }

    try {
        // Clear all seeded documents
        const collections = ['organizations', 'users', 'volunteers', 'needs', 'tasks', 'resources'];
        for (const col of collections) {
            const snap = await db.collection(col).where('_seeded', '==', true).get();
            const batch = db.batch();
            snap.docs.forEach(d => batch.delete(d.ref));
            await batch.commit();
        }

        // Clear all caches
        await cache.delPattern('*');

        return ok(res, {
            message: 'Demo data cleared. Run seed script to repopulate.',
            hint: 'node scripts/seedData.js',
        });
    } catch (err) {
        return fail(res, 500, err.message);
    }
});

// GET /api/demo/status
router.get('/status', (req, res) => {
    return ok(res, {
        demoMode: process.env.DEMO_MODE === 'true',
        environment: process.env.NODE_ENV,
        resetEndpoint: '/api/demo/reset',
        resetHeader: 'x-demo-secret: <secret>',
    });
});

module.exports = router;