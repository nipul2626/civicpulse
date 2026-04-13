require('dotenv').config();
const { db } = require('./firebase');
const { generateVolunteerMatchReason } = require('./aiService');
const { COLLECTIONS } = require('../config/schema');
const { computedUrgency } = require('../utils/urgencyDecay');
// Redis for match cache
let redis = null;
try {
    const Redis = require('ioredis');
    redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', { lazyConnect: true });
    redis.connect().catch(() => { redis = null; });
} catch { redis = null; }

// ── Haversine distance in km ──────────────────────────────────────────────────
function haversineKm(lat1, lng1, lat2, lng2) {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ── Skill map: need category → required skills ────────────────────────────────
const CATEGORY_SKILLS = {
    medical:    ['medical', 'nursing', 'firstaid', 'doctor', 'paramedic'],
    food:       ['cooking', 'logistics', 'catering', 'distribution'],
    shelter:    ['construction', 'carpentry', 'engineering', 'housing'],
    education:  ['teaching', 'tutoring', 'counselling', 'training'],
    water:      ['plumbing', 'engineering', 'sanitation', 'hydraulics'],
    livelihood: ['finance', 'counselling', 'business', 'vocational'],
    sanitation: ['sanitation', 'plumbing', 'cleaning', 'waste'],
    other:      [],
};

// ── Factor scorers ────────────────────────────────────────────────────────────

function scoreSkillMatch(volunteer, need) {
    const requiredSkills = CATEGORY_SKILLS[need.category] || [];
    if (requiredSkills.length === 0) return 10;

    const verified   = (volunteer.verifiedSkills || []).map(s => s.toLowerCase());
    const unverified = (volunteer.skills || []).map(s => s.toLowerCase());
    const weights    = volunteer.implicitSkillWeights || {}; // ✅ NEW

    let baseScore = 0;

    // Verified skill match
    for (const req of requiredSkills) {
        if (verified.includes(req)) {
            baseScore = 35;
            break;
        }
    }

    // Unverified skill match
    if (baseScore === 0) {
        for (const req of requiredSkills) {
            if (unverified.some(s => s.includes(req) || req.includes(s))) {
                baseScore = 20;
                break;
            }
        }
    }

    // ✅ Implicit skill weight adjustment
    // Range: -0.5 to +0.5 → impact: -5 to +5
    const categoryWeight = weights[need.category] || 0;
    const boostedScore = baseScore + (categoryWeight * 10);

    return Math.max(0, Math.min(35, Math.round(boostedScore)));
}

function scoreProximity(volunteer, need, radiusMultiplier = 1) {
    const vLat = volunteer.location?.lat;
    const vLng = volunteer.location?.lng;
    const nLat = need.location?.lat;
    const nLng = need.location?.lng;
    if (!vLat || !vLng || !nLat || !nLng) return 10; // unknown → neutral

    const dist = haversineKm(vLat, vLng, nLat, nLng);
    const m = radiusMultiplier;

    if (dist <= 2 * m)  return 25;
    if (dist <= 5 * m)  return 20;
    if (dist <= 10 * m) return 15;
    if (dist <= 20 * m) return 8;
    return 0;
}

function scoreAvailability(volunteer, need) {
    const grid = volunteer.availabilityGrid;
    if (!grid || Object.keys(grid).length === 0) return 10;

    if (!need.scheduledTime) return 10;

    const dt = new Date(need.scheduledTime?.seconds ? need.scheduledTime.seconds * 1000 : need.scheduledTime);
    const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    const day = days[dt.getDay()];
    const hour = dt.getHours();

    let slot = 'morning';
    if (hour >= 12 && hour < 17) slot = 'afternoon';
    else if (hour >= 17) slot = 'evening';

    const key = `${day}-${slot}`;
    if (grid[key] === true) return 20;
    if (grid[key] === false) return 0;
    return 10;
}

function scoreReliability(volunteer) {
    const score = volunteer.reliabilityScore ?? 1;
    return Math.round(Math.min(score, 1) * 10);
}

function scoreWorkload(volunteer) {
    const tasks = volunteer.currentTasks || 0;
    if (tasks === 0) return 5;
    if (tasks === 1) return 3;
    if (tasks === 2) return 1;
    return 0;
}

async function scoreTaskHistory(volunteer, need) {
    try {
        const snap = await db.collection(COLLECTIONS.TASKS)
            .where('assignedVolunteer', '==', volunteer.id)
            .where('status', '==', 'completed')
            .get();

        const similar = snap.docs.filter(d => {
            // We'd need to join with need — approximate by checking task's orgId or outcome text
            return true; // Simplified — full join would need denormalizing category onto task
        }).length;

        if (similar >= 3) return 5;
        if (similar >= 1) return 3;
        return 0;
    } catch {
        return 0;
    }
}

// ── Core matching function ────────────────────────────────────────────────────
async function matchVolunteersToNeed(needId) {
    // Check Redis cache
    if (redis) {
        const cached = await redis.get(`match:${needId}`).catch(() => null);
        if (cached) return JSON.parse(cached);
    }

    // Fetch need
    const needDoc = await db.collection(COLLECTIONS.NEEDS).doc(needId).get();
    if (!needDoc.exists) throw new Error(`Need ${needId} not found`);
    const need = needDoc.data();

// ✅ Apply urgency decay before scoring
    const effectiveUrgency = computedUrgency(
        need.urgencyScore,
        need.createdAt,
        need.status
    );

    need.effectiveUrgency = effectiveUrgency;
    // Fetch eligible volunteers
    const volSnap = await db.collection(COLLECTIONS.VOLUNTEERS)
        .where('currentTasks', '<', 3)
        .where('burnoutFlag', '!=', true)
        .get();

    const volunteers = volSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    if (volunteers.length === 0) return [];

    // Score all volunteers at primary radius
    let scored = await Promise.all(volunteers.map(async (v) => {
        const skillScore   = scoreSkillMatch(v, need);
        const proxScore    = scoreProximity(v, need, 1);
        const availScore   = scoreAvailability(v, need);
        const relScore     = scoreReliability(v);
        const workScore    = scoreWorkload(v);
        const histScore    = await scoreTaskHistory(v, need);

        const total = skillScore + proxScore + availScore + relScore + workScore + histScore;
        const dist  = (v.location?.lat && need.location?.lat)
            ? haversineKm(v.location.lat, v.location.lng, need.location.lat, need.location.lng)
            : null;

        return { volunteer: v, score: total, distance: dist, matchLevel: 'primary' };
    }));

    scored.sort((a, b) => b.score - a.score);

    // Fallback: if top 5 all below 40, expand radius x2
    const top5Primary = scored.slice(0, 5);
    if (top5Primary.every(r => r.score < 40)) {
        console.log(`⚠️  matchVolunteersToNeed: primary results weak for ${needId}, expanding radius x2`);
        scored = await Promise.all(volunteers.map(async (v) => {
            const skillScore   = scoreSkillMatch(v, need);
            const proxScore    = scoreProximity(v, need, 2); // doubled
            const availScore   = scoreAvailability(v, need);
            const relScore     = scoreReliability(v);
            const workScore    = scoreWorkload(v);
            const histScore    = await scoreTaskHistory(v, need);

            const total = skillScore + proxScore + availScore + relScore + workScore + histScore;
            const dist  = (v.location?.lat && need.location?.lat)
                ? haversineKm(v.location.lat, v.location.lng, need.location.lat, need.location.lng)
                : null;

            return { volunteer: v, score: total, distance: dist, matchLevel: 'expanded' };
        }));
        scored.sort((a, b) => b.score - a.score);

        // Broadcast fallback
        if (scored.slice(0, 5).every(r => r.score < 40)) {
            console.log(`⚠️  matchVolunteersToNeed: expanded still weak for ${needId}, broadcasting`);
            scored = scored.map(r => ({ ...r, matchLevel: 'broadcast' }));
        }
    }

    const top5 = scored.slice(0, 5);

    // Fetch user names for top 5
    const results = await Promise.all(top5.map(async ({ volunteer: v, score, distance, matchLevel }) => {
        let name = v.displayName || 'Unknown';
        try {
            const userDoc = await db.collection(COLLECTIONS.USERS).doc(v.userId || v.id).get();
            if (userDoc.exists) name = userDoc.data().displayName || name;
        } catch {}

        let reason = '';
        try {
            reason = await generateVolunteerMatchReason(v, need);
        } catch {
            reason = `Matched on ${need.category} category with score ${score}/100`;
        }

        return {
            volunteerId: v.id,
            name,
            score,
            reason,
            distance: distance ? `${distance.toFixed(1)} km` : 'Unknown',
            skills: v.verifiedSkills || v.skills || [],
            reliabilityScore: v.reliabilityScore ?? 1,
            matchLevel,
        };
    }));

    // Cache for 5 minutes
    if (redis) {
        await redis.setex(`match:${needId}`, 300, JSON.stringify(results)).catch(() => {});
    }

    return results;
}

module.exports = { matchVolunteersToNeed };