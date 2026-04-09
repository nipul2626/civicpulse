# CivicPulse 🌍  


An AI-powered community resource coordination platform that transforms fragmented NGO data into real-time actionable intelligence and automatically matches the right volunteers to the most urgent needs.

---

## 🚨 Problem

Local NGOs collect critical community data through:
- Paper surveys  
- WhatsApp messages  
- Field officer notes  

This leads to:
- Fragmented, unstructured data  
- No unified view of community needs  
- Manual and slow volunteer coordination  
- Delayed response in emergencies  

Existing tools (Google Forms, Excel, KoboToolbox, WhatsApp) solve isolated problems but fail to connect the full workflow.

---

## 💡 Solution: CivicPulse

CivicPulse closes the entire loop:

**Collect → Analyze → Prioritize → Match → Deploy → Track → Report → Improve**

---

## ⚡ Key Features

### 📥 Data Collection
- Multi-format input (quick form, detailed report, CSV upload, OCR)
- Voice-to-text transcription
- Offline-capable PWA (auto-sync when online)

### 🧠 AI Engine (Gemini)
- Urgency scoring  
- Automatic categorization  
- Deduplication of repeated reports  
- Situation report generation  
- Predictive need forecasting  
- Volunteer burnout detection  

### 🗺️ Live Heatmap
- Real-time urgency visualization  
- Category filters  
- Interactive need pins  

### 🤝 Smart Volunteer Matching
- 6-factor ranking system:
  - Skills
  - Proximity
  - Availability
  - Reliability
  - Workload
  - Task history  
- Fallback chain ensures no task is dropped  

### 📋 Task Management
- Kanban board lifecycle:
  - Unassigned → Assigned → In Progress → Completed → Verified  
- Real-time updates  

### 📊 Impact Dashboard
- Needs resolved  
- People helped  
- Volunteer hours  
- Response time analytics  

### 📦 Resource Tracking
- Inventory management  
- Resource-to-task linking  

### 🌐 Donor Transparency
- Public impact portal  
- Real-time updates  
- Geo-tagged proof of work  

---

## 🧮 AI Scoring Formula
Urgency Score = (Severity × 0.35) + (People Affected × 0.25) + (Time Sensitivity × 0.20) + (Vulnerability Index × 0.15) − (Duplication Penalty × 0.05)


---

## 🏗️ Tech Stack

### Frontend
- React (Vite)
- Tailwind CSS
- Framer Motion
- Leaflet + OpenStreetMap
- Zustand
- React Query

### Backend
- Node.js + Express
- Firebase Firestore
- Firebase Auth
- Firebase Cloud Messaging
- Firebase Cloud Tasks
- Redis

### AI
- Gemini 1.5 Flash API

### Deployment
- Frontend: Vercel  
- Backend: Railway  



