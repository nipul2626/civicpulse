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

## MATCH

### POST /api/match
Auth: coordinator only
Body: `{ needId }`
Response: `{ needId, matches: [{ volunteerId, name, score, reason, distance, skills, reliabilityScore, matchLevel }] }`
Notes: matchLevel is "primary" | "expanded" | "broadcast". Cached 5 min.

### POST /api/match/assign
Auth: coordinator only
Body: `{ needId, volunteerId, scheduledTime?, resourceIds?: [] }`
Response: `{ message, taskId, task }`

---

## TASKS

### POST /api/tasks/create
Auth: coordinator only
Body: `{ needId, assignedVolunteerId, scheduledTime, orgId, resourceIds?: [] }`
Response: `{ message, taskId, task }`

### GET /api/tasks
Auth: bearer token
Query params: `orgId, volunteerId, status, startDate, endDate`
Notes: Volunteers only see their own tasks. Coordinators see all in org.
Response: Array of task documents

### PATCH /api/tasks/:id/status
Auth: coordinator or assigned volunteer
Body: `{ status, outcome?, peopleHelped?, durationHours? }`
Valid transitions: `assigned→inProgress→completed→verified`
Response: `{ message, taskId, status }`

### GET /api/tasks/:id
Auth: bearer token
Response: Task document enriched with `need` and `volunteer` objects

### POST /api/tasks/:id/no-show-check
Auth: internal (no token check — call from Cloud Tasks or scheduler)
Response: `{ message }`

---

## VOLUNTEERS (updated)

### GET /api/volunteers
Auth: coordinator only
Query params: `skill, available, verified`
Response: Array of volunteer profiles with displayName

### GET /api/volunteers/burnout-risk
Auth: coordinator only
Response: Array of at-risk volunteers with `recommendedAction`

### GET /api/volunteers/:id
Auth: coordinator only
Response: Volunteer profile + `taskHistory` (last 20 tasks)

### PUT /api/volunteers/:id/availability
Auth: own volunteer only
Body: `{ availabilityGrid: { "mon-morning": true, "mon-afternoon": false, ... } }`
Response: `{ message }`

### PUT /api/volunteers/:id/location
Auth: own volunteer only
Body: `{ lat, lng }`
Response: `{ message }`

### POST /api/volunteers/verify-skill
Auth: bearer token
Body: `{ volunteerId, claimedSkill, documentText }`
Response: `{ verified, confidence, badge, reason }`