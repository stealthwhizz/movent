import React, { useState } from 'react';
import { CUSTOMERS } from '../data/customers';
import CustomerCard from './CustomerCard';
import { Activity, Zap, AlertTriangle, TrendingUp } from 'lucide-react';

const FILTERS = ['All', 'High Risk', 'Medium Risk', 'Recovered'];

const STAT_CARDS = [
  { label: 'Moments Detected', value: '10', icon: Activity, color: '#2D6BE4', testId: 'moments-detected' },
  { label: 'Interventions Triggered', value: '7', icon: Zap, color: '#F5A623', testId: 'interventions-triggered' },
  { label: 'Customers at Risk', value: '8', icon: AlertTriangle, color: '#E84444', testId: 'customers-at-risk' },
  { label: 'Avg Risk Score', value: '62', icon: TrendingUp, color: '#22A95B', testId: 'avg-risk-score' },
];

function filterCustomers(customers, filter) {
  if (filter === 'All') return customers;
  if (filter === 'High Risk') return customers.filter(c => c.risk >= 75);
  if (filter === 'Medium Risk') return customers.filter(c => c.risk >= 40 && c.risk < 75);
  if (filter === 'Recovered') return customers.filter(c => c.risk < 40);
  return customers;
}

export default function MomentRadar({ onViewMoment }) {
  const [activeFilter, setActiveFilter] = useState('All');
  const filtered = filterCustomers(CUSTOMERS, activeFilter);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {STAT_CARDS.map(({ label, value, icon: Icon, color, testId }) => (
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
