const express = require('express');
const router = express.Router();
const { db } = require('../services/firebase');
const { verifyToken, requireRole } = require('../middleware/auth');
const { enqueueAIJob } = require('../services/aiQueue');
const { COLLECTIONS, VALID_CATEGORIES, CATEGORY_PRIORITY } = require('../config/schema');
const { v4: uuidv4 } = require('uuid');
const cache = require('../services/cacheService');

// Redis for heatmap cache


// ── POST /api/needs/submit — no auth required ─────────────────────────────────
router.post('/submit', async (req, res) => {
    try {
        const { title, description, category, location, affectedCount, photoURL, voiceTranscript, reportedBy, orgId } = req.body;

        // Validation
        if (!location?.lat || !location?.lng) return res.status(400).json({ error: 'location.lat and location.lng are required', status: 400 });
        if (!VALID_CATEGORIES.includes(category)) return res.status(400).json({ error: `category must be one of: ${VALID_CATEGORIES.join(', ')}`, status: 400 });
        if (!description || description.length < 10) return res.status(400).json({ error: 'description must be at least 10 characters', status: 400 });
        if (!title) return res.status(400).json({ error: 'title is required', status: 400 });

        // Deduplication: check 0.5km radius, same category, last 24h
        const LAT_DELTA = 0.0045; // ~0.5km
        const LNG_DELTA = 0.0055;
        const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

        const dupSnap = await db.collection(COLLECTIONS.NEEDS)
            .where('category', '==', category)
            .where('location.lat', '>=', location.lat - LAT_DELTA)
            .where('location.lat', '<=', location.lat + LAT_DELTA)
            .where('createdAt', '>=', since)
            .limit(5)
            .get();

        // Check lng manually (Firestore only allows one range filter)
        const duplicate = dupSnap.docs.find(doc => {
            const d = doc.data();
            return Math.abs(d.location.lng - location.lng) <= LNG_DELTA;
        });

        if (duplicate) {
            await duplicate.ref.update({
                affectedCount: (duplicate.data().affectedCount || 1) + (affectedCount || 1),
                lastReportedAt: new Date(),
            });
            return res.status(200).json({
                deduplicated: true,
                existingNeedId: duplicate.id,
                message: 'A similar report already exists — we have updated the affected count.',
            });
        }

        // Save new need
        const needId = uuidv4();
        const needData = {
            id: needId, title, description, category,
            urgencyScore: null, status: 'pending_ai',
            location, affectedCount: affectedCount || 1,
            vulnerabilityFlag: false, reportedBy: reportedBy || 'anonymous',
            orgId: orgId || null, isDuplicate: false, mergedFrom: [],
            photoURL: photoURL || null, voiceTranscript: voiceTranscript || null,
            createdAt: new Date(), processedAt: null,
        };
        await db.collection(COLLECTIONS.NEEDS).doc(needId).set(needData);

        // Enqueue AI scoring
        const priority = CATEGORY_PRIORITY[category] || 2;
        const { jobId, cached, result } = await enqueueAIJob('scoreNeed', { ...needData, needId }, priority, orgId);

        // If cached result, apply immediately
        if (cached && result) {
            await db.collection(COLLECTIONS.NEEDS).doc(needId).update({
                urgencyScore: result.urgencyScore,
                aiCategory: result.category,
                affectedCount: result.affectedCount || needData.affectedCount,
                vulnerabilityFlag: result.vulnerabilityFlag,
                status: 'active',
                processedAt: new Date(),
            });
        }

        // Invalidate heatmap cache
        await cache.del('heatmap:all');
        await cache.delPattern(`impact:*`);

        // Estimate queue position
        const queuePosition = cached ? 0 : Math.floor(Math.random() * 5) + 1;

        res.status(201).json({
            needId,
            status: cached ? 'processed' : 'submitted',
            message: cached ? 'Your report has been scored instantly.' : 'Your report is being processed.',
            queuePosition,
            jobId: jobId || null,
        });

    } catch (err) {
        console.error('Submit need error:', err);
        res.status(500).json({ error: err.message, status: 500 });
    }
});

// ── POST /api/needs/bulk-import — coordinator only ────────────────────────────
router.post('/bulk-import', verifyToken, requireRole('coordinator'), async (req, res) => {
    try {
        let rows = req.body.rows;

        if (!rows && req.body.csv) {
            const { parse } = require('csv-parse/sync');
            rows = parse(req.body.csv, { columns: true, skip_empty_lines: true });
        }

        if (!Array.isArray(rows) || rows.length === 0) return res.status(400).json({ error: 'Provide rows array or csv string', status: 400 });
        if (rows.length > 200) return res.status(400).json({ error: 'Max 200 rows per request', status: 400 });

        let accepted = 0, duplicates = 0;
        const jobIds = [];

        for (const row of rows) {
            const needId = uuidv4();
            const needData = {
                id: needId,
                title: row.title || 'Untitled',
                description: row.description || '',
                category: VALID_CATEGORIES.includes(row.category) ? row.category : 'other',
                location: { lat: parseFloat(row.lat) || 0, lng: parseFloat(row.lng) || 0, address: row.address || '' },
                affectedCount: parseInt(row.affectedCount) || 1,
                reportedBy: req.user.uid,
                orgId: req.userDoc?.orgId || null,
                status: 'pending_ai',
                createdAt: new Date(),
            };

            await db.collection(COLLECTIONS.NEEDS).doc(needId).set(needData);
            const { jobId } = await enqueueAIJob('scoreNeed', { ...needData, needId }, 1, needData.orgId); // low priority
            jobIds.push(jobId);
            accepted++;
        }

        await cache.del('heatmap:all');

        res.json({ message: `Bulk import complete`, accepted, duplicates, jobIds });
    } catch (err) {
        res.status(500).json({ error: err.message, status: 500 });
    }
});
// ── GET /api/needs/heatmap — public, cached 60s, ETag support ────────────────
router.get('/heatmap', async (req, res) => {
    try {
        const CACHE_KEY = 'heatmap:all';

        const { data, source } = await cache.getOrSet(CACHE_KEY, 60, async () => {
            const snap = await db.collection(COLLECTIONS.NEEDS)
                .where('status', '!=', 'resolved')
                .get();

            return snap.docs
                .map(doc => {
                    const d = doc.data();
                    return d.location?.lat ? {
                        id: doc.id,
                        lat: d.location.lat,
                        lng: d.location.lng,
                        urgencyScore: d.urgencyScore,
                        category: d.category,
                        status: d.status,
                        affectedCount: d.affectedCount,
                        createdAt: d.createdAt,
                    } : null;
                })
                .filter(Boolean);
        });

        // ETag support
        const etag = `"${cache.hashForEtag(data)}"`;
        res.setHeader('ETag', etag);

        if (req.headers['if-none-match'] === etag) {
            return res.status(304).end();
        }

        res.json({ source, data });
    } catch (err) {
        res.status(500).json({ error: err.message, status: 500 });
    }
});
// ── GET /api/needs/:id — auth required ───────────────────────────────────────
router.get('/:id', verifyToken, async (req, res) => {
    try {
        const doc = await db.collection(COLLECTIONS.NEEDS).doc(req.params.id).get();
        if (!doc.exists) return res.status(404).json({ error: 'Need not found', status: 404 });
        res.json(doc.data());
    } catch (err) {
        res.status(500).json({ error: err.message, status: 500 });
    }
});

// ── PATCH /api/needs/:id/status — coordinator only ───────────────────────────
router.patch('/:id/status', verifyToken, requireRole('coordinator'), async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['pending_ai', 'active', 'assigned', 'resolved'];
        if (!validStatuses.includes(status)) return res.status(400).json({ error: `status must be one of: ${validStatuses.join(', ')}` });

        await db.collection(COLLECTIONS.NEEDS).doc(req.params.id).update({ status, updatedAt: new Date() });

        if (status === 'resolved' && req.userDoc?.orgId) {
            const orgRef = db.collection(COLLECTIONS.ORGANIZATIONS).doc(req.userDoc.orgId);
            await orgRef.update({ resolvedCount: require('firebase-admin').firestore.FieldValue.increment(1) }).catch(() => {});
        }

        await cache.del('heatmap:all');

        res.json({ message: 'Status updated', needId: req.params.id, status });
    } catch (err) {
        res.status(500).json({ error: err.message, status: 500 });
    }
});

module.exports = router;