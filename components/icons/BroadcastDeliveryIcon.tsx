import React from 'react';

const BroadcastDeliveryIcon: React.FC = () => (
    <div className="w-28 h-28 flex items-center justify-center">
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="25" y="10" width="30" height="60" rx="5" fill="white" stroke="#D1D5DB" strokeWidth="2"/>
            <path d="M30 18H50" stroke="#D1D5DB" strokeWidth="2" strokeLinecap="round"/>
            <rect x="30" y="30" width="20" height="15" rx="2" fill="#FEF3C7"/>
            <text x="40" y="39.5" textAnchor="middle" fontSize="8" fill="#F59E0B" fontWeight="bold">500</text>
            <rect x="15" y="25" width="15" height="8" rx="2" fill="white" stroke="#9CA3AF" strokeWidth="1.5"/>
            <path d="M17 29h11" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round"/>
            <rect x="50" y="25" width="15" height="8" rx="2" fill="white" stroke="#9CA3AF" strokeWidth="1.5"/>
            <path d="M52 29h11" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
    </div>
);

export default BroadcastDeliveryIcon;
