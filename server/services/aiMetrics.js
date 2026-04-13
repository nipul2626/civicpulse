/**
 * Lightweight in-memory metrics tracker for AI provider usage.
 * Resets on server restart — good enough for monitoring, not for billing.
 * In production, flush to Firestore every hour.
 */

const metrics = {
    'rule-based-layer0': { requests: 0, savings: 0 },
    'semantic-cache':    { requests: 0, savings: 0 },
    'ollama':            { requests: 0, cost: 0 },
    'groq':              { requests: 0, cost: 0, errors: 0 },
    'gemini':            { requests: 0, cost: 0, errors: 0 },
    'rule-based-layer5': { requests: 0, errors: 0 },
};

let startTime = Date.now();

function record(provider, type = 'request') {
    if (!metrics[provider]) {
        metrics[provider] = { requests: 0 };
    }

    if (type === 'request') metrics[provider].requests++;
    if (type === 'error')   metrics[provider].errors = (metrics[provider].errors || 0) + 1;
    if (type === 'saving')  metrics[provider].savings = (metrics[provider].savings || 0) + 1;
}

function getSummary() {
    const total = Object.values(metrics).reduce((sum, m) => sum + (m.requests || 0), 0);
    const apiCalls = (metrics.groq?.requests || 0) + (metrics.gemini?.requests || 0);
    const freeCalls = (metrics['rule-based-layer0']?.requests || 0) + (metrics['semantic-cache']?.requests || 0);
    const uptimeMinutes = Math.round((Date.now() - startTime) / 60000);

    return {
        uptimeMinutes,
        totalRequests: total,
        apiCallsSaved: freeCalls,
        apiCallsMade: apiCalls,
        savingsPercent: total > 0 ? Math.round((freeCalls / total) * 100) : 0,
        byProvider: metrics,
    };
}

function reset() {
    Object.keys(metrics).forEach(k => {
        metrics[k] = { requests: 0 };
    });
    startTime = Date.now();
}

module.exports = { record, getSummary, reset };