import React, { useState, useEffect } from 'react';
import { ArrowLeft, Mail, Globe, Smartphone, Target, Bell, CheckCircle } from 'lucide-react';
import { analyzeCustomerMoment, approveIntervention } from '../utils/api';

const CHANNEL_CFG = {
  email: { icon: Mail, color: '#2D6BE4', label: 'Email' },
  web:   { icon: Globe, color: '#7B5CF5', label: 'Web' },
  app:   { icon: Smartphone, color: '#22A95B', label: 'App' },
  paid:  { icon: Target, color: '#F5A623', label: 'Paid' },
  push:  { icon: Bell, color: '#E84444', label: 'Push' },
};

function getRiskPill(risk) {
  if (risk >= 75) return 'bg-[#FEF2F2] text-[#E84444]';
  if (risk >= 40) return 'bg-[#FFFBEB] text-[#F5A623]';
  return 'bg-[#F0FDF4] text-[#22A95B]';
}

function SourceBadge({ source }) {
  const map = {
    groq:   { label: 'Powered by Groq', cls: 'bg-[#EEF4FF] text-[#2D6BE4]' },
    ollama: { label: 'Powered by Ollama', cls: 'bg-[#F0FDF4] text-[#22A95B]' },
    mock:   { label: 'Offline Mode', cls: 'bg-[#F5F4F1] text-[#7A7874]' },
  };
  const cfg = map[source] || map.mock;
  return (
    <span data-testid="ai-source-badge" className={`text-[10px] font-medium px-2 py-0.5 rounded-md ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
}

function Shimmer() {
  return (
    <div className="space-y-3" data-testid="ai-loading-shimmer">
      <div className="shimmer h-3.5 rounded-md w-full"></div>
      <div className="shimmer h-3.5 rounded-md w-11/12"></div>
      <div className="shimmer h-3.5 rounded-md w-5/6"></div>
      <div className="shimmer h-3.5 rounded-md w-4/6"></div>
    </div>
  );
}

export default function MomentIntelligence({ customer, onBack }) {
  const [aiData, setAiData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [approved, setApproved] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setAiData(null);
    setApproved(false);
    analyzeCustomerMoment(customer)
      .then(data => { if (!cancelled) setAiData(data); })
      .catch(() => { if (!cancelled) setAiData(null); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customer.id]);

  const handleApprove = async () => {
    if (!aiData?.recommendation) return;
    try {
      await approveIntervention(customer.id, aiData.recommendation.channel, aiData.recommendation.message_type);
      setApproved(true);
      showToast('success', `Intervention approved via ${aiData.recommendation.channel.toUpperCase()}`);
    } catch {
      showToast('error', 'Failed to approve. Please try again.');
    }
  };

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const rec = aiData?.recommendation;
  const reversedEvents = [...customer.events].reverse();

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Toast */}
      {toast && (
        <div
          data-testid="toast-notification"
          className={`fixed top-20 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-lg shadow-lg text-sm font-medium transition-all duration-300 ${
            toast.type === 'success' ? 'bg-[#22A95B] text-white' : 'bg-[#E84444] text-white'
          }`}
        >
          <CheckCircle size={15} />
          {toast.message}
        </div>
      )}

      {/* Back + Header */}
      <div className="mb-8">
        <button
          data-testid="back-button"
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-[#7A7874] hover:text-[#1A1916] mb-5 transition-colors"
        >
          <ArrowLeft size={15} />
          Back to Moment Radar
        </button>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-[#2D6BE4] flex items-center justify-center flex-shrink-0">
            <span className="text-base font-semibold text-white">{customer.initials}</span>
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-[#1A1916]">{customer.name}</h1>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="text-xs text-[#7A7874] bg-[#F5F4F1] px-2 py-0.5 rounded-md">{customer.segment}</span>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${getRiskPill(customer.risk)}`}>
                Risk: {customer.risk}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Journey Timeline */}
      <div className="bg-white border border-[#E8E6E1] rounded-lg p-6 shadow-sm mb-6" data-testid="journey-timeline">
        <h2 className="text-base font-semibold text-[#1A1916] mb-6">Customer Journey</h2>
        <div className="overflow-x-auto pb-3">
          <div className="flex items-start min-w-max gap-0">
            {reversedEvents.map((event, idx) => {
              const cfg = CHANNEL_CFG[event.type] || CHANNEL_CFG.web;
              const Icon = cfg.icon;
              const isLatest = idx === reversedEvents.length - 1;
              return (
                <div key={idx} className="flex items-start">
                  <div className="flex flex-col items-center" style={{ width: '82px' }}>
                    {/* Dot */}
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center relative"
                      style={{
                        backgroundColor: `${cfg.color}18`,
                        border: `2px solid ${isLatest ? cfg.color : 'transparent'}`
                      }}
                    >
                      <Icon size={14} style={{ color: cfg.color }} />
                      {isLatest && (
                        <span
                          className="absolute inset-0 rounded-full animate-ping"
                          style={{ backgroundColor: `${cfg.color}25`, animationDuration: '2s' }}
                        />
                      )}
                    </div>
                    {/* Label */}
                    <span className="text-[9px] text-center text-[#1A1916] mt-1.5 leading-tight px-0.5">
                      {event.action}
                    </span>
                    {/* Date */}
                    <span className="text-[9px] text-[#7A7874] mt-0.5">{event.date}</span>
                  </div>
                  {/* Connector */}
                  {idx < reversedEvents.length - 1 && (
                    <div className="h-px w-3 bg-[#E8E6E1] mt-4 flex-shrink-0" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* AI Insight + Recommendation */}
      <div className="grid lg:grid-cols-2 gap-6">

        {/* AI Insight */}
        <div data-testid="ai-insight-card" className="bg-white border border-[#E8E6E1] rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-[#1A1916]">What's happening</h2>
            {!loading && aiData && <SourceBadge source={aiData.source} />}
          </div>
          {loading
            ? <Shimmer />
            : <p className="text-sm text-[#1A1916] leading-relaxed">
                {aiData?.explanation || 'Unable to generate analysis. Please try again.'}
              </p>
          }
        </div>

        {/* Recommendation */}
        <div data-testid="recommendation-card" className="bg-[#EEF4FF] border border-[#2D6BE4]/20 rounded-lg p-6 shadow-sm">
          <h2 className="text-base font-semibold text-[#1A1916] mb-4">Recommended Action</h2>

          {loading || !rec ? (
            <div className="space-y-3 animate-pulse">
              <div className="h-3.5 bg-[#D0E4FF] rounded w-1/2"></div>
              <div className="h-3.5 bg-[#D0E4FF] rounded w-full"></div>
              <div className="h-3.5 bg-[#D0E4FF] rounded w-3/4"></div>
              <div className="h-8 bg-[#D0E4FF] rounded-md w-1/3 mt-4"></div>
            </div>
          ) : (() => {
            const chCfg = CHANNEL_CFG[rec.channel] || CHANNEL_CFG.email;
            const ChIcon = chCfg.icon;
            return (
              <>
                {/* Channel row */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${chCfg.color}18` }}>
                    <ChIcon size={16} style={{ color: chCfg.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#1A1916] capitalize">{rec.channel}</p>
                    <p className="text-xs text-[#7A7874] truncate">{rec.message_type}</p>
                  </div>
                  <span data-testid="urgency-badge" className={`text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${
                    rec.urgency === 'high'   ? 'bg-[#FEF2F2] text-[#E84444]' :
                    rec.urgency === 'medium' ? 'bg-[#FFFBEB] text-[#F5A623]' :
                                               'bg-[#EEF4FF] text-[#2D6BE4]'
                  }`}>
                    {rec.urgency} urgency
                  </span>
                </div>

                {/* Confidence bar */}
                <div className="mb-5">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-[#7A7874]">Confidence</span>
                    <span className="text-xs font-semibold text-[#1A1916]">{rec.confidence}%</span>
                  </div>
                  <div className="h-1.5 bg-[#D0E4FF] rounded-full overflow-hidden">
                    <div
                      data-testid="confidence-bar"
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${rec.confidence}%`, backgroundColor: '#2D6BE4' }}
                    />
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-3">
                  {approved ? (
                    <div data-testid="approved-state"
                      className="flex items-center gap-2 px-4 py-2 bg-[#22A95B] text-white rounded-md text-sm font-medium">
                      <CheckCircle size={14} />
                      Approved
                    </div>
                  ) : (
                    <button
                      data-testid="approve-intervention-btn"
                      onClick={handleApprove}
                      className="px-4 py-2 bg-[#2D6BE4] text-white rounded-md text-sm font-medium hover:bg-[#255fc0] transition-colors"
                    >
                      Approve Intervention
                    </button>
                  )}
                  {!approved && (
                    <button
                      data-testid="dismiss-btn"
                      className="px-4 py-2 border border-[#E8E6E1] text-[#7A7874] rounded-md text-sm font-medium hover:bg-[#F5F4F1] transition-colors"
                    >
                      Dismiss
                    </button>
                  )}
                </div>
              </>
            );
          })()}
        </div>

      </div>
    </main>
  );
}
