const express = require('express');
const router = express.Router();
const { db } = require('../services/firebase');
const { verifyToken, requireRole } = require('../middleware/auth');
const { verifySkillDocument } = require('../services/aiService');
const { calculateBurnoutRisk } = require('../services/burnoutDetection');
const { COLLECTIONS } = require('../config/schema');
const { FieldValue } = require('firebase-admin').firestore;
const cache = require('../services/cacheService');
const { ok, paginated, fail, notFound, serverError } = require('../utils/response');




// GET /api/volunteers — coordinator auth (with caching)
router.get('/', verifyToken, requireRole('coordinator'), async (req, res) => {
    try {
        const { orgId, skill, available, verified, limit, cursor } = req.query;
        const CACHE_KEY = `volunteers:${orgId || 'all'}`;
        const useCache = !skill && !available && !verified && !cursor;

        let volunteers;
        if (useCache) {
            const { data } = await cache.getOrSet(CACHE_KEY, 120, async () => {
                const snap = await db.collection(COLLECTIONS.VOLUNTEERS).get();
                return snap.docs.map(d => ({ id: d.id, ...d.data() }));
            });
            volunteers = data;
        } else {
            const snap = await db.collection(COLLECTIONS.VOLUNTEERS).get();
            volunteers = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        }

        // Apply filters
        if (orgId)            volunteers = volunteers.filter(v => v.orgId === orgId);
        if (available === 'true') volunteers = volunteers.filter(v => (v.currentTasks || 0) < 3 && !v.burnoutFlag);
        if (skill) {
            const s = skill.toLowerCase();
            volunteers = verified === 'true'
                ? volunteers.filter(v => (v.verifiedSkills || []).some(vs => vs.toLowerCase().includes(s)))
                : volunteers.filter(v => [...(v.skills || []), ...(v.verifiedSkills || [])].some(vs => vs.toLowerCase().includes(s)));
        }

        // Manual cursor pagination on in-memory array
        const parsedLimit = Math.min(parseInt(limit) || 20, 100);
        const cursorIdx = cursor ? volunteers.findIndex(v => v.id === cursor) + 1 : 0;
        const page = volunteers.slice(cursorIdx, cursorIdx + parsedLimit);
        const hasMore = cursorIdx + parsedLimit < volunteers.length;

        // Join displayNames for current page only (not full list — avoids N+1 on all 500)
        const enriched = await Promise.all(page.map(async (v) => {
            try {
                const userDoc = await db.collection(COLLECTIONS.USERS).doc(v.userId || v.id).get();
                return { ...v, displayName: userDoc.exists ? userDoc.data().displayName : 'Unknown' };
            } catch { return v; }
        }));

        return paginated(res, enriched, {
            count: enriched.length,
            hasMore,
            nextCursor: hasMore ? page[page.length - 1]?.id : null,
            limit: parsedLimit,
            total: volunteers.length,
        });
    } catch (err) {
        return serverError(res, err);
    }
});
// GET /api/volunteers/burnout-risk — coordinator auth
router.get('/burnout-risk', verifyToken, requireRole('coordinator'), async (req, res) => {
    try {
        const snap = await db.collection(COLLECTIONS.VOLUNTEERS)
            .where('burnoutFlag', '==', true).get();
        res.json(snap.docs.map(d => ({
            ...d.data(),
            recommendedAction: 'Reduce task load and check in with volunteer.',
        })));
    } catch (err) {
        res.status(500).json({ error: err.message, status: 500 });
    }
});

// GET /api/volunteers/:id — coordinator auth
router.get('/:id', verifyToken, requireRole('coordinator'), async (req, res) => {
    try {
        const doc = await db.collection(COLLECTIONS.VOLUNTEERS).doc(req.params.id).get();
        if (!doc.exists) return res.status(404).json({ error: 'Volunteer not found' });

        // Fetch task history (last 20)
        const taskSnap = await db.collection(COLLECTIONS.TASKS)
            .where('assignedVolunteer', '==', req.params.id)
            .orderBy('createdAt', 'desc')
            .limit(20)
            .get();

        res.json({ ...doc.data(), taskHistory: taskSnap.docs.map(d => d.data()) });
    } catch (err) {
        res.status(500).json({ error: err.message, status: 500 });
    }
});

// PUT /api/volunteers/:id/availability — volunteer auth (own profile only)
router.put('/:id/availability', verifyToken, async (req, res) => {
    try {
        if (req.user.uid !== req.params.id && req.userDoc?.role !== 'coordinator') {
            return res.status(403).json({ error: 'Can only update your own availability' });
        }
        const { availabilityGrid } = req.body;
        if (!availabilityGrid || typeof availabilityGrid !== 'object') {
            return res.status(400).json({ error: 'availabilityGrid object is required' });
        }
        await db.collection(COLLECTIONS.VOLUNTEERS).doc(req.params.id).update({ availabilityGrid });
        await cache.delPattern('volunteers:*');
        res.json({ message: 'Availability updated' });
    } catch (err) {
        res.status(500).json({ error: err.message, status: 500 });
    }
});

// PUT /api/volunteers/:id/location — volunteer auth
router.put('/:id/location', verifyToken, async (req, res) => {
    try {
        if (req.user.uid !== req.params.id && req.userDoc?.role !== 'coordinator') {
            return res.status(403).json({ error: 'Can only update your own location' });
        }
        const { lat, lng } = req.body;
        if (!lat || !lng) return res.status(400).json({ error: 'lat and lng required' });
        await db.collection(COLLECTIONS.VOLUNTEERS).doc(req.params.id).update({ location: { lat, lng } });
        await cache.delPattern('volunteers:*');
        res.json({ message: 'Location updated' });
    } catch (err) {
        res.status(500).json({ error: err.message, status: 500 });
    }
});

// POST /api/volunteers/verify-skill
router.post('/verify-skill', verifyToken, async (req, res) => {
    try {
        const { volunteerId, claimedSkill, documentText } = req.body;
        if (!volunteerId || !claimedSkill || !documentText) {
            return res.status(400).json({ error: 'volunteerId, claimedSkill, documentText are required' });
        }
        const result = await verifySkillDocument(documentText, claimedSkill);
        if (result.verified) {
            await db.collection(COLLECTIONS.VOLUNTEERS).doc(volunteerId).update({
                verifiedSkills: FieldValue.arrayUnion(claimedSkill),
            });
        }
        res.json({
            verified: result.verified,
            confidence: result.confidence,
            badge: result.verified ? 'verified' : 'rejected',
            reason: result.extractedCredential || (result.verified ? 'Document verified' : 'Could not confirm skill'),
        });
    } catch (err) {
        res.status(500).json({ error: err.message, status: 500 });
    }
});

module.exports = router;