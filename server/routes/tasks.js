const express = require('express');
const router = express.Router();
const { db } = require('../services/firebase');
const { verifyToken, requireRole } = require('../middleware/auth');
const { matchVolunteersToNeed } = require('../services/matchingEngine');
const { sendTaskAssignment, sendTaskReminder, sendNoShowAlert } = require('../services/notificationService');
const { COLLECTIONS } = require('../config/schema');
const { v4: uuidv4 } = require('uuid');
const { FieldValue } = require('firebase-admin').firestore;

// ── POST /api/tasks/create ────────────────────────────────────────────────────
router.post('/create', verifyToken, requireRole('coordinator'), async (req, res) => {
    try {
        const { needId, assignedVolunteerId, scheduledTime, orgId, resourceIds } = req.body;
        if (!needId || !assignedVolunteerId) return res.status(400).json({ error: 'needId and assignedVolunteerId required' });

        const needDoc = await db.collection(COLLECTIONS.NEEDS).doc(needId).get();
        if (!needDoc.exists) return res.status(404).json({ error: 'Need not found' });
        const need = needDoc.data();

        const taskId = uuidv4();
        const task = {
            id: taskId, needId, needTitle: need.title, needCategory: need.category,
            assignedVolunteer: assignedVolunteerId, status: 'assigned',
            scheduledTime: scheduledTime ? new Date(scheduledTime) : null,
            completedAt: null, outcome: null, peopleHelped: null,
            orgId: orgId || need.orgId || null,
            createdAt: new Date(), createdBy: req.user.uid,
        };

        const batch = db.batch();
        batch.set(db.collection(COLLECTIONS.TASKS).doc(taskId), task);
        batch.update(db.collection(COLLECTIONS.NEEDS).doc(needId), { status: 'assigned' });
        batch.update(db.collection(COLLECTIONS.VOLUNTEERS).doc(assignedVolunteerId), {
            currentTasks: FieldValue.increment(1),
        });

        if (resourceIds?.length) {
            for (const rId of resourceIds) {
                batch.update(db.collection(COLLECTIONS.RESOURCES).doc(rId), {
                    deployedTo: FieldValue.arrayUnion(taskId),
                });
            }
        }

        await batch.commit();

        // Notifications
        await sendTaskAssignment(assignedVolunteerId, { taskId, needTitle: need.title, scheduledTime });

        // Schedule reminder and no-show check using setTimeout (Cloud Tasks substitute)
        if (scheduledTime) {
            const taskTime = new Date(scheduledTime).getTime();
            const reminderDelay = taskTime - Date.now() - 2 * 60 * 60 * 1000; // 2h before
            const noShowDelay   = taskTime + 1 * 60 * 60 * 1000;              // 1h after

            if (reminderDelay > 0) {
                setTimeout(() => sendTaskReminder(assignedVolunteerId, { taskId, needTitle: need.title }), reminderDelay);
            }
            if (noShowDelay > 0) {
                setTimeout(() => triggerNoShowCheck(taskId, need, req.user.uid), noShowDelay);
            }
        }

        res.status(201).json({ message: 'Task created', taskId, task });
    } catch (err) {
        console.error('Create task error:', err);
        res.status(500).json({ error: err.message, status: 500 });
    }
});

// ── No-show check logic (internal) ───────────────────────────────────────────
async function triggerNoShowCheck(taskId, need, coordinatorId) {
    try {
        const taskDoc = await db.collection(COLLECTIONS.TASKS).doc(taskId).get();
        if (!taskDoc.exists) return;
        const task = taskDoc.data();

        // Only act if still in 'assigned' state (not started)
        if (task.status !== 'assigned') return;

        console.log(`⚠️  No-show detected for task ${taskId}, finding replacement...`);

        // Find next best volunteer
        const matches = await matchVolunteersToNeed(need.id || task.needId);
        const nextBest = matches.find(m => m.volunteerId !== task.assignedVolunteer);

        if (nextBest) {
            const newTaskId = uuidv4();
            const batch = db.batch();

            // Mark old task as reassigned
            batch.update(db.collection(COLLECTIONS.TASKS).doc(taskId), { status: 'reassigned' });

            // Decrement old volunteer reliability
            const oldVolRef = db.collection(COLLECTIONS.VOLUNTEERS).doc(task.assignedVolunteer);
            const oldVolDoc = await oldVolRef.get();
            if (oldVolDoc.exists) {
                const currentScore = oldVolDoc.data().reliabilityScore ?? 1;
                batch.update(oldVolRef, {
                    reliabilityScore: Math.max(0, currentScore - 0.1),
                    currentTasks: FieldValue.increment(-1),
                });
            }

            // Create new task for replacement volunteer
            const newTask = {
                id: newTaskId, needId: task.needId, needTitle: task.needTitle,
                needCategory: task.needCategory, assignedVolunteer: nextBest.volunteerId,
                status: 'assigned', scheduledTime: task.scheduledTime,
                completedAt: null, outcome: null, orgId: task.orgId,
                createdAt: new Date(), replacedTaskId: taskId,
            };
            batch.set(db.collection(COLLECTIONS.TASKS).doc(newTaskId), newTask);
            batch.update(db.collection(COLLECTIONS.VOLUNTEERS).doc(nextBest.volunteerId), {
                currentTasks: FieldValue.increment(1),
            });

            await batch.commit();

            // Notify replacement volunteer and coordinator
            await sendTaskAssignment(nextBest.volunteerId, { taskId: newTaskId, needTitle: task.needTitle });
            await sendNoShowAlert(coordinatorId, { taskId, needTitle: task.needTitle });

            console.log(`✅ Task ${taskId} reassigned to ${nextBest.volunteerId}`);
        } else {
            console.warn(`No replacement found for task ${taskId}`);
            await sendNoShowAlert(coordinatorId, { taskId, needTitle: task.needTitle });
        }
    } catch (err) {
        console.error('No-show check error:', err.message);
    }
}

// ── GET /api/tasks — filtered list ───────────────────────────────────────────
router.get('/', verifyToken, async (req, res) => {
    try {
        const { orgId, volunteerId, status, startDate, endDate } = req.query;
        let query = db.collection(COLLECTIONS.TASKS);

        // Volunteers only see their own tasks
        if (req.userDoc?.role === 'volunteer') {
            query = query.where('assignedVolunteer', '==', req.user.uid);
        } else if (volunteerId) {
            query = query.where('assignedVolunteer', '==', volunteerId);
        }

        if (orgId) query = query.where('orgId', '==', orgId);
        if (status) query = query.where('status', '==', status);
        if (startDate) query = query.where('createdAt', '>=', new Date(startDate));
        if (endDate) query = query.where('createdAt', '<=', new Date(endDate));

        const snap = await query.get();
        let tasks = snap.docs.map(d => d.data());

        // Sort by linked need urgency (best effort — urgency on task not stored, sort by createdAt)
        tasks.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));

        res.json(tasks);
    } catch (err) {
        res.status(500).json({ error: err.message, status: 500 });
    }
});

// ── PATCH /api/tasks/:id/status ───────────────────────────────────────────────
router.patch('/:id/status', verifyToken, async (req, res) => {
    try {
        const { status, outcome, peopleHelped, durationHours } = req.body;

        const VALID_TRANSITIONS = {
            assigned: ['inProgress'],
            inProgress: ['completed'],
            completed: ['verified'],
        };

        const taskDoc = await db.collection(COLLECTIONS.TASKS).doc(req.params.id).get();
        if (!taskDoc.exists) return res.status(404).json({ error: 'Task not found' });
        const task = taskDoc.data();

        // Auth check: coordinator or assigned volunteer
        const isCoordinator = req.userDoc?.role === 'coordinator';
        const isAssignedVolunteer = task.assignedVolunteer === req.user.uid;
        if (!isCoordinator && !isAssignedVolunteer) {
            return res.status(403).json({ error: 'Not authorized to update this task' });
        }

        const allowedNext = VALID_TRANSITIONS[task.status];
        if (!allowedNext || !allowedNext.includes(status)) {
            return res.status(400).json({ error: `Cannot transition from "${task.status}" to "${status}"` });
        }

        const updates = { status, updatedAt: new Date() };
        if (outcome) updates.outcome = outcome;
        if (peopleHelped) updates.peopleHelped = peopleHelped;

        const batch = db.batch();
        batch.update(db.collection(COLLECTIONS.TASKS).doc(req.params.id), updates);

        if (status === 'completed') {
            updates.completedAt = new Date();
            batch.update(db.collection(COLLECTIONS.TASKS).doc(req.params.id), { completedAt: new Date() });

            // Decrement volunteer currentTasks, add hours, recalc reliability
            const volRef = db.collection(COLLECTIONS.VOLUNTEERS).doc(task.assignedVolunteer);
            const volDoc = await volRef.get();
            if (volDoc.exists) {
                const vol = volDoc.data();
                const hours = durationHours || 2;
                const totalCompleted = (vol.totalCompleted || 0) + 1;
                const totalAccepted = (vol.totalAccepted || 1) + 1;
                batch.update(volRef, {
                    currentTasks: FieldValue.increment(-1),
                    totalHours: FieldValue.increment(hours),
                    totalCompleted,
                    reliabilityScore: totalCompleted / totalAccepted,
                });
            }
        }

        if (status === 'verified') {
            // Resolve linked need
            if (task.needId) {
                batch.update(db.collection(COLLECTIONS.NEEDS).doc(task.needId), { status: 'resolved' });
            }
            // Update org impact counter
            if (task.orgId) {
                batch.update(db.collection(COLLECTIONS.ORGANIZATIONS).doc(task.orgId), {
                    resolvedCount: FieldValue.increment(1),
                    totalPeopleHelped: FieldValue.increment(peopleHelped || 0),
                });
            }
            // Invalidate heatmap cache
            try {
                const Redis = require('ioredis');
                const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
                await redis.del('civic_heatmap').catch(() => {});
                redis.disconnect();
            } catch {}
        }

        await batch.commit();
        res.json({ message: 'Task status updated', taskId: req.params.id, status });
    } catch (err) {
        res.status(500).json({ error: err.message, status: 500 });
    }
});

// ── GET /api/tasks/:id — full detail ─────────────────────────────────────────
router.get('/:id', verifyToken, async (req, res) => {
    try {
        const taskDoc = await db.collection(COLLECTIONS.TASKS).doc(req.params.id).get();
        if (!taskDoc.exists) return res.status(404).json({ error: 'Task not found' });
        const task = taskDoc.data();

        // Enrich with need + volunteer
        const [needDoc, volDoc] = await Promise.all([
            task.needId ? db.collection(COLLECTIONS.NEEDS).doc(task.needId).get() : null,
            task.assignedVolunteer ? db.collection(COLLECTIONS.VOLUNTEERS).doc(task.assignedVolunteer).get() : null,
        ]);

        res.json({
            ...task,
            need: needDoc?.exists ? needDoc.data() : null,
            volunteer: volDoc?.exists ? volDoc.data() : null,
        });
    } catch (err) {
        res.status(500).json({ error: err.message, status: 500 });
    }
});

// ── POST /api/tasks/:id/no-show-check — internal ─────────────────────────────
router.post('/:id/no-show-check', async (req, res) => {
    try {
        const taskDoc = await db.collection(COLLECTIONS.TASKS).doc(req.params.id).get();
        if (!taskDoc.exists) return res.status(404).json({ error: 'Task not found' });
        const task = taskDoc.data();

        const needDoc = await db.collection(COLLECTIONS.NEEDS).doc(task.needId).get();
        await triggerNoShowCheck(req.params.id, needDoc.data(), task.createdBy);

        res.json({ message: 'No-show check triggered' });
    } catch (err) {
        res.status(500).json({ error: err.message, status: 500 });
    }
});

module.exports = router;