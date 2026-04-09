const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');
const { scoreNeed } = require('../services/gemini');
const { findDuplicate, mergeDuplicate } = require('../services/dedup');
const authMiddleware = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');
const { parse } = require('csv-parse/sync');

// Redis setup (optional - graceful fallback if Redis not running)
let redisClient = null;
try {
    const { createClient } = require('redis');
    redisClient = createClient({ url: process.env.REDIS_URL });
    redisClient.connect().catch(() => {
        console.log('Redis not available, caching disabled');
        redisClient = null;
    });
} catch (e) {
    console.log('Redis not installed, skipping');
}

// ─── POST /api/needs/submit ────────────────────────────────────────────────
router.post('/submit', authMiddleware, async (req, res) => {
    try {
        const { title, description, category, location, lat, lng } = req.body;

        // Validate required fields
        if (!title || !description || !category || !location) {
            return res.status(400).json({ error: 'title, description, category, location are required' });
        }

        const needData = {
            title,
            description,
            category,
            location,
            lat: lat || null,
            lng: lng || null,
            reportedBy: req.user.uid,
            reportCount: 1,
            createdAt: new Date(),
            lastReportedAt: new Date(),
            status: 'pending',
        };

        // Deduplication check
        const duplicate = await findDuplicate(location, category);
        if (duplicate) {
            const aiScore = await scoreNeed(needData);
            needData.urgencyScore = aiScore.urgencyScore;
            const mergedId = await mergeDuplicate(duplicate, needData);
            return res.status(200).json({
                message: 'Duplicate found and merged',
                needId: mergedId,
                aiScore,
                merged: true,
            });
        }

        // AI Scoring
        const aiScore = await scoreNeed(needData);
        needData.urgencyScore = aiScore.urgencyScore;
        needData.aiCategory = aiScore.category;
        needData.affectedCount = aiScore.affectedCount;
        needData.vulnerabilityFlag = aiScore.vulnerabilityFlag;
        needData.aiReasoning = aiScore.reasoning;

        // Save to Firestore
        const docRef = db.collection('needs').doc(uuidv4());
        await docRef.set(needData);

        // Invalidate heatmap cache
        if (redisClient) {
            await redisClient.del('heatmap_cache').catch(() => {});
        }

        res.status(201).json({
            message: 'Need submitted successfully',
            needId: docRef.id,
            aiScore,
            merged: false,
        });

    } catch (error) {
        console.error('Submit need error:', error);
        res.status(500).json({ error: error.message });
    }
});

// ─── GET /api/needs/heatmap ────────────────────────────────────────────────
router.get('/heatmap', async (req, res) => {
    try {
        // Try Redis cache first
        if (redisClient) {
            const cached = await redisClient.get('heatmap_cache').catch(() => null);
            if (cached) {
                return res.json({ source: 'cache', data: JSON.parse(cached) });
            }
        }

        const snapshot = await db.collection('needs')
            .where('lat', '!=', null)
            .get();

        const heatmapData = snapshot.docs.map(doc => {
            const d = doc.data();
            return {
                id: doc.id,
                lat: d.lat,
                lng: d.lng,
                urgencyScore: d.urgencyScore,
                category: d.category,
                title: d.title,
                affectedCount: d.affectedCount,
                vulnerabilityFlag: d.vulnerabilityFlag,
            };
        });

        // Cache for 60 seconds
        if (redisClient) {
            await redisClient.setEx('heatmap_cache', 60, JSON.stringify(heatmapData)).catch(() => {});
        }

        res.json({ source: 'firestore', data: heatmapData });

    } catch (error) {
        console.error('Heatmap error:', error);
        res.status(500).json({ error: error.message });
    }
});

// ─── POST /api/needs/bulk ──────────────────────────────────────────────────
router.post('/bulk', authMiddleware, async (req, res) => {
    try {
        // Accepts either pre-parsed rows array OR raw CSV string
        let rows = req.body.rows;

        if (!rows && req.body.csv) {
            rows = parse(req.body.csv, {
                columns: true,
                skip_empty_lines: true,
            });
        }

        if (!rows || !Array.isArray(rows)) {
            return res.status(400).json({ error: 'Provide rows array or csv string' });
        }

        const results = [];

        for (const row of rows) {
            try {
                const needData = {
                    title: row.title || 'Untitled',
                    description: row.description || '',
                    category: row.category || 'general',
                    location: row.location || '',
                    lat: parseFloat(row.lat) || null,
                    lng: parseFloat(row.lng) || null,
                    reportedBy: req.user.uid,
                    reportCount: 1,
                    createdAt: new Date(),
                    lastReportedAt: new Date(),
                    status: 'pending',
                };

                const aiScore = await scoreNeed(needData);
                needData.urgencyScore = aiScore.urgencyScore;
                needData.aiCategory = aiScore.category;
                needData.affectedCount = aiScore.affectedCount;
                needData.vulnerabilityFlag = aiScore.vulnerabilityFlag;
                needData.aiReasoning = aiScore.reasoning;

                const docRef = db.collection('needs').doc(uuidv4());
                await docRef.set(needData);

                results.push({ id: docRef.id, title: needData.title, urgencyScore: aiScore.urgencyScore, success: true });
            } catch (rowErr) {
                results.push({ title: row.title, success: false, error: rowErr.message });
            }
        }

        res.json({ message: `Processed ${rows.length} rows`, results });

    } catch (error) {
        console.error('Bulk import error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;