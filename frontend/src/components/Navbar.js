import React from 'react';
import { Bell } from 'lucide-react';

export default function Navbar({ currentTab, onTabChange, showBack, onBack }) {
  const today = new Date().toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  });

  return (
    <nav className="sticky top-0 z-50 bg-[#FAFAF8]/90 backdrop-blur-md border-b border-[#E8E6E1]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">

        {/* Wordmark */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="flex flex-col">
            <span className="text-lg font-semibold tracking-tight text-[#1A1916] leading-none">Movent</span>
            <span className="hidden sm:block text-[10px] text-[#7A7874] tracking-wide leading-none mt-0.5">
              Know the moment. Make the move.
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 bg-white border border-[#E8E6E1] rounded-lg p-1">
          <button
            data-testid="tab-moment-radar"
            onClick={() => onTabChange('radar')}
            className={`px-3 sm:px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-150 ${
              currentTab === 'radar' && !showBack
                ? 'bg-[#1A1916] text-white shadow-sm'
                : 'text-[#7A7874] hover:text-[#1A1916]'
            }`}
          >
            Moment Radar
          </button>
          <button
            data-testid="tab-impact-cockpit"
            onClick={() => onTabChange('cockpit')}
            className={`px-3 sm:px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-150 ${
              currentTab === 'cockpit' && !showBack
                ? 'bg-[#1A1916] text-white shadow-sm'
                : 'text-[#7A7874] hover:text-[#1A1916]'
            }`}
          >
            Impact Cockpit
          </button>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="hidden md:block text-xs text-[#7A7874]">{today}</span>
          <button
            data-testid="nav-bell"
            className="p-2 rounded-md hover:bg-[#F0EFEC] transition-colors text-[#7A7874] hover:text-[#1A1916]"
            aria-label="Notifications"
          >
            <Bell size={17} />
          </button>
          <button
            data-testid="nav-avatar"
            className="w-8 h-8 rounded-full bg-[#2D6BE4] flex items-center justify-center flex-shrink-0"
            aria-label="User menu"
          >
            <span className="text-xs font-semibold text-white">E</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
