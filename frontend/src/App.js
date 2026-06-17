import React, { useState } from 'react';
import Navbar from './components/Navbar';
import MomentRadar from './components/MomentRadar';
import MomentIntelligence from './components/MomentIntelligence';
import ImpactCockpit from './components/ImpactCockpit';
import './App.css';

export default function App() {
  const [currentTab, setCurrentTab] = useState('radar');
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const handleViewMoment = (customer) => {
    setSelectedCustomer(customer);
  };

  const handleBack = () => {
    setSelectedCustomer(null);
  };

  const handleTabChange = (tab) => {
    setCurrentTab(tab);
    setSelectedCustomer(null);
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <Navbar currentTab={currentTab} onTabChange={handleTabChange} showBack={!!selectedCustomer} onBack={handleBack} />
      {selectedCustomer ? (
        <MomentIntelligence customer={selectedCustomer} onBack={handleBack} />
      ) : currentTab === 'radar' ? (
        <MomentRadar onViewMoment={handleViewMoment} />
      ) : (
        <ImpactCockpit />
      )}
    </div>
  );
}
