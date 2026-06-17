const API_BASE = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

export async function analyzeCustomerMoment(customer) {
  const response = await fetch(`${API_BASE}/api/analyze-moment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customer_name: customer.name,
      segment: customer.segment,
      risk_score: customer.risk,
      events: customer.events.map(e => ({
        type: e.type,
        action: e.action,
        date: e.date,
      }))
    })
  });
  if (!response.ok) throw new Error(`API error: ${response.status}`);
  return response.json();
}

export async function approveIntervention(customerId, channel, messageType) {
  const response = await fetch(`${API_BASE}/api/approve-intervention`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customer_id: customerId,
      channel,
      message_type: messageType,
    })
  });
  if (!response.ok) throw new Error(`API error: ${response.status}`);
  return response.json();
}

export async function getDashboardMetrics() {
  const response = await fetch(`${API_BASE}/api/dashboard-metrics`);
  if (!response.ok) throw new Error(`API error: ${response.status}`);
  return response.json();
}
