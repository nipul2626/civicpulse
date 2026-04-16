/**
 * Complete language detection and translation service.
 * Used by need submission, WhatsApp parsing, and voice transcription.
 */

require('dotenv').config();
const franc  = require('franc');

// ── Language code map ─────────────────────────────────────────────────────────
const LANG_MAP = {
    'hin': { name: 'Hindi',      script: 'Devanagari', region: 'India' },
    'mar': { name: 'Marathi',    script: 'Devanagari', region: 'India' },
    'ben': { name: 'Bengali',    script: 'Bengali',    region: 'India/Bangladesh' },
    'tam': { name: 'Tamil',      script: 'Tamil',      region: 'India' },
    'tel': { name: 'Telugu',     script: 'Telugu',     region: 'India' },
    'kan': { name: 'Kannada',    script: 'Kannada',    region: 'India' },
    'mal': { name: 'Malayalam',  script: 'Malayalam',  region: 'India' },
    'guj': { name: 'Gujarati',   script: 'Gujarati',   region: 'India' },
    'pan': { name: 'Punjabi',    script: 'Gurmukhi',   region: 'India/Pakistan' },
    'urd': { name: 'Urdu',       script: 'Arabic',     region: 'India/Pakistan' },
    'ori': { name: 'Odia',       script: 'Odia',       region: 'India' },
    'eng': { name: 'English',    script: 'Latin',      region: 'Global' },
};

// ── Detect language ───────────────────────────────────────────────────────────
function detectLanguage(text) {
    if (!text || text.trim().length < 5) {
        return { code: 'eng', name: 'English', confidence: 'low', isEnglish: true };
    }

    const minLength = parseInt(process.env.FRANC_MIN_LENGTH || '10');
    const detected = franc(text, { minLength });

    if (detected === 'und') {
        // Undetermined — check for Devanagari script manually
        const hasDevanagari = /[\u0900-\u097F]/.test(text);
        const hasArabic     = /[\u0600-\u06FF]/.test(text);
        const hasTamil      = /[\u0B80-\u0BFF]/.test(text);
        const hasTelugu     = /[\u0C00-\u0C7F]/.test(text);
        const hasBengali    = /[\u0980-\u09FF]/.test(text);

        if (hasDevanagari) return { code: 'hin', name: 'Hindi', confidence: 'medium', isEnglish: false };
        if (hasArabic)     return { code: 'urd', name: 'Urdu',  confidence: 'medium', isEnglish: false };
        if (hasTamil)      return { code: 'tam', name: 'Tamil', confidence: 'medium', isEnglish: false };
        if (hasTelugu)     return { code: 'tel', name: 'Telugu',confidence: 'medium', isEnglish: false };
        if (hasBengali)    return { code: 'ben', name: 'Bengali',confidence:'medium', isEnglish: false };

        return { code: 'eng', name: 'English', confidence: 'low', isEnglish: true };
    }

    const langInfo = LANG_MAP[detected];
    const isEnglish = detected === 'eng';

    return {
        code: detected,
        name: langInfo?.name || detected,
        script: langInfo?.script || 'Unknown',
        confidence: text.length > 30 ? 'high' : 'medium',
        isEnglish,
    };
}

// ── Get supported languages list ──────────────────────────────────────────────
function getSupportedLanguages() {
    return Object.entries(LANG_MAP).map(([code, info]) => ({
        code,
        ...info,
    }));
}

// ── Build multilingual AI prompt ──────────────────────────────────────────────
function buildMultilingualScoringPrompt(needData, langName) {
    return `
The following community need report is written in ${langName}.
This is from India — please be sensitive to local context.

Original text:
Title: ${needData.title || ''}
Description: ${needData.description || ''}

Your tasks:
1. Translate the title and description accurately to English
2. Score the need based on the translated content

Return ONLY this exact JSON (no other text, no markdown):
{
  "translatedTitle": "<accurate English translation of title>",
  "translatedDescription": "<accurate English translation of description>",
  "urgencyScore": <integer 1-5>,
  "category": "<one of: food, water, medical, shelter, education, livelihood, sanitation, other>",
  "affectedCount": <estimated integer>,
  "vulnerabilityFlag": <true or false>,
  "summary": "<one sentence summary in English>",
  "duplicateRisk": <true or false>
}`;
}

// ── Build WhatsApp help message ────────────────────────────────────────────────
function getWhatsAppHelpMessage(language = 'English') {
    const messages = {
        English: `🆘 *CivicPulse Help*\n\nTo report a need, send a message describing:\n1. What is the problem?\n2. Where is it happening?\n3. How many people are affected?\n\n*Example:* "Flood in Dharavi, 50 families need food and water"\n\nReply HELP anytime for this message.`,
        Hindi:   `🆘 *CivicPulse सहायता*\n\nज़रूरत रिपोर्ट करने के लिए बताएं:\n1. क्या समस्या है?\n2. कहाँ हो रही है?\n3. कितने लोग प्रभावित हैं?\n\n*उदाहरण:* "धारावी में बाढ़, 50 परिवारों को खाना और पानी चाहिए"\n\nकिसी भी समय HELP भेजें।`,
        Marathi: `🆘 *CivicPulse मदत*\n\nगरज नोंदवण्यासाठी सांगा:\n1. काय समस्या आहे?\n2. कुठे होत आहे?\n3. किती लोक प्रभावित आहेत?\n\n*उदाहरण:* "धारावीत पूर, 50 कुटुंबांना अन्न आणि पाणी हवे आहे"\n\nकधीही HELP पाठवा.`,
    };
    return messages[language] || messages.English;
}

module.exports = {
    detectLanguage,
    getSupportedLanguages,
    buildMultilingualScoringPrompt,
    getWhatsAppHelpMessage,

};
console.log(typeof franc);