import React from 'react';

const BrowseAbandonmentIcon: React.FC = () => (
  <div className="w-28 h-28 flex items-center justify-center bg-blue-50 rounded-full">
    <svg width="60" height="60" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="25" y="10" width="30" height="60" rx="5" fill="#FFFFFF" stroke="#D1D5DB" strokeWidth="2"/>
        <path d="M30 18H50" stroke="#D1D5DB" strokeWidth="2" strokeLinecap="round"/>
        <rect x="30" y="25" width="20" height="20" rx="2" fill="#E0F2FE"/>
        <path d="M34 32h12M34 38h8" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round"/>
        <path d="M20 20a5 5 0 0 1-5-5V10" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeDasharray="4 4"/>
        <path d="M15 5L12 8M15 5l3 3" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  </div>
);

export default BrowseAbandonmentIcon;
