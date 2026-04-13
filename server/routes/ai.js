const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const Groq = require('groq-sdk');
const { getQueueStatus } = require('../services/aiQueue');
const { verifyToken } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

const upload = multer({
    storage: multer.diskStorage({
        destination: '/tmp/',
        filename: (req, file, cb) => {
            // ✅ Always generate safe filename
            const ext =
                file.mimetype === 'audio/mpeg' ? '.mp3' :
                    file.mimetype === 'audio/wav' ? '.wav' :
                        file.mimetype === 'audio/mp4' ? '.mp4' :
                            file.mimetype === 'audio/ogg' ? '.ogg' :
                                '.webm';

            cb(null, `${uuidv4()}${ext}`);
        },
    }),

    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
    },

    fileFilter: (req, file, cb) => {
        // ✅ Strict audio validation
        const allowed = [
            'audio/webm',
            'audio/mpeg',
            'audio/wav',
            'audio/mp4',
            'audio/ogg',
        ];

        if (allowed.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only audio files are allowed'), false);
        }
    },
});
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