const express = require('express');
const router = express.Router();
const { db } = require('../services/firebase');
const { verifyToken, requireRole } = require('../middleware/auth');
const { COLLECTIONS } = require('../config/schema');
const cache = require('../services/cacheService');
const { ok, fail, serverError } = require('../utils/response');

// GET /api/analytics/coordinator — full coordinator dashboard stats
router.get('/coordinator', verifyToken, requireRole('coordinator'), async (req, res) => {
    try {
        const { orgId } = req.query;
        if (!orgId) return fail(res, 400, 'orgId is required');

        const CACHE_KEY = `analytics:coordinator:${orgId}`;
        const { data, source } = await cache.getOrSet(CACHE_KEY, 300, async () => {
            const now = new Date();
            const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);
            const sevenDaysAgo  = new Date(now - 7  * 24 * 60 * 60 * 1000);

            const [needsSnap, tasksSnap, volSnap] = await Promise.all([
                db.collection(COLLECTIONS.NEEDS).where('orgId', '==', orgId).get(),
                db.collection(COLLECTIONS.TASKS).where('orgId', '==', orgId).get(),
                db.collection(COLLECTIONS.VOLUNTEERS).where('orgId', '==', orgId).get(),
            ]);

            const needs = needsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
            const tasks = tasksSnap.docs.map(d => ({ id: d.id, ...d.data() }));
            const volunteers = volSnap.docs.map(d => ({ id: d.id, ...d.data() }));

            const getTime = (ts) => ts?.seconds ? ts.seconds * 1000 : new Date(ts).getTime();

            // Avg resolution time by category (need created → task completed)
            const categoryResolutionTimes = {};
            tasks
                .filter(t => t.status === 'verified' && t.completedAt)
                .forEach(t => {
                    const need = needs.find(n => n.id === t.needId);
                    if (!need?.createdAt || !t.completedAt) return;
                    const mins = (getTime(t.completedAt) - getTime(need.createdAt)) / 60000;
                    const cat = need.category || 'other';
                    if (!categoryResolutionTimes[cat]) categoryResolutionTimes[cat] = [];
                    categoryResolutionTimes[cat].push(mins);
                });

            const avgResolutionByCategory = {};
            Object.entries(categoryResolutionTimes).forEach(([cat, times]) => {
                avgResolutionByCategory[cat] = Math.round(times.reduce((a, b) => a + b, 0) / times.length);
            });

            // Volunteer leaderboard (by tasks completed in last 30 days)
            const volTaskCounts = {};
            tasks
                .filter(t => t.status === 'verified' && t.completedAt && getTime(t.completedAt) >= thirtyDaysAgo.getTime())
                .forEach(t => {
                    volTaskCounts[t.assignedVolunteer] = (volTaskCounts[t.assignedVolunteer] || 0) + 1;
                });

            const leaderboard = volunteers
                .map(v => ({
                    volunteerId: v.id,
                    displayName: v.displayName || 'Unknown',
                    tasksCompleted: volTaskCounts[v.id] || 0,
                    totalHours: v.totalHours || 0,
                    reliabilityScore: v.reliabilityScore || 1,
                    skills: v.verifiedSkills || [],
                }))
                .sort((a, b) => b.tasksCompleted - a.tasksCompleted)
                .slice(0, 10);

            // Need hot zones — top 5 locations with most needs
            const locationCounts = {};
            needs.forEach(n => {
                const addr = n.location?.address || 'Unknown';
                const key = addr.split(',')[0].trim();
                if (!locationCounts[key]) locationCounts[key] = { address: key, count: 0, categories: {} };
                locationCounts[key].count++;
                locationCounts[key].categories[n.category] = (locationCounts[key].categories[n.category] || 0) + 1;
            });

            const hotZones = Object.values(locationCounts)
                .sort((a, b) => b.count - a.count)
                .slice(0, 5);

            // Weekly submission trend (last 8 weeks)
            const weeklyTrend = [];
            for (let i = 7; i >= 0; i--) {
                const wStart = new Date(now - (i + 1) * 7 * 24 * 60 * 60 * 1000);
                const wEnd   = new Date(now - i * 7 * 24 * 60 * 60 * 1000);
                const inRange = ts => getTime(ts) >= wStart.getTime() && getTime(ts) < wEnd.getTime();

                weeklyTrend.push({
                    week: wStart.toISOString().split('T')[0],
                    submitted: needs.filter(n => n.createdAt && inRange(n.createdAt)).length,
                    resolved:  needs.filter(n => n.status === 'resolved' && n.createdAt && inRange(n.createdAt)).length,
                    volunteers: new Set(
                        tasks.filter(t => t.createdAt && inRange(t.createdAt)).map(t => t.assignedVolunteer)
                    ).size,
                });
            }

            // Response time distribution
            const responseTimes = tasks
                .filter(t => t.createdAt)
                .map(t => {
                    const need = needs.find(n => n.id === t.needId);
                    if (!need?.createdAt) return null;
                    return (getTime(t.createdAt) - getTime(need.createdAt)) / 60000;
                })
                .filter(Boolean);

            const avgResponseTime = responseTimes.length
                ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length)
                : 0;

            // SLA compliance — needs resolved within 24 hours
            const resolvedNeeds = needs.filter(n => n.status === 'resolved');
            const within24h = resolvedNeeds.filter(n => {
                const linkedTask = tasks.find(t => t.needId === n.id && t.completedAt);
                if (!linkedTask || !n.createdAt) return false;
                return (getTime(linkedTask.completedAt) - getTime(n.createdAt)) <= 24 * 60 * 60 * 1000;
            });

            return {
                summary: {
                    totalNeeds: needs.length,
                    activeNeeds: needs.filter(n => ['active', 'pending_ai'].includes(n.status)).length,
                    resolvedNeeds: resolvedNeeds.length,
                    resolutionRate: needs.length ? Math.round((resolvedNeeds.length / needs.length) * 100) : 0,
                    avgResponseTimeMinutes: avgResponseTime,
                    slaCompliance: resolvedNeeds.length
                        ? Math.round((within24h.length / resolvedNeeds.length) * 100)
                        : 0,
                    activeVolunteers: volunteers.filter(v => !v.burnoutFlag && (v.currentTasks || 0) < 3).length,
                    volunteersAtRisk: volunteers.filter(v => v.burnoutFlag).length,
                    totalPeopleHelped: tasks.reduce((s, t) => s + (t.peopleHelped || 0), 0),
                },
                avgResolutionByCategory,
                leaderboard,
                hotZones,
                weeklyTrend,
                lastUpdated: new Date().toISOString(),
            };
        });

        return ok(res, data, { source });
    } catch (err) {
        return serverError(res, err);
    }
});

// GET /api/analytics/volunteer/:id — individual volunteer performance
router.get('/volunteer/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const CACHE_KEY = `analytics:volunteer:${id}`;

        const { data } = await cache.getOrSet(CACHE_KEY, 120, async () => {
            const [volDoc, taskSnap] = await Promise.all([
                db.collection(COLLECTIONS.VOLUNTEERS).doc(id).get(),
                db.collection(COLLECTIONS.TASKS)
                    .where('assignedVolunteer', '==', id)
                    .orderBy('createdAt', 'desc')
                    .limit(50)
                    .get(),
            ]);

            if (!volDoc.exists) return null;

            const vol = volDoc.data();
            const tasks = taskSnap.docs.map(d => d.data());
            const completed = tasks.filter(t => ['completed', 'verified'].includes(t.status));

            const categoryBreakdown = {};
            completed.forEach(t => {
                const cat = t.needCategory || 'other';
                categoryBreakdown[cat] = (categoryBreakdown[cat] || 0) + 1;
            });

            return {
                volunteerId: id,
                displayName: vol.displayName || 'Unknown',
                totalTasksCompleted: completed.length,
                totalHours: vol.totalHours || 0,
                reliabilityScore: vol.reliabilityScore || 1,
                burnoutFlag: vol.burnoutFlag || false,
                currentTasks: vol.currentTasks || 0,
                categoryBreakdown,
                implicitSkillWeights: vol.implicitSkillWeights || {},
                recentTasks: tasks.slice(0, 10),
            };
        });

        if (!data) return res.status(404).json({ success: false, error: 'Volunteer not found' });
        return ok(res, data);
    } catch (err) {
        return serverError(res, err);
    }
});

// GET /api/analytics/needs-trend — need submission trend for heatmap overlay
router.get('/needs-trend', verifyToken, requireRole('coordinator'), async (req, res) => {
    try {
        const { orgId, days = 30 } = req.query;
        if (!orgId) return fail(res, 400, 'orgId is required');

        const since = new Date(Date.now() - parseInt(days) * 24 * 60 * 60 * 1000);
        const snap = await db.collection(COLLECTIONS.NEEDS)
            .where('orgId', '==', orgId)
            .where('createdAt', '>=', since)
            .get();

        const needs = snap.docs.map(d => d.data());

        const dailyCounts = {};
        needs.forEach(n => {
            if (!n.createdAt) return;
            const date = new Date(
                n.createdAt?.seconds ? n.createdAt.seconds * 1000 : n.createdAt
            ).toISOString().split('T')[0];
            if (!dailyCounts[date]) dailyCounts[date] = { date, submitted: 0, byCategory: {} };
            dailyCounts[date].submitted++;
            dailyCounts[date].byCategory[n.category] = (dailyCounts[date].byCategory[n.category] || 0) + 1;
        });

        const trend = Object.values(dailyCounts).sort((a, b) => a.date.localeCompare(b.date));
        return ok(res, trend);
    } catch (err) {
        return serverError(res, err);
    }
});

module.exports = router;