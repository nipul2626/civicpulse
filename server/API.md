# CivicPulse API Contract

Base URL: http://localhost:5000/api

## Auth
All protected routes require:
`Authorization: Bearer <Firebase ID Token>`

---

## Health
GET /api/health
Response: { status, timestamp, service, version }

---

## Needs

### POST /api/needs/submit  [PROTECTED]
Body: { title, description, category, location, lat?, lng? }
Response: { message, needId, aiScore, merged }

### GET /api/needs/heatmap  [PUBLIC]
Response: { source, data: [{ id, lat, lng, urgencyScore, category, title, affectedCount, vulnerabilityFlag }] }

### POST /api/needs/bulk  [PROTECTED]
Body: { rows: [{title, description, category, location, lat, lng}] }
OR: { csv: "<csv string with headers>" }
Response: { message, results: [{ id, title, urgencyScore, success }] }

---

## Voice

### POST /api/voice/transcribe  [PROTECTED]
Content-Type: multipart/form-data
Field: audio (file)
Response: { transcription }