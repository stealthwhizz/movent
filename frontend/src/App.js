import React, { useState } from 'react';
import Navbar from './components/Navbar';
import MomentRadar from './components/MomentRadar';
import MomentIntelligence from './components/MomentIntelligence';
import ImpactCockpit from './components/ImpactCockpit';
import './App.css';

export default function App() {
  const [currentTab, setCurrentTab] = useState('radar');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  // Interventions approved this session — passed to ImpactCockpit so the log reflects live approvals
  const [sessionApprovals, setSessionApprovals] = useState([]);

  const handleViewMoment = (customer) => setSelectedCustomer(customer);
  const handleBack = () => setSelectedCustomer(null);

  const handleTabChange = (tab) => {
    setCurrentTab(tab);
    setSelectedCustomer(null);
  };

  const handleApproval = (customer, recommendation) => {
    setSessionApprovals(prev => [
      {
        customer: customer.name,
        signal: customer.signal,
        channel: recommendation.channel.charAt(0).toUpperCase() + recommendation.channel.slice(1),
        outcome: 'Pending',
      },
      ...prev,
    ]);
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <Navbar currentTab={currentTab} onTabChange={handleTabChange} showBack={!!selectedCustomer} />
      {selectedCustomer ? (
        <MomentIntelligence customer={selectedCustomer} onBack={handleBack} onApproval={handleApproval} />
      ) : currentTab === 'radar' ? (
        <MomentRadar onViewMoment={handleViewMoment} />
      ) : (
        <ImpactCockpit sessionApprovals={sessionApprovals} />
      )}
    </div>
  );
}
