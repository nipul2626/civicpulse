/**
 * Layer 2: Ollama self-hosted AI service
 *
 * NOT deployed yet — Render free tier has 512MB RAM, Mistral needs 8GB.
 * This file is architected and ready. When you upgrade to a 4GB+ server:
 *   1. Install Ollama on the server
 *   2. Pull model: ollama pull mistral
 *   3. Set OLLAMA_URL=http://localhost:11434 in env
 *   4. The routing in aiService.js will automatically start using it
 *
 * Zero cost once deployed — eliminates Groq/Gemini calls entirely at scale.
 */

const OLLAMA_URL = process.env.OLLAMA_URL || null;
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'mistral';
const OLLAMA_TIMEOUT_MS = parseInt(process.env.OLLAMA_TIMEOUT_MS || '15000');

// ── Health check — called on startup and before routing ───────────────────────
let ollamaAvailable = false;
let lastHealthCheck = 0;
const HEALTH_CHECK_INTERVAL = 60 * 1000; // recheck every 60 seconds

async function checkOllamaHealth() {
    if (!OLLAMA_URL) return false;

    const now = Date.now();
    if (now - lastHealthCheck < HEALTH_CHECK_INTERVAL) {
        return ollamaAvailable; // use cached result
    }

    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 3000);

        const res = await fetch(`${OLLAMA_URL}/api/tags`, {
            signal: controller.signal,
        });
        clearTimeout(timeout);

        ollamaAvailable = res.ok;
        lastHealthCheck = now;

        if (ollamaAvailable) {
            console.log(`✅ Ollama available at ${OLLAMA_URL}`);
        }
        return ollamaAvailable;
    } catch {
        ollamaAvailable = false;
        lastHealthCheck = now;
        return false;
    }
}

// ── Server load check — only use Ollama when server isn't stressed ────────────
function getServerLoad() {
    const used = process.memoryUsage();
    const heapUsedMB = used.heapUsed / 1024 / 1024;
    const heapTotalMB = used.heapTotal / 1024 / 1024;
    return heapUsedMB / heapTotalMB; // 0.0 to 1.0
}

// ── Core Ollama call ──────────────────────────────────────────────────────────
async function callOllama(prompt, options = {}) {
    if (!OLLAMA_URL) {
        throw new Error('OLLAMA_URL not configured');
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), OLLAMA_TIMEOUT_MS);

    try {
        const response = await fetch(`${OLLAMA_URL}/api/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: options.model || OLLAMA_MODEL,
                prompt,
                stream: false,
                options: {
                    temperature: 0.1,      // low temp for consistent JSON output
                    num_predict: options.maxTokens || 500,
                },
            }),
            signal: controller.signal,
        });

        clearTimeout(timeout);

        if (!response.ok) {
            throw new Error(`Ollama HTTP ${response.status}`);
        }

        const data = await response.json();
        return {
            text: data.response,
            provider: 'ollama',
            model: OLLAMA_MODEL,
            usedFallback: false,
        };
    } catch (err) {
        clearTimeout(timeout);
        if (err.name === 'AbortError') {
            throw new Error(`Ollama timeout after ${OLLAMA_TIMEOUT_MS}ms`);
        }
        throw err;
    }
}

// ── Should we use Ollama for this request? ────────────────────────────────────
async function shouldUseOllama() {
    if (!OLLAMA_URL) return false;

    const healthy = await checkOllamaHealth();
    if (!healthy) return false;

    const load = getServerLoad();
    if (load > 0.7) {
        console.log(`⚠️  Server load ${(load * 100).toFixed(0)}% — skipping Ollama, using API`);
        return false;
    }

    return true;
}

module.exports = { callOllama, shouldUseOllama, checkOllamaHealth };