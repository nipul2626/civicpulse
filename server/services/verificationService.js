require('dotenv').config();

const crypto = require('crypto');
const sanitizeHtml = require('sanitize-html');
const { db } = require('./firebase');
const { COLLECTIONS } = require('../config/schema');

/*
 * CivicPulse Verification Engine
 *
 * IMPORTANT:
 * This does NOT prove that a report is true.
 *
 * It estimates how well-supported a report is using multiple signals:
 *
 *   Reporter history       20 points
 *   Message quality        20 points
 *   Location evidence      20 points
 *   Duplicate/corroboration 20 points
 *   Suspicion/spam         20 points
 *
 * Total = 100
 *
 * 70-100 -> high confidence -> eligible for ACTIVE after AI
 * 45-69  -> review required
 * 0-44   -> review required / suspicious
 */

const CONFIG = {
    highConfidence: 70,
    reviewThreshold: 45,

    reporterWeight: 20,
    messageWeight: 20,
    locationWeight: 20,
    corroborationWeight: 20,
    suspicionWeight: 20,

    recentReportHours: 24,
    reporterHistoryDays: 90,
    duplicateLookbackHours: 24,

    maxHistoryDocs: 50,
    maxRecentDocs: 50,
};

/* -------------------------------------------------------------------------- */
/* Utility                                                                    */
/* -------------------------------------------------------------------------- */

function normalizeText(value = '') {
    return String(value)
        .toLowerCase()
        .normalize('NFKC')
        .replace(/[^\p{L}\p{N}\s]/gu, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

function tokenize(value = '') {
    return normalizeText(value)
        .split(' ')
        .filter(word => word.length >= 3);
}

function clamp(value, min = 0, max = 100) {
    return Math.max(min, Math.min(max, value));
}

function hashReporter(value = '') {
    const secret = process.env.VERIFICATION_HASH_SECRET ||
        process.env.TWILIO_AUTH_TOKEN ||
        'civicpulse-verification';

    return crypto
        .createHmac('sha256', secret)
        .update(String(value))
        .digest('hex');
}

function getReporterKey(phone) {
    if (!phone) return null;

    const normalized = String(phone)
        .replace(/^whatsapp:/i, '')
        .replace(/[^\d+]/g, '');

    return hashReporter(normalized);
}

function safeNumber(value, fallback = 0) {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
}

/* -------------------------------------------------------------------------- */
/* 1. Reporter history — 20 points                                           */
/* -------------------------------------------------------------------------- */

async function scoreReporterHistory(reporterKey) {
    if (!reporterKey) {
        return {
            score: 5,
            reports: 0,
            confirmed: 0,
            rejected: 0,
            reason: 'Reporter history unavailable',
        };
    }

    try {
        const since = new Date(
            Date.now() -
            CONFIG.reporterHistoryDays * 24 * 60 * 60 * 1000
        );

        const snap = await db
            .collection(COLLECTIONS.NEEDS)
            .where('reporterKey', '==', reporterKey)
            .limit(CONFIG.maxHistoryDocs)
            .get();

        let reports = 0;
        let confirmed = 0;
        let rejected = 0;

        snap.docs.forEach(doc => {
            const data = doc.data();

            const createdAt = data.createdAt?.toDate
                ? data.createdAt.toDate()
                : new Date(data.createdAt || 0);

            if (createdAt < since) return;

            reports++;

            const verificationStatus =
                data.verification?.status ||
                data.verificationStatus;

            if (
                verificationStatus === 'verified' ||
                verificationStatus === 'approved' ||
                verificationStatus === 'active'
            ) {
                confirmed++;
            }

            if (
                verificationStatus === 'rejected' ||
                verificationStatus === 'spam'
            ) {
                rejected++;
            }
        });

        if (reports === 0) {
            return {
                score: 10,
                reports: 0,
                confirmed: 0,
                rejected: 0,
                reason: 'New reporter — insufficient history',
            };
        }

        const confirmationRate = confirmed / reports;
        const rejectionRate = rejected / reports;

        let score = 10;

        score += Math.round(confirmationRate * 10);
        score -= Math.round(rejectionRate * 15);

        if (confirmed >= 5 && rejectionRate === 0) {
            score += 3;
        }

        return {
            score: clamp(score, 0, 20),
            reports,
            confirmed,
            rejected,
            reason:
                `${confirmed} confirmed of ${reports} previous reports`,
        };

    } catch (err) {
        console.warn(
            '⚠️ Reporter verification history failed:',
            err.message
        );

        return {
            score: 8,
            reports: 0,
            confirmed: 0,
            rejected: 0,
            reason: 'History check unavailable',
        };
    }
}

/* -------------------------------------------------------------------------- */
/* 2. Message quality — 20 points                                             */
/* -------------------------------------------------------------------------- */

function scoreMessageQuality({
                                 title,
                                 description,
                                 category,
                                 affectedCount,
                             }) {
    const text = normalizeText(
        `${title || ''} ${description || ''}`
    );

    if (!text) {
        return {
            score: 0,
            reasons: ['Empty message'],
        };
    }

    let score = 0;
    const reasons = [];

    const length = text.length;

    if (length >= 20) {
        score += 5;
        reasons.push('Sufficient detail');
    } else if (length >= 10) {
        score += 3;
    } else {
        reasons.push('Very short report');
    }

    const tokens = tokenize(text);

    if (tokens.length >= 6) {
        score += 4;
        reasons.push('Descriptive message');
    } else if (tokens.length >= 3) {
        score += 2;
    }

    const problemIndicators = [
        'need',
        'required',
        'shortage',
        'problem',
        'emergency',
        'help',
        'affected',
        'families',
        'students',
        'residents',
        'people',
        'children',
        'patients',
        'water',
        'food',
        'medicine',
        'shelter',
    ];

    if (problemIndicators.some(word => tokens.includes(word))) {
        score += 4;
        reasons.push('Contains concrete need information');
    }

    if (category && category !== 'other') {
        score += 3;
        reasons.push(`Specific category: ${category}`);
    }

    const count = safeNumber(affectedCount, 0);

    if (count > 0 && count <= 10000) {
        score += 2;
    }

    // Generic/vague messages should lose confidence.
    const vaguePatterns = [
        /^help me$/,
        /^need help$/,
        /^please help$/,
        /^urgent$/,
        /^emergency$/,
        /^support needed$/,
        /^community support needed$/,
    ];

    if (vaguePatterns.some(pattern => pattern.test(text))) {
        score -= 8;
        reasons.push('Message is too vague');
    }

    return {
        score: clamp(score, 0, 20),
        reasons,
    };
}

/* -------------------------------------------------------------------------- */
/* 3. Location evidence — 20 points                                           */
/* -------------------------------------------------------------------------- */

function scoreLocation(location) {
    const address = normalizeText(location?.address || '');
    const lat = Number(location?.lat);
    const lng = Number(location?.lng);

    let score = 0;
    const reasons = [];

    const validCoordinates =
        Number.isFinite(lat) &&
        Number.isFinite(lng) &&
        lat >= -90 &&
        lat <= 90 &&
        lng >= -180 &&
        lng <= 180;

    if (validCoordinates) {
        score += 12;
        reasons.push('Valid geographic coordinates');
    }

    if (address) {
        const words = address
            .split(' ')
            .filter(Boolean);

        if (words.length >= 2) {
            score += 5;
            reasons.push('Specific location provided');
        } else {
            score += 2;
        }
    }

    if (
        address.includes('unknown') ||
        address.includes('somewhere') ||
        address.includes('anywhere') ||
        address.includes('our area')
    ) {
        score -= 6;
        reasons.push('Location is vague');
    }

    return {
        score: clamp(score, 0, 20),
        reasons,
        validCoordinates,
    };
}

/* -------------------------------------------------------------------------- */
/* 4. Duplicate / corroboration detection — 20 points                        */
/* -------------------------------------------------------------------------- */

function calculateTokenSimilarity(a, b) {
    const aTokens = new Set(tokenize(a));
    const bTokens = new Set(tokenize(b));

    if (!aTokens.size || !bTokens.size) return 0;

    let intersection = 0;

    for (const token of aTokens) {
        if (bTokens.has(token)) {
            intersection++;
        }
    }

    const union = new Set([
        ...aTokens,
        ...bTokens,
    ]).size;

    return union === 0 ? 0 : intersection / union;
}

async function findRelatedReports({
                                      category,
                                      description,
                                      location,
                                      reporterKey,
                                  }) {
    try {
        const since = new Date(
            Date.now() -
            CONFIG.duplicateLookbackHours * 60 * 60 * 1000
        );

        /*
         * Deliberately use a simple Firestore query here.
         * This avoids requiring a new composite index just for verification.
         */
        let query = db
            .collection(COLLECTIONS.NEEDS)
            .where('category', '==', category || 'other')
            .limit(CONFIG.maxRecentDocs);

        const snap = await query.get();

        const reports = [];

        for (const doc of snap.docs) {
            const data = doc.data();

            if (data.reporterKey === reporterKey) {
                continue;
            }

            const createdAt = data.createdAt?.toDate
                ? data.createdAt.toDate()
                : new Date(data.createdAt || 0);

            if (createdAt < since) continue;

            const similarity = calculateTokenSimilarity(
                description,
                data.description || data.title || ''
            );

            if (similarity < 0.30) continue;

            let locationSimilarity = 0;

            const currentAddress =
                normalizeText(location?.address || '');

            const existingAddress =
                normalizeText(data.location?.address || '');

            if (
                currentAddress &&
                existingAddress &&
                (
                    currentAddress.includes(existingAddress) ||
                    existingAddress.includes(currentAddress)
                )
            ) {
                locationSimilarity = 1;
            }

            const currentLat = Number(location?.lat);
            const currentLng = Number(location?.lng);
            const existingLat = Number(data.location?.lat);
            const existingLng = Number(data.location?.lng);

            if (
                Number.isFinite(currentLat) &&
                Number.isFinite(currentLng) &&
                Number.isFinite(existingLat) &&
                Number.isFinite(existingLng)
            ) {
                const distance =
                    haversineKm(
                        currentLat,
                        currentLng,
                        existingLat,
                        existingLng
                    );

                if (distance <= 1) {
                    locationSimilarity = 1;
                } else if (distance <= 5) {
                    locationSimilarity = 0.5;
                }
            }

            reports.push({
                id: doc.id,
                similarity,
                locationSimilarity,
                sameLocation: locationSimilarity >= 1,
                data,
            });
        }

        reports.sort(
            (a, b) =>
                (
                    b.similarity +
                    b.locationSimilarity
                ) -
                (
                    a.similarity +
                    a.locationSimilarity
                )
        );

        return reports;

    } catch (err) {
        console.warn(
            '⚠️ Related report search failed:',
            err.message
        );

        return [];
    }
}

function calculateCorroborationScore(relatedReports) {
    if (!relatedReports.length) {
        return {
            score: 8,
            relatedCount: 0,
            strongestSimilarity: 0,
            reasons: ['No independent corroboration yet'],
        };
    }

    const strongest = relatedReports[0];

    let score = 8;

    if (strongest.similarity >= 0.65) {
        score += 6;
    } else if (strongest.similarity >= 0.45) {
        score += 3;
    }

    const sameLocationReports =
        relatedReports.filter(r => r.sameLocation).length;

    if (sameLocationReports >= 1) {
        score += 4;
    }

    if (relatedReports.length >= 2) {
        score += 2;
    }

    return {
        score: clamp(score, 0, 20),
        relatedCount: relatedReports.length,
        strongestSimilarity: strongest.similarity,
        reasons: [
            `${relatedReports.length} related report(s) found`,
            sameLocationReports > 0
                ? 'Independent report from same location'
                : 'Related report found',
        ],
    };
}

/* -------------------------------------------------------------------------- */
/* 5. Suspicion / spam — 20 points                                             */
/* -------------------------------------------------------------------------- */

function scoreSuspicion({
                            title,
                            description,
                            affectedCount,
                        }) {
    const text = normalizeText(
        `${title || ''} ${description || ''}`
    );

    let score = 20;
    const reasons = [];

    const suspiciousPatterns = [
        /send money/i,
        /send me money/i,
        /pay me/i,
        /upi/i,
        /bank account/i,
        /credit card/i,
        /otp/i,
        /password/i,
        /free money/i,
        /investment/i,
        /crypto/i,
        /loan/i,
    ];

    const matchedSuspicious =
        suspiciousPatterns.filter(pattern =>
            pattern.test(text)
        );

    if (matchedSuspicious.length > 0) {
        score -= Math.min(
            14,
            matchedSuspicious.length * 7
        );

        reasons.push(
            'Contains potentially unrelated financial/request language'
        );
    }

    // Excessive repetition is suspicious.
    const words = tokenize(text);

    if (words.length >= 8) {
        const counts = {};

        for (const word of words) {
            counts[word] = (counts[word] || 0) + 1;
        }

        const maxRepeat = Math.max(
            ...Object.values(counts)
        );

        if (maxRepeat >= Math.ceil(words.length * 0.5)) {
            score -= 6;
            reasons.push('Highly repetitive message');
        }
    }

    const count = safeNumber(affectedCount, 0);

    if (count > 1000000) {
        score -= 8;
        reasons.push('Unusually large affected count');
    }

    return {
        score: clamp(score, 0, 20),
        reasons,
    };
}

/* -------------------------------------------------------------------------- */
/* Haversine                                                                   */
/* -------------------------------------------------------------------------- */

function haversineKm(lat1, lng1, lat2, lng2) {
    const R = 6371;

    const dLat =
        ((lat2 - lat1) * Math.PI) / 180;

    const dLng =
        ((lng2 - lng1) * Math.PI) / 180;

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

/* -------------------------------------------------------------------------- */
/* Main verification function                                                  */
/* -------------------------------------------------------------------------- */

async function verifyNeed({
                              phone,
                              title,
                              description,
                              category,
                              location,
                              affectedCount,
                          }) {
    const reporterKey = getReporterKey(phone);

    const [
        reporter,
        relatedReports,
    ] = await Promise.all([
        scoreReporterHistory(reporterKey),

        findRelatedReports({
            category,
            description,
            location,
            reporterKey,
        }),
    ]);

    const message = scoreMessageQuality({
        title,
        description,
        category,
        affectedCount,
    });

    const locationResult =
        scoreLocation(location);

    const corroboration =
        calculateCorroborationScore(
            relatedReports
        );

    const suspicion = scoreSuspicion({
        title,
        description,
        affectedCount,
    });

    const score = clamp(
        reporter.score +
        message.score +
        locationResult.score +
        corroboration.score +
        suspicion.score,
        0,
        100
    );

    let status = 'pending_review';

    if (score >= CONFIG.highConfidence) {
        status = 'verified';
    }

    const reasons = [
        ...(message.reasons || []),
        ...(locationResult.reasons || []),
        ...(corroboration.reasons || []),
        ...(suspicion.reasons || []),
        reporter.reason,
    ];

    return {
        score,

        status,

        requiresHumanReview:
            status !== 'verified',

        reporterKey,

        signals: {
            reporterTrust: reporter.score,
            messageQuality: message.score,
            location: locationResult.score,
            corroboration: corroboration.score,
            suspicion: suspicion.score,
        },

        details: {
            reporter,
            message,
            location: locationResult,
            corroboration,
            suspicion,
        },

        relatedReports: relatedReports
            .slice(0, 5)
            .map(report => ({
                id: report.id,
                similarity:
                    Number(
                        report.similarity.toFixed(2)
                    ),
                sameLocation:
                report.sameLocation,
            })),

        reasons: [
            ...new Set(reasons),
        ].slice(0, 10),

        verifiedAt:
            status === 'verified'
                ? new Date()
                : null,

        verificationMethod:
            'multi_signal_automated',
    };
}

/* -------------------------------------------------------------------------- */
/* Exports                                                                    */
/* -------------------------------------------------------------------------- */

module.exports = {
    verifyNeed,
    getReporterKey,
    hashReporter,
    normalizeText,
    calculateTokenSimilarity,
};