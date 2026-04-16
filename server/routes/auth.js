const express = require('express');
const router = express.Router();
const { db, auth } = require('../services/firebase');
const { verifyToken } = require('../middleware/auth');
const { COLLECTIONS } = require('../config/schema');
const { ok, fail, serverError } = require('../utils/response');
// POST /api/auth/register
router.post('/register', async (req, res) => {
    try {
        const { uid, email, role, orgId, displayName } = req.body;
        if (!uid || !email || !role) return fail(res, 400, 'uid, email, role required');

        const validRoles = ['coordinator', 'volunteer', 'community'];
        if (!validRoles.includes(role)) return fail(res, 400, 'Invalid role');

        const userRef = db.collection(COLLECTIONS.USERS).doc(uid);
        await userRef.set({ id: uid, email, role, orgId: orgId || null, displayName: displayName || '', createdAt: new Date() });

        return ok(res, { uid }, { message: 'User registered' });
    } catch (err) {
        return serverError(res, err);
    }
});

// POST /api/auth/register-volunteer
router.post('/register-volunteer', async (req, res) => {
    try {
        const { uid, email, skills, availabilityGrid, zoneRadius, location } = req.body;
        if (!uid || !email) return fail(res, 400, 'uid and email required');

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
        return ok(res, { uid }, { message: 'Volunteer registered' });
    } catch (err) {
        return serverError(res, err);
    }
});

// POST /api/auth/register-org
router.post('/register-org', async (req, res) => {
    try {
        const { uid, email, orgName, contactPerson, zones } = req.body;
        if (!uid || !email || !orgName) return fail(res, 400, 'uid, email, orgName required');

        const orgRef = db.collection(COLLECTIONS.ORGANIZATIONS).doc();
        const orgId = orgRef.id;

        const batch = db.batch();
        batch.set(orgRef, { id: orgId, name: orgName, email, zones: zones || [], contactPerson: contactPerson || '', createdAt: new Date(), subscriptionTier: 'free' });

        const userRef = db.collection(COLLECTIONS.USERS).doc(uid);
        batch.set(userRef, { id: uid, email, role: 'coordinator', orgId, displayName: contactPerson || '', createdAt: new Date() });

        await batch.commit();
        return ok(res, { orgId, uid }, { message: 'Organization and coordinator registered' });
    } catch (err) {
        return serverError(res, err);
    }
});

// GET /api/auth/me
router.get('/me', verifyToken, async (req, res) => {
    try {
        const userDoc = await db.collection(COLLECTIONS.USERS).doc(req.user.uid).get();
        if (!userDoc.exists) return fail(res, 404, 'User not found');

        const userData = userDoc.data();
        let orgData = null;
        if (userData.orgId) {
            const orgDoc = await db.collection(COLLECTIONS.ORGANIZATIONS).doc(userData.orgId).get();
            if (orgDoc.exists) orgData = orgDoc.data();
        }

        return ok(res, { user: userData, org: orgData });
    } catch (err) {
        return serverError(res, err);
    }
});

module.exports = router;