import { useEffect } from "react"
import { useNavigate } from "react-router-dom"

// Auth is now handled inside LandingPage via modal.
// This redirect ensures /login doesn't show a blank page.
const LoginPage = () => {
    const navigate = useNavigate()
    useEffect(() => {
        navigate("/", { replace: true, state: { openAuth: "login" } })
    }, [navigate])
    return null
}

export default LoginPage