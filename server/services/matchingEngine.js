require('dotenv').config();

const { db } = require('./firebase');
const { generateVolunteerMatchReason } = require('./aiService');
const { COLLECTIONS } = require('../config/schema');
const { computedUrgency } = require('../utils/urgencyDecay');

// ─────────────────────────────────────────────────────────────────────────────
// Redis cache
// ─────────────────────────────────────────────────────────────────────────────

let redis = null;

try {
    const Redis = require('ioredis');

    redis = new Redis(
        process.env.REDIS_URL || 'redis://localhost:6379',
        {
            lazyConnect: true,
            maxRetriesPerRequest: 2,
            enableOfflineQueue: false,
        }
    );

    redis.connect().catch(() => {
        redis = null;
    });
} catch {
    redis = null;
}


// ─────────────────────────────────────────────────────────────────────────────
// MATCHING CONFIGURATION
// ─────────────────────────────────────────────────────────────────────────────

const MATCH_CONFIG = {
    // Six-factor scoring = exactly 100 points
    weights: {
        skill: 35,
        proximity: 25,
        availability: 20,
        reliability: 10,
        workload: 5,
        history: 5,
    },

    // Primary proximity thresholds
    primaryRadiusKm: {
        excellent: 2,
        good: 5,
        moderate: 10,
        acceptable: 20,
    },

    // Expanded search doubles the geographic radius
    expandedRadiusMultiplier: 2,

    // Only classify as weak if ALL returned candidates are below this
    weakMatchThreshold: 40,

    // Redis cache
    cacheSeconds: 300,

    // Maximum active tasks
    maxCurrentTasks: 3,

    // Implicit skill weight range
    minImplicitWeight: -0.5,
    maxImplicitWeight: 0.5,

    // Firestore `in` query limit
    firestoreInBatchSize: 30,
};


// ─────────────────────────────────────────────────────────────────────────────
// CATEGORY → REQUIRED SKILLS
// ─────────────────────────────────────────────────────────────────────────────

const CATEGORY_SKILLS = {
    medical: [
        'medical',
        'nursing',
        'firstaid',
        'first aid',
        'doctor',
        'paramedic',
        'healthcare',
    ],

    food: [
        'cooking',
        'cook',
        'logistics',
        'catering',
        'distribution',
        'food',
    ],

    shelter: [
        'construction',
        'carpentry',
        'engineering',
        'housing',
        'masonry',
        'electrician',
    ],

    education: [
        'teaching',
        'teacher',
        'tutoring',
        'counselling',
        'counseling',
        'training',
        'education',
    ],

    water: [
        'plumbing',
        'plumber',
        'engineering',
        'sanitation',
        'hydraulics',
        'water management',
        'water',
    ],

    livelihood: [
        'finance',
        'counselling',
        'counseling',
        'business',
        'vocational',
        'accounting',
    ],

    sanitation: [
        'sanitation',
        'plumbing',
        'cleaning',
        'waste',
        'waste management',
    ],

    other: [],
};


// ─────────────────────────────────────────────────────────────────────────────
// UTILITY FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

function normalizeText(value) {
    return String(value || '')
        .trim()
        .toLowerCase()
        .replace(/[_-]/g, ' ')
        .replace(/\s+/g, ' ');
}


function normalizeSkill(skill) {
    return normalizeText(skill);
}


function getNeedCategory(need) {
    return normalizeText(need?.category || 'other');
}


function hasValidCoordinate(value) {
    return (
        typeof value === 'number' &&
        Number.isFinite(value)
    );
}


function hasValidLocation(location) {
    return (
        hasValidCoordinate(location?.lat) &&
        hasValidCoordinate(location?.lng)
    );
}


function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}


function normalizeReliability(value) {
    const numeric = Number(value);

    if (!Number.isFinite(numeric)) {
        return null;
    }

    // Database may contain either:
    // 0.0 → 1.0
    // OR
    // 0 → 100
    if (numeric > 1) {
        return clamp(numeric / 100, 0, 1);
    }

    return clamp(numeric, 0, 1);
}


// ─────────────────────────────────────────────────────────────────────────────
// HAVERSINE DISTANCE
// ─────────────────────────────────────────────────────────────────────────────

function haversineKm(lat1, lng1, lat2, lng2) {
    const R = 6371;

    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;

    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) ** 2;

    return (
        R *
        2 *
        Math.atan2(
            Math.sqrt(a),
            Math.sqrt(1 - a)
        )
    );
}


// ─────────────────────────────────────────────────────────────────────────────
// 1. SKILL MATCH — 35 POINTS
//
// Verified exact/related skill      → 35
// Unverified exact/related skill    → 25
// Implicit learned category skill  → up to 15
// No evidence                       → 0
//
// IMPORTANT:
// An unrelated skill NEVER receives skill points.
// ─────────────────────────────────────────────────────────────────────────────

function scoreSkillMatch(volunteer, need) {
    const category = getNeedCategory(need);

    const requiredSkills =
        CATEGORY_SKILLS[category] || [];

    // "Other" has no strict skill requirement.
    if (requiredSkills.length === 0) {
        return 20;
    }

    const verifiedSkills = (
        volunteer.verifiedSkills || []
    ).map(normalizeSkill);

    const normalSkills = (
        volunteer.skills || []
    ).map(normalizeSkill);

    const normalizedRequired =
        requiredSkills.map(normalizeSkill);


    // ── Verified skill ────────────────────────────────────────────────────────

    const hasVerifiedExact =
        normalizedRequired.some(
            required =>
                verifiedSkills.includes(required)
        );

    if (hasVerifiedExact) {
        return MATCH_CONFIG.weights.skill;
    }


    // Verified partial/related skill
    const hasVerifiedRelated =
        normalizedRequired.some(required =>
            verifiedSkills.some(skill =>
                skill.includes(required) ||
                required.includes(skill)
            )
        );

    if (hasVerifiedRelated) {
        return MATCH_CONFIG.weights.skill;
    }


    // ── Unverified skill ──────────────────────────────────────────────────────

    const hasNormalExact =
        normalizedRequired.some(
            required =>
                normalSkills.includes(required)
        );

    if (hasNormalExact) {
        return 25;
    }


    const hasNormalRelated =
        normalizedRequired.some(required =>
            normalSkills.some(skill =>
                skill.includes(required) ||
                required.includes(skill)
            )
        );

    if (hasNormalRelated) {
        return 25;
    }


    // ── Implicit skill learning ───────────────────────────────────────────────
    //
    // Example:
    // implicitSkillWeights = {
    //     water: 0.4
    // }
    //
    // This means the volunteer has learned experience with
    // water-related work even if "plumbing" is not explicitly
    // listed in their profile.
    //
    // But this NEVER applies to an unrelated category.
    // ─────────────────────────────────────────────────────────────────────────

    const weights =
        volunteer.implicitSkillWeights || {};

    const rawWeight =
        Number(weights[category] ?? 0);

    if (Number.isFinite(rawWeight)) {
        const categoryWeight = clamp(
            rawWeight,
            MATCH_CONFIG.minImplicitWeight,
            MATCH_CONFIG.maxImplicitWeight
        );

        // Positive implicit experience can contribute up to 10 points.
        if (categoryWeight > 0) {
            return Math.round(
                categoryWeight *
                20
            );
        }
    }


    // No relevant skill evidence.
    return 0;
}


// ─────────────────────────────────────────────────────────────────────────────
// 2. PROXIMITY — 25 POINTS
//
// 0–2 km       → 25
// 2–5 km        → 20
// 5–10 km       → 15
// 10–20 km      → 8
// 20+ km        → 0
// Unknown       → 0
//
// Missing location must NEVER award points.
// ─────────────────────────────────────────────────────────────────────────────

function calculateDistance(volunteer, need) {
    if (
        !hasValidLocation(volunteer.location) ||
        !hasValidLocation(need.location)
    ) {
        return null;
    }

    return haversineKm(
        volunteer.location.lat,
        volunteer.location.lng,
        need.location.lat,
        need.location.lng
    );
}


function scoreProximity(
    volunteer,
    need,
    radiusMultiplier = 1
) {
    const distance =
        calculateDistance(
            volunteer,
            need
        );

    if (distance === null) {
        return 0;
    }

    const multiplier =
        Math.max(1, radiusMultiplier);

    if (
        distance <=
        MATCH_CONFIG.primaryRadiusKm.excellent *
        multiplier
    ) {
        return 25;
    }

    if (
        distance <=
        MATCH_CONFIG.primaryRadiusKm.good *
        multiplier
    ) {
        return 20;
    }

    if (
        distance <=
        MATCH_CONFIG.primaryRadiusKm.moderate *
        multiplier
    ) {
        return 15;
    }

    if (
        distance <=
        MATCH_CONFIG.primaryRadiusKm.acceptable *
        multiplier
    ) {
        return 8;
    }

    return 0;
}


// ─────────────────────────────────────────────────────────────────────────────
// 3. AVAILABILITY — 20 POINTS
//
// Exact available slot → 20
// Unknown slot          → 10
// Explicit unavailable  → 0
//
// If no scheduled time exists, availability cannot be evaluated,
// therefore it receives the neutral score of 10.
// ─────────────────────────────────────────────────────────────────────────────

function scoreAvailability(volunteer, need) {
    const grid =
        volunteer.availabilityGrid;

    if (
        !grid ||
        typeof grid !== 'object' ||
        Object.keys(grid).length === 0
    ) {
        return 10;
    }

    if (!need.scheduledTime) {
        return 10;
    }

    let timestamp;

    if (
        typeof need.scheduledTime === 'object' &&
        need.scheduledTime.seconds
    ) {
        timestamp =
            need.scheduledTime.seconds * 1000;
    } else {
        timestamp =
            need.scheduledTime;
    }

    const dt = new Date(timestamp);

    if (Number.isNaN(dt.getTime())) {
        return 10;
    }

    const days = [
        'sun',
        'mon',
        'tue',
        'wed',
        'thu',
        'fri',
        'sat',
    ];

    const day =
        days[dt.getDay()];

    const hour =
        dt.getHours();

    let slot = 'morning';

    if (
        hour >= 12 &&
        hour < 17
    ) {
        slot = 'afternoon';
    } else if (
        hour >= 17
    ) {
        slot = 'evening';
    }

    const key =
        `${day}-${slot}`;

    if (grid[key] === true) {
        return 20;
    }

    if (grid[key] === false) {
        return 0;
    }

    return 10;
}


// ─────────────────────────────────────────────────────────────────────────────
// 4. RELIABILITY — 10 POINTS
//
// Supports both:
//
// 0.00 → 1.00
// 0    → 100
//
// Missing reliability = neutral 5.
// Missing data must not be treated as perfect reliability.
// ─────────────────────────────────────────────────────────────────────────────

function scoreReliability(volunteer) {
    const normalized =
        normalizeReliability(
            volunteer.reliabilityScore
        );

    if (normalized === null) {
        return 5;
    }

    return Math.round(
        normalized *
        MATCH_CONFIG.weights.reliability
    );
}


// ─────────────────────────────────────────────────────────────────────────────
// 5. CURRENT WORKLOAD — 5 POINTS
//
// 0 tasks → 5
// 1 task  → 3
// 2 tasks → 1
// 3+      → 0
//
// 3+ should normally already be excluded.
// ─────────────────────────────────────────────────────────────────────────────

function scoreWorkload(volunteer) {
    const tasks =
        Number(volunteer.currentTasks || 0);

    if (!Number.isFinite(tasks)) {
        return 3;
    }

    if (tasks <= 0) {
        return 5;
    }

    if (tasks === 1) {
        return 3;
    }

    if (tasks === 2) {
        return 1;
    }

    return 0;
}


// ─────────────────────────────────────────────────────────────────────────────
// 6. TASK HISTORY — 5 POINTS
//
// Only COMPLETED tasks in the SAME CATEGORY count.
//
// 3+ same-category tasks → 5
// 1–2 same-category      → 3
// None                   → 0
// ─────────────────────────────────────────────────────────────────────────────

async function loadTaskHistory(
    volunteers,
    needCategory
) {
    const historyMap =
        new Map();

    for (const volunteer of volunteers) {
        historyMap.set(
            volunteer.id,
            0
        );
    }

    if (volunteers.length === 0) {
        return historyMap;
    }

    const volunteerIds =
        volunteers.map(
            volunteer => volunteer.id
        );

    const category =
        normalizeText(
            needCategory
        );


    // Firestore `in` queries have a limit,
    // so process volunteers in chunks.
    const chunks = [];

    for (
        let i = 0;
        i < volunteerIds.length;
        i += MATCH_CONFIG.firestoreInBatchSize
    ) {
        chunks.push(
            volunteerIds.slice(
                i,
                i + MATCH_CONFIG.firestoreInBatchSize
            )
        );
    }


    for (const chunk of chunks) {
        try {
            const snapshot =
                await db
                    .collection(
                        COLLECTIONS.TASKS
                    )
                    .where(
                        'assignedVolunteer',
                        'in',
                        chunk
                    )
                    .where(
                        'status',
                        '==',
                        'completed'
                    )
                    .get();

            for (const doc of snapshot.docs) {
                const task =
                    doc.data();

                const volunteerId =
                    task.assignedVolunteer;

                if (
                    !historyMap.has(
                        volunteerId
                    )
                ) {
                    continue;
                }

                const taskCategory =
                    normalizeText(
                        task.needCategory ||
                        task.category ||
                        ''
                    );

                if (
                    taskCategory ===
                    category
                ) {
                    historyMap.set(
                        volunteerId,
                        historyMap.get(
                            volunteerId
                        ) + 1
                    );
                }
            }
        } catch (err) {
            console.error(
                `Task history query failed: ${err.message}`
            );
        }
    }

    return historyMap;
}


function scoreTaskHistory(
    volunteer,
    historyMap
) {
    const similar =
        historyMap.get(
            volunteer.id
        ) || 0;

    if (similar >= 3) {
        return 5;
    }

    if (similar >= 1) {
        return 3;
    }

    return 0;
}


// ─────────────────────────────────────────────────────────────────────────────
// URGENCY
//
// Urgency does NOT directly add points to the 100-point volunteer score.
//
// Why?
// A volunteer should not become geographically closer,
// more reliable, or more skilled simply because a need is urgent.
//
// Instead, effective urgency is used as:
// - metadata
// - tie-breaker
// - ranking priority when scores are extremely close
// ─────────────────────────────────────────────────────────────────────────────

function calculateEffectiveUrgency(need) {
    try {
        const urgency =
            computedUrgency(
                need.urgencyScore,
                need.createdAt,
                need.status
            );

        if (
            Number.isFinite(
                Number(urgency)
            )
        ) {
            return clamp(
                Number(urgency),
                1,
                5
            );
        }

        return Number(
            need.urgencyScore
        ) || 1;
    } catch {
        return Number(
            need.urgencyScore
        ) || 1;
    }
}


// ─────────────────────────────────────────────────────────────────────────────
// ORGANIZATION FILTER
//
// If the need has an orgId, volunteers from another organization
// must not be matched.
//
// Volunteers without an orgId are only allowed when the need itself
// has no orgId.
// ─────────────────────────────────────────────────────────────────────────────

function belongsToNeedOrganization(
    volunteer,
    need
) {
    if (!need.orgId) {
        return true;
    }

    return (
        volunteer.orgId ===
        need.orgId
    );
}


// ─────────────────────────────────────────────────────────────────────────────
// VOLUNTEER ELIGIBILITY
// ─────────────────────────────────────────────────────────────────────────────

function isVolunteerEligible(
    volunteer,
    need
) {
    const currentTasks =
        Number(
            volunteer.currentTasks || 0
        );

    // Hard workload limit
    if (
        Number.isFinite(currentTasks) &&
        currentTasks >=
        MATCH_CONFIG.maxCurrentTasks
    ) {
        return false;
    }

    // Burnout exclusion
    if (
        volunteer.burnoutFlag === true
    ) {
        return false;
    }

    // Explicit inactive status
    if (
        typeof volunteer.active === 'boolean' &&
        volunteer.active === false
    ) {
        return false;
    }

    // Explicit unavailable status
    if (
        typeof volunteer.available === 'boolean' &&
        volunteer.available === false
    ) {
        return false;
    }

    // Organization isolation
    if (
        !belongsToNeedOrganization(
            volunteer,
            need
        )
    ) {
        return false;
    }

    return true;
}


// ─────────────────────────────────────────────────────────────────────────────
// COMPLETE VOLUNTEER SCORE
// ─────────────────────────────────────────────────────────────────────────────

async function calculateVolunteerScore(
    volunteer,
    need,
    historyMap,
    radiusMultiplier = 1
) {
    const skillScore =
        scoreSkillMatch(
            volunteer,
            need
        );

    const proximityScore =
        scoreProximity(
            volunteer,
            need,
            radiusMultiplier
        );

    const availabilityScore =
        scoreAvailability(
            volunteer,
            need
        );

    const reliabilityScore =
        scoreReliability(
            volunteer
        );

    const workloadScore =
        scoreWorkload(
            volunteer
        );

    const historyScore =
        scoreTaskHistory(
            volunteer,
            historyMap
        );

    const total =
        skillScore +
        proximityScore +
        availabilityScore +
        reliabilityScore +
        workloadScore +
        historyScore;

    const distance =
        calculateDistance(
            volunteer,
            need
        );

    return {
        volunteer,

        score: clamp(
            Math.round(total),
            0,
            100
        ),

        distance,

        breakdown: {
            skill: skillScore,
            proximity: proximityScore,
            availability: availabilityScore,
            reliability: reliabilityScore,
            workload: workloadScore,
            history: historyScore,
        },
    };
}


// ─────────────────────────────────────────────────────────────────────────────
// SORT MATCHES
//
// Primary ordering:
// 1. Total score
// 2. Skill score
// 3. Distance
// 4. Reliability
// 5. Workload
//
// Urgency is intentionally NOT used to artificially inflate scores.
// ─────────────────────────────────────────────────────────────────────────────

function sortMatches(
    a,
    b
) {
    // 1. Overall score
    if (
        b.score !==
        a.score
    ) {
        return (
            b.score -
            a.score
        );
    }

    // 2. Skill match
    if (
        b.breakdown.skill !==
        a.breakdown.skill
    ) {
        return (
            b.breakdown.skill -
            a.breakdown.skill
        );
    }

    // 3. Proximity
    if (
        a.distance !== null &&
        b.distance !== null &&
        a.distance !==
        b.distance
    ) {
        return (
            a.distance -
            b.distance
        );
    }

    // 4. Reliability
    if (
        b.breakdown.reliability !==
        a.breakdown.reliability
    ) {
        return (
            b.breakdown.reliability -
            a.breakdown.reliability
        );
    }

    // 5. Workload
    return (
        b.breakdown.workload -
        a.breakdown.workload
    );
}


// ─────────────────────────────────────────────────────────────────────────────
// MATCH QUALITY
// ─────────────────────────────────────────────────────────────────────────────

function getMatchQuality(score) {
    if (score >= 85) {
        return 'excellent';
    }

    if (score >= 70) {
        return 'strong';
    }

    if (score >= 55) {
        return 'good';
    }

    if (score >= 40) {
        return 'moderate';
    }

    if (score >= 25) {
        return 'weak';
    }

    return 'poor';
}


// ─────────────────────────────────────────────────────────────────────────────
// CORE MATCHING ENGINE
// ─────────────────────────────────────────────────────────────────────────────

async function matchVolunteersToNeed(
    needId
) {
    const cacheKey =
        `match:${needId}`;


    // ─────────────────────────────────────────────────────────────────────────
    // 1. Redis cache
    // ─────────────────────────────────────────────────────────────────────────

    if (redis) {
        try {
            const cached =
                await redis.get(
                    cacheKey
                );

            if (cached) {
                return JSON.parse(
                    cached
                );
            }
        } catch (err) {
            console.warn(
                `Match cache read failed: ${err.message}`
            );
        }
    }


    // ─────────────────────────────────────────────────────────────────────────
    // 2. Fetch need
    // ─────────────────────────────────────────────────────────────────────────

    const needDoc =
        await db
            .collection(
                COLLECTIONS.NEEDS
            )
            .doc(needId)
            .get();

    if (!needDoc.exists) {
        throw new Error(
            `Need ${needId} not found`
        );
    }

    const need = {
        id: needDoc.id,
        ...needDoc.data(),
    };


    // ─────────────────────────────────────────────────────────────────────────
    // 3. Calculate effective urgency
    // ─────────────────────────────────────────────────────────────────────────

    const effectiveUrgency =
        calculateEffectiveUrgency(
            need
        );

    need.effectiveUrgency =
        effectiveUrgency;


    // ─────────────────────────────────────────────────────────────────────────
    // 4. Fetch volunteers
    // ─────────────────────────────────────────────────────────────────────────

    const volSnap =
        await db
            .collection(
                COLLECTIONS.VOLUNTEERS
            )
            .where(
                'currentTasks',
                '<',
                MATCH_CONFIG.maxCurrentTasks
            )
            .where(
                'burnoutFlag',
                '!=',
                true
            )
            .get();


    const allVolunteers =
        volSnap.docs.map(
            doc => ({
                id: doc.id,
                ...doc.data(),
            })
        );


    // Apply additional eligibility rules
    const volunteers =
        allVolunteers.filter(
            volunteer =>
                isVolunteerEligible(
                    volunteer,
                    need
                )
        );


    if (
        volunteers.length === 0
    ) {
        return [];
    }


    // ─────────────────────────────────────────────────────────────────────────
    // 5. Load task history ONCE
    // ─────────────────────────────────────────────────────────────────────────

    const historyMap =
        await loadTaskHistory(
            volunteers,
            getNeedCategory(need)
        );


    // ─────────────────────────────────────────────────────────────────────────
    // 6. PRIMARY MATCHING
    // ─────────────────────────────────────────────────────────────────────────

    let scored =
        await Promise.all(
            volunteers.map(
                volunteer =>
                    calculateVolunteerScore(
                        volunteer,
                        need,
                        historyMap,
                        1
                    )
            )
        );


    scored.sort(
        sortMatches
    );


    scored =
        scored.map(
            result => ({
                ...result,
                matchLevel:
                    'primary',
            })
        );


    // ─────────────────────────────────────────────────────────────────────────
    // 7. EXPANDED RADIUS FALLBACK
    //
    // Only expand geographic radius when ALL top candidates are weak.
    // We do not throw away good primary matches just because some candidates
    // are far away.
    // ─────────────────────────────────────────────────────────────────────────

    const top5Primary =
        scored.slice(0, 5);

    const shouldExpand =
        top5Primary.length > 0 &&
        top5Primary.every(
            result =>
                result.score <
                MATCH_CONFIG.weakMatchThreshold
        );


    if (shouldExpand) {
        console.log(
            `⚠️ Weak primary matches for ${needId}. Expanding geographic radius.`
        );

        const expanded =
            await Promise.all(
                volunteers.map(
                    volunteer =>
                        calculateVolunteerScore(
                            volunteer,
                            need,
                            historyMap,
                            MATCH_CONFIG.expandedRadiusMultiplier
                        )
                )
            );

        expanded.sort(
            sortMatches
        );

        scored =
            expanded.map(
                result => ({
                    ...result,
                    matchLevel:
                        'expanded',
                })
            );
    }


    // ─────────────────────────────────────────────────────────────────────────
    // 8. BROADCAST FALLBACK
    //
    // If there are still no meaningful matches, return the best eligible
    // volunteers but explicitly label them as broadcast candidates.
    // ─────────────────────────────────────────────────────────────────────────

    const top5AfterExpansion =
        scored.slice(0, 5);

    const shouldBroadcast =
        top5AfterExpansion.length > 0 &&
        top5AfterExpansion.every(
            result =>
                result.score <
                MATCH_CONFIG.weakMatchThreshold
        );


    if (shouldBroadcast) {
        console.log(
            `⚠️ No strong matches for ${needId}. Falling back to broadcast candidates.`
        );

        scored =
            scored.map(
                result => ({
                    ...result,
                    matchLevel:
                        'broadcast',
                })
            );
    }


    // ─────────────────────────────────────────────────────────────────────────
    // 9. Select top 5
    // ─────────────────────────────────────────────────────────────────────────

    const top5 =
        scored.slice(0, 5);


    // ─────────────────────────────────────────────────────────────────────────
    // 10. Build final response
    // ─────────────────────────────────────────────────────────────────────────

    const results =
        await Promise.all(
            top5.map(
                async ({
                           volunteer,
                           score,
                           distance,
                           matchLevel,
                           breakdown,
                       }) => {

                    const v =
                        volunteer;

                    // ─────────────────────────────────────────────────────────
                    // Resolve volunteer name
                    // ─────────────────────────────────────────────────────────

                    let name =
                        v.displayName ||
                        v.name ||
                        'Unknown';

                    try {
                        const userDoc =
                            await db
                                .collection(
                                    COLLECTIONS.USERS
                                )
                                .doc(
                                    v.userId ||
                                    v.id
                                )
                                .get();

                        if (
                            userDoc.exists
                        ) {
                            const user =
                                userDoc.data();

                            name =
                                user.displayName ||
                                user.name ||
                                name;
                        }
                    } catch {
                        // Keep existing name
                    }


                    // ─────────────────────────────────────────────────────────
                    // AI-generated explanation
                    // ─────────────────────────────────────────────────────────

                    let reason = '';

                    try {
                        reason =
                            await generateVolunteerMatchReason(
                                v,
                                need
                            );
                    } catch {
                        reason =
                            buildFallbackReason(
                                v,
                                need,
                                score,
                                breakdown
                            );
                    }


                    const reliability =
                        normalizeReliability(
                            v.reliabilityScore
                        );


                    return {
                        volunteerId:
                        v.id,

                        name,

                        score,

                        matchQuality:
                            getMatchQuality(
                                score
                            ),

                        reason,

                        distance:
                            distance !== null
                                ? `${distance.toFixed(1)} km`
                                : 'Unknown',

                        skills:
                            v.verifiedSkills ||
                            v.skills ||
                            [],

                        reliabilityScore:
                            reliability !== null
                                ? Number(
                                    reliability.toFixed(2)
                                )
                                : null,

                        matchLevel,

                        scoreBreakdown: {
                            skill:
                            breakdown.skill,

                            proximity:
                            breakdown.proximity,

                            availability:
                            breakdown.availability,

                            reliability:
                            breakdown.reliability,

                            workload:
                            breakdown.workload,

                            history:
                            breakdown.history,

                            total:
                            score,
                        },

                        effectiveUrgency,

                        urgencyLevel:
                            getUrgencyLevel(
                                effectiveUrgency
                            ),
                    };
                }
            )
        );


    // ─────────────────────────────────────────────────────────────────────────
    // 11. Cache
    // ─────────────────────────────────────────────────────────────────────────

    if (redis) {
        try {
            await redis.setex(
                cacheKey,
                MATCH_CONFIG.cacheSeconds,
                JSON.stringify(
                    results
                )
            );
        } catch (err) {
            console.warn(
                `Match cache write failed: ${err.message}`
            );
        }
    }


    return results;
}


// ─────────────────────────────────────────────────────────────────────────────
// FALLBACK AI REASON
// ─────────────────────────────────────────────────────────────────────────────

function buildFallbackReason(
    volunteer,
    need,
    score,
    breakdown
) {
    const category =
        getNeedCategory(
            need
        );

    const reasons = [];

    if (
        breakdown.skill >= 35
    ) {
        reasons.push(
            `verified ${category}-related skills`
        );
    } else if (
        breakdown.skill >= 25
    ) {
        reasons.push(
            `relevant ${category}-related skills`
        );
    } else if (
        breakdown.skill === 0
    ) {
        reasons.push(
            `no directly verified ${category} skill`
        );
    }

    if (
        breakdown.proximity >= 25
    ) {
        reasons.push(
            'very close to the reported need'
        );
    } else if (
        breakdown.proximity >= 15
    ) {
        reasons.push(
            'located reasonably close to the need'
        );
    }

    if (
        breakdown.reliability >= 8
    ) {
        reasons.push(
            'strong reliability history'
        );
    }

    if (
        breakdown.workload === 5
    ) {
        reasons.push(
            'currently has no active tasks'
        );
    }

    if (
        breakdown.history >= 5
    ) {
        reasons.push(
            `completed multiple ${category} tasks previously`
        );
    } else if (
        breakdown.history >= 3
    ) {
        reasons.push(
            `has previous ${category} task experience`
        );
    }

    return (
        `Match score ${score}/100 based on ` +
        `${reasons.slice(0, 3).join(', ')}.`
    );
}


// ─────────────────────────────────────────────────────────────────────────────
// URGENCY LABEL
// ─────────────────────────────────────────────────────────────────────────────

function getUrgencyLevel(
    urgency
) {
    if (urgency >= 5) {
        return 'critical';
    }

    if (urgency >= 4) {
        return 'high';
    }

    if (urgency >= 3) {
        return 'medium';
    }

    if (urgency >= 2) {
        return 'low';
    }

    return 'minimal';
}


// ─────────────────────────────────────────────────────────────────────────────
// EXPORT
// ─────────────────────────────────────────────────────────────────────────────

module.exports = {
    matchVolunteersToNeed,
};