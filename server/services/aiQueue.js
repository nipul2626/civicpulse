require('dotenv').config();
const { v4: uuidv4 } = require('uuid');
const { db } = require('./firebase');
const { scoreNeedBatch, scoreNeed, scoreNeedMultilingual } = require('./aiService');
const { COLLECTIONS } = require('../config/schema');

// ── Redis setup with in-memory fallback ──────────────────────────────────────
let redis = null;
const inMemoryQueue = [];

try {
    const Redis = require('ioredis');
    redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
        lazyConnect: true,
        connectTimeout: 3000,
    });
    redis.connect().catch(() => {
        console.log('⚠️  Redis unavailable — using in-memory queue (dev mode)');
        redis = null;
    });
} catch {
    console.log('⚠️  ioredis not found — using in-memory queue');
}

// ── Simple djb2 hash for semantic cache key ───────────────────────────────────
function hashText(str) {
    let hash = 5381;
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) + hash) + str.charCodeAt(i);
        hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
}

function normalizeText(text = '') {
    return text.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(' ').sort().join('_');
}

function getCacheKey(payload) {
    const normalized = normalizeText(`${payload.title || ''} ${payload.description || ''}`);
    return `civic_cache_${hashText(normalized)}`;
}

// ── Enqueue ───────────────────────────────────────────────────────────────────
async function enqueueAIJob(type, payload, priority = 3, orgId = null) {
    // Semantic cache check
    const cacheKey = getCacheKey(payload);
    if (redis) {
        const cached = await redis.get(cacheKey).catch(() => null);
        if (cached) {
            console.log(`Cache hit for job type=${type}`);
            return { jobId: null, cached: true, result: JSON.parse(cached) };
        }
    }

    const jobId = uuidv4();
    const job = {
        id: jobId,
        type,
        payload,
        priority,
        status: 'pending',
        retries: 0,
        createdAt: new Date().toISOString(),
        processedAt: null,
        result: null,
        orgId,
    };

    // Save to Firestore
    await db.collection(COLLECTIONS.AI_QUEUE).doc(jobId).set(job);

    // Add to Redis sorted set (lower score = higher priority processed first)
    if (redis) {
        const score = (6 - priority) * Date.now();
        await redis.zadd('civic_ai_queue', score, jobId).catch(() => {});
        await redis.setex(`civic_job_${jobId}`, 3600, JSON.stringify(job)).catch(() => {});
    } else {
        inMemoryQueue.push({ ...job, score: (6 - priority) * Date.now() });
        inMemoryQueue.sort((a, b) => a.score - b.score);
    }

    return { jobId, cached: false };
}

// ── Process next batch ────────────────────────────────────────────────────────
async function processNextBatch() {
    let jobIds = [];

    if (redis) {
        jobIds = await redis.zrange('civic_ai_queue', 0, 4).catch(() => []);
        if (jobIds.length === 0) return;
        await redis.zrem('civic_ai_queue', ...jobIds).catch(() => {});
    } else {
        if (inMemoryQueue.length === 0) return;
        const batch = inMemoryQueue.splice(0, 5);
        jobIds = batch.map(j => j.id);
    }

    // Fetch job payloads
    const jobs = await Promise.all(
        jobIds.map(async id => {
            const doc = await db.collection(COLLECTIONS.AI_QUEUE).doc(id).get();
            return doc.exists ? { id, ...doc.data() } : null;
        })
    );
    const validJobs = jobs.filter(Boolean);
    if (validJobs.length === 0) return;

    // Mark as processing
    await Promise.all(validJobs.map(j =>
        db.collection(COLLECTIONS.AI_QUEUE).doc(j.id).update({ status: 'processing' })
    ));

    try {
        const needsPayloads = validJobs.map(j => j.payload);

        const results = await Promise.all(
            needsPayloads.map(async (payload) => {
                if (payload.useMultilingual && payload.detectedLanguage) {
                    const r = await scoreNeedMultilingual(payload);

                    // ✅ Store translation in Firestore
                    if (r.translatedText && payload.needId) {
                        await db.collection(COLLECTIONS.NEEDS).doc(payload.needId).update({
                            translatedText: r.translatedText,
                            titleTranslated: r.data?.translatedTitle || null,
                            descriptionTranslated: r.data?.translatedDescription || null,
                        }).catch(() => {});
                    }

                    return r;
                }

                return scoreNeed(payload);
            })
        );
        await Promise.all(validJobs.map(async (job, idx) => {
            const result = results[idx]?.data || results[idx];
            const cacheKey = getCacheKey(job.payload);

            // Update Firestore job
            await db.collection(COLLECTIONS.AI_QUEUE).doc(job.id).update({
                status: 'done',
                result,
                processedAt: new Date().toISOString(),
            });

            // Update the actual need document with AI scores
            if (job.payload.needId) {
                await db.collection(COLLECTIONS.NEEDS).doc(job.payload.needId).update({
                    urgencyScore: result.urgencyScore,
                    aiCategory: result.category,
                    affectedCount: result.affectedCount,
                    vulnerabilityFlag: result.vulnerabilityFlag,
                    aiSummary: result.summary,
                    status: 'active',
                    processedAt: new Date().toISOString(),
                });
            }

            // Cache result
            if (redis) {
                await redis.setex(cacheKey, 6 * 3600, JSON.stringify(result)).catch(() => {});
            }
        }));

        console.log(`✅ Processed batch of ${validJobs.length} AI jobs`);
    } catch (err) {
        console.error('Batch processing error:', err.message);

        // Retry or fail jobs
        await Promise.all(validJobs.map(async job => {
            const retries = (job.retries || 0) + 1;
            if (retries >= 3) {
                await db.collection(COLLECTIONS.AI_QUEUE).doc(job.id).update({ status: 'failed', retries });
            } else {
                await db.collection(COLLECTIONS.AI_QUEUE).doc(job.id).update({ status: 'pending', retries });
                // Re-enqueue
                if (redis) {
                    const score = (6 - (job.priority || 3)) * Date.now();
                    await redis.zadd('civic_ai_queue', score, job.id).catch(() => {});
                } else {
                    inMemoryQueue.push(job);
                }
            }
        }));
    }
}

// ── Queue status ──────────────────────────────────────────────────────────────
async function getQueueStatus() {
    let pendingCount = 0;
    let processingCount = 0;

    if (redis) {
        pendingCount = await redis.zcard('civic_ai_queue').catch(() => 0);
    } else {
        pendingCount = inMemoryQueue.length;
    }

    const processingSnap = await db.collection(COLLECTIONS.AI_QUEUE)
        .where('status', '==', 'processing').limit(20).get();
    processingCount = processingSnap.size;

    // Avg wait: estimate 2.5s per batch of 5
    const avgWaitSeconds = Math.ceil((pendingCount / 5) * 2.5);

    // Provider health: check last 10 done jobs
    const recentSnap = await db.collection(COLLECTIONS.AI_QUEUE)
        .where('status', '==', 'done').orderBy('processedAt', 'desc').limit(10).get();
    const recentJobs = recentSnap.docs.map(d => d.data());
    const fallbackCount = recentJobs.filter(j => j.result?.provisional).length;

    return {
        pendingCount,
        processingCount,
        avgWaitSeconds,
        providerStatus: {
            groq: fallbackCount > 5 ? 'limited' : 'ok',
            gemini: 'ok',
        },
    };
}

async function getJobResult(jobId) {
    const doc = await db.collection(COLLECTIONS.AI_QUEUE).doc(jobId).get();
    return doc.exists ? doc.data() : null;
}

function startQueueProcessor() {
    console.log('🔄 AI queue processor started (2.5s interval)');
    setInterval(processNextBatch, 2500);
}

module.exports = { enqueueAIJob, getQueueStatus, getJobResult, startQueueProcessor };