require('dotenv').config();

// ── Redis setup with no-op fallback ──────────────────────────────────────────
let redisClient = null;

async function initRedis() {
    try {
        const Redis = require('ioredis');
        const client = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
            lazyConnect: true,
            connectTimeout: 3000,
            maxRetriesPerRequest: 1,
        });
        await client.connect();
        redisClient = client;
        console.log('✅ Redis connected');
    } catch (err) {
        console.warn('⚠️  Redis unavailable — running without cache (dev mode)');
        redisClient = null;
    }
}

// No-op fallback so app never crashes without Redis
const noOp = {
    get: async () => null,
    set: async () => null,
    del: async () => null,
    keys: async () => [],
};

function getClient() {
    return redisClient || noOp;
}

// ── Core cache operations ─────────────────────────────────────────────────────

async function get(key) {
    try {
        const raw = await getClient().get(key);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

async function set(key, value, ttlSeconds = 300) {
    try {
        await getClient().setex(key, ttlSeconds, JSON.stringify(value));
    } catch {
        // Silent fail — cache is non-critical
    }
}

async function del(key) {
    try {
        await getClient().del(key);
    } catch {}
}

async function delPattern(pattern) {
    try {
        if (!redisClient) return;
        const keys = await redisClient.keys(pattern);
        if (keys.length > 0) {
            await redisClient.del(...keys);
            console.log(`🗑️  Cache cleared: ${keys.length} keys matching "${pattern}"`);
        }
    } catch {}
}

// ── Cache-aside helper ────────────────────────────────────────────────────────
// Usage: const data = await getOrSet('my:key', 60, () => fetchFromDB())
async function getOrSet(key, ttlSeconds, fetchFn) {
    const cached = await get(key);
    if (cached !== null) {
        return { data: cached, source: 'cache' };
    }
    const fresh = await fetchFn();
    await set(key, fresh, ttlSeconds);
    return { data: fresh, source: 'firestore' };
}

// ── Simple hash for ETag ──────────────────────────────────────────────────────
function hashForEtag(data) {
    const str = JSON.stringify(data);
    let hash = 5381;
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) + hash) + str.charCodeAt(i);
        hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
}

module.exports = { initRedis, get, set, del, delPattern, getOrSet, hashForEtag };