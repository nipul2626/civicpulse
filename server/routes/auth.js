const express = require('express');
const router = express.Router();
const { db, auth } = require('../services/firebase');
const { verifyToken } = require('../middleware/auth');
const { COLLECTIONS } = require('../config/schema');

// POST /api/auth/register
router.post('/register', async (req, res) => {
    try {
        const { uid, email, role, orgId, displayName } = req.body;
        if (!uid || !email || !role) return res.status(400).json({ error: 'uid, email, role required' });

        const validRoles = ['coordinator', 'volunteer', 'community'];
        if (!validRoles.includes(role)) return res.status(400).json({ error: 'Invalid role' });

        const userRef = db.collection(COLLECTIONS.USERS).doc(uid);
        await userRef.set({ id: uid, email, role, orgId: orgId || null, displayName: displayName || '', createdAt: new Date() });

        res.status(201).json({ message: 'User registered', uid });
    } catch (err) {
        res.status(500).json({ error: err.message, status: 500 });
    }
});

// POST /api/auth/register-volunteer
router.post('/register-volunteer', async (req, res) => {
    try {
        const { uid, email, skills, availabilityGrid, zoneRadius, location } = req.body;
        if (!uid || !email) return res.status(400).json({ error: 'uid and email required' });

        const batch = db.batch();

        const userRef = db.collection(COLLECTIONS.USERS).doc(uid);
        batch.set(userRef, { id: uid, email, role: 'volunteer', orgId: null, displayName: '', createdAt: new Date() });

        const volunteerRef = db.collection(COLLECTIONS.VOLUNTEERS).doc(uid);
        batch.set(volunteerRef, {
            id: uid, userId: uid, skills: skills || [], verifiedSkills: [],
            availabilityGrid: availabilityGrid || {}, zoneRadius: zoneRadius || 10,
            reliabilityScore: 100, totalHours: 0, currentTasks: 0,
            burnoutFlag: false, location: location || { lat: null, lng: null },
        });

        await batch.commit();
        res.status(201).json({ message: 'Volunteer registered', uid });
    } catch (err) {
        res.status(500).json({ error: err.message, status: 500 });
    }
});

// POST /api/auth/register-org
router.post('/register-org', async (req, res) => {
    try {
        const { uid, email, orgName, contactPerson, zones } = req.body;
        if (!uid || !email || !orgName) return res.status(400).json({ error: 'uid, email, orgName required' });

        const orgRef = db.collection(COLLECTIONS.ORGANIZATIONS).doc();
        const orgId = orgRef.id;

        const batch = db.batch();
        batch.set(orgRef, { id: orgId, name: orgName, email, zones: zones || [], contactPerson: contactPerson || '', createdAt: new Date(), subscriptionTier: 'free' });

        const userRef = db.collection(COLLECTIONS.USERS).doc(uid);
        batch.set(userRef, { id: uid, email, role: 'coordinator', orgId, displayName: contactPerson || '', createdAt: new Date() });

        await batch.commit();
        res.status(201).json({ message: 'Organization and coordinator registered', orgId, uid });
    } catch (err) {
        res.status(500).json({ error: err.message, status: 500 });
    }
});

// GET /api/auth/me
router.get('/me', verifyToken, async (req, res) => {
    try {
        const userDoc = await db.collection(COLLECTIONS.USERS).doc(req.user.uid).get();
        if (!userDoc.exists) return res.status(404).json({ error: 'User not found' });

        const userData = userDoc.data();
        let orgData = null;
        if (userData.orgId) {
            const orgDoc = await db.collection(COLLECTIONS.ORGANIZATIONS).doc(userData.orgId).get();
            if (orgDoc.exists) orgData = orgDoc.data();
        }

        res.json({ user: userData, org: orgData });
    } catch (err) {
        res.status(500).json({ error: err.message, status: 500 });
    }
});

module.exports = router;