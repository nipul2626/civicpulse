const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const Groq = require('groq-sdk');
const { getQueueStatus } = require('../services/aiQueue');
const { verifyToken } = require('../middleware/auth');

const upload = multer({ dest: '/tmp/', limits: { fileSize: 10 * 1024 * 1024 } });
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// GET /api/ai/queue-status
router.get('/queue-status', async (req, res) => {
    try {
        const status = await getQueueStatus();
        res.json(status);
    } catch (err) {
        res.status(500).json({ error: err.message, status: 500 });
    }
});

// POST /api/ai/transcribe — audio file → text
router.post('/transcribe', verifyToken, upload.single('audio'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No audio file. Send multipart/form-data with field "audio"' });

    try {
        const transcription = await groq.audio.transcriptions.create({
            file: fs.createReadStream(req.file.path),
            model: 'whisper-large-v3',
        });

        res.json({ transcript: transcription.text });
    } catch (err) {
        console.error('Transcription error:', err.message);
        res.json({ transcript: null, error: 'Transcription unavailable, please type your report' });
    } finally {
        // Always clean up temp file
        fs.unlink(req.file.path, () => {});
    }
});

module.exports = router;