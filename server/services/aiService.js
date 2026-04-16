require('dotenv').config();
const Groq = require('groq-sdk');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { tryRuleBasedScoring } = require('./aiPreprocessor');
const { callOllama, shouldUseOllama } = require('./ollamaService');
const aiMetrics = require('./aiMetrics');

// ── API Clients ───────────────────────────────────────────────────────────────
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ── Layer 5: Rule-based final fallback ────────────────────────────────────────
function ruleBasedFallback(needText = '', category = 'other') {
    const text = needText.toLowerCase();
    const HIGH   = ['medical', 'emergency', 'flood', 'fire', 'injury', 'death', 'child', 'infant', 'elderly', 'disabled', 'pregnant'];
    const MEDIUM = ['food', 'water', 'shelter', 'education', 'medicine', 'family'];

    let urgencyScore = 2;
    if (HIGH.some(k => text.includes(k)))   urgencyScore = 4;
    else if (MEDIUM.some(k => text.includes(k))) urgencyScore = 3;

    aiMetrics.record('rule-based-layer5');
    return {
        urgencyScore,
        category,
        affectedCount: null,
        vulnerabilityFlag: HIGH.some(k => text.includes(k)),
        summary: 'Auto-scored by fallback rules — needs coordinator review',
        duplicateRisk: false,
        provisional: true,
        provider: 'rule-based-layer5',
    };
}

// ── Layer 3+4: Groq with Gemini fallback ──────────────────────────────────────
async function callGroqWithGeminiFallback(prompt, options = {}) {
    // Try Groq first
    try {
        const completion = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [{ role: 'user', content: prompt }],
            max_tokens: options.maxTokens || 1000,
        });
        aiMetrics.record('groq');
        return {
            text: completion.choices[0].message.content,
            provider: 'groq',
            usedFallback: false,
        };
    } catch (groqErr) {
        const isRateLimit   = groqErr.status === 429;
        const isServerError = groqErr.status >= 500;

        if (isRateLimit || isServerError) {
            aiMetrics.record('groq', 'error');
            console.warn(`⚠️  Groq failed (${groqErr.status}), trying Gemini...`);
        } else {
            aiMetrics.record('groq', 'error');
            throw groqErr; // Bad request — don't fallback, surface the error
        }
    }

    // Layer 4: Gemini fallback
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
        const result = await model.generateContent(prompt);
        aiMetrics.record('gemini');
        return {
            text: result.response.text(),
            provider: 'gemini',
            usedFallback: true,
        };
    } catch (geminiErr) {
        aiMetrics.record('gemini', 'error');
        console.error('❌ Gemini also failed:', geminiErr.message);
        throw geminiErr;
    }
}

// ── Core smart router — the main function everything calls ────────────────────
async function callAI(prompt, options = {}) {
    // Layer 2: Ollama (self-hosted) — only if OLLAMA_URL is set and server is healthy
    if (await shouldUseOllama()) {
        try {
            const result = await callOllama(prompt, options);
            aiMetrics.record('ollama');
            return result;
        } catch (ollamaErr) {
            console.warn('⚠️  Ollama failed, falling through to APIs:', ollamaErr.message);
        }
    }

    // Layer 3 + 4: Groq → Gemini
    return callGroqWithGeminiFallback(prompt, options);
}

// ── JSON parser with retry ────────────────────────────────────────────────────
async function parseAIJson(prompt, ruleBasedPayload = null) {
    let response;
    try {
        response = await callAI(prompt);
    } catch (err) {
        // All AI layers failed — use rule-based fallback
        if (ruleBasedPayload) {
            return {
                data: ruleBasedFallback(ruleBasedPayload.text, ruleBasedPayload.category),
                provider: 'rule-based-layer5',
            };
        }
        throw err;
    }

    // Try parsing directly
    try {
        const cleaned = response.text.replace(/```json|```/g, '').trim();
        return { data: JSON.parse(cleaned), provider: response.provider };
    } catch {
        // JSON parse failed — retry with explicit instruction
        console.warn('⚠️  JSON parse failed, retrying with explicit JSON instruction...');
        const retryPrompt = 'Respond ONLY with valid JSON. No explanation, no markdown, no extra text.\n\n' + prompt;

        try {
            const retry = await callAI(retryPrompt);
            const cleaned = retry.text.replace(/```json|```/g, '').trim();
            return { data: JSON.parse(cleaned), provider: retry.provider };
        } catch {
            // Retry also failed — rule-based last resort
            if (ruleBasedPayload) {
                return {
                    data: ruleBasedFallback(ruleBasedPayload.text, ruleBasedPayload.category),
                    provider: 'rule-based-layer5',
                };
            }
            throw new Error('AI returned unparseable response after retry');
        }
    }
}

// ── Exported AI functions ─────────────────────────────────────────────────────

async function scoreNeed(needData) {
    // Layer 0: Try rule-based preprocessing first (free, instant)
    const ruleResult = tryRuleBasedScoring(needData);
    if (ruleResult) {
        aiMetrics.record('rule-based-layer0');
        return { data: ruleResult, provider: 'rule-based-layer0' };
    }

    // Layer 1: Semantic cache is handled by aiQueue.js before calling scoreNeed
    // If we're here, cache missed — call AI

    const prompt = `
You are an AI assistant for a civic emergency platform in India.
Analyze this community need report and return ONLY a valid JSON object.

Need:
- Title: ${needData.title}
- Description: ${needData.description}
- Category submitted: ${needData.category}
- Location: ${needData.location?.address || needData.location || 'Unknown'}
- Reported affected count: ${needData.affectedCount || 'Unknown'}

Return this exact JSON (no other text):
{
  "urgencyScore": <integer 1-5>,
  "category": "<one of: food, water, medical, shelter, education, livelihood, sanitation, other>",
  "affectedCount": <integer estimate>,
  "vulnerabilityFlag": <true or false>,
  "summary": "<one sentence in English>",
  "duplicateRisk": <true or false>
}`;

    return parseAIJson(prompt, {
        text: `${needData.title} ${needData.description}`,
        category: needData.category,
    });
}

async function scoreNeedBatch(needsArray) {
    // For each need in batch, first try Layer 0
    const results = [];
    const needsForAI = [];
    const aiIndexMap = []; // tracks which original index each AI need belongs to

    for (let i = 0; i < needsArray.length; i++) {
        const ruleResult = tryRuleBasedScoring(needsArray[i]);
        if (ruleResult) {
            aiMetrics.record('rule-based-layer0');
            results[i] = { data: ruleResult, provider: 'rule-based-layer0' };
        } else {
            needsForAI.push(needsArray[i]);
            aiIndexMap.push(i);
        }
    }

    // Batch score only the ones that need AI
    if (needsForAI.length === 0) {
        return results;
    }

    const prompt = `
Score each of these community needs from India and return ONLY a JSON array in the same order.

Needs:
${needsForAI.map((n, i) => `${i + 1}. Title: ${n.title} | Description: ${n.description} | Category: ${n.category}`).join('\n')}

Return a JSON array where each item has:
{ "urgencyScore": 1-5, "category": string, "affectedCount": number, "vulnerabilityFlag": boolean, "summary": string, "duplicateRisk": boolean }`;

    try {
        const response = await callAI(prompt);
        const cleaned = response.text.replace(/```json|```/g, '').trim();
        const aiResults = JSON.parse(cleaned);

        // Map AI results back to original indexes
        aiResults.forEach((r, aiIdx) => {
            const originalIdx = aiIndexMap[aiIdx];
            results[originalIdx] = { data: r, provider: response.provider };
        });
    } catch {
        // Batch failed — fall back to individual scoring
        console.warn('⚠️  Batch scoring failed, falling back to individual...');
        for (let i = 0; i < needsForAI.length; i++) {
            const originalIdx = aiIndexMap[i];
            results[originalIdx] = await scoreNeed(needsForAI[i]);
        }
    }

    return results;
}

async function scoreNeedMultilingual(needData) {
    const franc = require('franc');

    const textToCheck = `${needData.title || ''} ${needData.description || ''}`.trim();
    const detectedLang = franc(textToCheck, { minLength: 10 });

    const NON_ENGLISH_LANGS = {
        'hin': 'Hindi',   'mar': 'Marathi', 'ben': 'Bengali',
        'tam': 'Tamil',   'tel': 'Telugu',  'kan': 'Kannada',
        'mal': 'Malayalam', 'guj': 'Gujarati', 'pan': 'Punjabi',
        'urd': 'Urdu',    'ori': 'Odia',
    };

    const langName = NON_ENGLISH_LANGS[detectedLang];

    if (!langName) {
        const result = await scoreNeed(needData);
        return {
            ...result,
            detectedLanguage: detectedLang === 'eng' ? 'English' : 'Unknown',
            originalText: null,
            translatedText: null,
        };
    }

    console.log(`🌐 Detected language: ${langName}`);

    // Layer 0 still applies even for non-English — keywords work across languages
    const ruleResult = tryRuleBasedScoring(needData);
    if (ruleResult && ruleResult.confidence >= 0.85) {
        aiMetrics.record('rule-based-layer0');
        return {
            data: ruleResult,
            provider: 'rule-based-layer0',
            detectedLanguage: langName,
            originalText: textToCheck,
            translatedText: null,
        };
    }

    const prompt = `
The following community need report is written in ${langName}.

Original:
Title: ${needData.title}
Description: ${needData.description}

Tasks:
1. Translate accurately to English
2. Score the need

Return ONLY this JSON:
{
  "translatedTitle": "<English translation>",
  "translatedDescription": "<English translation>",
  "urgencyScore": <1-5>,
  "category": "<food|water|medical|shelter|education|livelihood|sanitation|other>",
  "affectedCount": <number>,
  "vulnerabilityFlag": <true/false>,
  "summary": "<one sentence in English>",
  "duplicateRisk": <true/false>
}`;

    const result = await parseAIJson(prompt, {
        text: textToCheck,
        category: needData.category || 'other',
    });

    return {
        data: result.data,
        provider: result.provider,
        detectedLanguage: langName,
        originalText: textToCheck,
        translatedText: result.data?.translatedTitle
            ? `${result.data.translatedTitle} — ${result.data.translatedDescription}`
            : null,
    };
}

async function generateVolunteerMatchReason(volunteer, need) {
    const prompt = `In exactly one sentence of maximum 20 words, explain why this volunteer is the best match for this need.
Volunteer verified skills: ${(volunteer.verifiedSkills || volunteer.skills || []).join(', ')}
Volunteer reliability score: ${((volunteer.reliabilityScore || 1) * 100).toFixed(0)}%
Need category: ${need.category}, urgency: ${need.urgencyScore}/5
Need description: ${need.description?.substring(0, 100)}
Return only the sentence, nothing else.`;

    const response = await callAI(prompt, { maxTokens: 60 });
    return response.text.trim();
}

async function generateSitrep(tasksArray, startDate, endDate) {
    const prompt = `Write a formal 3-paragraph situation report for an NGO coordinator.
Period: ${startDate} to ${endDate}
Tasks completed: ${tasksArray.length}
Task outcomes: ${JSON.stringify(tasksArray.slice(0, 10).map(t => t.outcome).filter(Boolean))}

Paragraph 1: Needs overview and urgency distribution.
Paragraph 2: Volunteer deployment and response time.
Paragraph 3: Outcomes achieved and people helped.

Use formal NGO language. Return only the report text, no headers.`;

    const response = await callAI(prompt, { maxTokens: 600 });
    return response.text.trim();
}

async function detectBurnout(volunteerStats) {
    const prompt = `Analyze these volunteer work statistics and assess burnout risk.
Stats (last 7 days): ${JSON.stringify(volunteerStats)}

Return ONLY this JSON:
{ "burnoutRisk": <true/false>, "reason": "<one sentence explanation>" }`;

    const result = await parseAIJson(prompt);
    return result.data;
}

async function verifySkillDocument(ocrText, claimedSkill) {
    const prompt = `Analyze this document text and determine if it proves the claimed skill.
Claimed skill: ${claimedSkill}
Document text (first 500 chars): ${ocrText?.substring(0, 500)}

Return ONLY this JSON:
{ "verified": <true/false>, "confidence": "<high|medium|low>", "extractedCredential": "<credential name or null>" }`;

    const result = await parseAIJson(prompt);
    return result.data;
}

async function transcribeAudio(audioBase64, mimeType = 'audio/webm') {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent([
        { inlineData: { mimeType, data: audioBase64 } },
        'Transcribe this audio accurately. Return only the transcribed text, nothing else.',
    ]);
    return result.response.text().trim();
}

module.exports = {
    callAI,
    scoreNeed,
    scoreNeedBatch,
    scoreNeedMultilingual,
    generateVolunteerMatchReason,
    generateSitrep,
    detectBurnout,
    verifySkillDocument,
    transcribeAudio,
};