const express = require('express');
const router = express.Router();
const { db } = require('../services/firebase');
const { verifyToken, requireRole } = require('../middleware/auth');
const { matchVolunteersToNeed } = require('../services/matchingEngine');
const { sendTaskAssignment, sendTaskReminder, sendNoShowAlert } = require('../services/notificationService');
const { COLLECTIONS } = require('../config/schema');
const { v4: uuidv4 } = require('uuid');
const { FieldValue } = require('firebase-admin').firestore;
const { scheduleTaskReminder, scheduleNoShowCheck } = require('../queues/taskQueue')
const sanitizeHtml = require('sanitize-html');
const { applyUrgencyDecay } = require('../utils/urgencyDecay');
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
            await scheduleTaskReminder(
                taskId,
                assignedVolunteerId,
                need.title,
                scheduledTime
            );
            await scheduleNoShowCheck(
                taskId,
                needId,
                req.user.uid,
                need.title,
                scheduledTime
            );
        }

        res.status(201).json({ message: 'Task created', taskId, task });
    } catch (err) {
        console.error('Create task error:', err);
        res.status(500).json({ error: err.message, status: 500 });
    }
});

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
        // ✅ Sanitize outcome input
        const { status, outcome, peopleHelped, durationHours } = req.body;
        const sanitizedOutcome = outcome
            ? sanitizeHtml(outcome, { allowedTags: [], allowedAttributes: {} })
            : null;

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
        if (sanitizedOutcome) updates.outcome = sanitizedOutcome;
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

            // ── Skill learning ────────────────────────────────────────
            const coordinatorRating = req.body.coordinatorRating;

            if (coordinatorRating && task.assignedVolunteer && task.needCategory) {
                const parsed = parseInt(coordinatorRating);
                if (!isNaN(parsed)) {
                    const rating = Math.max(1, Math.min(5, parsed));

                    const delta = (rating - 3) * 0.05;

                    await db.collection(COLLECTIONS.VOLUNTEERS)
                        .doc(task.assignedVolunteer)
                        .update({
                            [`implicitSkillWeights.${task.needCategory}`]: FieldValue.increment(delta),
                            totalRatings: FieldValue.increment(1),
                            ratingSum: FieldValue.increment(rating),
                        })
                        .catch(err => {
                            console.warn('Skill learning failed:', err.message);
                        });

                    console.log(
                        `📊 Skill learning: volunteer ${task.assignedVolunteer} ${task.needCategory} weight ${delta > 0 ? '+' : ''}${delta}`
                    );
                }
            }
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


module.exports = router;