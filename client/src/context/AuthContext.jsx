import { createContext, useContext } from "react"
import { useAuth } from "../hooks/useAuth"

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const auth = useAuth()
    return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>
}

export function useAuthContext() {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error("useAuthContext must be used inside <AuthProvider>")
    return ctx
}