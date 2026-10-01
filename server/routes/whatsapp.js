require('dotenv').config();

const express = require('express');
const router = express.Router();
const twilio = require('twilio');
const sanitizeHtml = require('sanitize-html');
const { v4: uuidv4 } = require('uuid');

const { db } = require('../services/firebase');

const {
    COLLECTIONS,
    CATEGORY_PRIORITY,
    VALID_CATEGORIES,
} = require('../config/schema');

const {
    parseIncomingMessage,
    sendWhatsApp,
    sendSMS,
    getNeedAcknowledgmentMessage,
} = require('../services/twilioService');

const {
    detectLanguage,
    getWhatsAppHelpMessage,
} = require('../services/languageService');

const {
    enqueueAIJob,
} = require('../services/aiQueue');

const cache = require('../services/cacheService');

const {
    verifyNeed,
} = require('../services/verificationService');


/* ==========================================================================
   CONFIGURATION
   ========================================================================== */

const VERIFICATION_CONFIG = {
    // High-confidence reports become eligible for ACTIVE after AI.
    highConfidenceScore: 70,

    // Reports below this require human review.
    reviewStatus: 'pending_review',

    // Do not allow huge WhatsApp messages.
    maxMessageLength: 2000,

    // Prevent repeated identical submissions from the same phone.
    sameReporterDuplicateHours: 24,
};


/* ==========================================================================
   TWILIO SIGNATURE VALIDATION
   ========================================================================== */

function validateTwilioSignature(req) {
    /*
     * Development:
     * allow local/Postman testing.
     *
     * Production:
     * validate every incoming webhook against Twilio.
     */

    if (process.env.NODE_ENV !== 'production') {
        return true;
    }

    const authToken =
        process.env.TWILIO_AUTH_TOKEN;

    if (!authToken) {
        console.warn(
            '⚠️ TWILIO_AUTH_TOKEN missing — webhook signature validation skipped'
        );

        return false;
    }

    const signature =
        req.headers['x-twilio-signature'];

    if (!signature) {
        return false;
    }

    const url =
        `${req.protocol}://${req.get('host')}${req.originalUrl}`;

    return twilio.validateRequest(
        authToken,
        signature,
        url,
        req.body
    );
}


/* ==========================================================================
   TEXT HELPERS
   ========================================================================== */

function normalizeText(text = '') {
    return String(text)
        .toLowerCase()
        .normalize('NFKC')
        .replace(/[^\p{L}\p{N}\s]/gu, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}


function extractAffectedCount(text = '') {
    const patterns = [
        /(\d[\d,]*)\s*(?:people|persons|person|families|family|students|children|residents|patients)/i,
        /(?:for|affecting|impacting)\s+(\d[\d,]*)/i,
        /(\d[\d,]*)\s*(?:लोग|परिवार|विद्यार्थी|लोक|कुटुंब|మంది|కుటుంబాలు)/i,
    ];

    for (const pattern of patterns) {
        const match = text.match(pattern);

        if (match) {
            const count =
                Number(
                    String(match[1])
                        .replace(/,/g, '')
                );

            if (
                Number.isFinite(count) &&
                count > 0 &&
                count <= 1000000
            ) {
                return count;
            }
        }
    }

    return 1;
}


/*
 * Better location extraction than the original:
 *
 * "in Karvenagar, Pune"
 * "at Maisammaguda"
 * "near Hanuman Temple Road"
 *
 * We intentionally do NOT treat "in our area" or "in need of help"
 * as a useful location.
 */
function extractLocationHint(text = '') {
    const patterns = [
        /\b(?:in|at|near)\s+([A-Za-z][A-Za-z0-9 .,'-]{2,80}?)(?=\s+(?:and|with|where|for|affecting|need|needs|required|urgently|please)\b|[.!?]|$)/i,

        /(?:में|पर|पास|जवळ|मध्ये)\s+([^\n।,.!?]{2,60})/i,

        /(?:లో|వద్ద|దగ్గర)\s+([^\n,.!?]{2,60})/i,
    ];

    for (const pattern of patterns) {
        const match = text.match(pattern);

        if (!match) continue;

        const value = match[1]
            .trim()
            .replace(/\s+/g, ' ');

        if (!value) continue;

        const normalized =
            normalizeText(value);

        const invalid = [
            'our area',
            'the area',
            'need help',
            'need of help',
            'need assistance',
            'this situation',
            'this problem',
            'an emergency',
            'urgent help',
        ];

        if (
            invalid.some(
                item => normalized === item
            )
        ) {
            continue;
        }

        return value;
    }

    return null;
}


function inferCategory(text, parsedCategory) {
    const normalized =
        normalizeText(text);

    const patterns = {
        food: [
            'food',
            'hungry',
            'meal',
            'meals',
            'rice',
            'groceries',
            'ration',
            'खाना',
            'भोजन',
            'अन्न',
        ],

        water: [
            'water',
            'drinking water',
            'water shortage',
            'paani',
            'पानी',
            'पाणी',
            'నీరు',
        ],

        medical: [
            'medical',
            'medicine',
            'doctor',
            'hospital',
            'injury',
            'patient',
            'ambulance',
            'दवा',
            'अस्पताल',
        ],

        shelter: [
            'shelter',
            'homeless',
            'roof',
            'house damaged',
            'घर',
            'आश्रय',
        ],

        education: [
            'school',
            'student',
            'students',
            'books',
            'teacher',
            'education',
            'school supplies',
        ],

        livelihood: [
            'job',
            'employment',
            'work',
            'income',
            'livelihood',
        ],

        sanitation: [
            'toilet',
            'garbage',
            'waste',
            'sewage',
            'drain',
            'sanitation',
        ],
    };

    /*
     * Prefer an explicitly detected category when useful.
     */
    if (
        VALID_CATEGORIES.includes(parsedCategory) &&
        parsedCategory !== 'other'
    ) {
        return parsedCategory;
    }

    for (const [category, keywords] of Object.entries(patterns)) {
        if (
            keywords.some(
                keyword =>
                    normalized.includes(
                        normalizeText(keyword)
                    )
            )
        ) {
            return category;
        }
    }

    return 'other';
}


/* ==========================================================================
   SAME-REPORTER DUPLICATE CHECK
   ========================================================================== */

async function findRecentReporterDuplicate(
    reporterKey,
    text,
) {
    if (!reporterKey) {
        return null;
    }

    try {
        const snap =
            await db
                .collection(COLLECTIONS.NEEDS)
                .where(
                    'reporterKey',
                    '==',
                    reporterKey
                )
                .limit(20)
                .get();

        const normalizedIncoming =
            normalizeText(text);

        const cutoff =
            Date.now() -
            VERIFICATION_CONFIG.sameReporterDuplicateHours *
            60 *
            60 *
            1000;

        for (const doc of snap.docs) {
            const data = doc.data();

            const createdAt =
                data.createdAt?.toDate
                    ? data.createdAt.toDate().getTime()
                    : new Date(
                        data.createdAt || 0
                    ).getTime();

            if (
                !Number.isFinite(createdAt) ||
                createdAt < cutoff
            ) {
                continue;
            }

            const existingText =
                normalizeText(
                    data.description ||
                    data.originalText ||
                    data.title ||
                    ''
                );

            if (
                existingText &&
                existingText === normalizedIncoming
            ) {
                return {
                    id: doc.id,
                    data,
                };
            }
        }

        return null;

    } catch (err) {
        console.warn(
            '⚠️ Reporter duplicate check failed:',
            err.message
        );

        return null;
    }
}


/* ==========================================================================
   HELP
   ========================================================================== */

router.post(
    '/incoming',
    express.urlencoded({
        extended: false,
    }),
    async (req, res) => {

        if (!validateTwilioSignature(req)) {
            console.warn(
                '🚫 Invalid Twilio webhook signature'
            );

            return res
                .status(403)
                .send('Forbidden');
        }

        const {
            Body,
            From,
            To,
        } = req.body;

        if (!Body || !From) {
            return res
                .status(400)
                .send(
                    'Missing Body or From'
                );
        }

        const isWhatsApp =
            String(From).startsWith(
                'whatsapp:'
            );

        const phoneNumber =
            String(From)
                .replace(/^whatsapp:/, '');

        const channel =
            isWhatsApp
                ? 'whatsapp'
                : 'sms';

        console.log(
            `📨 Incoming ${channel} from ${phoneNumber}: "${String(Body).substring(0, 100)}..."`
        );


        /* ------------------------------------------------------------------
           Commands
        ------------------------------------------------------------------ */

        const command =
            String(Body)
                .trim()
                .toUpperCase();

        if (
            command === 'HELP' ||
            command === 'HELP ME' ||
            command === 'मदद' ||
            command === 'मदत'
        ) {
            const langResult =
                detectLanguage(Body);

            const helpMessage =
                getWhatsAppHelpMessage(
                    langResult.name
                );

            if (isWhatsApp) {
                await sendWhatsApp(
                    From,
                    helpMessage
                );
            } else {
                await sendSMS(
                    phoneNumber,
                    helpMessage
                );
            }

            res.set(
                'Content-Type',
                'text/xml'
            );

            return res.send(
                '<Response></Response>'
            );
        }


        if (
            command === 'STOP' ||
            command === 'UNSUBSCRIBE'
        ) {
            res.set(
                'Content-Type',
                'text/xml'
            );

            return res.send(
                '<Response></Response>'
            );
        }


        /* ------------------------------------------------------------------
           Main report processing
        ------------------------------------------------------------------ */

        try {
            if (
                String(Body).length >
                VERIFICATION_CONFIG.maxMessageLength
            ) {
                const message =
                    'Your message is too long. Please send a shorter description of the community need, including what happened, where, and how many people are affected.';

                if (isWhatsApp) {
                    await sendWhatsApp(
                        From,
                        message
                    );
                } else {
                    await sendSMS(
                        phoneNumber,
                        message
                    );
                }

                res.set(
                    'Content-Type',
                    'text/xml'
                );

                return res.send(
                    '<Response></Response>'
                );
            }


            /* --------------------------------------------------------------
               Language
            -------------------------------------------------------------- */

            const langResult =
                detectLanguage(Body);

            console.log(
                `🌐 Detected language: ${langResult.name} (${langResult.code})`
            );


            /* --------------------------------------------------------------
               Sanitize
            -------------------------------------------------------------- */

            const cleanBody =
                sanitizeHtml(
                    String(Body),
                    {
                        allowedTags: [],
                        allowedAttributes: {},
                    }
                ).trim();


            if (cleanBody.length < 10) {
                const message =
                    getWhatsAppHelpMessage(
                        langResult.name
                    );

                if (isWhatsApp) {
                    await sendWhatsApp(
                        From,
                        message
                    );
                } else {
                    await sendSMS(
                        phoneNumber,
                        message
                    );
                }

                res.set(
                    'Content-Type',
                    'text/xml'
                );

                return res.send(
                    '<Response></Response>'
                );
            }


            /* --------------------------------------------------------------
               Parse
            -------------------------------------------------------------- */

            const parsed =
                parseIncomingMessage(
                    cleanBody,
                    phoneNumber,
                    langResult.name
                );

            const category =
                inferCategory(
                    cleanBody,
                    parsed.detectedCategory
                );

            const locationHint =
                extractLocationHint(
                    cleanBody
                );

            const affectedCount =
                extractAffectedCount(
                    cleanBody
                );


            /* --------------------------------------------------------------
               Reporter identity
               -------------------------------------------------------------- */

            /*
             * verifyNeed() creates a privacy-preserving HMAC hash.
             * We do not store the raw phone number as the trust key.
             */

            const {
                getReporterKey,
            } = require(
                '../services/verificationService'
            );

            const reporterKey =
                getReporterKey(
                    phoneNumber
                );


            /* --------------------------------------------------------------
               Exact duplicate from same reporter
            -------------------------------------------------------------- */

            const existingDuplicate =
                await findRecentReporterDuplicate(
                    reporterKey,
                    cleanBody
                );

            if (existingDuplicate) {

                const existingRef =
                    db
                        .collection(
                            COLLECTIONS.NEEDS
                        )
                        .doc(
                            existingDuplicate.id
                        );

                const existingData =
                    existingDuplicate.data;

                await existingRef.update({
                    affectedCount:
                        (
                            existingData.affectedCount ||
                            1
                        ) + affectedCount,

                    lastReportedAt:
                        new Date(),

                    duplicateReports:
                        (
                            existingData.duplicateReports ||
                            0
                        ) + 1,
                });

                const duplicateMessage =
                    `ℹ️ We already have a similar report from you (ID: ${existingDuplicate.id.substring(0, 8)}). We added your latest report to it.`;

                if (isWhatsApp) {
                    await sendWhatsApp(
                        From,
                        duplicateMessage
                    );
                } else {
                    await sendSMS(
                        phoneNumber,
                        duplicateMessage
                    );
                }

                res.set(
                    'Content-Type',
                    'text/xml'
                );

                return res.send(
                    '<Response></Response>'
                );
            }


            /* --------------------------------------------------------------
               Location
            -------------------------------------------------------------- */

            const location = {
                lat: null,
                lng: null,
                address:
                    locationHint ||
                    'Location not provided — submitted via WhatsApp',
            };


            /* --------------------------------------------------------------
               Verification
            -------------------------------------------------------------- */

            console.log(
                `🔍 Verifying incoming ${channel} report...`
            );

            const verification =
                await verifyNeed({
                    phone: phoneNumber,
                    title:
                        cleanBody.substring(
                            0,
                            100
                        ),
                    description:
                    cleanBody,
                    category,
                    location,
                    affectedCount,
                });


            console.log(
                `🔎 Verification score: ${verification.score}/100 (${verification.status})`
            );


            /* --------------------------------------------------------------
               Need document
            -------------------------------------------------------------- */

            const needId =
                uuidv4();

            const initialStatus =
                verification.status ===
                'verified'
                    ? 'pending_ai'
                    : 'pending_review';


            const needData = {
                id: needId,

                title:
                    cleanBody.substring(
                        0,
                        100
                    ),

                description:
                cleanBody,

                category,

                urgencyScore: null,

                status: initialStatus,

                location,

                affectedCount,

                vulnerabilityFlag: false,

                reportedBy:
                    `${channel}:${phoneNumber}`,

                submitterPhone:
                phoneNumber,

                submitterChannel:
                channel,

                submittedVia:
                channel,

                orgId: null,

                reporterKey,

                isDuplicate: false,

                mergedFrom: [],

                duplicateReports: 0,

                photoURL: null,

                voiceTranscript: null,

                originalText:
                    langResult.isEnglish
                        ? null
                        : cleanBody,

                translatedText: null,

                detectedLanguage:
                langResult.name,

                useMultilingual:
                    !langResult.isEnglish,

                createdAt:
                    new Date(),

                processedAt: null,

                verification: {
                    score:
                    verification.score,

                    status:
                    verification.status,

                    requiresHumanReview:
                    verification.requiresHumanReview,

                    signals:
                    verification.signals,

                    details:
                    verification.details,

                    relatedReports:
                    verification.relatedReports,

                    reasons:
                    verification.reasons,

                    verificationMethod:
                    verification.verificationMethod,

                    verifiedAt:
                    verification.verifiedAt,

                    reviewedBy: null,

                    reviewedAt: null,

                    reviewDecision: null,
                },
            };


            await db
                .collection(
                    COLLECTIONS.NEEDS
                )
                .doc(needId)
                .set(needData);


            /* --------------------------------------------------------------
               Queue AI only for verified/high-confidence reports.
               Reports requiring review are NOT sent to active heatmap.
            -------------------------------------------------------------- */

            let jobId = null;
            let cached = false;
            let result = null;

            if (
                verification.score >=
                VERIFICATION_CONFIG.highConfidenceScore
            ) {

                const priority =
                    CATEGORY_PRIORITY[
                        category
                        ] || 2;

                const queueResult =
                    await enqueueAIJob(
                        'scoreNeed',
                        {
                            ...needData,
                            needId,
                        },
                        priority,
                        null
                    );

                jobId =
                    queueResult.jobId;

                cached =
                    queueResult.cached;

                result =
                    queueResult.result;


                /* ----------------------------------------------------------
                   Cached AI result
                ---------------------------------------------------------- */

                if (
                    cached &&
                    result
                ) {
                    await db
                        .collection(
                            COLLECTIONS.NEEDS
                        )
                        .doc(needId)
                        .update({
                            urgencyScore:
                            result.urgencyScore,

                            aiCategory:
                            result.category,

                            affectedCount:
                                result.affectedCount ||
                                affectedCount,

                            vulnerabilityFlag:
                            result.vulnerabilityFlag,

                            aiSummary:
                            result.summary,

                            status:
                                'active',

                            processedAt:
                                new Date(),

                            verification: {
                                ...needData.verification,

                                status:
                                    'verified',

                                verifiedAt:
                                    new Date(),
                            },
                        });
                }

            } else {

                console.log(
                    `⏸️ Need ${needId} requires human verification — score ${verification.score}/100`
                );
            }


            /* --------------------------------------------------------------
               Cache invalidation
            -------------------------------------------------------------- */

            await cache.del(
                'heatmap:all'
            );

            await cache.delPattern(
                'impact:*'
            );


            /* --------------------------------------------------------------
               User acknowledgement
            -------------------------------------------------------------- */

            let ackMessage;

            if (
                verification.score <
                VERIFICATION_CONFIG.highConfidenceScore
            ) {

                ackMessage =
                    `📝 We received your report (ID: ${needId.substring(0, 8)}). It has been submitted for verification. We may contact you if more information is needed.`;

            } else {

                ackMessage =
                    getNeedAcknowledgmentMessage(
                        needId,
                        langResult.name
                    );
            }


            if (isWhatsApp) {
                await sendWhatsApp(
                    From,
                    ackMessage
                );
            } else {
                await sendSMS(
                    phoneNumber,
                    ackMessage
                );
            }


            /* --------------------------------------------------------------
               Response
            -------------------------------------------------------------- */

            console.log(
                `✅ Need ${needId} created from ${channel}`
            );

            console.log(
                `   Category: ${category}`
            );

            console.log(
                `   Location: ${location.address}`
            );

            console.log(
                `   Verification: ${verification.score}/100`
            );

            console.log(
                `   Status: ${cached ? 'active' : initialStatus}`
            );


            res.set(
                'Content-Type',
                'text/xml'
            );

            return res.send(
                '<Response></Response>'
            );

        } catch (err) {

            console.error(
                '❌ WhatsApp webhook error:',
                err
            );

            const errorMsg =
                'We received your message but had a technical issue processing it. Please try again.';

            try {
                if (isWhatsApp) {
                    await sendWhatsApp(
                        From,
                        errorMsg
                    );
                } else {
                    await sendSMS(
                        phoneNumber,
                        errorMsg
                    );
                }
            } catch {}

            res.set(
                'Content-Type',
                'text/xml'
            );

            return res.send(
                '<Response></Response>'
            );
        }
    }
);


/* ==========================================================================
   STATUS
   ========================================================================== */

router.get(
    '/status',
    (req, res) => {

        const configured =
            !!(
                process.env.TWILIO_ACCOUNT_SID &&
                process.env.TWILIO_AUTH_TOKEN &&
                process.env.TWILIO_PHONE_NUMBER
            );

        res.json({
            success: true,

            data: {
                configured,

                smsEnabled:
                    configured &&
                    !!process.env.TWILIO_PHONE_NUMBER,

                whatsappEnabled:
                    configured &&
                    !!process.env.TWILIO_WHATSAPP_NUMBER,

                webhookUrl:
                    `https://civicpulse-backend-klzk.onrender.com/api/whatsapp/incoming`,

                verification: {
                    enabled: true,

                    highConfidenceThreshold:
                    VERIFICATION_CONFIG
                        .highConfidenceScore,

                    reviewStatus:
                    VERIFICATION_CONFIG
                        .reviewStatus,
                },

                sandboxInstructions:
                    !configured
                        ? 'Add TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN and TWILIO_PHONE_NUMBER to .env'
                        : null,
            },
        });
    }
);


module.exports = router;