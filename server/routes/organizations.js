const express = require('express');
const router = express.Router();
const { db } = require('../services/firebase');
const { verifyToken, requireRole } = require('../middleware/auth');
const { sendPushNotification } = require('../services/notificationService');
const { COLLECTIONS } = require('../config/schema');
const { v4: uuidv4 } = require('uuid');

// GET /api/organizations/:id
router.get('/:id', verifyToken, async (req, res) => {
    try {
        const doc = await db.collection(COLLECTIONS.ORGANIZATIONS).doc(req.params.id).get();
        if (!doc.exists) return res.status(404).json({ error: 'Organization not found' });

        // Stats
        const [needsSnap, volSnap] = await Promise.all([
            db.collection(COLLECTIONS.NEEDS).where('orgId', '==', req.params.id).get(),
            db.collection(COLLECTIONS.VOLUNTEERS).get(),
        ]);

        res.json({
            ...doc.data(),
            stats: {
                totalNeeds: needsSnap.size,
                resolvedNeeds: needsSnap.docs.filter(d => d.data().status === 'resolved').length,
            },
        });
    } catch (err) {
        res.status(500).json({ error: err.message, status: 500 });
    }
});

// GET /api/organizations/cross-ngo-map — all orgs as GeoJSON
router.get('/cross-ngo-map', verifyToken, async (req, res) => {
    try {
        const snap = await db.collection(COLLECTIONS.ORGANIZATIONS).get();
        const features = snap.docs.map(doc => {
            const org = doc.data();
            // Simplified bounding box from zone name array — placeholder coords
            // In production these would be real polygon coordinates
            return {
                type: 'Feature',
                properties: {
                    orgId: doc.id,
                    name: org.name,
                    zones: org.zones || [],
                    contactPerson: org.contactPerson,
                    subscriptionTier: org.subscriptionTier,
                },
                geometry: {
                    type: 'Point', // Replace with Polygon when real zone geodata is stored
                    coordinates: [72.8777, 19.0760], // Default Mumbai coords
                },
            };
        });

        res.json({ type: 'FeatureCollection', features });
    } catch (err) {
        res.status(500).json({ error: err.message, status: 500 });
    }
});

// POST /api/organizations/handoff-request
router.post('/handoff-request', verifyToken, requireRole('coordinator'), async (req, res) => {
    try {
        const { fromOrgId, toOrgId, needId, message } = req.body;
        if (!fromOrgId || !toOrgId || !needId) {
            return res.status(400).json({ error: 'fromOrgId, toOrgId, needId required' });
        }

        const id = uuidv4();
        const handoff = {
            id, fromOrgId, toOrgId, needId,
            message: message || '',
            status: 'pending',
            createdBy: req.user.uid,
            createdAt: new Date(),
        };

        await db.collection('handoffRequests').doc(id).set(handoff);

        // Notify target org coordinators
        const targetCoordSnap = await db.collection(COLLECTIONS.USERS)
            .where('orgId', '==', toOrgId)
            .where('role', '==', 'coordinator')
            .get();

        for (const coord of targetCoordSnap.docs) {
            await sendPushNotification(coord.id, {
                title: '📩 New Handoff Request',
                body: `Another NGO is requesting you to take over a need. ${message || ''}`,
                data: { handoffId: id, needId, type: 'handoff_request' },
            });
        }

        res.status(201).json({ message: 'Handoff request created', handoffId: id });
    } catch (err) {
        res.status(500).json({ error: err.message, status: 500 });
    }
});

// PATCH /api/organizations/handoff-request/:id
router.patch('/handoff-request/:id', verifyToken, requireRole('coordinator'), async (req, res) => {
    try {
        const { status } = req.body; // 'accepted' or 'declined'
        if (!['accepted', 'declined'].includes(status)) {
            return res.status(400).json({ error: 'status must be accepted or declined' });
        }

        await db.collection('handoffRequests').doc(req.params.id).update({ status, updatedAt: new Date() });
        res.json({ message: `Handoff ${status}`, handoffId: req.params.id });
    } catch (err) {
        res.status(500).json({ error: err.message, status: 500 });
    }
});

module.exports = router;