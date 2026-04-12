const express = require('express');
const router = express.Router();
const { db } = require('../services/firebase');
const { verifyToken, requireRole } = require('../middleware/auth');
const { matchVolunteersToNeed } = require('../services/matchingEngine');
const { sendTaskAssignment } = require('../services/notificationService');
const { COLLECTIONS } = require('../config/schema');
const { v4: uuidv4 } = require('uuid');
const cache = require('../services/cacheService');

// POST /api/match — get top 5 volunteers for a need (cached)
router.post('/', verifyToken, requireRole('coordinator'), async (req, res) => {
    try {
        const { needId } = req.body;
        if (!needId) return res.status(400).json({ error: 'needId is required', status: 400 });

        const CACHE_KEY = `match:${needId}`;

        const { data: matches, source } = await cache.getOrSet(
            CACHE_KEY,
            300, // 5 min cache
            () => matchVolunteersToNeed(needId)
        );

        res.json({ needId, matches, source });
    } catch (err) {
        console.error('Match error:', err);
        res.status(500).json({ error: err.message, status: 500 });
    }
});

// POST /api/match/assign — assign a volunteer to a need, creates task
router.post('/assign', verifyToken, requireRole('coordinator'), async (req, res) => {
    try {
        const { needId, volunteerId, scheduledTime, resourceIds } = req.body;
        if (!needId || !volunteerId) return res.status(400).json({ error: 'needId and volunteerId are required', status: 400 });

        // Fetch need
        const needDoc = await db.collection(COLLECTIONS.NEEDS).doc(needId).get();
        if (!needDoc.exists) return res.status(404).json({ error: 'Need not found', status: 404 });
        const need = needDoc.data();

        // Create task
        const taskId = uuidv4();
        const task = {
            id: taskId,
            needId,
            needTitle: need.title,
            needCategory: need.category,
            assignedVolunteer: volunteerId,
            status: 'assigned',
            scheduledTime: scheduledTime ? new Date(scheduledTime) : null,
            completedAt: null,
            outcome: null,
            orgId: need.orgId || req.userDoc?.orgId || null,
            createdAt: new Date(),
            createdBy: req.user.uid,
        };

        const batch = db.batch();

        // Save task
        batch.set(db.collection(COLLECTIONS.TASKS).doc(taskId), task);

        // Update need status
        batch.update(db.collection(COLLECTIONS.NEEDS).doc(needId), { status: 'assigned' });

        // Increment volunteer currentTasks
        const { FieldValue } = require('firebase-admin').firestore;
        batch.update(db.collection(COLLECTIONS.VOLUNTEERS).doc(volunteerId), {
            currentTasks: FieldValue.increment(1),
        });

        // Mark resources as deployed
        if (resourceIds?.length) {
            for (const rId of resourceIds) {
                batch.update(db.collection(COLLECTIONS.RESOURCES).doc(rId), {
                    deployedTo: FieldValue.arrayUnion(taskId),
                });
            }
        }

        await batch.commit();

        // Invalidate match cache
        await cache.del(`match:${needId}`);
        await cache.del('heatmap:all');

        // Send push notification
        await sendTaskAssignment(volunteerId, { taskId, needTitle: need.title, scheduledTime });

        res.status(201).json({ message: 'Volunteer assigned successfully', taskId, task });
    } catch (err) {
        console.error('Assign error:', err);
        res.status(500).json({ error: err.message, status: 500 });
    }
});

module.exports = router;