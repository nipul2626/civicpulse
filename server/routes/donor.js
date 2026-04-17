const express = require('express');
const router = express.Router();
const { db } = require('../services/firebase');
const { COLLECTIONS } = require('../config/schema');
const { ok, serverError } = require('../utils/response');

// Fuzzes lat/lng to ~500m radius to prevent re-identification
function fuzzyLocation(lat, lng) {
    if (!lat || !lng) return { lat: null, lng: null };
    const FUZZ = 0.005; // ~500m
    return {
        lat: Math.round((lat + (Math.random() - 0.5) * FUZZ) * 1000) / 1000,
        lng: Math.round((lng + (Math.random() - 0.5) * FUZZ) * 1000) / 1000,
    };
}

// Strips all PII from a need before returning to public donor portal
function sanitizeNeedForPublic(doc) {
    const d = doc.data ? doc.data() : doc;
    const fuzzed = fuzzyLocation(d.location?.lat, d.location?.lng);
    return {
        id: doc.id || d.id,
        category: d.category,
        title: d.title,
        urgencyScore: d.urgencyScore,
        affectedCount: d.affectedCount,
        status: d.status,
        aiSummary: d.aiSummary || null,
        location: {
            address: d.location?.address
                ? d.location.address.split(',').slice(-2).join(',').trim() // keep only city/district
                : 'Mumbai, India',
            lat: fuzzed.lat,
            lng: fuzzed.lng,
        },
        createdAt: d.createdAt,
        resolvedAt: d.processedAt || null,
    };
}

router.get('/public-stats', async (req, res) => {
    try {
        const [needsSnap, tasksSnap, volSnap] = await Promise.all([
            db.collection(COLLECTIONS.NEEDS).get(),
            db.collection(COLLECTIONS.TASKS).where('status', 'in', ['completed', 'verified']).get(),
            db.collection(COLLECTIONS.VOLUNTEERS).get(),
        ]);

        const peopleHelped = tasksSnap.docs.reduce((s, d) => s + (d.data().peopleHelped || 0), 0);
        const totalHours   = volSnap.docs.reduce((s, d) => s + (d.data().totalHours || 0), 0);
        const resolved     = needsSnap.docs.filter(d => d.data().status === 'resolved').length;

        return ok(res, {
            totalNeedsAddressed: resolved,
            volunteersActive: volSnap.size,
            peopleHelped,
            totalVolunteerHours: Math.round(totalHours),
            lastUpdated: new Date().toISOString(),
        });
    } catch (err) {
        return serverError(res, err);
    }
});

router.get('/resolved-needs', async (req, res) => {
    try {
        const snap = await db.collection(COLLECTIONS.NEEDS)
            .where('status', '==', 'resolved')
            .orderBy('createdAt', 'desc')
            .limit(50)
            .get();

        const results = snap.docs.map(sanitizeNeedForPublic);
        return ok(res, results);
    } catch (err) {
        return serverError(res, err);
    }
});

router.get('/need/:id/story', async (req, res) => {
    try {
        const needDoc = await db.collection(COLLECTIONS.NEEDS).doc(req.params.id).get();
        if (!needDoc.exists) return res.status(404).json({ success: false, error: 'Need not found' });

        const need = needDoc.data();
        const taskSnap = await db.collection(COLLECTIONS.TASKS)
            .where('needId', '==', req.params.id)
            .where('status', 'in', ['completed', 'verified'])
            .limit(1)
            .get();

        let volunteerFirstName = 'A volunteer';
        let outcome = null;
        let peopleHelped = null;

        if (!taskSnap.empty) {
            const task = taskSnap.docs[0].data();
            outcome = task.outcome;
            peopleHelped = task.peopleHelped;
            try {
                const userDoc = await db.collection(COLLECTIONS.USERS).doc(task.assignedVolunteer).get();
                if (userDoc.exists) {
                    volunteerFirstName = (userDoc.data().displayName || '').split(' ')[0] || 'A volunteer';
                }
            } catch {}
        }

        const fuzzed = fuzzyLocation(need.location?.lat, need.location?.lng);

        return ok(res, {
            id: req.params.id,
            title: need.title,
            category: need.category,
            location: need.location?.address
                ? need.location.address.split(',').slice(-2).join(',').trim()
                : 'Mumbai, India',
            lat: fuzzed.lat,
            lng: fuzzed.lng,
            whatWasReported: need.description?.substring(0, 200),
            whoHelped: `${volunteerFirstName} and the CivicPulse team`,
            outcome: outcome || need.aiSummary || 'Successfully resolved',
            peopleHelped,
            reportedAt: need.createdAt,
            resolvedAt: need.processedAt || null,
        });
    } catch (err) {
        return serverError(res, err);
    }
});

module.exports = router;