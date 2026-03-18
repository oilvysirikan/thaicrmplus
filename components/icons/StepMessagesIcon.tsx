import React from 'react';

const StepMessagesIcon: React.FC = () => (
  <div className="w-28 h-28 flex items-center justify-center">
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="25" y="10" width="30" height="60" rx="5" fill="white" stroke="#D1D5DB" strokeWidth="2"/>
        <path d="M30 18H50" stroke="#D1D5DB" strokeWidth="2" strokeLinecap="round"/>
        <rect x="30" y="25" width="20" height="20" rx="2" fill="#E0F2FE"/>
        <path d="M34 32h12M34 38h8" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round"/>
        <rect x="5" y="20" width="15" height="10" rx="5" fill="white" stroke="#9CA3AF" strokeWidth="1.5"/>
        <text x="12.5" y="27" textAnchor="middle" fontSize="6" fill="#4B5563" fontWeight="bold">1Day</text>
        <rect x="5" y="35" width="15" height="10" rx="5" fill="white" stroke="#9CA3AF" strokeWidth="1.5"/>
        <text x="12.5" y="42" textAnchor="middle" fontSize="6" fill="#4B5563" fontWeight="bold">3Day</text>
        <path d="M20 25L25 25" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M20 40L25 40" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  </div>
);

export default StepMessagesIcon;
