# CivicPulse — Product Requirements Document

**Version:** 4.0.0  
**Stack:** Node.js / Express / Firebase / Groq / Gemini / Redis / Render  
**Target users:** NGO coordinators, field volunteers, community members  
**Scale:** 1,000–10,000 users

---

## Feature List — Small to Large

### Infrastructure & Foundation
* **Express server** with CORS, Helmet security headers, Gzip compression
* **Firebase Admin SDK** initialized from environment variables (no JSON file)
* **Redis cache** with graceful no-op fallback when Redis is unavailable
* **Pino structured JSON logging** with request tracking
* **Sentry error tracking** with automatic PII scrubbing before events are sent
* **Health check endpoint** reporting Redis + Firestore status and server uptime
* **Global rate limiting** (100 req/15min), auth limiter (10 req/15min), AI limiter (10 req/min)
* **Per-user rate limiting** on authenticated routes (not just per-IP)
* **Graceful shutdown** with SIGTERM handler
* **Environment-based configuration** with documented `.env.example`

---

### Authentication & Authorization
* **Firebase ID token verification** on all protected routes
* **Three roles:** coordinator, volunteer, community
* **requireRole() middleware** — checks Firestore user document for role
* **requireSameOrg() middleware** — prevents cross-org data access
* **Register organization + coordinator** in one atomic Firestore batch
* **Register volunteer** with skills, availability grid, and location
* **GET /api/auth/me** returns user profile + org data
* **Token generation script** for local development (`scripts/getToken.js`)

---

### Firestore Schema & Security
* **Seven collections:** organizations, users, volunteers, needs, tasks, resources, aiQueue
* **All collection names exported as constants** from `config/schema.js` — no hardcoded strings
* **Composite Firestore indexes** on orgId+status+createdAt, volunteer matching queries, burnout queries
* **Firestore security rules** — public need creation, role-based read/write, org isolation, no client writes to aiQueue

---

### Need Submission & Management
* **POST /api/needs/submit** — fully public, no login required for community members
* **Input sanitization** with `sanitize-html` on all free-text fields
* **SHA-256 submitter hash** stored for abuse investigation without storing raw IPs
* **Geographic deduplication** — checks 0.5km radius + same category + last 24 hours before creating duplicate
* **If duplicate found:** increments `affectedCount` on existing need, returns `deduplicated: true`
* **Immediate response with queue position** — user never waits for AI scoring
* **Firestore onSnapshot compatible** — frontend gets real-time update when AI score lands
* **POST /api/needs/bulk-import** — coordinator only, up to 200 rows as JSON array or CSV string
* **GET /api/needs/heatmap** — public, Redis cached 60 seconds, ETag support for mobile bandwidth saving
* **PATCH /api/needs/:id/status** — coordinator only, triggers lifecycle notifications on change
* **Urgency decay** — unassigned needs lose up to 50% urgency score over 72 hours, applied at read time

---

### Multilingual Support
* **Language detection** using `franc v3` with Unicode script fallback for 11 Indian languages
* **Supported:** Hindi, Marathi, Bengali, Tamil, Telugu, Kannada, Malayalam, Gujarati, Punjabi, Urdu, Odia
* **Non-English needs:** translate + score in one Gemini API call (saves a round trip)
* **Stores originalText, translatedText, detectedLanguage** on the need document
* **Coordinators see translated text;** submitters receive acknowledgments in their own language

---

### AI Architecture — 4-Layer Smart Routing
* **Layer 0 — Rule-based preprocessor:** keyword scoring handles ~30% of needs instantly with zero API cost. Confidence threshold 0.85 — escalates to AI if below
* **Layer 1 — Semantic cache:** djb2 hash of normalized need text, 6-hour Redis TTL. Same need never scored twice
* **Layer 2 — Ollama (future):** self-hosted Mistral, activated by setting `OLLAMA_URL`. Server load check (skip if >70% memory). Zero cost when active
* **Layer 3 — Groq API:** llama3-70b-8192, 14,400 free requests/day, batch scoring (5 needs per prompt)
* **Layer 4 — Gemini 1.5 Flash:** fallback on Groq 429/5xx errors
* **Layer 5 — Rule-based fallback:** last resort when all API layers fail, flags result as `provisional: true`
* **AI metrics endpoint** tracking requests and API savings per layer
* **JSON parse retry** with explicit instruction on first failure
* **All AI calls return { data, provider }** so the UI can show which layer was used

---

### AI Priority Queue
* **Redis sorted set** — score = (6 - priority) × timestamp so urgent needs process first
* **In-memory queue fallback** when Redis unavailable
* **Processes up to 5 jobs per batch** every 2500ms
* **Semantic cache check** before enqueuing — cached results returned instantly
* **Retry up to 3 times on failure**, marks job failed after max retries
* **Writes AI score directly to Firestore need document** — triggers frontend onSnapshot
* **GET /api/ai/queue-status** — returns pendingCount, avgWaitSeconds, providerStatus
* **Circuit breaker** — returns 503 if queue depth > 500

---

### BullMQ Task Scheduling
* **Task reminders** sent 2 hours before scheduled time (persisted in Redis, survives server restarts)
* **No-show checks** triggered 1 hour after scheduled time
* **Unique job IDs** prevent duplicate scheduling
* **On no-show:** finds next best volunteer via matching engine, creates replacement task, penalizes old volunteer reliability by 0.1, notifies coordinator
* **Worker processes** task-reminder and no-show-check job types with 3 retries and exponential backoff

---

### 6-Factor Volunteer Matching Engine
* **Fetches eligible volunteers:** currentTasks < 3, burnoutFlag false
* **Factor 1 — Skill match (35pts):** verified skill = 35, unverified = 20, missing = 0. Category-to-skill mapping for all 8 need categories. Boosted/penalized by `implicitSkillWeights` from past performance
* **Factor 2 — Proximity (25pts):** Haversine formula. 0-2km = 25pts, 2-5km = 20, 5-10km = 15, 10-20km = 8, 20km+ = 0
* **Factor 3 — Availability (20pts):** checks `availabilityGrid` for the task's day-slot. Unknown = 10pts neutral
* **Factor 4 — Reliability score (10pts):** completedTasks / acceptedTasks ratio × 10
* **Factor 5 — Workload (5pts):** 0 tasks = 5, 1 = 3, 2 = 1, 3+ = 0
* **Factor 6 — Task history (5pts):** past completed tasks in same category
* **Fallback chain:** primary → expanded radius (×2) → broadcast if all scores below 40
* **AI-generated match reason sentence** for top 5 results
* **Results cached** 5 minutes per needId

---

### Volunteer Skill Learning
* **Coordinators rate task completion** 1-5 stars on verify
* **implicitSkillWeights[category]** updated with delta of ±0.1 per task
* **Matching engine uses weights** to boost/penalize future scores for that volunteer+category
* **System improves automatically** with every resolved task

---

### Task Lifecycle Management
* **Status transitions enforced:** assigned → inProgress → completed → verified
* **Coordinators and assigned volunteers** can update status (role-checked)
* **On completed:** decrements `currentTasks`, adds hours, recalculates reliability score
* **On verified:** resolves linked need, updates org impact counters, invalidates heatmap + impact caches
* **Full task detail endpoint** enriched with need and volunteer documents

---

### Burnout Detection
* **calculateBurnoutRisk()** fetches last 7 days of completed tasks per volunteer
* **Calculates:** totalHours, taskCount, highIntensityCount (medical/emergency), consecutiveDays
* **Calls aiService.detectBurnout()** — returns { burnoutRisk, reason }
* **Sets burnoutFlag: true** on volunteer document — excludes from future matching
* **Daily cron job** (midnight IST via node-cron) runs for all active volunteers
* **Coordinators notified via FCM** when volunteer is flagged

---

### Real-time — Server-Sent Events
* **Single persistent connection** replaces all 3-second polling intervals
* **Channels:** needs, tasks, heatmap, queue, * (all)
* **Firestore onSnapshot listeners** push to connected SSE clients
* **Events:** need:scored, need:updated, heatmap:new-need, heatmap:need-resolved, task:updated, queue:status
* **Heartbeat every 30 seconds** keeps connection alive through Render's proxy
* **X-Accel-Buffering: no** header disables Nginx buffering
* **SSE stats endpoint:** connected client count by channel
* **Queue status broadcast** after every AI batch — live queue position for community members

---

### Caching Strategy
* **cacheService.js** wraps ioredis with no-op fallback
* **getOrSet(key, ttl, fetchFn)** — cache-aside pattern used across all heavy routes
* **Heatmap:** 60s TTL, ETag support, invalidated on need submit/status change
* **Match results:** 300s TTL, invalidated on assignment
* **Impact stats:** 300s TTL, invalidated on task verify
* **Volunteer list:** 120s TTL, invalidated on profile update
* **Predictions:** 3600s TTL (1 hour)
* **AI semantic cache:** 6h TTL per normalized need text hash
* **delPattern('heatmap:*')** clears related cache groups

---

### Impact Dashboard
* **GET /api/impact** — aggregate stats: totalNeedsReported, needsResolved, resolutionRate, activeVolunteers, totalVolunteerHours, peopleHelped, avgResponseTime, needsByCategory, needsByUrgency, weeklyTrend (8 weeks)
* **Filterable** by orgId, startDate, endDate
* **POST /api/impact/sitrep** — coordinator auth, AI-generated formal 3-paragraph NGO situation report

---

### Coordinator Analytics
* **Avg resolution time** by need category
* **Volunteer leaderboard** (top 10 by tasks completed in last 30 days)
* **Need hot zones** (top 5 areas by submission volume with category breakdown)
* **Weekly trend** (submitted vs resolved vs volunteers deployed)
* **SLA compliance:** % of needs resolved within 24 hours
* **Individual volunteer performance profile**

---

### Donor Portal (Public, No Auth)
* **Sanitized public stats:** totalNeedsAddressed, volunteersActive, peopleHelped, totalHours
* **Resolved needs list:** location fuzzed to 500m radius to prevent re-identification
* **Need story endpoint:** volunteer first name only, fuzzed location, outcome, people helped

---

### Resource Tracking
* **Full CRUD** for physical resources (medical kits, food, tarpaulins, etc.)
* **Deploy endpoint** — decrements quantity, records taskId + amount + timestamp
* **Available resources filter** — quantity > 0, filterable by category

---

### Cross-NGO Coordination
* **Handoff request:** NGO A formally requests NGO B take over a need
* **Notifies target org coordinators** via FCM
* **Accept/decline** workflow
* **GeoJSON cross-NGO map endpoint** for map visualization

---

### Predictions Engine (Rule-based)
* **Groups last 12 months of needs** by category and month
* **Identifies historically high months** for each category
* **Returns predicted counts** with confidence level (high/medium/low based on data volume)
* **Recommended actions** per category (e.g. "Pre-position first aid kits")
* **No AI cost** — pure statistics, cached 1 hour

---

### WhatsApp & SMS Intake
* **Twilio webhook** receives messages from any phone — no app install required
* **Language detection** on incoming message
* **Free-form text parsed** into structured need (category detection, location hint extraction)
* **Acknowledgment sent back** in submitter's language (7 languages)
* **HELP command** returns usage instructions in detected language
* **STOP handled automatically** by Twilio

---

### Need Lifecycle Notifications
* **Submitters notified** when their need is assigned (volunteer coming)
* **Submitters notified** when their need is resolved
* **Notifications sent** via FCM (if they have account) or SMS/WhatsApp (if submitted via phone)
* **Messages localized** to submitter's detected language

---

### Offline PWA Support
* **GET /api/pwa/volunteer-cache/:id** — returns volunteer profile + active tasks + need details for IndexedDB caching
* **POST /api/pwa/sync** — accepts queued offline actions (task updates, need submissions, location updates), processes oldest-first by timestamp
* **Service worker (sw.js)** for Ishu: network-first for API, cache-first for assets, IndexedDB queue for offline POST/PATCH, background sync on reconnect, push notification handling

---

### Security
* **Firestore security rules** enforced at database level (independent of API)
* **Input sanitization** on all free-text fields (`sanitize-html`)
* **UUID-based temp filenames** for audio uploads (no user-controlled paths)
* **SHA-256 submitter hash** for abuse investigation without storing raw IPs
* **Twilio signature validation** on webhook in production
* **PII scrubbing:** donor routes fuzzy-locate to 500m, strip all reporter identity
* **Sentry events scrubbed** of phone, email, location before transmission
* **Rate limiting** per-user for authenticated routes, per-IP for public routes

---

### Seed & Demo Tools
* **seedData.js** — 3 orgs, 15 volunteers, 50 needs, 30 tasks, 5 resources with realistic Mumbai/Pune coordinates
* **_seeded: true** flag on all seeded documents for selective clearing
* **clearData() function** deletes only seeded documents
* **GET /api/demo/status** — check demo mode
* **POST /api/demo/reset** — clear seeded data (protected by `x-demo-secret` header)