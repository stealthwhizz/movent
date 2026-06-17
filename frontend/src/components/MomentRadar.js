import React, { useState } from 'react';
import { CUSTOMERS } from '../data/customers';
import CustomerCard from './CustomerCard';
import { Activity, Zap, AlertTriangle, TrendingUp } from 'lucide-react';

const FILTERS = ['All', 'High Risk', 'Medium Risk', 'Low Risk'];

// Sort once at module level — highest risk first
const SORTED_CUSTOMERS = [...CUSTOMERS].sort((a, b) => b.risk - a.risk);

// Baseline stats derived from the dataset
const MOMENTS_DETECTED = CUSTOMERS.length;
const CUSTOMERS_AT_RISK = CUSTOMERS.filter(c => c.risk >= 40).length;
const AVG_RISK_SCORE = Math.round(CUSTOMERS.reduce((s, c) => s + c.risk, 0) / CUSTOMERS.length);
const INTERVENTIONS_BASELINE = 7; // pre-session interventions in the dataset

function filterCustomers(customers, filter) {
  if (filter === 'All') return customers;
  if (filter === 'High Risk') return customers.filter(c => c.risk >= 75);
  if (filter === 'Medium Risk') return customers.filter(c => c.risk >= 40 && c.risk < 75);
  if (filter === 'Low Risk') return customers.filter(c => c.risk < 40);
  return customers;
}

export default function MomentRadar({ onViewMoment, sessionApprovalsCount = 0 }) {
  const [activeFilter, setActiveFilter] = useState('All');
  const filtered = filterCustomers(SORTED_CUSTOMERS, activeFilter);

  const statCards = [
    { label: 'Moments Detected', value: MOMENTS_DETECTED, icon: Activity, color: '#2D6BE4', testId: 'moments-detected' },
    { label: 'Interventions Triggered', value: INTERVENTIONS_BASELINE + sessionApprovalsCount, icon: Zap, color: '#F5A623', testId: 'interventions-triggered' },
    { label: 'Customers at Risk', value: CUSTOMERS_AT_RISK, icon: AlertTriangle, color: '#E84444', testId: 'customers-at-risk' },
    { label: 'Avg Risk Score', value: AVG_RISK_SCORE, icon: TrendingUp, color: '#22A95B', testId: 'avg-risk-score' },
  ];

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Page heading with Live indicator */}
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-xl font-semibold tracking-tight text-[#1A1916]">Moment Radar</h1>
        <span className="flex items-center gap-1.5 text-xs font-medium text-[#22A95B]">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22A95B] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#22A95B]"></span>
          </span>
          Live
        </span>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map(({ label, value, icon: Icon, color, testId }) => (
          <div
            key={label}
            data-testid={`stat-card-${testId}`}
            className="bg-white border border-[#E8E6E1] rounded-lg p-5 shadow-sm"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium tracking-wide text-[#7A7874] uppercase leading-none">{label}</span>
              <Icon size={15} style={{ color }} />
            </div>
            <span className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#1A1916]">{value}</span>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2 flex-wrap mb-6">
        {FILTERS.map(f => (
          <button
            key={f}
            data-testid={`filter-${f.toLowerCase().replace(/ /g, '-')}`}
            onClick={() => setActiveFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-150 border ${
              activeFilter === f
                ? 'bg-[#1A1916] text-white border-[#1A1916]'
                : 'text-[#7A7874] border-transparent hover:text-[#1A1916] hover:border-[#E8E6E1] hover:bg-white'
            }`}
          >
            {f}
          </button>
        ))}
        <span className="ml-auto text-sm text-[#7A7874]">
          {filtered.length} customer{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Customer card feed */}
      <div className="space-y-3">
        {filtered.map(customer => (
          <CustomerCard key={customer.id} customer={customer} onViewMoment={onViewMoment} />
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-16 text-[#7A7874] text-sm">
            No customers match this filter.
          </div>
        )}
      </div>
    </main>
  );
}
