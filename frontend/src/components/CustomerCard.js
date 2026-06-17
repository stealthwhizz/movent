import React from 'react';
import { Mail, Globe, Smartphone, Target, Bell } from 'lucide-react';

const CHANNELS = [
  { key: 'email', icon: Mail, label: 'Email', activeColor: '#2D6BE4' },
  { key: 'web', icon: Globe, label: 'Web', activeColor: '#7B5CF5' },
  { key: 'app', icon: Smartphone, label: 'App', activeColor: '#22A95B' },
  { key: 'paid', icon: Target, label: 'Paid', activeColor: '#F5A623' },
  { key: 'push', icon: Bell, label: 'Push', activeColor: '#E84444' },
];

function getRiskPill(risk) {
  if (risk >= 75) return 'bg-[#FEF2F2] text-[#E84444]';
  if (risk >= 40) return 'bg-[#FFFBEB] text-[#F5A623]';
  return 'bg-[#F0FDF4] text-[#22A95B]';
}

export default function CustomerCard({ customer, onViewMoment }) {
  return (
    <div
      data-testid={`customer-card-${customer.id}`}
      className="bg-white border border-[#E8E6E1] rounded-lg px-5 py-4 shadow-sm hover:shadow-md transition-shadow duration-200"
    >
      <div className="flex items-center gap-4">

        {/* Avatar */}
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#2D6BE4] flex items-center justify-center">
          <span className="text-sm font-semibold text-white">{customer.initials}</span>
        </div>

        {/* Main info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-sm font-semibold text-[#1A1916]">{customer.name}</span>
            <span className="text-xs bg-[#F5F4F1] text-[#7A7874] px-2 py-0.5 rounded-md leading-none">
              {customer.segment}
            </span>
          </div>
          <p className="text-xs text-[#7A7874] mb-2.5 truncate">{customer.signal}</p>

          {/* Channel icons */}
          <div className="flex items-center gap-1.5">
            {CHANNELS.map(({ key, icon: Icon, label, activeColor }) => {
              const isActive = customer.activeChannels.includes(key);
              return (
                <div
                  key={key}
                  title={`${label}${isActive ? ' — active last 7d' : ''}`}
                  className="w-6 h-6 rounded-md flex items-center justify-center transition-colors"
                  style={{
                    backgroundColor: isActive ? `${activeColor}18` : '#F5F4F1',
                  }}
                >
                  <Icon size={11} style={{ color: isActive ? activeColor : '#C8C5BF' }} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Risk + CTA */}
        <div className="flex-shrink-0 flex flex-col items-end gap-2">
          <span
            data-testid={`risk-score-${customer.id}`}
            className={`text-xs font-semibold px-2.5 py-1 rounded-full ${getRiskPill(customer.risk)}`}
          >
            {customer.risk}
          </span>
          <button
            data-testid={`view-moment-btn-${customer.id}`}
            onClick={() => onViewMoment(customer)}
            className="text-xs font-medium text-[#2D6BE4] hover:bg-[#EEF4FF] px-3 py-1.5 rounded-md transition-colors whitespace-nowrap"
          >
            View Moment
          </button>
        </div>

      </div>
    </div>
  );
}
