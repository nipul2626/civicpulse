const express = require('express');
const router = express.Router();
const twilio = require('twilio');
const { db } = require('../services/firebase');
const { v4: uuidv4 } = require('uuid');
const { COLLECTIONS, VALID_CATEGORIES, CATEGORY_PRIORITY } = require('../config/schema');
const { parseIncomingMessage, sendWhatsApp, sendSMS, getNeedAcknowledgmentMessage } = require('../services/twilioService');
const { detectLanguage, getWhatsAppHelpMessage } = require('../services/languageService');
const { enqueueAIJob } = require('../services/aiQueue');
const { broadcast } = require('../services/sseService');
const sanitizeHtml = require('sanitize-html');

// ── Twilio webhook signature validator ────────────────────────────────────────
function validateTwilioSignature(req) {
    if (process.env.NODE_ENV !== 'production') return true; // skip in dev

    const authToken = process.env.TWILIO_AUTH_TOKEN;
    if (!authToken) return true; // skip if not configured

    const signature = req.headers['x-twilio-signature'];
    const url = `${req.protocol}://${req.get('host')}${req.originalUrl}`;

    return twilio.validateRequest(authToken, signature, url, req.body);
}

/**
 * POST /api/whatsapp/incoming
 *
 * Twilio calls this URL when someone messages your WhatsApp number.
 * Set this URL in Twilio Console:
 *   Messaging → Settings → WhatsApp Sandbox Settings → When a message comes in:
 *   https://civicpulse-backend-klzk.onrender.com/api/whatsapp/incoming
 *
 * Also works for SMS — set as the SMS webhook too.
 */
router.post('/incoming', express.urlencoded({ extended: false }), async (req, res) => {
    // Validate the request is genuinely from Twilio
    if (!validateTwilioSignature(req)) {
        return res.status(403).send('Forbidden');
    }

    const { Body, From, To } = req.body;

    if (!Body || !From) {
        return res.status(400).send('Missing Body or From');
    }

    const isWhatsApp = From.startsWith('whatsapp:');
    const phoneNumber = From.replace('whatsapp:', '');
    const channel = isWhatsApp ? 'whatsapp' : 'sms';

    console.log(`📨 Incoming ${channel} from ${phoneNumber}: "${Body.substring(0, 50)}..."`);

    // ── Handle special commands ────────────────────────────────────────────────
    const command = Body.trim().toUpperCase();

    if (command === 'HELP' || command === 'HELP ME' || command === 'मदद' || command === 'मदत') {
        const langResult = detectLanguage(Body);
        const helpMsg = getWhatsAppHelpMessage(langResult.name);

        if (isWhatsApp) await sendWhatsApp(From, helpMsg);
        else await sendSMS(phoneNumber, helpMsg);

        // Twilio expects TwiML response
        res.set('Content-Type', 'text/xml');
        return res.send('<Response></Response>');
    }

    if (command === 'STOP' || command === 'UNSUBSCRIBE') {
        // Twilio handles STOP automatically — just acknowledge
        res.set('Content-Type', 'text/xml');
        return res.send('<Response></Response>');
    }

    // ── Process as need submission ─────────────────────────────────────────────
    try {
        // Detect language
        const langResult = detectLanguage(Body);
        console.log(`🌐 Detected language: ${langResult.name} (${langResult.code})`);

        // Sanitize input
        const cleanBody = sanitizeHtml(Body, { allowedTags: [], allowedAttributes: {} }).trim();

        // Parse the message into structured data
        const parsed = parseIncomingMessage(cleanBody, phoneNumber, langResult.name);

        // Build need data
        const needId = uuidv4();
        const needData = {
            id: needId,
            title: cleanBody.substring(0, 100), // first 100 chars as title
            description: cleanBody,
            category: parsed.detectedCategory || 'other',
            urgencyScore: null,
            status: 'pending_ai',
            location: {
                lat: null,
                lng: null,
                address: parsed.locationHint || 'Unknown — submitted via WhatsApp',
            },
            affectedCount: 1,
            vulnerabilityFlag: false,
            reportedBy: `${channel}:${phoneNumber}`,
            submitterPhone: phoneNumber,
            submitterChannel: channel,
            orgId: null, // no org for community submissions
            isDuplicate: false,
            mergedFrom: [],
            photoURL: null,
            voiceTranscript: null,
            originalText: langResult.isEnglish ? null : cleanBody,
            detectedLanguage: langResult.name,
            useMultilingual: !langResult.isEnglish,
            submittedVia: channel,
            createdAt: new Date(),
            processedAt: null,
        };

        // Save to Firestore
        await db.collection(COLLECTIONS.NEEDS).doc(needId).set(needData);

        // Enqueue AI scoring
        const priority = CATEGORY_PRIORITY[parsed.detectedCategory] || 2;
        await enqueueAIJob('scoreNeed', { ...needData, needId }, priority, null);

        // Broadcast to SSE clients (heatmap update)
        broadcast('heatmap', 'heatmap:new-need', {
            id: needId,
            category: parsed.detectedCategory,
            status: 'pending_ai',
            submittedVia: channel,
        });

        // Send acknowledgment in the submitter's language
        const ackMessage = getNeedAcknowledgmentMessage(needId, langResult.name);
        if (isWhatsApp) {
            await sendWhatsApp(From, ackMessage);
        } else {
            await sendSMS(phoneNumber, ackMessage);
        }

        console.log(`✅ Need ${needId} created from ${channel} submission`);

        // Twilio expects TwiML — empty response means we handled it ourselves
        res.set('Content-Type', 'text/xml');
        res.send('<Response></Response>');

    } catch (err) {
        console.error('WhatsApp webhook error:', err.message);

        // Still send acknowledgment even on error
        const errorMsg = 'We received your message but had a technical issue. Please try again or call our helpline.';
        try {
            if (isWhatsApp) await sendWhatsApp(From, errorMsg);
            else await sendSMS(phoneNumber, errorMsg);
        } catch {}

        res.set('Content-Type', 'text/xml');
        res.send('<Response></Response>');
    }
});

/**
 * GET /api/whatsapp/status
 * Returns WhatsApp/SMS service status — useful for monitoring.
 */
router.get('/status', (req, res) => {
    const configured = !!(
        process.env.TWILIO_ACCOUNT_SID &&
        process.env.TWILIO_AUTH_TOKEN &&
        process.env.TWILIO_PHONE_NUMBER
    );

    res.json({
        success: true,
        data: {
            configured,
            smsEnabled: configured && !!process.env.TWILIO_PHONE_NUMBER,
            whatsappEnabled: configured && !!process.env.TWILIO_WHATSAPP_NUMBER,
            webhookUrl: `https://civicpulse-backend-klzk.onrender.com/api/whatsapp/incoming`,
            sandboxInstructions: !configured ? 'Add TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER to .env' : null,
        },
    });
});

module.exports = router;