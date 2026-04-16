const express = require('express');
const router = express.Router();
const { db } = require('../services/firebase');
const { COLLECTIONS } = require('../config/schema');
const { verifyToken } = require('../middleware/auth');
const { ok, serverError } = require('../utils/response');

/**
 * These endpoints support the offline PWA functionality.
 * When Ishu's frontend goes offline, it queues actions in IndexedDB.
 * When back online, it syncs with these endpoints.
 */

/**
 * POST /api/pwa/sync
 * Called when a volunteer comes back online after being offline.
 * Accepts an array of queued actions (task status updates, need submissions)
 * and processes them in order.
 *
 * Body: {
 *   actions: [
 *     { type: 'task:update', taskId, status, outcome, timestamp },
 *     { type: 'need:submit', needData, timestamp },
 *     { type: 'location:update', volunteerId, lat, lng, timestamp }
 *   ]
 * }
 */
router.post('/sync', verifyToken, async (req, res) => {
    const { actions } = req.body;

    if (!Array.isArray(actions) || actions.length === 0) {
        return ok(res, { synced: 0, failed: 0, results: [] });
    }

    // Sort by timestamp — process oldest first
    const sorted = [...actions].sort((a, b) =>
        new Date(a.timestamp) - new Date(b.timestamp)
    );

    const results = [];
    let synced = 0;
    let failed = 0;

    for (const action of sorted) {
        try {
            if (action.type === 'task:update') {
                const { taskId, status, outcome, peopleHelped } = action;
                const VALID = ['inProgress', 'completed'];
                if (!VALID.includes(status)) throw new Error(`Invalid status: ${status}`);

                await db.collection(COLLECTIONS.TASKS).doc(taskId).update({
                    status,
                    outcome: outcome || null,
                    peopleHelped: peopleHelped || null,
                    updatedAt: new Date(),
                    syncedAt: new Date(),
                    offlineAction: true,
                });
                results.push({ type: action.type, taskId, success: true });
                synced++;

            } else if (action.type === 'need:submit') {
                // Re-route through the needs submit logic
                // Just save directly since we trust the authenticated user
                const { needData } = action;
                const { v4: uuidv4 } = require('uuid');
                const { enqueueAIJob } = require('../services/aiQueue');
                const { CATEGORY_PRIORITY } = require('../config/schema');

                const needId = uuidv4();
                await db.collection(COLLECTIONS.NEEDS).doc(needId).set({
                    ...needData,
                    id: needId,
                    status: 'pending_ai',
                    submittedVia: 'offline-sync',
                    createdAt: new Date(action.timestamp),
                    syncedAt: new Date(),
                });

                const priority = CATEGORY_PRIORITY[needData.category] || 2;
                await enqueueAIJob('scoreNeed', { ...needData, needId }, priority, needData.orgId);

                results.push({ type: action.type, needId, success: true });
                synced++;

            } else if (action.type === 'location:update') {
                const { volunteerId, lat, lng } = action;
                await db.collection(COLLECTIONS.VOLUNTEERS).doc(volunteerId).update({
                    location: { lat, lng },
                    locationUpdatedAt: new Date(action.timestamp),
                });
                results.push({ type: action.type, volunteerId, success: true });
                synced++;

            } else {
                results.push({ type: action.type, success: false, error: 'Unknown action type' });
                failed++;
            }
        } catch (err) {
            results.push({ type: action.type, success: false, error: err.message });
            failed++;
        }
    }

    return ok(res, { synced, failed, results });
});

/**
 * GET /api/pwa/volunteer-cache/:volunteerId
 * Returns everything a volunteer needs to work offline:
 * - Their assigned tasks (last 10)
 * - Task details with need info
 * - Their profile
 *
 * Ishu caches this in IndexedDB on app load.
 * Volunteer can view and update tasks even without internet.
 */
router.get('/volunteer-cache/:volunteerId', verifyToken, async (req, res) => {
    try {
        const { volunteerId } = req.params;

        const [volDoc, taskSnap] = await Promise.all([
            db.collection(COLLECTIONS.VOLUNTEERS).doc(volunteerId).get(),
            db.collection(COLLECTIONS.TASKS)
                .where('assignedVolunteer', '==', volunteerId)
                .where('status', 'in', ['assigned', 'inProgress'])
                .orderBy('createdAt', 'desc')
                .limit(10)
                .get(),
        ]);

        const volunteer = volDoc.exists ? volDoc.data() : null;
        const tasks = taskSnap.docs.map(d => d.data());

        // Enrich tasks with need data
        const enrichedTasks = await Promise.all(tasks.map(async (task) => {
            const needDoc = await db.collection(COLLECTIONS.NEEDS).doc(task.needId).get();
            return {
                ...task,
                need: needDoc.exists ? needDoc.data() : null,
            };
        }));

        return ok(res, {
            volunteer,
            tasks: enrichedTasks,
            cachedAt: new Date().toISOString(),
            cacheExpiresIn: 3600, // suggest frontend refresh every hour
        });
    } catch (err) {
        return serverError(res, err);
    }
});

/**
 * GET /api/pwa/manifest
 * Returns dynamic web app manifest with org-specific branding.
 * Ishu's service worker fetches this for the PWA install prompt.
 */
router.get('/manifest', (req, res) => {
    res.json({
        name: 'CivicPulse',
        short_name: 'CivicPulse',
        description: 'AI-powered community resource coordination',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#2563eb',
        orientation: 'portrait-primary',
        icons: [
            { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
            { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
            { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
        categories: ['social', 'utilities'],
        lang: 'en',
    });
});

module.exports = router;