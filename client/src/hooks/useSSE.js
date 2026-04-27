import { useEffect, useRef } from "react"
import { connectSSE } from "../lib/sse"

/**
 * React hook that opens an SSE connection on mount and closes it on unmount.
 *
 * @param {string}   orgId     - Org ID (pass "" for public consumers)
 * @param {object}   handlers  - { "need:scored": fn, "heatmap:new-need": fn, ... }
 * @param {string[]} channels  - Default: ["needs","tasks","queue","heatmap"]
 * @param {boolean}  enabled   - Set false to skip opening the connection
 */
export function useSSE(orgId = "", handlers = {}, channels, enabled = true) {
    // Stable ref so handler changes don't re-open the connection
    const handlersRef = useRef(handlers)
    handlersRef.current = handlers

    useEffect(() => {
        if (!enabled) return

        // Wrap each handler so the ref is read at call-time
        const proxied = {}
        const EVENTS = [
            "need:scored",
            "need:updated",
            "heatmap:new-need",
            "heatmap:need-resolved",
            "task:updated",
            "queue:status",
        ]
        EVENTS.forEach((name) => {
            proxied[name] = (data) => {
                if (handlersRef.current[name]) handlersRef.current[name](data)
            }
        })

        const es = connectSSE(orgId, proxied, channels)
        return () => es.close()
    }, [orgId, enabled]) // eslint-disable-line react-hooks/exhaustive-deps
}