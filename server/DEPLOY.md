# CivicPulse Deployment Guide

## Prerequisites
- GitHub repo pushed and up to date
- Railway account at railway.app (free)
- Vercel account for frontend (handled by Ishu)

---

## Backend Deployment on Railway

### Step 1 — Push latest code
```bash
git add .
git commit -m "chore: production ready"
git push origin main
```

### Step 2 — Create Railway project
1. Go to [railway.app](https://railway.app) → Login with GitHub
2. Click **New Project** → **Deploy from GitHub repo**
3. Select `civicpulse` repo
4. Railway auto-detects Node.js. Click **Deploy**
5. In Settings → **Root Directory** → set to `server`

### Step 3 — Add Redis plugin
1. In your Railway project, click **+ New** → **Database** → **Add Redis**
2. Railway auto-sets `REDIS_URL` env variable — no action needed

### Step 4 — Add environment variables
In Railway dashboard → your service → **Variables** tab, add ALL of these:

| Variable | Where to get it |
|---|---|
| `PORT` | Set to `3001` |
| `NODE_ENV` | Set to `production` |
| `FIREBASE_PROJECT_ID` | Firebase Console → Project Settings → General |
| `FIREBASE_CLIENT_EMAIL` | Firebase Console → Project Settings → Service Accounts → Generate Key |
| `FIREBASE_PRIVATE_KEY` | Same JSON file — copy the `private_key` value exactly including `\n` |
| `GROQ_API_KEY` | [console.groq.com](https://console.groq.com) → API Keys |
| `GEMINI_API_KEY` | [aistudio.google.com](https://aistudio.google.com) → Get API Key |
| `CLIENT_URL` | Your Vercel frontend URL e.g. `https://civicpulse.vercel.app` |
| `FIREBASE_WEB_API_KEY` | Firebase Console → Project Settings → General → Web API Key |

> ⚠️ For FIREBASE_PRIVATE_KEY: In Railway, paste the key value exactly as it is in the JSON
> file. Railway handles multiline values correctly — do NOT manually escape \n.

### Step 5 — Deploy and get your URL
1. Railway will auto-deploy after you add variables
2. Go to your service → **Settings** → **Networking** → **Generate Domain**
3. Your URL will be: `https://civicpulse-server-xxxx.up.railway.app`
4. Test it: open that URL + `/api/health` in browser — you should see `{"status":"ok",...}`

### Step 6 — Share URL with frontend (Ishu)
Ishu needs to add this to Vercel:
VITE_API_BASE_URL=https://civicpulse-server-xxxx.up.railway.app

### Step 7 — Deploy Firestore security rules
```bash
# Install Firebase CLI if you haven't
npm install -g firebase-tools

# Login
firebase login

# Initialize (select your project, select Firestore)
firebase init firestore

# Deploy rules
firebase deploy --only firestore:rules
```

### Step 8 — Seed production data (optional)
```bash
# From your local machine, pointing at production Firebase
NODE_ENV=production node scripts/seedData.js
```

---

## Verify Everything Works

Run these in order after deployment:

```bash
# 1. Health check
curl https://your-railway-url.up.railway.app/api/health

# 2. Heatmap (public)
curl https://your-railway-url.up.railway.app/api/needs/heatmap

# 3. Public donor stats
curl https://your-railway-url.up.railway.app/api/donor/public-stats

# 4. Impact stats
curl https://your-railway-url.up.railway.app/api/impact
```

All should return JSON with data. If any return 500, check Railway logs.

---

## Checking Logs on Railway
Railway dashboard → your service → **Deployments** tab → click latest → **View Logs**

---

## Common Deployment Issues

| Problem | Fix |
|---|---|
| `Cannot find module` error | Make sure `server/` is set as root directory in Railway |
| Firebase auth error | Check FIREBASE_PRIVATE_KEY — make sure there are no extra quotes |
| Redis connection error | Safe to ignore — app falls back to no-cache mode |
| CORS error from frontend | Check CLIENT_URL env variable matches Ishu's Vercel URL exactly |
| 503 health check failing | Check PORT is set to 3001, not 80 |