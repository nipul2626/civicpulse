import { useState, useEffect } from "react"
import { onAuthStateChanged } from "firebase/auth"
import { auth } from "../lib/firebase"
import { getMe } from "../lib/api"

/**
 * Returns { user, role, orgId, displayName, loading, error }
 *
 * - `user`        Firebase user object (or null)
 * - `role`        "coordinator" | "volunteer" | "community" | null
 * - `orgId`       org ID for coordinators (or null)
 * - `displayName` string
 * - `loading`     true while auth state + backend profile are being resolved
 * - `error`       Error object if /api/auth/me fails
 */
export function useAuth() {
    const [user,        setUser]        = useState(null)
    const [role,        setRole]        = useState(null)
    const [orgId,       setOrgId]       = useState(null)
    const [displayName, setDisplayName] = useState("")
    const [loading,     setLoading]     = useState(true)
    const [error,       setError]       = useState(null)

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
            if (!firebaseUser) {
                setUser(null)
                setRole(null)
                setOrgId(null)
                setDisplayName("")
                setLoading(false)
                return
            }

            setUser(firebaseUser)

            try {
                const res = await getMe()
                const { user: profile, org } = res.data ?? res
                setRole(profile.role ?? null)
                setOrgId(profile.orgId ?? org?.id ?? null)
                setDisplayName(profile.displayName || firebaseUser.displayName || "")
                setError(null)
            } catch (err) {
                console.error("[useAuth] /api/auth/me error:", err)
                setError(err)
                // Fall back to null role — pages guard against this
                setRole(null)
            } finally {
                setLoading(false)
            }
        })

        return unsub
    }, [])

    return { user, role, orgId, displayName, loading, error }
}