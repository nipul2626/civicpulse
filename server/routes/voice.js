const express = require('express');
const router = express.Router();
const multer = require('multer');
const { transcribeAudio } = require('../services/gemini');
const authMiddleware = require('../middleware/auth');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// POST /api/voice/transcribe
router.post('/transcribe', authMiddleware, upload.single('audio'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No audio file provided. Send as multipart/form-data with field name "audio"' });
        }

        const audioBase64 = req.file.buffer.toString('base64');
        const mimeType = req.file.mimetype || 'audio/webm';

        const transcription = await transcribeAudio(audioBase64, mimeType);

        res.json({ transcription });
    } catch (error) {
        console.error('Voice transcription error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;