import { useState, useEffect, useCallback } from "react"

/**
 * Generic data-fetching hook.
 *
 * @param {Function|null} fetchFn   - Async function that returns data; pass null to skip
 * @param {Array}         deps      - Dependency array (like useEffect)
 * @param {any}           initial   - Initial value for `data` (default null)
 *
 * Returns { data, loading, error, refetch }
 */
export function useApi(fetchFn, deps = [], initial = null) {
    const [data,    setData]    = useState(initial)
    const [loading, setLoading] = useState(!!fetchFn)
    const [error,   setError]   = useState(null)

    const run = useCallback(async () => {
        if (!fetchFn) return
        setLoading(true)
        setError(null)
        try {
            const result = await fetchFn()
            // Support both { data: ... } wrapper and raw arrays/objects
            setData(result?.data ?? result)
        } catch (err) {
            setError(err?.response?.data?.error || err.message || "An error occurred")
        } finally {
            setLoading(false)
        }
    }, deps) // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        run()
    }, [run])

    return { data, loading, error, refetch: run }
}