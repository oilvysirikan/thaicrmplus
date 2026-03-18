import React from 'react';

const RichMenuFlowIcon: React.FC = () => (
    <div className="w-28 h-28 flex items-center justify-center">
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="25" y="10" width="30" height="60" rx="5" fill="white" stroke="#D1D5DB" strokeWidth="2"/>
            <path d="M30 18H50" stroke="#D1D5DB" strokeWidth="2" strokeLinecap="round"/>
            <rect x="25" y="50" width="30" height="20" rx="5" fill="#DBEAFE"/>
            <text x="40" y="62" textAnchor="middle" fontSize="6" fill="#3B82F6" fontWeight="bold">SALE</text>
            <path d="M55 60 L 65 60" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round"/>
            <path d="M65 60 L 65 50 L 70 50" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" fill="none"/>
            <path d="M70 50 l-3 -3" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" />
            <path d="M70 50 l-3 3" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" />
        </svg>
    </div>
);

export default RichMenuFlowIcon;
