/**
 * Computes a time-decayed urgency score.
 * A need submitted 72 hours ago at urgency 5 that is still unassigned
 * should not compete equally with one submitted 30 minutes ago at urgency 4.
 *
 * Decay: score reduces by up to 50% over 72 hours linearly.
 * Only applies to unassigned/pending needs — resolved/assigned are unchanged.
 */
function computedUrgency(baseScore, createdAt, status) {
    // Don't decay needs that are already being handled
    if (!['pending_ai', 'active', 'scored'].includes(status)) {
        return baseScore;
    }

    if (!baseScore || !createdAt) return baseScore;

    const createdTime = createdAt?.seconds
        ? createdAt.seconds * 1000
        : new Date(createdAt).getTime();

    const hoursElapsed = (Date.now() - createdTime) / 3_600_000;

    // No decay for first 2 hours — fresh reports get full urgency
    if (hoursElapsed <= 2) return baseScore;

    // Linear decay from 100% to 50% over 72 hours
    const decayFactor = Math.max(0.5, 1 - ((hoursElapsed - 2) / 72) * 0.5);
    const decayed = Math.round(baseScore * decayFactor * 10) / 10;

    return decayed;
}

/**
 * Adds computedUrgency to a need object before returning it.
 * Use this when fetching needs for display or matching.
 */
function applyUrgencyDecay(need) {
    return {
        ...need,
        urgencyScore: computedUrgency(need.urgencyScore, need.createdAt, need.status),
        urgencyDecayed: need.urgencyScore !== computedUrgency(need.urgencyScore, need.createdAt, need.status),
    };
}

module.exports = { computedUrgency, applyUrgencyDecay };