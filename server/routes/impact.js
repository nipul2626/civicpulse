const express = require('express');
const router = express.Router();
const { db } = require('../services/firebase');
const { verifyToken, requireRole } = require('../middleware/auth');
const { generateSitrep } = require('../services/aiService');
const { COLLECTIONS } = require('../config/schema');
const cache = require('../services/cacheService');


// ── Shared aggregation helper ─────────────────────────────────────────────────
async function buildImpactStats({ orgId, startDate, endDate }) {
    let needsQuery = db.collection(COLLECTIONS.NEEDS);
    let tasksQuery = db.collection(COLLECTIONS.TASKS);

    if (orgId) {
        needsQuery = needsQuery.where('orgId', '==', orgId);
        tasksQuery = tasksQuery.where('orgId', '==', orgId);
    }
    if (startDate) {
        needsQuery = needsQuery.where('createdAt', '>=', new Date(startDate));
        tasksQuery = tasksQuery.where('createdAt', '>=', new Date(startDate));
    }
    if (endDate) {
        needsQuery = needsQuery.where('createdAt', '<=', new Date(endDate));
        tasksQuery = tasksQuery.where('createdAt', '<=', new Date(endDate));
    }

    const [needsSnap, tasksSnap, volSnap] = await Promise.all([
        needsQuery.get(),
        tasksQuery.get(),
        db.collection(COLLECTIONS.VOLUNTEERS).get(),
    ]);

    const needs = needsSnap.docs.map(d => d.data());
    const tasks = tasksSnap.docs.map(d => d.data());
    const volunteers = volSnap.docs.map(d => d.data());

    const resolved = needs.filter(n => n.status === 'resolved');
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // Active volunteers: completed a task in last 30 days
    const activeVolIds = new Set(
        tasks
            .filter(t => t.completedAt && new Date(t.completedAt?.seconds ? t.completedAt.seconds * 1000 : t.completedAt) >= thirtyDaysAgo)
            .map(t => t.assignedVolunteer)
    );

    const totalVolHours = volunteers.reduce((sum, v) => sum + (v.totalHours || 0), 0);
    const peopleHelped = tasks
        .filter(t => ['completed', 'verified'].includes(t.status))
        .reduce((sum, t) => sum + (t.peopleHelped || 0), 0);

    // Avg response time (need created → first task created)
    const responseTimes = tasks
        .map(t => {
            const need = needs.find(n => n.id === t.needId);
            if (!need || !need.createdAt || !t.createdAt) return null;
            const nTime = need.createdAt?.seconds ? need.createdAt.seconds * 1000 : new Date(need.createdAt).getTime();
            const tTime = t.createdAt?.seconds ? t.createdAt.seconds * 1000 : new Date(t.createdAt).getTime();
            return Math.max(0, (tTime - nTime) / 60000); // minutes
        })
        .filter(Boolean);
    const avgResponseTime = responseTimes.length
        ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length)
        : 0;

    // Needs by category
    const needsByCategory = {};
    needs.forEach(n => {
        needsByCategory[n.category] = (needsByCategory[n.category] || 0) + 1;
    });

    // Needs by urgency
    const needsByUrgency = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    needs.forEach(n => {
        if (n.urgencyScore) needsByUrgency[n.urgencyScore] = (needsByUrgency[n.urgencyScore] || 0) + 1;
    });

    // Weekly trend — last 8 weeks
    const weeklyTrend = [];
    for (let i = 7; i >= 0; i--) {
        const weekStart = new Date(Date.now() - (i + 1) * 7 * 24 * 60 * 60 * 1000);
        const weekEnd   = new Date(Date.now() - i * 7 * 24 * 60 * 60 * 1000);
        const label = weekStart.toISOString().split('T')[0];

        const inRange = (d) => {
            const t = d?.seconds ? d.seconds * 1000 : new Date(d).getTime();
            return t >= weekStart.getTime() && t < weekEnd.getTime();
        };

        weeklyTrend.push({
            week: label,
            needsReported: needs.filter(n => inRange(n.createdAt)).length,
            resolved: needs.filter(n => n.status === 'resolved' && inRange(n.createdAt)).length,
        });
    }

    return {
        totalNeedsReported: needs.length,
        needsResolved: resolved.length,
        resolutionRate: needs.length ? Math.round((resolved.length / needs.length) * 100) : 0,
        activeVolunteers: activeVolIds.size,
        totalVolunteerHours: Math.round(totalVolHours),
        peopleHelped,
        avgResponseTime,
        needsByCategory,
        needsByUrgency,
        weeklyTrend,
    };
}

// ── GET /api/impact — cached with cacheService ────────────────────────────────
router.get('/', async (req, res) => {
    try {
        const { orgId, startDate, endDate } = req.query;

        const CACHE_KEY = `impact:${orgId || 'all'}:${startDate || ''}:${endDate || ''}`;

        const { data: stats, source } = await cache.getOrSet(
            CACHE_KEY,
            300, // 5 min cache
            () => buildImpactStats({ orgId, startDate, endDate })
        );

        res.json({ source, ...stats });
    } catch (err) {
        console.error('Impact stats error:', err);
        res.status(500).json({ error: err.message, status: 500 });
    }
});

// ── POST /api/impact/sitrep ───────────────────────────────────────────────────
router.post('/sitrep', verifyToken, requireRole('coordinator'), async (req, res) => {
    try {
        const { orgId, startDate, endDate } = req.body;
        if (!orgId || !startDate || !endDate) {
            return res.status(400).json({ error: 'orgId, startDate, endDate are required' });
        }

        const stats = await buildImpactStats({ orgId, startDate, endDate });

        // Fetch tasks for AI context
        let tasksQuery = db.collection(COLLECTIONS.TASKS).where('orgId', '==', orgId);
        if (startDate) tasksQuery = tasksQuery.where('createdAt', '>=', new Date(startDate));
        if (endDate)   tasksQuery = tasksQuery.where('createdAt', '<=', new Date(endDate));
        const tasksSnap = await tasksQuery.get();
        const tasks = tasksSnap.docs.map(d => d.data());

        const report = await generateSitrep(tasks, startDate, endDate);

        res.json({
            report,
            generatedAt: new Date().toISOString(),
            stats,
        });
    } catch (err) {
        console.error('Sitrep error:', err);
        res.status(500).json({ error: err.message, status: 500 });
    }
});

module.exports = router;