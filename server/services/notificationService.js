const { admin, db } = require('./firebase');
const { COLLECTIONS } = require('../config/schema');

// ── Core push sender ──────────────────────────────────────────────────────────
async function sendPushNotification(userId, { title, body, data = {} }) {
    try {
        const userDoc = await db.collection(COLLECTIONS.USERS).doc(userId).get();
        if (!userDoc.exists) return;

        const fcmToken = userDoc.data().fcmToken;
        if (!fcmToken) {
            console.warn(`No FCM token for user ${userId}`);
            return;
        }

        await admin.messaging().send({
            token: fcmToken,
            notification: { title, body },
            data: Object.fromEntries(Object.entries(data).map(([k, v]) => [k, String(v)])),
        });

        console.log(`✅ Push sent to ${userId}: ${title}`);
    } catch (err) {
        console.error(`Push notification failed for ${userId}:`, err.message);
    }
}

// ── Specific notification templates ──────────────────────────────────────────
async function sendTaskAssignment(volunteerId, taskDetails) {
    await sendPushNotification(volunteerId, {
        title: '📋 New Task Assigned',
        body: `You have been assigned: ${taskDetails.needTitle || 'a new task'}. Scheduled: ${taskDetails.scheduledTime || 'TBD'}.`,
        data: { taskId: taskDetails.taskId, type: 'task_assigned' },
    });
}

async function sendTaskReminder(volunteerId, taskDetails) {
    await sendPushNotification(volunteerId, {
        title: '⏰ Task Reminder',
        body: `Your task "${taskDetails.needTitle || 'task'}" starts in 2 hours. Please confirm your attendance.`,
        data: { taskId: taskDetails.taskId, type: 'task_reminder' },
    });
}

async function sendNoShowAlert(coordinatorId, taskDetails) {
    await sendPushNotification(coordinatorId, {
        title: '⚠️ Volunteer No-Show',
        body: `Volunteer did not start task "${taskDetails.needTitle || 'task'}". A replacement has been auto-assigned.`,
        data: { taskId: taskDetails.taskId, type: 'no_show' },
    });
}

async function sendBurnoutAlert(coordinatorId, volunteerName) {
    await sendPushNotification(coordinatorId, {
        title: '🔴 Burnout Risk Detected',
        body: `Volunteer ${volunteerName} is showing burnout risk. Consider reducing their task load.`,
        data: { type: 'burnout_alert' },
    });
}

module.exports = {
    sendPushNotification,
    sendTaskAssignment,
    sendTaskReminder,
    sendNoShowAlert,
    sendBurnoutAlert,
};