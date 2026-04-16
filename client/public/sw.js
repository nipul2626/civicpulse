/**
 * CivicPulse Service Worker
 * Handles offline functionality for volunteers in the field.
 *
 * Ishu: Put this file in your /public folder.
 * It will be served at /sw.js automatically by Vite.
 *
 * Register it in your main.jsx:
 *   if ('serviceWorker' in navigator) {
 *     navigator.serviceWorker.register('/sw.js');
 *   }
 */

const CACHE_NAME = 'civicpulse-v1';
const API_BASE = self.location.origin.includes('localhost')
    ? 'http://localhost:5000'
    : 'https://civicpulse-backend-klzk.onrender.com';

// Files to cache for offline app shell
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/manifest.json',
];

// ── Install: cache static assets ──────────────────────────────────────────────
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(STATIC_ASSETS);
        })
    );
    self.skipWaiting();
});

// ── Activate: clean old caches ────────────────────────────────────────────────
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
        )
    );
    self.clients.claim();
});

// ── Fetch: network-first for API, cache-first for assets ─────────────────────
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // API requests: network first, queue if offline
    if (url.href.includes(API_BASE)) {
        if (request.method !== 'GET') {
            // POST/PATCH — queue for sync if offline
            event.respondWith(
                fetch(request.clone()).catch(() => {
                    // Offline — queue the action
                    return queueOfflineAction(request.clone()).then(() =>
                        new Response(JSON.stringify({
                            success: true,
                            offline: true,
                            message: 'Action queued — will sync when online',
                        }), { headers: { 'Content-Type': 'application/json' } })
                    );
                })
            );
            return;
        }

        // GET API — network first, fall back to cache
        event.respondWith(
            fetch(request)
                .then((response) => {
                    const cloned = response.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(request, cloned));
                    return response;
                })
                .catch(() => caches.match(request))
        );
        return;
    }

    // Static assets — cache first
    event.respondWith(
        caches.match(request).then((cached) => cached || fetch(request))
    );
});

// ── Queue offline actions in IndexedDB ───────────────────────────────────────
async function queueOfflineAction(request) {
    const body = await request.text();
    const action = {
        url: request.url,
        method: request.method,
        body,
        headers: Object.fromEntries(request.headers.entries()),
        timestamp: new Date().toISOString(),
        id: Date.now(),
    };

    // Store in IndexedDB
    const db = await openDB();
    const tx = db.transaction('offline-queue', 'readwrite');
    await tx.objectStore('offline-queue').add(action);
    await tx.done;
}

function openDB() {
    return new Promise((resolve, reject) => {
        const req = indexedDB.open('civicpulse-offline', 1);
        req.onupgradeneeded = (e) => {
            const db = e.target.result;
            if (!db.objectStoreNames.contains('offline-queue')) {
                db.createObjectStore('offline-queue', { keyPath: 'id' });
            }
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
}

// ── Background sync — runs when connection is restored ───────────────────────
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-offline-actions') {
        event.waitUntil(syncOfflineActions());
    }
});

async function syncOfflineActions() {
    const db = await openDB();
    const tx = db.transaction('offline-queue', 'readwrite');
    const store = tx.objectStore('offline-queue');
    const actions = await store.getAll();

    for (const action of actions) {
        try {
            await fetch(action.url, {
                method: action.method,
                headers: action.headers,
                body: action.body,
            });
            // Success — remove from queue
            await store.delete(action.id);
        } catch {
            // Still offline — leave in queue
        }
    }
}

// ── Push notifications ────────────────────────────────────────────────────────
self.addEventListener('push', (event) => {
    if (!event.data) return;

    let data;
    try {
        data = event.data.json();
    } catch {
        data = { title: 'CivicPulse', body: event.data.text() };
    }

    event.waitUntil(
        self.registration.showNotification(data.title || 'CivicPulse', {
            body: data.body || '',
            icon: '/icons/icon-192.png',
            badge: '/icons/badge-72.png',
            data: data.data || {},
            actions: data.actions || [],
            vibrate: [100, 50, 100],
        })
    );
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const taskId = event.notification.data?.taskId;
    const url = taskId ? `/?task=${taskId}` : '/';

    event.waitUntil(
        clients.matchAll({ type: 'window' }).then((windowClients) => {
            if (windowClients.length > 0) {
                windowClients[0].focus();
                windowClients[0].navigate(url);
            } else {
                clients.openWindow(url);
            }
        })
    );
});