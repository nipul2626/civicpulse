const express = require('express');
const router = express.Router();
const { db } = require('../services/firebase');
const { verifyToken } = require('../middleware/auth');
const { verifySkillDocument, detectBurnout } = require('../services/aiService');
const { COLLECTIONS } = require('../config/schema');

// POST /api/volunteers/verify-skill
router.post('/verify-skill', verifyToken, async (req, res) => {
    try {
        const { volunteerId, claimedSkill, documentText } = req.body;
        if (!volunteerId || !claimedSkill || !documentText) {
            return res.status(400).json({ error: 'volunteerId, claimedSkill, documentText are required' });
        }

        const result = await verifySkillDocument(documentText, claimedSkill);

        const volunteerRef = db.collection(COLLECTIONS.VOLUNTEERS).doc(volunteerId);
        if (result.verified) {
            const { FieldValue } = require('firebase-admin').firestore;
            await volunteerRef.update({ verifiedSkills: FieldValue.arrayUnion(claimedSkill) });
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

// GET /api/volunteers/list
router.get('/list', verifyToken, async (req, res) => {
    try {
        const snap = await db.collection(COLLECTIONS.VOLUNTEERS).get();
        res.json(snap.docs.map(d => d.data()));
    } catch (err) {
        res.status(500).json({ error: err.message, status: 500 });
    }
});

// GET /api/volunteers/burnout-risk
router.get('/burnout-risk', verifyToken, async (req, res) => {
    try {
        const snap = await db.collection(COLLECTIONS.VOLUNTEERS).where('burnoutFlag', '==', true).get();
        res.json(snap.docs.map(d => d.data()));
    } catch (err) {
        res.status(500).json({ error: err.message, status: 500 });
    }
});

// GET /api/volunteers/:id
router.get('/:id', verifyToken, async (req, res) => {
    try {
        const doc = await db.collection(COLLECTIONS.VOLUNTEERS).doc(req.params.id).get();
        if (!doc.exists) return res.status(404).json({ error: 'Volunteer not found' });
        res.json(doc.data());
    } catch (err) {
        res.status(500).json({ error: err.message, status: 500 });
    }
});

module.exports = router;