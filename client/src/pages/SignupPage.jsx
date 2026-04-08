import { useEffect } from "react"
import { useNavigate } from "react-router-dom"

// Auth is now handled inside LandingPage via modal.
// This redirect ensures /signup doesn't show a blank page.
const SignupPage = () => {
    const navigate = useNavigate()
    useEffect(() => {
        navigate("/", { replace: true, state: { openAuth: "signup" } })
    }, [navigate])
    return null
}

export default SignupPage