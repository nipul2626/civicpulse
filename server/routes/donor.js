const express = require('express');
const router = express.Router();
const { db } = require('../services/firebase');
const { COLLECTIONS } = require('../config/schema');

// GET /api/donor/public-stats — sanitized, no personal data
router.get('/public-stats', async (req, res) => {
    try {
        const [needsSnap, tasksSnap, volSnap] = await Promise.all([
            db.collection(COLLECTIONS.NEEDS).get(),
            db.collection(COLLECTIONS.TASKS).where('status', 'in', ['completed', 'verified']).get(),
            db.collection(COLLECTIONS.VOLUNTEERS).get(),
        ]);

        const peopleHelped = tasksSnap.docs.reduce((sum, d) => sum + (d.data().peopleHelped || 0), 0);
        const totalHours   = volSnap.docs.reduce((sum, d) => sum + (d.data().totalHours || 0), 0);
        const resolved     = needsSnap.docs.filter(d => d.data().status === 'resolved').length;

        res.json({
            totalNeedsAddressed: resolved,
            volunteersActive: volSnap.size,
            peopleHelped,
            totalVolunteerHours: Math.round(totalHours),
            lastUpdated: new Date().toISOString(),
        });
    } catch (err) {
        res.status(500).json({ error: err.message, status: 500 });
    }
});

// GET /api/donor/resolved-needs — no personal data
router.get('/resolved-needs', async (req, res) => {
    try {
        const snap = await db.collection(COLLECTIONS.NEEDS)
            .where('status', '==', 'resolved')
            .orderBy('createdAt', 'desc')
            .limit(50)
            .get();

        const results = snap.docs.map(doc => {
            const d = doc.data();
            return {
                id: doc.id,
                category: d.category,
                title: d.title,
                location: { address: d.location?.address, lat: d.location?.lat, lng: d.location?.lng },
                urgencyScore: d.urgencyScore,
                affectedCount: d.affectedCount,
                createdAt: d.createdAt,
                resolvedAt: d.processedAt || null,
                aiSummary: d.aiSummary || null,
            };
        });

        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message, status: 500 });
    }
});

// GET /api/donor/need/:id/story
router.get('/need/:id/story', async (req, res) => {
    try {
        const needDoc = await db.collection(COLLECTIONS.NEEDS).doc(req.params.id).get();
        if (!needDoc.exists) return res.status(404).json({ error: 'Need not found' });
        const need = needDoc.data();

        // Find linked completed task
        const taskSnap = await db.collection(COLLECTIONS.TASKS)
            .where('needId', '==', req.params.id)
            .where('status', 'in', ['completed', 'verified'])
            .limit(1)
            .get();

        let volunteerFirstName = null;
        let outcome = null;
        let peopleHelped = null;

        if (!taskSnap.empty) {
            const task = taskSnap.docs[0].data();
            outcome = task.outcome;
            peopleHelped = task.peopleHelped;

            // Only first name for privacy
            try {
                const userDoc = await db.collection(COLLECTIONS.USERS).doc(task.assignedVolunteer).get();
                if (userDoc.exists) {
                    const fullName = userDoc.data().displayName || '';
                    volunteerFirstName = fullName.split(' ')[0] || 'A volunteer';
                }
            } catch {}
        }

        res.json({
            id: req.params.id,
            title: need.title,
            category: need.category,
            location: need.location?.address || 'Unknown location',
            whatWasReported: need.description,
            whoHelped: volunteerFirstName ? `${volunteerFirstName} and the team` : 'Our volunteers',
            outcome: outcome || need.aiSummary || 'Successfully resolved',
            peopleHelped,
            reportedAt: need.createdAt,
            resolvedAt: need.processedAt || null,
        });
    } catch (err) {
        res.status(500).json({ error: err.message, status: 500 });
    }
});

module.exports = router;