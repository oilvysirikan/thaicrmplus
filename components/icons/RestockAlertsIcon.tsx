import React from 'react';

const RestockAlertsIcon: React.FC = () => (
    <div className="w-28 h-28 flex items-center justify-center bg-red-50 rounded-full">
        <svg width="64" height="64" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="25" y="10" width="30" height="60" rx="5" fill="white" stroke="#D1D5DB" strokeWidth="2"/>
            <path d="M30 18H50" stroke="#D1D5DB" strokeWidth="2" strokeLinecap="round"/>
            <rect x="30" y="25" width="20" height="15" rx="2" fill="#FEE2E2"/>
            <rect x="30" y="45" width="20" height="15" rx="2" fill="#DBEAFE"/>
            <path d="M37 32.5h6" stroke="#EF4444" strokeWidth="2" strokeLinecap="round"/>
            <path d="M37 52.5h6m-3-3v6" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round"/>
        </svg>
    </div>
);

export default RestockAlertsIcon;
