# Movent — Know the moment. Make the move.

> **AI-powered Customer Moment Engine for enterprise marketers.**

---

## What is Movent?

Movent is an AI-powered Customer Moment Engine that helps enterprise marketing teams detect when customers are about to disengage — and act on it immediately. It analyzes cross-channel behavioral signals in real time, explains *why* a customer is at risk in plain English, and recommends the precise intervention: the right channel, the right message, at the right time.

Rather than reacting to churn after it happens, Movent surfaces "moments" — critical windows of opportunity — before they close.

---

## Features

- **Moment Radar** — Live feed of at-risk customers with risk scores, behavioral signal summaries, and channel activity indicators
- **AI-Powered Moment Intelligence** — Per-customer deep-dive with a scrollable journey timeline, AI-generated risk explanation, and a recommended intervention
- **Impact Cockpit** — Executive analytics dashboard with KPI cards, disengagement pattern charts, and an intervention log
- **Cascading AI Provider System** — Groq → Ollama → Mock fallback with a visible source badge on every AI response
- **One-Click Intervention Approval** — Approve and log recommended interventions directly from the UI

---

## Tech Stack

### Frontend
- React 18 (Create React App)
- Tailwind CSS 3
- Recharts (data visualization)
- Lucide React (icons)
- Inter font (Google Fonts)

### Backend
- Python FastAPI
- python-dotenv
- groq (Groq Python SDK)
- requests (HTTP client for Ollama fallback)
- Uvicorn (ASGI server)

---

## AI Cascade System

Movent uses a three-tier AI fallback system to ensure the app always works, regardless of API availability:

```
1. Groq API (llama3-70b-8192) — Primary
   ↓ fails
2. Ollama (llama3 local) — Secondary
   ↓ fails
3. Hardcoded intelligent mock responses — Final fallback
```

Every AI response includes a `source` field (`"groq"`, `"ollama"`, or `"mock"`) displayed as a badge on the UI.

### Getting a free Groq API key

1. Go to [console.groq.com](https://console.groq.com)
2. Sign up for a free account
3. Navigate to **API Keys** → **Create new key**
4. Copy the key and set it as `GROQ_API_KEY` in `backend/.env`

### Setting up Ollama (local fallback)

1. Install Ollama from [ollama.com/download](https://ollama.com/download)
2. Pull the llama3 model: `ollama pull llama3`
3. Ollama runs automatically at `http://localhost:11434` — no configuration needed

---

## Setup & Installation

### Prerequisites
- Node.js 18+, Yarn
- Python 3.10+

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env and set your GROQ_API_KEY

# Start the server
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

### Frontend

```bash
cd frontend
yarn install

# Configure environment
# Set REACT_APP_BACKEND_URL in .env to your backend URL (e.g. http://localhost:8001)

yarn start
```

The frontend runs on `http://localhost:3000` and the backend on `http://localhost:8001`.

---

## API Endpoints

### `POST /api/analyze-moment`
Accepts customer name, segment, risk score, and behavioral events. Returns a 2–3 sentence AI explanation of why the customer is at risk plus a recommended intervention (channel, message type, urgency, confidence). Includes a `source` field indicating the AI provider used.

### `POST /api/approve-intervention`
Accepts customer ID, channel, and message type. Returns a success confirmation. (Mock — no real message sending.)

### `GET /api/dashboard-metrics`
Returns aggregate KPI data: moments detected, interventions approved, churn prevented, recovery rate, top disengagement patterns, 7-day daily stats, and an intervention log.

---

## Screens

### 1. Moment Radar (default)
Customer at-risk feed with 4 summary stat cards, filter tabs (All / High Risk / Medium Risk / Recovered), and cards for each customer showing their signal summary, channel activity icons, risk score, and a "View Moment" CTA.

### 2. Moment Intelligence
Per-customer deep-dive. Shows a horizontally scrollable behavioral journey timeline colored by channel, an AI Insight card with the risk explanation and AI source badge, and a Recommendation card with approve/dismiss actions.

### 3. Impact Cockpit
Analytics dashboard with 4 KPI cards (with trend percentages), a horizontal bar chart of top disengagement patterns, a dual-line chart of interventions vs. recoveries over 7 days, and a full intervention log table.

---

## Notes

This project was built as a hackathon submission for **Texpedition by Epsilon**.

---

*Movent — Know the moment. Make the move.*
