const SSE_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"

/**
 * Connect to the SSE stream and register event handlers.
 *
 * @param {string}   orgId     - Coordinator org ID (pass "" for public consumers)
 * @param {object}   handlers  - Map of eventName → callback(data)
 * @param {string[]} channels  - Channels to subscribe to
 * @returns {EventSource}      - Call .close() on unmount
 */
export function connectSSE(
    orgId = "",
    handlers = {},
    channels = ["needs", "tasks", "queue", "heatmap"]
) {
    const params = new URLSearchParams({
        channels: channels.join(","),
        ...(orgId && { orgId }),
    })
    const url = `${SSE_BASE}/api/sse/stream?${params.toString()}`
    const es = new EventSource(url)

    es.addEventListener("connected", (e) => {
        try {
            console.log("[SSE] connected:", JSON.parse(e.data))
        } catch {}
    })

    const EVENTS = [
        "need:scored",
        "need:updated",
        "heatmap:new-need",
        "heatmap:need-resolved",
        "task:updated",
        "queue:status",
    ]

    EVENTS.forEach((name) => {
        es.addEventListener(name, (e) => {
            try {
                const data = JSON.parse(e.data)
                if (handlers[name]) handlers[name](data)
            } catch (err) {
                console.warn(`[SSE] parse error on ${name}:`, err)
            }
        })
    })

    es.onerror = () => {
        // Browser auto-reconnects — no extra logic needed
        console.warn("[SSE] disconnected — browser will reconnect")
    }

    return es // caller: useEffect(() => { const es = connectSSE(...); return () => es.close() }, [])
}