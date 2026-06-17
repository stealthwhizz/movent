# Movent — PRD

**Tagline:** Know the moment. Make the move.

---

## Problem Statement
Enterprise marketers need a way to detect customers about to disengage, understand WHY using cross-channel behavioral signals, and act precisely — right channel, right message, right time.

---

## Architecture

### Stack
- **Frontend:** React 18 (CRA), Tailwind CSS 3, Recharts, Lucide React, Inter font
- **Backend:** FastAPI (Python), python-dotenv, groq SDK, requests
- **AI:** Groq (llama3-70b-8192) → Ollama (llama3 local) → Intelligent mock fallback
- **No database, no auth** — stateless app with hardcoded customer demo data

### File Structure
```
/app/
├── backend/
│   ├── server.py          # FastAPI app with 3 endpoints
│   ├── requirements.txt
│   ├── .env               # GROQ_API_KEY, MONGO_URL, DB_NAME
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── App.js         # Root routing (radar/intelligence/cockpit)
│   │   ├── components/
│   │   │   ├── Navbar.js
│   │   │   ├── MomentRadar.js      # Screen 1: customer feed
│   │   │   ├── CustomerCard.js     # Individual card component
│   │   │   ├── MomentIntelligence.js  # Screen 2: AI analysis
│   │   │   └── ImpactCockpit.js    # Screen 3: analytics
│   │   ├── data/customers.js       # 10 hardcoded customers with events
│   │   └── utils/api.js            # API call helpers
│   ├── public/index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── postcss.config.js
├── README.md
└── .gitignore
```

### API Endpoints
1. `POST /api/analyze-moment` — AI cascade (Groq → Ollama → mock), returns explanation + recommendation + source
2. `POST /api/approve-intervention` — mock confirmation, returns success
3. `GET /api/dashboard-metrics` — hardcoded KPIs, charts data, intervention log

---

## Screens

### Screen 1: Moment Radar (default)
- 4 stat cards (10 moments, 7 interventions, 8 at-risk, avg 62)
- Filter tabs: All / High Risk (≥75) / Medium Risk (40-74) / Recovered (<40)
- 10 customer cards with avatar, name, segment, signal, channel icons, risk pill, "View Moment" CTA

### Screen 2: Moment Intelligence
- Back button, customer header with risk pill
- Horizontal scrollable journey timeline (events colored by channel, newest has pulsing ring)
- AI Insight card with shimmer loading + "Offline Mode"/"Powered by Groq"/"Powered by Ollama" badge
- Recommendation card (channel icon, message type, urgency badge, confidence bar, Approve/Dismiss)
- Approve button → POST /api/approve-intervention → toast + green "Approved" state

### Screen 3: Impact Cockpit
- 4 KPI cards with trend percentages
- Horizontal bar chart: Top Disengagement Patterns (Recharts)
- Line chart: Interventions vs Recoveries 7 Days (Recharts)
- Intervention log table (Customer, Signal, Channel Used, Outcome badges)

---

## Design System
- Background: `#FAFAF8`, Cards: `#FFFFFF border #E8E6E1 shadow-sm`
- Primary: `#2D6BE4`, Danger: `#E84444`, Warning: `#F5A623`, Success: `#22A95B`
- Text: `#1A1916`, Muted: `#7A7874`
- Rec card bg: `#EEF4FF`
- Font: Inter (Google Fonts)
- Style: Linear/Notion minimal, no dark mode, no gradients

---

## What's Been Implemented (Jun 17-18, 2026)
- ✅ Full backend with 3 endpoints + AI cascade (Groq → Ollama → mock)
- ✅ 10 hardcoded customers with 10-15 events each
- ✅ All 3 frontend screens fully functional
- ✅ AI Insight card with shimmer loading and source badge
- ✅ Approve Intervention flow with toast notification
- ✅ Filter tabs, channel icons, risk pills
- ✅ Recharts bar + line charts in Impact Cockpit
- ✅ Mobile responsive design
- ✅ README.md + .gitignore created
- ✅ 100% test pass rate (backend + frontend e2e)

---

## Backlog / Future Work
- P0: Real Groq API key integration (current key is xAI format, fallback to mock is active)
- P1: Real-time customer data source (webhook/API integration)
- P1: Bulk intervention approval
- P2: Customer search/sort on Moment Radar
- P2: Export intervention log (CSV/PDF)
- P3: Email/push notification sending via SendGrid/Twilio
- P3: Historical moment tracking (add MongoDB persistence)
