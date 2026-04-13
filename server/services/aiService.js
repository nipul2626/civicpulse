require('dotenv').config();
const Groq = require('groq-sdk');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// ── Clients ──────────────────────────────────────────────────────────────────
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ── Core callAI with Groq → Gemini → Rule-based fallback ─────────────────────
async function callAI(prompt, options = {}) {
    // 1. Try Groq
    try {
        const completion = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [{ role: 'user', content: prompt }],
            max_tokens: options.maxTokens || 1000,
        });
        return {
            text: completion.choices[0].message.content,
            provider: 'groq',
            usedFallback: false,
        };
    } catch (groqErr) {
        const isRateLimit = groqErr.status === 429;
        const isServerError = groqErr.status >= 500;
        if (isRateLimit || isServerError) {
            console.warn(`Groq failed (${groqErr.status}), trying Gemini...`);
        } else {
            throw groqErr; // Don't fallback on bad requests
        }
    }

    // 2. Try Gemini
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const result = await model.generateContent(prompt);
        return {
            text: result.response.text(),
            provider: 'gemini',
            usedFallback: true,
        };
    } catch (geminiErr) {
        console.error('Gemini also failed:', geminiErr.message);
    }

    // 3. Rule-based fallback
    const fallback = options.ruleBasedPayload
        ? ruleBasedScore(options.ruleBasedPayload.text, options.ruleBasedPayload.category)
        : null;

    return {
        text: fallback ? JSON.stringify(fallback) : null,
        provider: 'rule-based',
        usedFallback: true,
    };
}

// ── Rule-based fallback scorer ────────────────────────────────────────────────
function ruleBasedScore(needText = '', category = 'other') {
    const text = needText.toLowerCase();
    const HIGH = ['medical', 'emergency', 'flood', 'fire', 'injury', 'death', 'child', 'infant', 'elderly', 'disabled', 'pregnant'];
    const MEDIUM = ['food', 'water', 'shelter', 'education', 'medicine', 'family'];

    let urgencyScore = 2;
    if (HIGH.some(k => text.includes(k))) urgencyScore = 4;
    else if (MEDIUM.some(k => text.includes(k))) urgencyScore = 3;

    return {
        urgencyScore,
        category,
        affectedCount: null,
        vulnerabilityFlag: HIGH.some(k => text.includes(k)),
        summary: 'Auto-scored by rule engine — needs human review',
        duplicateRisk: false,
        provisional: true,
    };
}

// ── Parse JSON from AI response safely ───────────────────────────────────────
async function parseAIJson(prompt, ruleBasedPayload = null) {
    let response = await callAI(prompt, { ruleBasedPayload });

    if (response.provider === 'rule-based') {
        return { data: JSON.parse(response.text), provider: 'rule-based' };
    }

    // Try parsing directly
    try {
        const cleaned = response.text.replace(/```json|```/g, '').trim();
        return { data: JSON.parse(cleaned), provider: response.provider };
    } catch {
        // Retry with explicit JSON instruction
        console.warn('JSON parse failed, retrying with explicit instruction...');
        const retryPrompt = 'Respond ONLY with valid JSON, no explanation, no markdown.\n\n' + prompt;
        const retry = await callAI(retryPrompt, { ruleBasedPayload });
        try {
            const cleaned = retry.text.replace(/```json|```/g, '').trim();
            return { data: JSON.parse(cleaned), provider: retry.provider };
        } catch {
            // Final fallback
            if (ruleBasedPayload) {
                return { data: ruleBasedScore(ruleBasedPayload.text, ruleBasedPayload.category), provider: 'rule-based' };
            }
            throw new Error('AI returned unparseable response after retry');
        }
    }
}

// ── Exported AI functions ─────────────────────────────────────────────────────

async function scoreNeed(needData) {
    const prompt = `
You are an AI assistant for a civic emergency platform. Analyze this need and return ONLY a valid JSON object.

Need:
- Title: ${needData.title}
- Description: ${needData.description}
- Category: ${needData.category}
- Location: ${needData.location?.address || needData.location || 'Unknown'}
- Affected count reported: ${needData.affectedCount || 'Unknown'}

Return this exact JSON:
{
  "urgencyScore": <1-5>,
  "category": "<one of: food, water, medical, shelter, education, livelihood, sanitation, other>",
  "affectedCount": <number>,
  "vulnerabilityFlag": <true/false>,
  "summary": "<one sentence>",
  "duplicateRisk": <true/false>
}`;

    return parseAIJson(prompt, {
        text: `${needData.title} ${needData.description}`,
        category: needData.category,
    });
}

async function scoreNeedBatch(needsArray) {
    const prompt = `
Score each of these community needs and return ONLY a JSON array of results in the same order.

Needs:
${needsArray.map((n, i) => `${i + 1}. Title: ${n.title} | Description: ${n.description} | Category: ${n.category}`).join('\n')}

Return a JSON array where each item has:
{ "urgencyScore": 1-5, "category": string, "affectedCount": number, "vulnerabilityFlag": boolean, "summary": string, "duplicateRisk": boolean }`;

    const response = await callAI(prompt);
    try {
        const cleaned = response.text.replace(/```json|```/g, '').trim();
        const results = JSON.parse(cleaned);
        return results.map(r => ({ data: r, provider: response.provider }));
    } catch {
        // Fall back to individual scoring
        return Promise.all(needsArray.map(n => scoreNeed(n)));
    }
}

async function generateVolunteerMatchReason(volunteer, need) {
    const prompt = `In one sentence of max 20 words, explain why this volunteer matches this need.
Volunteer skills: ${(volunteer.verifiedSkills || volunteer.skills || []).join(', ')}
Need category: ${need.category}, urgency: ${need.urgencyScore}, description: ${need.description}
Return only the sentence.`;

    const response = await callAI(prompt);
    return response.text.trim();
}

async function generateSitrep(tasksArray, startDate, endDate) {
    const prompt = `Write a formal 3-paragraph situation report for an NGO coordinator.
Period: ${startDate} to ${endDate}
Tasks completed: ${tasksArray.length}
Summary data: ${JSON.stringify(tasksArray.slice(0, 20))}

Paragraph 1: Needs overview. Paragraph 2: Volunteer deployment. Paragraph 3: Outcomes achieved.
Use formal NGO language. Return only the report text.`;

    const response = await callAI(prompt);
    return response.text.trim();
}

async function detectBurnout(volunteerStats) {
    const prompt = `Analyze these volunteer stats and return ONLY valid JSON.
Stats: ${JSON.stringify(volunteerStats)}
Return: { "burnoutRisk": boolean, "reason": "one sentence explanation" }`;

    const result = await parseAIJson(prompt);
    return result.data;
}

async function verifySkillDocument(ocrText, claimedSkill) {
    const prompt = `Analyze this document text and determine if it proves the claimed skill.
Claimed skill: ${claimedSkill}
Document text: ${ocrText}
Return ONLY: { "verified": boolean, "confidence": "high|medium|low", "extractedCredential": "credential name or null" }`;

    const result = await parseAIJson(prompt);
    return result.data;
}

// Legacy function name support (your existing code may call this)
async function transcribeAudio(audioBase64, mimeType = 'audio/webm') {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent([
        { inlineData: { mimeType, data: audioBase64 } },
        'Transcribe this audio accurately. Return only the transcribed text.',
    ]);
    return result.response.text().trim();
}
// ── Language detection + multilingual scoring ─────────────────────────────────
async function scoreNeedMultilingual(needData) {
    // franc is CommonJS compatible at v3
    const { franc } = require('franc');

    const textToCheck = `${needData.title || ''} ${needData.description || ''}`.trim();
    const detectedLang = franc(textToCheck, { minLength: 10 });

    // franc returns 'und' if undetermined, or ISO 639-3 codes
    // English codes: 'eng'. If English or undetermined, use standard scoring.
    const NON_ENGLISH_LANGS = {
        'hin': 'Hindi',
        'mar': 'Marathi',
        'ben': 'Bengali',
        'tam': 'Tamil',
        'tel': 'Telugu',
        'kan': 'Kannada',
        'mal': 'Malayalam',
        'guj': 'Gujarati',
        'pan': 'Punjabi',
        'urd': 'Urdu',
        'ori': 'Odia',
    };

    const langName = NON_ENGLISH_LANGS[detectedLang];

    // If English or unknown language, use standard scoring
    if (!langName) {
        const result = await scoreNeed(needData);
        return {
            ...result,
            detectedLanguage: detectedLang === 'eng' ? 'English' : 'Unknown',
            originalText: null,
            translatedText: null,
        };
    }

    // Non-English: translate + score in one prompt (saves one API call)
    console.log(`🌐 Detected language: ${langName} — using multilingual scoring`);

    const prompt = `
The following community need report is written in ${langName}.

Original text:
Title: ${needData.title}
Description: ${needData.description}

Your tasks:
1. Translate the title and description to English accurately
2. Score the need based on the translated content

Return ONLY a valid JSON object with this exact structure:
{
  "translatedTitle": "<English translation of title>",
  "translatedDescription": "<English translation of description>",
  "urgencyScore": <1-5>,
  "category": "<one of: food, water, medical, shelter, education, livelihood, sanitation, other>",
  "affectedCount": <estimated number>,
  "vulnerabilityFlag": <true or false>,
  "summary": "<one sentence in English>",
  "duplicateRisk": <true or false>
}`;

    const result = await parseAIJson(prompt, {
        text: textToCheck,
        category: needData.category || 'other',
    });

    return {
        data: result.data,
        provider: result.provider,
        detectedLanguage: langName,
        originalText: `${needData.title} — ${needData.description}`,
        translatedText: `${result.data.translatedTitle} — ${result.data.translatedDescription}`,
    };
}
module.exports = {
    callAI,
    scoreNeed,
    scoreNeedBatch,
    generateVolunteerMatchReason,
    generateSitrep,
    detectBurnout,
    verifySkillDocument,
    transcribeAudio,
    scoreNeedMultilingual,
};