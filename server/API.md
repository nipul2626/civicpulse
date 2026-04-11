# CivicPulse API Contract

## Base URL
- Local: `http://localhost:3001`
- Production: `https://civicpulse-api.railway.app`

## Auth Header (attach to every protected request)
```js
// Axios interceptor — add this in your frontend src/lib/axios.js
import axios from 'axios';
import { getAuth } from 'firebase/auth';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL });
api.interceptors.request.use(async (config) => {
  const user = getAuth().currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
export default api;
```

---

## AUTH

### POST /api/auth/register
Auth: none
Body: `{ uid, email, role: "coordinator|volunteer|community", orgId?, displayName? }`
Response: `{ message, uid }`

### POST /api/auth/register-volunteer
Auth: none
Body: `{ uid, email, skills: [], availabilityGrid: {}, zoneRadius, location: {lat, lng} }`
Response: `{ message, uid }`

### POST /api/auth/register-org
Auth: none
Body: `{ uid, email, orgName, contactPerson, zones: [] }`
Response: `{ message, orgId, uid }`

### GET /api/auth/me
Auth: bearer token
Response: `{ user: {...}, org: {...} | null }`

---

## NEEDS

### POST /api/needs/submit
Auth: none (public)
Body: `{ title, description, category, location: {lat, lng, address}, affectedCount?, photoURL?, voiceTranscript?, reportedBy?, orgId? }`
Response: `{ needId, status, message, queuePosition, jobId }`
Notes: If duplicate found within 0.5km + same category + 24h, returns `{ deduplicated: true, existingNeedId }`

### POST /api/needs/bulk-import
Auth: coordinator only
Body: `{ rows: [{title, description, category, lat, lng, address, affectedCount}] }` OR `{ csv: "..." }`
Max: 200 rows per request
Response: `{ accepted, duplicates, jobIds }`

### GET /api/needs/heatmap
Auth: none (public)
Response: `{ source: "cache|firestore", data: [{id, lat, lng, urgencyScore, category, status, affectedCount, createdAt}] }`
Notes: Redis cached 60 seconds

### GET /api/needs/:id
Auth: bearer token
Response: Full need document with AI scores

### PATCH /api/needs/:id/status
Auth: coordinator only
Body: `{ status: "pending_ai|active|assigned|resolved" }`
Response: `{ message, needId, status }`

---

## AI

### GET /api/ai/queue-status
Auth: none
Response: `{ pendingCount, processingCount, avgWaitSeconds, providerStatus: {groq, gemini} }`

### POST /api/ai/transcribe
Auth: bearer token
Content-Type: multipart/form-data
Field: `audio` (file, max 10MB, .webm/.mp3/.wav)
Response: `{ transcript: string }` or `{ transcript: null, error: string }`

---

## VOLUNTEERS

### GET /api/volunteers/list
Auth: bearer token
Response: Array of volunteer documents

### GET /api/volunteers/burnout-risk
Auth: bearer token
Response: Array of volunteers with burnoutFlag: true

### GET /api/volunteers/:id
Auth: bearer token
Response: Volunteer document

### POST /api/volunteers/verify-skill
Auth: bearer token
Body: `{ volunteerId, claimedSkill, documentText }`
Notes: documentText is OCR-extracted text from certificate (Ishu does OCR client-side with Gemini Vision, sends text here)
Response: `{ verified, confidence: "high|medium|low", badge: "verified|rejected", reason }`