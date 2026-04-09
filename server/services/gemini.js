const { GoogleGenAI } = require('@google/genai');
require('dotenv').config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Test function — Week 1
async function testGemini() {
    const result = await ai.models.generateContent({
        model: "gemini-2.5-flash-lite",
        contents: [{ role: "user", parts: [{ text: "Say hello from CivicPulse!" }] }]
    });

    console.log("Gemini test:", result.text);
}

// AI Urgency Scoring — Week 2
async function scoreNeed(needData) {
    const prompt = `
You are an AI assistant for a civic emergency platform. Analyze the following need report and return ONLY a valid JSON object (no markdown, no explanation).

Need Report:
- Title: ${needData.title}
- Description: ${needData.description}
- Category: ${needData.category}
- Location: ${needData.location}
- Reported by: ${needData.reportedBy || 'Anonymous'}

Return this exact JSON structure:
{
  "urgencyScore": <number 1-5>,
  "category": "<confirmed or corrected category>",
  "affectedCount": <estimated number of people affected>,
  "vulnerabilityFlag": <true or false>,
  "reasoning": "<one line explanation>"
}
`;

    const result = await ai.models.generateContent({
        model: "gemini-2.5-flash-lite",
        contents: [{ role: "user", parts: [{ text: prompt }] }]
    });

    const text = result.text.trim().replace(/```json|```/g, "");
    return JSON.parse(text);
}

// Voice transcription — Week 2
async function transcribeAudio(audioBase64, mimeType = 'audio/webm') {
    const result = await ai.models.generateContent({
        model: "gemini-2.5-flash-lite",
        contents: [
            {
                role: "user",
                parts: [
                    {
                        inlineData: {
                            mimeType,
                            data: audioBase64
                        }
                    },
                    {
                        text: "Transcribe this audio accurately. Return only the transcribed text."
                    }
                ]
            }
        ]
    });

    return result.text.trim();
}

module.exports = { testGemini, scoreNeed, transcribeAudio};