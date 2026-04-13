require('dotenv').config();
const { Queue, Worker, QueueEvents } = require('bullmq');
const { db } = require('../services/firebase');
const { matchVolunteersToNeed } = require('../services/matchingEngine');
const { sendTaskReminder, sendNoShowAlert, sendTaskAssignment } = require('../services/notificationService');
const { COLLECTIONS } = require('../config/schema');
const { FieldValue } = require('firebase-admin').firestore;
const { v4: uuidv4 } = require('uuid');

// ── Redis connection config for BullMQ ────────────────────────────────────────
const connection = {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD || undefined,
    tls: process.env.REDIS_TLS === 'true' ? {} : undefined,
};

// If REDIS_URL is provided (Render format), parse it
if (process.env.REDIS_URL) {
    try {
        const url = new URL(process.env.REDIS_URL);
        connection.host = url.hostname;
        connection.port = parseInt(url.port) || 6379;
        if (url.password) connection.password = url.password;
        if (url.protocol === 'rediss:') connection.tls = {};
    } catch (e) {
        console.warn('Could not parse REDIS_URL for BullMQ, using defaults');
    }
}

// ── Queue definition ──────────────────────────────────────────────────────────
let taskQueue = null;
let taskWorker = null;

// ── Job processors ────────────────────────────────────────────────────────────
async function processTaskReminder(job) {
    const { taskId, volunteerId, needTitle, scheduledTime } = job.data;
    console.log(`📢 Sending reminder for task ${taskId}`);

    const taskDoc = await db.collection(COLLECTIONS.TASKS).doc(taskId).get();
    if (!taskDoc.exists) return { skipped: true, reason: 'Task not found' };

    const task = taskDoc.data();
    // Only send if still assigned (not already started or cancelled)
    if (!['assigned'].includes(task.status)) {
        return { skipped: true, reason: `Task status is ${task.status}` };
    }

    await sendTaskReminder(volunteerId, { taskId, needTitle, scheduledTime });
    return { sent: true };
}

async function processNoShowCheck(job) {
    const { taskId, needId, coordinatorId, needTitle } = job.data;
    console.log(`🔍 No-show check for task ${taskId}`);

    const taskDoc = await db.collection(COLLECTIONS.TASKS).doc(taskId).get();
    if (!taskDoc.exists) return { skipped: true, reason: 'Task not found' };

    const task = taskDoc.data();
    // Only act if still assigned — not started
    if (task.status !== 'assigned') {
        return { skipped: true, reason: `Task already in status: ${task.status}` };
    }

    console.log(`⚠️  No-show confirmed for task ${taskId}, finding replacement...`);

    try {
        // Find next best volunteer
        const matches = await matchVolunteersToNeed(needId);
        const nextBest = matches.find(m => m.volunteerId !== task.assignedVolunteer);

        if (nextBest) {
            const newTaskId = uuidv4();
            const batch = db.batch();

            // Mark old task reassigned
            batch.update(db.collection(COLLECTIONS.TASKS).doc(taskId), {
                status: 'reassigned',
                reassignedAt: new Date(),
            });

            // Penalize old volunteer reliability
            const oldVolRef = db.collection(COLLECTIONS.VOLUNTEERS).doc(task.assignedVolunteer);
            const oldVolDoc = await oldVolRef.get();
            if (oldVolDoc.exists) {
                const currentScore = oldVolDoc.data().reliabilityScore ?? 1;
                batch.update(oldVolRef, {
                    reliabilityScore: Math.max(0, currentScore - 0.1),
                    currentTasks: FieldValue.increment(-1),
                    noShowCount: FieldValue.increment(1),
                });
            }

            // Create replacement task
            const newTask = {
                id: newTaskId,
                needId: task.needId,
                needTitle: task.needTitle,
                needCategory: task.needCategory,
                assignedVolunteer: nextBest.volunteerId,
                status: 'assigned',
                scheduledTime: task.scheduledTime,
                completedAt: null,
                outcome: null,
                orgId: task.orgId,
                createdAt: new Date(),
                replacedTaskId: taskId,
                autoAssigned: true,
            };

            batch.set(db.collection(COLLECTIONS.TASKS).doc(newTaskId), newTask);
            batch.update(db.collection(COLLECTIONS.VOLUNTEERS).doc(nextBest.volunteerId), {
                currentTasks: FieldValue.increment(1),
            });

            await batch.commit();

            // Notify replacement volunteer and coordinator
            await sendTaskAssignment(nextBest.volunteerId, {
                taskId: newTaskId,
                needTitle: task.needTitle,
                scheduledTime: task.scheduledTime,
            });

            if (coordinatorId) {
                await sendNoShowAlert(coordinatorId, { taskId, needTitle });
            }

            // Schedule reminder and no-show check for the new task too
            if (taskQueue && task.scheduledTime) {
                const taskTime = new Date(task.scheduledTime.seconds
                    ? task.scheduledTime.seconds * 1000
                    : task.scheduledTime
                ).getTime();
                const reminderDelay = taskTime - Date.now() - 2 * 60 * 60 * 1000;
                const noShowDelay   = taskTime + 1 * 60 * 60 * 1000;

                if (reminderDelay > 0) {
                    await taskQueue.add('task-reminder', {
                        taskId: newTaskId,
                        volunteerId: nextBest.volunteerId,
                        needTitle: task.needTitle,
                        scheduledTime: task.scheduledTime,
                    }, { delay: reminderDelay });
                }

                if (noShowDelay > 0) {
                    await taskQueue.add('no-show-check', {
                        taskId: newTaskId,
                        needId,
                        coordinatorId,
                        needTitle,
                    }, { delay: noShowDelay });
                }
            }

            console.log(`✅ Task ${taskId} reassigned to ${nextBest.volunteerId} as ${newTaskId}`);
            return { reassigned: true, newTaskId, newVolunteerId: nextBest.volunteerId };
        } else {
            // No replacement found — just alert coordinator
            if (coordinatorId) {
                await sendNoShowAlert(coordinatorId, { taskId, needTitle });
            }
            await db.collection(COLLECTIONS.TASKS).doc(taskId).update({
                status: 'no-show',
                noShowAt: new Date(),
            });
            return { reassigned: false, reason: 'No suitable replacement found' };
        }
    } catch (err) {
        console.error(`No-show check failed for task ${taskId}:`, err.message);
        throw err; // BullMQ will retry
    }
}

// ── Initialize queue and worker ───────────────────────────────────────────────
function initTaskQueue() {
    try {
        taskQueue = new Queue('civic-task-reminders', {
            connection,
            defaultJobOptions: {
                attempts: 3,
                backoff: { type: 'exponential', delay: 5000 },
                removeOnComplete: 100, // keep last 100 completed jobs for debugging
                removeOnFail: 50,
            },
        });

        taskWorker = new Worker('civic-task-reminders', async (job) => {
            if (job.name === 'task-reminder') return processTaskReminder(job);
            if (job.name === 'no-show-check') return processNoShowCheck(job);
            throw new Error(`Unknown job type: ${job.name}`);
        }, { connection });

        taskWorker.on('completed', (job, result) => {
            console.log(`✅ BullMQ job ${job.name} (${job.id}) completed:`, result);
        });

        taskWorker.on('failed', (job, err) => {
            console.error(`❌ BullMQ job ${job.name} (${job.id}) failed:`, err.message);
        });

        console.log('✅ BullMQ task queue initialized');
        return taskQueue;
    } catch (err) {
        console.error('❌ BullMQ init failed (Redis unavailable?):', err.message);
        console.warn('⚠️  Task reminders will not work — fix Redis connection');
        return null;
    }
}

// ── Schedule helpers (called from routes/tasks.js) ────────────────────────────
async function scheduleTaskReminder(taskId, volunteerId, needTitle, scheduledTime) {
    if (!taskQueue) {
        console.warn('Task queue not available — reminder not scheduled');
        return;
    }

    const taskTime = new Date(scheduledTime).getTime();
    const delay = taskTime - Date.now() - 2 * 60 * 60 * 1000; // 2h before

    if (delay <= 0) {
        console.warn(`Reminder delay is negative for task ${taskId} — skipping`);
        return;
    }

    const job = await taskQueue.add('task-reminder', {
        taskId, volunteerId, needTitle, scheduledTime,
    }, { delay, jobId: `reminder-${taskId}` }); // jobId prevents duplicates

    console.log(`⏰ Reminder scheduled for task ${taskId} in ${Math.round(delay / 60000)} minutes`);
    return job.id;
}

async function scheduleNoShowCheck(taskId, needId, coordinatorId, needTitle, scheduledTime) {
    if (!taskQueue) {
        console.warn('Task queue not available — no-show check not scheduled');
        return;
    }

    const taskTime = new Date(scheduledTime).getTime();
    const delay = taskTime - Date.now() + 1 * 60 * 60 * 1000; // 1h after

    if (delay <= 0) {
        console.warn(`No-show delay is negative for task ${taskId} — skipping`);
        return;
    }

    const job = await taskQueue.add('no-show-check', {
        taskId, needId, coordinatorId, needTitle,
    }, { delay, jobId: `noshow-${taskId}` }); // jobId prevents duplicates

    console.log(`🔍 No-show check scheduled for task ${taskId} in ${Math.round(delay / 60000)} minutes`);
    return job.id;
}

function getTaskQueue() { return taskQueue; }

module.exports = {
    initTaskQueue,
    scheduleTaskReminder,
    scheduleNoShowCheck,
    getTaskQueue,
};