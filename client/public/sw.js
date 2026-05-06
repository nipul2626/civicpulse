const CACHE_NAME = "civicpulse-v1"
const STATIC_ASSETS = ["/", "/index.html"]

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
    )
    self.skipWaiting()
})

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
        )
    )
    self.clients.claim()
})

self.addEventListener("fetch", (event) => {
    const { request } = event
    const url = new URL(request.url)

    // API requests — network first, no cache
    if (url.pathname.startsWith("/api/")) {
        event.respondWith(
            fetch(request).catch(() =>
                new Response(JSON.stringify({ success:false, error:"Offline" }), {
                    headers: { "Content-Type":"application/json" },
                })
            )
        )
        return
    }

    // SSE — never intercept
    if (url.pathname.includes("/api/sse")) return

    // Static assets — cache first
    event.respondWith(
        caches.match(request).then((cached) => {
            if (cached) return cached
            return fetch(request).then((response) => {
                if (!response || response.status !== 200 || response.type === "opaque") return response
                const clone = response.clone()
                caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
                return response
            })
        })
    )
})

// Background sync for offline PWA actions
self.addEventListener("sync", (event) => {
    if (event.tag === "sync-actions") {
        event.waitUntil(syncOfflineActions())
    }
})

async function syncOfflineActions() {
    // Read queued actions from IndexedDB (if implemented)
    // and POST to /api/pwa/sync
    console.log("[SW] sync-actions fired")
}