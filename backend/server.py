import os
import json
import requests
from datetime import datetime, timezone
from typing import List
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "")
GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_MODEL = "llama3-70b-8192"
OLLAMA_URL = "http://localhost:11434/v1/chat/completions"

app = FastAPI(title="Movent - Customer Moment Engine API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class BehavioralEvent(BaseModel):
    type: str
    action: str
    date: str


class AnalyzeMomentRequest(BaseModel):
    customer_name: str
    segment: str
    risk_score: int
    events: List[BehavioralEvent]


class ApproveInterventionRequest(BaseModel):
    customer_id: str
    channel: str
    message_type: str


def build_prompt(customer_name: str, segment: str, risk_score: int, events: List[BehavioralEvent]) -> str:
    events_text = "\n".join([f"- {e.date}: [{e.type.upper()}] {e.action}" for e in events[:12]])
    return f"""You are an AI customer retention analyst. Analyze this customer and return ONLY a JSON object.

Customer: {customer_name}
Segment: {segment}
Risk Score: {risk_score}/100

Recent Events (newest first):
{events_text}

Return ONLY this JSON (no markdown, no extra text):
{{
  "explanation": "2-3 sentence plain English explanation of why this customer is at risk",
  "recommendation": {{
    "channel": "email",
    "message_type": "specific message type",
    "urgency": "high",
    "confidence": 85
  }}
}}

Rules:
- explanation: 2-3 sentences, specific to this customer's behavior pattern
- channel: one of exactly: email, web, app, paid, push
- urgency: one of exactly: high, medium, low
- confidence: integer 60-95
- urgency should be high if risk>=75, medium if 40-74, low if <40"""


def call_groq(prompt: str) -> dict:
    if not GROQ_API_KEY:
        raise ValueError("No GROQ_API_KEY configured")

    response = requests.post(
        GROQ_API_URL,
        headers={
            "Authorization": f"Bearer {GROQ_API_KEY}",
            "Content-Type": "application/json"
        },
        json={
            "model": GROQ_MODEL,
            "messages": [{"role": "user", "content": prompt}],
            "response_format": {"type": "json_object"},
            "temperature": 0.3,
            "max_tokens": 500
        },
        timeout=15
    )
    response.raise_for_status()
    data = response.json()
    content = data["choices"][0]["message"]["content"]
    result = json.loads(content)
    result["source"] = "groq"
    return result


def call_ollama(prompt: str) -> dict:
    response = requests.post(
        OLLAMA_URL,
        json={
            "model": "llama3",
            "messages": [
                {"role": "system", "content": "You are a helpful AI. Respond ONLY with valid JSON."},
                {"role": "user", "content": prompt}
            ],
            "stream": False
        },
        timeout=30
    )
    response.raise_for_status()
    data = response.json()
    content = data["choices"][0]["message"]["content"]
    result = json.loads(content)
    result["source"] = "ollama"
    return result


MOCK_RESPONSES = {
    "High-Value Lapsed": {
        "explanation": "This customer has abandoned a cart item and failed to respond to 4 consecutive email sends over the past week, indicating severe email channel fatigue combined with high purchase intent. The 7-day silence following clear cart engagement is a strong pre-churn signal in the high-value segment. An alternative channel intervention through push is critical to recovery before the purchase intent window closes entirely.",
        "recommendation": {"channel": "push", "message_type": "Exclusive Win-Back Offer", "urgency": "high", "confidence": 87}
    },
    "Repeat Buyer": {
        "explanation": "This repeat buyer's 21-day purchase gap significantly exceeds their historical repurchase cadence, and the absence of browse or wishlist activity signals a shift in engagement intent. Without a re-engagement touchpoint in the past three weeks, the risk of permanent churn is elevated. A personalized replenishment reminder anchored to their last purchase category is the highest-probability reactivation lever.",
        "recommendation": {"channel": "email", "message_type": "Personalized Replenishment Reminder", "urgency": "medium", "confidence": 78}
    },
    "New User": {
        "explanation": "This customer installed the app and engaged briefly on day 1 but has never returned — a classic onboarding abandonment pattern that predicts uninstall within 72 hours. Without a timely intervention, the probability of permanent app churn exceeds 80% based on cohort benchmarks for this segment. An in-app re-engagement push highlighting a clear first value moment has 3x the recovery rate of email for day-1 drop-offs.",
        "recommendation": {"channel": "push", "message_type": "Onboarding Completion Nudge", "urgency": "high", "confidence": 82}
    },
    "Browse Intent": {
        "explanation": "This customer has shown high browse frequency with 8+ sessions this week and wishlist additions but has not converted, indicating a hesitation pattern likely driven by price sensitivity or competitor comparison. The wishlist signal is a strong purchase intent marker that has not been activated by current outreach. A timely limited-time offer on their saved items could bridge the intent-to-purchase gap before attention shifts.",
        "recommendation": {"channel": "email", "message_type": "Wishlist Price Drop Alert", "urgency": "medium", "confidence": 74}
    },
    "Email Fatigued": {
        "explanation": "This customer explicitly unsubscribed from email but continues to receive paid ad exposure, creating a negative brand experience that accelerates churn risk. The combination of unsubscribe action with continued retargeting is creating regulatory risk and pushing a recoverable customer toward permanent disengagement. Shifting to a consent-based web retargeting strategy with a suppressed email flag is the recommended path.",
        "recommendation": {"channel": "web", "message_type": "Preference Center Re-engagement", "urgency": "high", "confidence": 79}
    },
    "Seasonal Buyer": {
        "explanation": "This seasonal buyer's last purchase aligns with a December calendar event, and their 4-month inactivity falls within the expected inter-purchase interval for this segment. However, the approach of a new seasonal repurchase window makes this an optimal pre-activation moment. A category-specific preview campaign delivered 3-4 weeks before their purchase anniversary has the highest reactivation probability.",
        "recommendation": {"channel": "email", "message_type": "Seasonal Preview Campaign", "urgency": "medium", "confidence": 68}
    },
    "Loyal Customer": {
        "explanation": "This loyal customer's 40% drop in email open rate over one month is a leading churn indicator that typically precedes full disengagement by 4-8 weeks. Despite strong historical engagement, the declining attention metrics suggest the current content cadence is no longer resonating with this customer. A preference survey combined with reduced send frequency can stabilize engagement before active disengagement sets in.",
        "recommendation": {"channel": "email", "message_type": "Loyalty Preference Survey", "urgency": "low", "confidence": 72}
    },
    "Trial User": {
        "explanation": "This trial user is in the critical final 48-hour window before trial expiry with no upgrade action taken — the highest-risk conversion moment in the entire trial lifecycle. The absence of pricing page exploration signals either insufficient feature discovery or a perceived value mismatch that has not been addressed by onboarding emails. An immediate in-app intervention showcasing unused premium features can increase trial-to-paid conversion by up to 35%.",
        "recommendation": {"channel": "app", "message_type": "Trial Expiry Feature Showcase", "urgency": "high", "confidence": 89}
    },
    "Re-engaged": {
        "explanation": "This customer was successfully reactivated after a prior disengagement period, demonstrating high responsiveness to push intervention, and their recent purchase confirms the reactivation worked. However, early re-engaged customers show a 28% relapse rate within 30 days without a follow-up retention touchpoint. A post-purchase satisfaction check-in will reinforce the relationship and surface any friction before it becomes a retention issue.",
        "recommendation": {"channel": "push", "message_type": "Post-Purchase Check-In", "urgency": "low", "confidence": 65}
    },
    "High Intent": {
        "explanation": "This customer is actively reading product reviews and comparing competitor options, placing them in the final evaluation phase of the purchase journey — the most time-sensitive intervention window. The competitor comparison behavior indicates they have not yet committed, meaning a well-timed value-differentiation message could capture the conversion. A direct competitive positioning message delivered within the next 12 hours has the highest probability for this behavioral pattern.",
        "recommendation": {"channel": "web", "message_type": "Competitive Differentiation Message", "urgency": "medium", "confidence": 76}
    }
}


def get_mock_response(customer_name: str, segment: str, risk_score: int) -> dict:
    mock = MOCK_RESPONSES.get(segment)
    if mock:
        return {
            "explanation": mock["explanation"],
            "recommendation": dict(mock["recommendation"]),
            "source": "mock"
        }
    urgency = "high" if risk_score >= 75 else "medium" if risk_score >= 40 else "low"
    return {
        "explanation": f"{customer_name} is showing behavioral patterns consistent with pre-churn disengagement across multiple channels. The combination of reduced activity frequency and non-responsiveness to recent outreach indicates declining intent. An immediate cross-channel intervention is recommended before this customer is permanently lost.",
        "recommendation": {"channel": "email", "message_type": "Re-engagement Campaign", "urgency": urgency, "confidence": 70},
        "source": "mock"
    }


@app.post("/api/analyze-moment")
def analyze_moment(request: AnalyzeMomentRequest):
    prompt = build_prompt(request.customer_name, request.segment, request.risk_score, request.events)

    try:
        return call_groq(prompt)
    except Exception:
        pass

    try:
        return call_ollama(prompt)
    except Exception:
        pass

    return get_mock_response(request.customer_name, request.segment, request.risk_score)


@app.post("/api/approve-intervention")
def approve_intervention(request: ApproveInterventionRequest):
    return {
        "success": True,
        "message": f"Intervention approved. {request.message_type} scheduled via {request.channel.upper()} for customer {request.customer_id}.",
        "customer_id": request.customer_id,
        "channel": request.channel,
        "message_type": request.message_type,
        "scheduled_at": datetime.now(timezone.utc).isoformat()
    }


@app.get("/api/dashboard-metrics")
def dashboard_metrics():
    return {
        "moments_detected": 247,
        "interventions_approved": 183,
        "churn_prevented": 41,
        "recovery_rate": 22.4,
        "trends": {
            "moments_detected": "+14%",
            "interventions_approved": "+8%",
            "churn_prevented": "+31%",
            "recovery_rate": "+4.2%"
        },
        "top_disengagement_patterns": [
            {"pattern": "Email Fatigue", "count": 68},
            {"pattern": "Cart Abandonment", "count": 54},
            {"pattern": "Day-1 Drop-off", "count": 47},
            {"pattern": "Long Purchase Gap", "count": 38},
            {"pattern": "Trial Expiry", "count": 29},
            {"pattern": "Ad + Unsub Overlap", "count": 11}
        ],
        "daily_stats": [
            {"date": "Jun 12", "interventions": 22, "recoveries": 5},
            {"date": "Jun 13", "interventions": 28, "recoveries": 7},
            {"date": "Jun 14", "interventions": 19, "recoveries": 4},
            {"date": "Jun 15", "interventions": 35, "recoveries": 9},
            {"date": "Jun 16", "interventions": 31, "recoveries": 6},
            {"date": "Jun 17", "interventions": 27, "recoveries": 7},
            {"date": "Jun 18", "interventions": 21, "recoveries": 3}
        ],
        "intervention_log": [
            {"customer": "Priya Mehta", "signal": "Cart abandonment + email silence", "channel": "Push", "outcome": "Recovered"},
            {"customer": "Aditya Kumar", "signal": "Trial expiry approaching", "channel": "App", "outcome": "Recovered"},
            {"customer": "Sneha Rao", "signal": "Day-1 app drop-off", "channel": "Push", "outcome": "Pending"},
            {"customer": "Arjun Shah", "signal": "21-day purchase gap", "channel": "Email", "outcome": "Pending"},
            {"customer": "Divya Nair", "signal": "Email fatigue + ad overlap", "channel": "Web", "outcome": "No Response"},
            {"customer": "Rohan Desai", "signal": "Competitor comparison detected", "channel": "Web", "outcome": "Recovered"},
            {"customer": "Karan Joshi", "signal": "Seasonal purchase window", "channel": "Email", "outcome": "Pending"},
            {"customer": "Rahul Verma", "signal": "Wishlist not converted", "channel": "Email", "outcome": "Recovered"}
        ]
    }
