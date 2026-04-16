const express = require('express');
const router = express.Router();
const {
    registerClient,
    removeClient,
    getStats,
    broadcast,
} = require('../services/sseService');
const { getQueueStatus } = require('../services/aiQueue');
const aiMetrics = require('../services/aiMetrics');

/**
 * GET /api/sse/stream
 *
 * Main SSE endpoint. Frontend connects once and receives real-time events.
 *
 * Query params:
 *   channels: comma-separated list of channels to subscribe to
 *             options: needs, tasks, heatmap, queue, *
 *   orgId: optional org filter
 *
 * How Ishu connects on the frontend:
 *
 *   const es = new EventSource(
 *     `${API_URL}/api/sse/stream?channels=needs,queue&orgId=${orgId}`
 *   );
 *
 *   es.addEventListener('need:scored', (e) => {
 *     const data = JSON.parse(e.data);
 *     updateNeedCard(data.needId, data.urgencyScore);
 *   });
 *
 *   es.addEventListener('need:updated', (e) => {
 *     const data = JSON.parse(e.data);
 *     refreshHeatmap();
 *   });
 *
 *   es.addEventListener('queue:status', (e) => {
 *     const data = JSON.parse(e.data);
 *     setQueuePosition(data.pendingCount);
 *   });
 *
 *   // Reconnect automatically on disconnect (EventSource does this by default)
 *   es.onerror = () => console.log('SSE reconnecting...');
 */
router.get('/stream', async (req, res) => {
    const channels = (req.query.channels || 'needs,tasks,queue').split(',').map(c => c.trim());
    const orgId = req.query.orgId || null;

    // Register client — this sets headers and sends first event
    const clientId = registerClient(res, orgId, channels);

    // If subscribed to queue channel, send current status immediately
    if (channels.includes('queue') || channels.includes('*')) {
        try {
            const queueStatus = await getQueueStatus();
            res.write(`event: queue:status\n`);
            res.write(`data: ${JSON.stringify({ ...queueStatus, channel: 'queue' })}\n\n`);
        } catch {}
    }

    // Clean up when client disconnects
    req.on('close', () => removeClient(clientId));
    req.on('aborted', () => removeClient(clientId));
});

/**
 * GET /api/sse/stats
 * Returns current SSE connection stats — useful for monitoring.
 */
router.get('/stats', (req, res) => {
    res.json({
        success: true,
        data: getStats(),
    });
});

/**
 * POST /api/sse/test-broadcast
 * Internal testing endpoint — broadcasts a test event to all clients.
 * Remove or protect in production.
 */
if (process.env.NODE_ENV !== 'production') {
    router.post('/test-broadcast', (req, res) => {
        const { channel = 'needs', event = 'test', data = {} } = req.body;
        broadcast(channel, event, { ...data, testBroadcast: true });
        res.json({ success: true, message: `Broadcast sent to channel: ${channel}` });
    });
}

/**
 * Queue status pusher — called by aiQueue.js after processing a batch.
 * Pushes queue status update to all queue-channel clients.
 */
async function pushQueueUpdate() {
    try {
        const status = await getQueueStatus();
        broadcast('queue', 'queue:status', status);
    } catch {}
}

module.exports = router;
module.exports.pushQueueUpdate = pushQueueUpdate;