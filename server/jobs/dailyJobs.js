const cron = require('node-cron');
const { db } = require('../services/firebase');
const { calculateBurnoutRisk } = require('../services/burnoutDetection');
const { sendBurnoutAlert } = require('../services/notificationService');
const { COLLECTIONS } = require('../config/schema');

async function runDailyBurnoutCheck() {
    console.log('🔄 Daily burnout check started:', new Date().toISOString());

    try {
        const volSnap = await db.collection(COLLECTIONS.VOLUNTEERS).get();
        const volunteers = volSnap.docs.map(d => ({ id: d.id, ...d.data() }));

        let atRisk = 0;
        for (const volunteer of volunteers) {
            const result = await calculateBurnoutRisk(volunteer.id);
            if (result.burnoutRisk) {
                atRisk++;
                // Alert coordinators in the same org
                try {
                    const userDoc = await db.collection(COLLECTIONS.USERS).doc(volunteer.userId || volunteer.id).get();
                    const orgId = userDoc.exists ? userDoc.data().orgId : null;
                    if (orgId) {
                        const coordSnap = await db.collection(COLLECTIONS.USERS)
                            .where('orgId', '==', orgId)
                            .where('role', '==', 'coordinator')
                            .get();
                        for (const coord of coordSnap.docs) {
                            await sendBurnoutAlert(coord.id, userDoc.exists ? userDoc.data().displayName : 'Volunteer');
                        }
                    }
                } catch {}
            }
        }

        console.log(`✅ Burnout check done: ${volunteers.length} checked, ${atRisk} at risk`);
    } catch (err) {
        console.error('Daily burnout check failed:', err.message);
    }
}

function startDailyJobs() {
    // Run every day at midnight
    cron.schedule('0 0 * * *', runDailyBurnoutCheck, { timezone: 'Asia/Kolkata' });
    console.log('📅 Daily jobs scheduled (midnight IST)');

    // Run once on startup in dev to verify it works
    if (process.env.NODE_ENV !== 'production') {
        setTimeout(() => {
            console.log('🔄 Running burnout check on startup (dev mode)...');
            runDailyBurnoutCheck();
        }, 5000);
    }
}

module.exports = { startDailyJobs, runDailyBurnoutCheck };