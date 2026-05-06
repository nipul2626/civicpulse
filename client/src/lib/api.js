import axios from "axios"
import { auth } from "./firebase"

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"

const api = axios.create({
    baseURL: BASE_URL,
    timeout: 30000,
    headers: { "Content-Type": "application/json" },
})

// Attach Firebase ID token on every request
api.interceptors.request.use(async (config) => {
    const user = auth.currentUser
    if (user) {
        try {
            const token = await user.getIdToken(/* forceRefresh */ false)
            config.headers.Authorization = `Bearer ${token}`
        } catch (err) {
            console.warn("[api] getIdToken failed:", err)
        }
    }
    return config
})

// Handle 401 — token expired, force refresh once, then redirect to login
api.interceptors.response.use(
    (res) => res,
    async (err) => {
        const original = err.config
        if (err.response?.status === 401 && !original._retry) {
            original._retry = true
            const user = auth.currentUser
            if (user) {
                try {
                    const token = await user.getIdToken(/* forceRefresh */ true)
                    original.headers.Authorization = `Bearer ${token}`
                    return api(original)
                } catch {
                    // Token refresh failed — sign the user out
                    await auth.signOut()
                    window.location.href = "/"
                }
            } else {
                window.location.href = "/"
            }
        }
        return Promise.reject(err)
    }
)

// ─── API helpers ──────────────────────────────────────────────────────────────

// Auth
export const registerOrg = (body) =>
    api.post("/api/auth/register-org", body).then((r) => r.data)

export const registerVolunteer = (body) =>
    api.post("/api/auth/register-volunteer", body).then((r) => r.data)

export const registerUser = (body) =>
    api.post("/api/auth/register", body).then((r) => r.data)

export const getMe = () =>
    api.get("/api/auth/me").then((r) => r.data)

// Public – Needs
export const submitNeed = (body) =>
    api.post("/api/needs/submit", body).then((r) => r.data)

export const getHeatmap = () =>
    api.get("/api/needs/heatmap").then((r) => r.data)

export const getNeed = (id) =>
    api.get(`/api/needs/${id}`).then((r) => r.data)

// Public – AI queue
export const getQueueStatus = () =>
    api.get("/api/ai/queue-status").then((r) => r.data)

// Public – Donor
export const getDonorPublicStats = () =>
    api.get("/api/donor/public-stats").then((r) => r.data)

export const getDonorResolvedNeeds = () =>
    api.get("/api/donor/resolved-needs").then((r) => r.data)

export const getNeedStory = (id) =>
    api.get(`/api/donor/need/${id}/story`).then((r) => r.data)

// Coordinator – Analytics
export const getCoordinatorAnalytics = (orgId) =>
    api.get("/api/analytics/coordinator", { params: { orgId } }).then((r) => r.data)

export const getImpact = (orgId) =>
    api.get("/api/impact", { params: { orgId } }).then((r) => r.data)

export const generateSitrep = (body) =>
    api.post("/api/impact/sitrep", body).then((r) => r.data)

export const getNeedsTrend = (orgId, days = 30) =>
    api.get("/api/analytics/needs-trend", { params: { orgId, days } }).then((r) => r.data)

// Coordinator – Needs
export const patchNeedStatus = (id, status) =>
    api.patch(`/api/needs/${id}/status`, { status }).then((r) => r.data)

export const bulkImportNeeds = (body) =>
    api.post("/api/needs/bulk-import", body).then((r) => r.data)

// Coordinator – Match
export const matchVolunteers = (needId) =>
    api.post("/api/match", { needId }).then((r) => r.data)

export const assignVolunteer = (body) =>
    api.post("/api/match/assign", body).then((r) => r.data)

// Coordinator – Tasks
export const createTask = (body) =>
    api.post("/api/tasks/create", body).then((r) => r.data)

export const getTasks = (params) =>
    api.get("/api/tasks", { params }).then((r) => r.data)

export const getTask = (id) =>
    api.get(`/api/tasks/${id}`).then((r) => r.data)

export const patchTaskStatus = (id, body) =>
    api.patch(`/api/tasks/${id}/status`, body).then((r) => r.data)

// Coordinator – Volunteers
export const getVolunteers = (params) =>
    api.get("/api/volunteers", { params }).then((r) => r.data)

export const getVolunteer = (id) =>
    api.get(`/api/volunteers/${id}`).then((r) => r.data)

export const getBurnoutRisk = () =>
    api.get("/api/volunteers/burnout-risk").then((r) => r.data)

export const verifySkill = (body) =>
    api.post("/api/volunteers/verify-skill", body).then((r) => r.data)

// Coordinator – Resources
export const getResources = (orgId) =>
    api.get("/api/resources", { params: { orgId } }).then((r) => r.data)

export const createResource = (body) =>
    api.post("/api/resources", body).then((r) => r.data)

export const updateResource = (id, body) =>
    api.put(`/api/resources/${id}`, body).then((r) => r.data)

export const deleteResource = (id) =>
    api.delete(`/api/resources/${id}`).then((r) => r.data)

export const deployResource = (id, body) =>
    api.post(`/api/resources/${id}/deploy`, body).then((r) => r.data)

// Coordinator – Predictions
export const getPredictions = (orgId) =>
    api.get("/api/predictions/upcoming", { params: { orgId } }).then((r) => r.data)

// Coordinator – Organizations
export const getOrg = (id) =>
    api.get(`/api/organizations/${id}`).then((r) => r.data)

export const getCrossNgoMap = () =>
    api.get("/api/organizations/cross-ngo-map").then((r) => r.data)

export const requestHandoff = (body) =>
    api.post("/api/organizations/handoff-request", body).then((r) => r.data)

export const updateHandoff = (id, status) =>
    api.patch(`/api/organizations/handoff-request/${id}`, { status }).then((r) => r.data)

// Volunteer
export const getVolunteerCache = (id) =>
    api.get(`/api/pwa/volunteer-cache/${id}`).then((r) => r.data)

export const updateAvailability = (id, availabilityGrid) =>
    api.put(`/api/volunteers/${id}/availability`, { availabilityGrid }).then((r) => r.data)

export const updateLocation = (id, lat, lng) =>
    api.put(`/api/volunteers/${id}/location`, { lat, lng }).then((r) => r.data)

export const transcribeAudio = (formData) =>
    api.post("/api/ai/transcribe", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    }).then((r) => r.data)

export const syncOfflineActions = (actions) =>
    api.post("/api/pwa/sync", { actions }).then((r) => r.data)

// Demo
export const getDemoStatus = () =>
    api.get("/api/demo/status").then((r) => r.data)

export const resetDemo = () =>
    api.post("/api/demo/reset", {}, {
        headers: { "x-demo-secret": "civicpulse-demo-2026" },
    }).then((r) => r.data)

export default api