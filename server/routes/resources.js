const express = require('express');
const router = express.Router();
const { db } = require('../services/firebase');
const { verifyToken, requireRole } = require('../middleware/auth');
const { COLLECTIONS } = require('../config/schema');
const { v4: uuidv4 } = require('uuid');
const { FieldValue } = require('firebase-admin').firestore;

// GET /api/resources — coordinator auth
router.get('/', verifyToken, requireRole('coordinator'), async (req, res) => {
    try {
        const { orgId } = req.query;
        let query = db.collection(COLLECTIONS.RESOURCES);
        if (orgId) query = query.where('orgId', '==', orgId);
        const snap = await query.get();
        res.json(snap.docs.map(d => d.data()));
    } catch (err) {
        res.status(500).json({ error: err.message, status: 500 });
    }
});

// GET /api/resources/available — filter by category and quantity > 0
router.get('/available', verifyToken, async (req, res) => {
    try {
        const { category, orgId } = req.query;
        let query = db.collection(COLLECTIONS.RESOURCES).where('quantity', '>', 0);
        if (orgId) query = query.where('orgId', '==', orgId);
        const snap = await query.get();
        let resources = snap.docs.map(d => d.data());
        if (category) resources = resources.filter(r => r.category === category);
        res.json(resources);
    } catch (err) {
        res.status(500).json({ error: err.message, status: 500 });
    }
});

// POST /api/resources — coordinator auth
router.post('/', verifyToken, requireRole('coordinator'), async (req, res) => {
    try {
        const { name, category, quantity, location, orgId } = req.body;
        if (!name || !category || quantity == null || !orgId) {
            return res.status(400).json({ error: 'name, category, quantity, orgId are required' });
        }
        const id = uuidv4();
        const resource = { id, name, category, quantity, location: location || {}, orgId, deployedTo: [], createdAt: new Date() };
        await db.collection(COLLECTIONS.RESOURCES).doc(id).set(resource);
        res.status(201).json({ message: 'Resource created', resource });
    } catch (err) {
        res.status(500).json({ error: err.message, status: 500 });
    }
});

// PUT /api/resources/:id
router.put('/:id', verifyToken, requireRole('coordinator'), async (req, res) => {
    try {
        const { quantity, location } = req.body;
        const updates = { updatedAt: new Date() };
        if (quantity != null) updates.quantity = quantity;
        if (location) updates.location = location;
        await db.collection(COLLECTIONS.RESOURCES).doc(req.params.id).update(updates);
        res.json({ message: 'Resource updated' });
    } catch (err) {
        res.status(500).json({ error: err.message, status: 500 });
    }
});

// DELETE /api/resources/:id
router.delete('/:id', verifyToken, requireRole('coordinator'), async (req, res) => {
    try {
        await db.collection(COLLECTIONS.RESOURCES).doc(req.params.id).delete();
        res.json({ message: 'Resource deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message, status: 500 });
    }
});

// POST /api/resources/:id/deploy
router.post('/:id/deploy', verifyToken, requireRole('coordinator'), async (req, res) => {
    try {
        const { taskId, quantityDeployed } = req.body;
        if (!taskId || !quantityDeployed) return res.status(400).json({ error: 'taskId and quantityDeployed required' });

        const doc = await db.collection(COLLECTIONS.RESOURCES).doc(req.params.id).get();
        if (!doc.exists) return res.status(404).json({ error: 'Resource not found' });
        const resource = doc.data();

        if (resource.quantity < quantityDeployed) {
            return res.status(400).json({ error: `Only ${resource.quantity} units available, requested ${quantityDeployed}` });
        }

        await db.collection(COLLECTIONS.RESOURCES).doc(req.params.id).update({
            quantity: FieldValue.increment(-quantityDeployed),
            deployedTo: FieldValue.arrayUnion({ taskId, quantity: quantityDeployed, deployedAt: new Date().toISOString() }),
        });

        res.json({ message: 'Resource deployed', remainingQuantity: resource.quantity - quantityDeployed });
    } catch (err) {
        res.status(500).json({ error: err.message, status: 500 });
    }
});

module.exports = router;