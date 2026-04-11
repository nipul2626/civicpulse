const { db } = require('./firebase');
const { detectBurnout } = require('./aiService');
const { COLLECTIONS } = require('../config/schema');

async function calculateBurnoutRisk(volunteerId) {
    try {
        // Fetch tasks completed in last 7 days
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const taskSnap = await db.collection(COLLECTIONS.TASKS)
            .where('assignedVolunteer', '==', volunteerId)
            .where('status', 'in', ['completed', 'verified'])
            .where('completedAt', '>=', sevenDaysAgo)
            .get();

        const tasks = taskSnap.docs.map(d => d.data());

        // Calculate stats
        const taskCount = tasks.length;
        const totalHours = tasks.reduce((sum, t) => sum + (t.durationHours || 2), 0); // default 2h per task
        const highIntensityCount = tasks.filter(t => ['medical', 'emergency'].includes(t.category)).length;

        // Count consecutive days with tasks
        const daySet = new Set(
            tasks
                .filter(t => t.completedAt)
                .map(t => {
                    const d = t.completedAt.toDate ? t.completedAt.toDate() : new Date(t.completedAt);
                    return d.toDateString();
                })
        );
        const consecutiveDays = daySet.size;

        const stats = { totalHours, taskCount, highIntensityCount, consecutiveDays };

        // Call AI burnout detection
        const result = await detectBurnout(stats);

        // Update Firestore if at risk
        if (result.burnoutRisk) {
            await db.collection(COLLECTIONS.VOLUNTEERS).doc(volunteerId).update({
                burnoutFlag: true,
                burnoutReason: result.reason,
                burnoutDetectedAt: new Date(),
            });
            console.log(`🔴 Burnout risk flagged for volunteer ${volunteerId}: ${result.reason}`);
        } else {
            // Clear flag if previously set
            await db.collection(COLLECTIONS.VOLUNTEERS).doc(volunteerId).update({
                burnoutFlag: false,
                burnoutReason: null,
            });
        }

        return { volunteerId, ...result, stats };
    } catch (err) {
        console.error(`Burnout check failed for ${volunteerId}:`, err.message);
        return { volunteerId, burnoutRisk: false, reason: 'Check failed', error: err.message };
    }
}

module.exports = { calculateBurnoutRisk };