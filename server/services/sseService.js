/**
 * Server-Sent Events (SSE) service.
 *
 * Replaces polling on these frontend patterns:
 *   BEFORE: setInterval(() => fetch('/api/ai/queue-status'), 3000)
 *   AFTER:  const es = new EventSource('/api/sse/queue')
 *           es.onmessage = (e) => updateUI(JSON.parse(e.data))
 *
 * SSE advantages over polling:
 * - Server pushes updates only when data changes (no wasted requests)
 * - Single persistent HTTP connection (no repeated handshakes)
 * - Built into browsers — no WebSocket library needed on frontend
 * - Works through proxies and load balancers (unlike WebSockets)
 */

const { db } = require('./firebase');
const { COLLECTIONS } = require('../config/schema');

// ── Client registry ───────────────────────────────────────────────────────────
// Map of clientId → { res, orgId, channels }
const clients = new Map();
let clientIdCounter = 0;

/**
 * Register a new SSE client.
 * Sets up the connection headers and heartbeat.
 * Returns clientId for cleanup on disconnect.
 */
function registerClient(res, orgId = null, channels = []) {
    const clientId = ++clientIdCounter;

    // SSE required headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // disable Nginx buffering on Render
    res.flushHeaders();

    // Send initial connection confirmation
    sendToClient(res, 'connected', {
        clientId,
        message: 'SSE connection established',
        channels,
    });

    // Heartbeat every 30s to keep connection alive through proxies
    const heartbeat = setInterval(() => {
        try {
            res.write(': heartbeat\n\n');
        } catch {
            clearInterval(heartbeat);
            clients.delete(clientId);
        }
    }, 30000);

    clients.set(clientId, { res, orgId, channels, heartbeat });
    console.log(`📡 SSE client ${clientId} connected (org: ${orgId}, channels: ${channels.join(',')}). Total: ${clients.size}`);

    return clientId;
}

/**
 * Remove a client on disconnect.
 */
function removeClient(clientId) {
    const client = clients.get(clientId);
    if (client) {
        clearInterval(client.heartbeat);
        clients.delete(clientId);
        console.log(`📡 SSE client ${clientId} disconnected. Total: ${clients.size}`);
    }
}

/**
 * Send an event to a specific client's response object.
 */
function sendToClient(res, event, data) {
    try {
        res.write(`event: ${event}\n`);
        res.write(`data: ${JSON.stringify(data)}\n\n`);
    } catch (err) {
        // Client disconnected — will be cleaned up by disconnect handler
    }
}

/**
 * Broadcast an event to all clients subscribed to a channel.
 * Optionally filter by orgId.
 */
function broadcast(channel, event, data, orgId = null) {
    let sent = 0;
    clients.forEach((client, clientId) => {
        const channelMatch = client.channels.includes(channel) || client.channels.includes('*');
        const orgMatch = !orgId || !client.orgId || client.orgId === orgId;

        if (channelMatch && orgMatch) {
            sendToClient(client.res, event, { ...data, channel });
            sent++;
        }
    });

    if (sent > 0) {
        console.log(`📡 Broadcast "${event}" on "${channel}" to ${sent} client(s)`);
    }
}

/**
 * Send to a specific user (by userId).
 */
function sendToUser(userId, event, data) {
    clients.forEach((client) => {
        if (client.userId === userId) {
            sendToClient(client.res, event, data);
        }
    });
}

// ── Firestore real-time listeners ─────────────────────────────────────────────
// These listen to Firestore and push updates to connected SSE clients.

let needsListener = null;
let tasksListener = null;

/**
 * Start Firestore listeners that push to SSE clients.
 * Called once from index.js on server start.
 */
function startFirestoreListeners() {
    // Listen for need status changes (urgency score updates, status changes)
    needsListener = db.collection(COLLECTIONS.NEEDS)
        .where('status', 'in', ['pending_ai', 'active', 'assigned'])
        .onSnapshot((snap) => {
            snap.docChanges().forEach((change) => {
                if (change.type === 'modified') {
                    const need = { id: change.doc.id, ...change.doc.data() };

                    // Broadcast need update to relevant org clients
                    broadcast('needs', 'need:updated', {
                        needId: need.id,
                        urgencyScore: need.urgencyScore,
                        status: need.status,
                        category: need.category,
                        aiSummary: need.aiSummary,
                    }, need.orgId);

                    // Special event when AI scoring completes
                    if (need.urgencyScore && need.status === 'active') {
                        broadcast('needs', 'need:scored', {
                            needId: need.id,
                            urgencyScore: need.urgencyScore,
                            category: need.aiCategory || need.category,
                            vulnerabilityFlag: need.vulnerabilityFlag,
                            affectedCount: need.affectedCount,
                        }, need.orgId);
                    }
                }

                if (change.type === 'added') {
                    const need = { id: change.doc.id, ...change.doc.data() };
                    broadcast('heatmap', 'heatmap:new-need', {
                        id: need.id,
                        lat: need.location?.lat,
                        lng: need.location?.lng,
                        urgencyScore: need.urgencyScore,
                        category: need.category,
                        status: need.status,
                    }, need.orgId);
                }
            });
        }, (err) => {
            console.error('Needs SSE listener error:', err.message);
        });

    // Listen for task status changes
    tasksListener = db.collection(COLLECTIONS.TASKS)
        .where('status', 'in', ['assigned', 'inProgress'])
        .onSnapshot((snap) => {
            snap.docChanges().forEach((change) => {
                if (change.type === 'modified') {
                    const task = { id: change.doc.id, ...change.doc.data() };
                    broadcast('tasks', 'task:updated', {
                        taskId: task.id,
                        status: task.status,
                        assignedVolunteer: task.assignedVolunteer,
                        needId: task.needId,
                    }, task.orgId);
                }
            });
        }, (err) => {
            console.error('Tasks SSE listener error:', err.message);
        });

    console.log('📡 Firestore SSE listeners started');
}

/**
 * Stop all Firestore listeners (for graceful shutdown).
 */
function stopFirestoreListeners() {
    if (needsListener) needsListener();
    if (tasksListener) tasksListener();
}

/**
 * Get current connection stats.
 */
function getStats() {
    const channelCounts = {};
    clients.forEach(client => {
        client.channels.forEach(ch => {
            channelCounts[ch] = (channelCounts[ch] || 0) + 1;
        });
    });

    return {
        totalClients: clients.size,
        channelCounts,
    };
}

module.exports = {
    registerClient,
    removeClient,
    broadcast,
    sendToUser,
    startFirestoreListeners,
    stopFirestoreListeners,
    getStats,
};