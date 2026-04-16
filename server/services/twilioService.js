require('dotenv').config();
const twilio = require('twilio');

// ── Client init ───────────────────────────────────────────────────────────────
let twilioClient = null;

function getClient() {
    if (!twilioClient) {
        if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
            console.warn('⚠️  Twilio not configured — SMS/WhatsApp disabled');
            return null;
        }
        twilioClient = twilio(
            process.env.TWILIO_ACCOUNT_SID,
            process.env.TWILIO_AUTH_TOKEN
        );
    }
    return twilioClient;
}

// ── Send SMS ──────────────────────────────────────────────────────────────────
async function sendSMS(to, message) {
    const client = getClient();
    if (!client) return { sent: false, reason: 'Twilio not configured' };

    try {
        const result = await client.messages.create({
            body: message,
            from: process.env.TWILIO_PHONE_NUMBER,
            to,
        });
        console.log(`📱 SMS sent to ${to}: ${result.sid}`);
        return { sent: true, sid: result.sid };
    } catch (err) {
        console.error(`SMS failed to ${to}:`, err.message);
        return { sent: false, error: err.message };
    }
}

// ── Send WhatsApp ─────────────────────────────────────────────────────────────
async function sendWhatsApp(to, message) {
    const client = getClient();
    if (!client) return { sent: false, reason: 'Twilio not configured' };

    // Ensure proper WhatsApp format
    const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886';
    const toNumber = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;

    try {
        const result = await client.messages.create({
            body: message,
            from: fromNumber,
            to: toNumber,
        });
        console.log(`💬 WhatsApp sent to ${to}: ${result.sid}`);
        return { sent: true, sid: result.sid };
    } catch (err) {
        console.error(`WhatsApp failed to ${to}:`, err.message);
        return { sent: false, error: err.message };
    }
}

// ── Need submission acknowledgment templates ──────────────────────────────────
function getNeedAcknowledgmentMessage(needId, language = 'English') {
    const messages = {
        English:   `✅ Your report has been received (ID: ${needId.substring(0, 8)}). We are processing it and will send updates. Reply STOP to unsubscribe.`,
        Hindi:     `✅ आपकी रिपोर्ट प्राप्त हो गई है (ID: ${needId.substring(0, 8)})। हम इसे प्रोसेस कर रहे हैं और अपडेट भेजेंगे।`,
        Marathi:   `✅ तुमची तक्रार मिळाली आहे (ID: ${needId.substring(0, 8)})। आम्ही ती प्रक्रिया करत आहोत आणि अपडेट पाठवू.`,
        Bengali:   `✅ আপনার রিপোর্ট পাওয়া গেছে (ID: ${needId.substring(0, 8)})। আমরা এটি প্রক্রিয়া করছি।`,
        Tamil:     `✅ உங்கள் அறிக்கை பெறப்பட்டது (ID: ${needId.substring(0, 8)})। நாங்கள் அதை செயலாக்குகிறோம்.`,
        Telugu:    `✅ మీ నివేదిక స్వీకరించబడింది (ID: ${needId.substring(0, 8)})। మేము దాన్ని ప్రాసెస్ చేస్తున్నాము.`,
        Gujarati:  `✅ તમારો અહેવાલ પ્રાપ્ત થયો (ID: ${needId.substring(0, 8)})। અમે તેની પ્રક્રિયા કરી રહ્યા છીએ.`,
    };
    return messages[language] || messages.English;
}

function getNeedAssignedMessage(needId, language = 'English') {
    const messages = {
        English: `🙌 Good news! A volunteer has been assigned to your report (ID: ${needId.substring(0, 8)}). Help is on the way.`,
        Hindi:   `🙌 अच्छी खबर! आपकी रिपोर्ट के लिए एक स्वयंसेवक नियुक्त किया गया है। मदद आ रही है।`,
        Marathi: `🙌 आनंदाची बातमी! तुमच्या तक्रारीसाठी एक स्वयंसेवक नियुक्त झाला आहे. मदत येत आहे.`,
    };
    return messages[language] || messages.English;
}

function getNeedResolvedMessage(needId, language = 'English') {
    const messages = {
        English: `✅ Your report (ID: ${needId.substring(0, 8)}) has been resolved. Thank you for reaching out to us.`,
        Hindi:   `✅ आपकी रिपोर्ट हल हो गई है। हम तक पहुंचने के लिए धन्यवाद।`,
        Marathi: `✅ तुमची तक्रार सोडवली गेली आहे. आमच्याशी संपर्क केल्याबद्दल धन्यवाद.`,
    };
    return messages[language] || messages.English;
}

// ── Notify submitter on status change ─────────────────────────────────────────
async function notifySubmitterByPhone(phone, needId, status, language = 'English', channel = 'sms') {
    let message;
    if (status === 'assigned') message = getNeedAssignedMessage(needId, language);
    else if (status === 'resolved') message = getNeedResolvedMessage(needId, language);
    else return { sent: false, reason: 'No notification for this status' };

    if (channel === 'whatsapp') {
        return sendWhatsApp(phone, message);
    }
    return sendSMS(phone, message);
}

// ── Parse incoming WhatsApp/SMS message into a structured need ────────────────
function parseIncomingMessage(body, from, language = 'English') {
    // Try to extract structured info from free-form text
    // Example: "Flood in Dharavi, 50 families need food and water urgently"

    const CATEGORY_PATTERNS = {
        food:       /food|hungry|meal|eat|rice|khana|roti|dal|chawal|भोजन|खाना/i,
        water:      /water|paani|pani|पानी|drinking|contaminated/i,
        medical:    /doctor|hospital|medicine|sick|injury|medical|दवा|अस्पताल|डॉक्टर/i,
        shelter:    /shelter|house|home|roof|homeless|ghar|घर/i,
        education:  /school|student|books|teacher|padhai|पढ़ाई/i,
        livelihood: /job|work|income|business|kaam|काम/i,
        sanitation: /toilet|garbage|sewage|drain|सफाई/i,
    };

    let detectedCategory = 'other';
    for (const [cat, pattern] of Object.entries(CATEGORY_PATTERNS)) {
        if (pattern.test(body)) {
            detectedCategory = cat;
            break;
        }
    }

    // Try to extract location from message
    // Simple approach — look for "in <place>" or "at <place>"
    const locationMatch = body.match(/(?:in|at|near|से|में|at)\s+([A-Za-z\u0900-\u097F\s]{3,30})/i);
    const locationHint = locationMatch ? locationMatch[1].trim() : null;

    return {
        rawMessage: body,
        fromPhone: from,
        detectedCategory,
        locationHint,
        language,
        submittedVia: 'whatsapp',
        needsAIProcessing: true,
    };
}

module.exports = {
    sendSMS,
    sendWhatsApp,
    notifySubmitterByPhone,
    parseIncomingMessage,
    getNeedAcknowledgmentMessage,
};