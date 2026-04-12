const express = require('express');
const router = express.Router();
const { db } = require('../services/firebase');
const { verifyToken, requireRole } = require('../middleware/auth');
const { COLLECTIONS, VALID_CATEGORIES } = require('../config/schema');
const cache = require('../services/cacheService');

// GET /api/predictions/upcoming — cached
router.get('/upcoming', verifyToken, requireRole('coordinator'), async (req, res) => {
    try {
        const { orgId } = req.query;
        if (!orgId) return res.status(400).json({ error: 'orgId is required' });

        const CACHE_KEY = `predictions:${orgId}`;

        const { data, source } = await cache.getOrSet(CACHE_KEY, 3600, async () => {

            const twelveMonthsAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
            let query = db.collection(COLLECTIONS.NEEDS)
                .where('orgId', '==', orgId)
                .where('createdAt', '>=', twelveMonthsAgo);

            const snap = await query.get();
            const needs = snap.docs.map(d => d.data());

            const now = new Date();
            const currentMonth = now.getMonth();

            // Group by category and month
            const categoryMonthMap = {};
            for (const cat of VALID_CATEGORIES) {
                categoryMonthMap[cat] = Array(12).fill(0);
            }

            needs.forEach(n => {
                if (!n.createdAt || !n.category) return;
                const date = n.createdAt?.seconds
                    ? new Date(n.createdAt.seconds * 1000)
                    : new Date(n.createdAt);

                const month = date.getMonth();

                if (categoryMonthMap[n.category]) {
                    categoryMonthMap[n.category][month]++;
                }
            });

            const predictions = VALID_CATEGORIES.map(category => {
                const monthlyCounts = categoryMonthMap[category];
                const historicalAvg = monthlyCounts.reduce((a, b) => a + b, 0) / 12;
                const currentMonthCount = monthlyCounts[currentMonth];
                const maxMonth = Math.max(...monthlyCounts);

                const totalDataPoints = monthlyCounts.reduce((a, b) => a + b, 0);
                const confidence = totalDataPoints >= 20 ? 'high'
                    : totalDataPoints >= 8 ? 'medium'
                        : 'low';

                const predictedCount = Math.round(historicalAvg * 1.1);

                const isHighMonth =
                    currentMonthCount >= historicalAvg * 1.3 ||
                    currentMonthCount === maxMonth;

                const ACTIONS = {
                    medical:    'Pre-position first aid kits and alert medical volunteers',
                    food:       'Stock food supplies and brief logistics volunteers',
                    water:      'Inspect water purification equipment availability',
                    shelter:    'Identify available shelters and construction volunteers',
                    education:  'Coordinate with school volunteers for sessions',
                    livelihood: 'Prepare skill-training materials and counsellors',
                    sanitation: 'Deploy sanitation inspection teams',
                    other:      'Review volunteer availability for general tasks',
                };

                return {
                    category,
                    predictedCount: Math.max(predictedCount, 1),
                    currentMonthSoFar: currentMonthCount,
                    historicalMonthlyAvg: Math.round(historicalAvg * 10) / 10,
                    confidence,
                    isHighRiskMonth: isHighMonth,
                    historicalBasis: `Based on ${totalDataPoints} reports over last 12 months`,
                    recommendedAction: isHighMonth ? ACTIONS[category] : null,
                };
            }).filter(p => p.predictedCount > 0 || p.currentMonthSoFar > 0);

            predictions.sort((a, b) => b.predictedCount - a.predictedCount);

            // 🔥 RETURN instead of res.json
            return {
                orgId,
                month: now.toLocaleString('default', { month: 'long' }),
                predictions
            };
        });

        res.json({ source, ...data });

    } catch (err) {
        res.status(500).json({ error: err.message, status: 500 });
    }
});

module.exports = router;