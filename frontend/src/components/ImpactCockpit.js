import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts';
import { Activity, CheckSquare, TrendingDown, BarChart2 } from 'lucide-react';
import { getDashboardMetrics } from '../utils/api';

const OUTCOME_STYLES = {
  'Recovered':   'bg-[#F0FDF4] text-[#22A95B]',
  'Pending':     'bg-[#FFFBEB] text-[#F5A623]',
  'No Response': 'bg-[#F5F4F1] text-[#7A7874]',
};

function KPICard({ label, value, trend, icon: Icon, color }) {
  return (
    <div
      data-testid={`kpi-${label.toLowerCase().replace(/\s+/g, '-')}`}
      className="bg-white border border-[#E8E6E1] rounded-lg p-5 shadow-sm"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium tracking-wide text-[#7A7874] uppercase leading-none">{label}</span>
        <Icon size={15} style={{ color }} />
      </div>
      <div className="flex items-end gap-2">
        <span className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#1A1916]">{value}</span>
        {trend && <span className="text-xs font-medium text-[#22A95B] mb-0.5">{trend}</span>}
      </div>
    </div>
  );
}

const TOOLTIP_STYLE = {
  border: '1px solid #E8E6E1',
  borderRadius: '8px',
  boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
  fontSize: 12,
  color: '#1A1916',
};

export default function ImpactCockpit() {
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    getDashboardMetrics().then(setMetrics).catch(console.error);
  }, []);

  if (!metrics) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[0, 1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-[#E8E6E1] rounded-lg" />
            ))}
          </div>
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="h-72 bg-[#E8E6E1] rounded-lg" />
            <div className="h-72 bg-[#E8E6E1] rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  const kpiCards = [
    { label: 'Moments Detected', value: metrics.moments_detected, trend: metrics.trends.moments_detected, icon: Activity, color: '#2D6BE4' },
    { label: 'Interventions Approved', value: metrics.interventions_approved, trend: metrics.trends.interventions_approved, icon: CheckSquare, color: '#F5A623' },
    { label: 'Churn Prevented', value: metrics.churn_prevented, trend: metrics.trends.churn_prevented, icon: TrendingDown, color: '#22A95B' },
    { label: 'Recovery Rate', value: `${metrics.recovery_rate}%`, trend: metrics.trends.recovery_rate, icon: BarChart2, color: '#7B5CF5' },
  ];

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {kpiCards.map(kpi => <KPICard key={kpi.label} {...kpi} />)}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6">

        {/* Bar chart */}
        <div className="bg-white border border-[#E8E6E1] rounded-lg p-6 shadow-sm">
          <h3 className="text-base font-semibold text-[#1A1916] mb-6">Top Disengagement Patterns</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={metrics.top_disengagement_patterns} layout="vertical" margin={{ left: 0, right: 16, top: 4, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8E6E1" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#7A7874' }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="pattern" tick={{ fontSize: 11, fill: '#7A7874' }} axisLine={false} tickLine={false} width={130} />
              <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: '#F5F4F1' }} />
              <Bar dataKey="count" fill="#2D6BE4" radius={[0, 4, 4, 0]} name="Signals" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Line chart */}
        <div className="bg-white border border-[#E8E6E1] rounded-lg p-6 shadow-sm">
          <h3 className="text-base font-semibold text-[#1A1916] mb-6">Interventions vs Recoveries — 7 Days</h3>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={metrics.daily_stats} margin={{ left: 0, right: 8, top: 4, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8E6E1" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#7A7874' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#7A7874' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Legend wrapperStyle={{ fontSize: 12, color: '#7A7874' }} />
              <Line type="monotone" dataKey="interventions" stroke="#2D6BE4" strokeWidth={2.5}
                dot={{ fill: '#2D6BE4', r: 3, strokeWidth: 0 }} name="Interventions" />
              <Line type="monotone" dataKey="recoveries" stroke="#22A95B" strokeWidth={2.5}
                dot={{ fill: '#22A95B', r: 3, strokeWidth: 0 }} name="Recoveries" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Intervention Log */}
      <div className="bg-white border border-[#E8E6E1] rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E8E6E1]">
          <h3 className="text-base font-semibold text-[#1A1916]">Intervention Log</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full" data-testid="intervention-log-table">
            <thead>
              <tr className="border-b border-[#E8E6E1] bg-[#FAFAF8]">
                {['Customer', 'Signal', 'Channel Used', 'Outcome'].map(h => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-medium tracking-wide text-[#7A7874] uppercase whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EFEC]">
              {metrics.intervention_log.map((row, i) => (
                <tr key={i} data-testid={`log-row-${i}`} className="hover:bg-[#FAFAF8] transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-[#1A1916] whitespace-nowrap">{row.customer}</td>
                  <td className="px-6 py-4 text-sm text-[#7A7874]">{row.signal}</td>
                  <td className="px-6 py-4 text-sm text-[#7A7874] whitespace-nowrap">{row.channel}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                      OUTCOME_STYLES[row.outcome] || OUTCOME_STYLES['No Response']
                    }`}>
                      {row.outcome}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </main>
  );
}
