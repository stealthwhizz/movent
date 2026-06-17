import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestDashboardMetrics:
    def test_dashboard_metrics_status(self):
        r = requests.get(f"{BASE_URL}/api/dashboard-metrics")
        assert r.status_code == 200

    def test_dashboard_metrics_data(self):
        r = requests.get(f"{BASE_URL}/api/dashboard-metrics")
        data = r.json()
        assert data["moments_detected"] == 247
        assert data["interventions_approved"] == 183
        assert data["churn_prevented"] == 41
        assert "recovery_rate" in data
        assert len(data["top_disengagement_patterns"]) == 6
        assert len(data["daily_stats"]) == 7
        assert len(data["intervention_log"]) == 8

    def test_intervention_log_columns(self):
        r = requests.get(f"{BASE_URL}/api/dashboard-metrics")
        log = r.json()["intervention_log"]
        for row in log:
            assert "customer" in row
            assert "signal" in row
            assert "channel" in row
            assert "outcome" in row

    def test_outcome_values(self):
        r = requests.get(f"{BASE_URL}/api/dashboard-metrics")
        log = r.json()["intervention_log"]
        valid_outcomes = {"Recovered", "Pending", "No Response"}
        for row in log:
            assert row["outcome"] in valid_outcomes


class TestAnalyzeMoment:
    def test_analyze_moment_status(self):
        payload = {
            "customer_name": "Priya Mehta",
            "segment": "High-Value Lapsed",
            "risk_score": 88,
            "events": [{"type": "web", "action": "Added to cart", "date": "Jun 17"}]
        }
        r = requests.post(f"{BASE_URL}/api/analyze-moment", json=payload)
        assert r.status_code == 200

    def test_analyze_moment_response_structure(self):
        payload = {
            "customer_name": "Priya Mehta",
            "segment": "High-Value Lapsed",
            "risk_score": 88,
            "events": [{"type": "web", "action": "Added to cart", "date": "Jun 17"}]
        }
        r = requests.post(f"{BASE_URL}/api/analyze-moment", json=payload)
        data = r.json()
        assert "explanation" in data
        assert "recommendation" in data
        assert "source" in data
        rec = data["recommendation"]
        assert "channel" in rec
        assert "message_type" in rec
        assert "urgency" in rec
        assert "confidence" in rec

    def test_analyze_moment_source_field(self):
        payload = {
            "customer_name": "Priya Mehta",
            "segment": "High-Value Lapsed",
            "risk_score": 88,
            "events": [{"type": "web", "action": "Added to cart", "date": "Jun 17"}]
        }
        r = requests.post(f"{BASE_URL}/api/analyze-moment", json=payload)
        data = r.json()
        # Expected to be mock since Groq key is invalid
        assert data["source"] in ["groq", "ollama", "mock"]

    def test_analyze_moment_recommendation_values(self):
        payload = {
            "customer_name": "Sneha Rao",
            "segment": "New User",
            "risk_score": 81,
            "events": [{"type": "app", "action": "App installed", "date": "Jun 8"}]
        }
        r = requests.post(f"{BASE_URL}/api/analyze-moment", json=payload)
        data = r.json()
        rec = data["recommendation"]
        assert rec["channel"] in ["email", "web", "app", "paid", "push"]
        assert rec["urgency"] in ["high", "medium", "low"]
        assert isinstance(rec["confidence"], int)
        assert 0 <= rec["confidence"] <= 100


class TestApproveIntervention:
    def test_approve_intervention_status(self):
        payload = {"customer_id": "1", "channel": "push", "message_type": "Win-Back Offer"}
        r = requests.post(f"{BASE_URL}/api/approve-intervention", json=payload)
        assert r.status_code == 200

    def test_approve_intervention_success(self):
        payload = {"customer_id": "1", "channel": "push", "message_type": "Win-Back Offer"}
        r = requests.post(f"{BASE_URL}/api/approve-intervention", json=payload)
        data = r.json()
        assert data["success"] is True
        assert "message" in data
        assert data["customer_id"] == "1"
        assert "scheduled_at" in data
