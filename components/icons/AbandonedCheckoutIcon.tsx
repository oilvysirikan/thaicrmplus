import React from 'react';

const AbandonedCheckoutIcon: React.FC = () => (
    <div className="w-28 h-28 flex items-center justify-center bg-yellow-50 rounded-full">
        <svg width="64" height="64" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="25" y="10" width="30" height="60" rx="5" fill="white" stroke="#D1D5DB" strokeWidth="2"/>
            <path d="M30 18H50" stroke="#D1D5DB" strokeWidth="2" strokeLinecap="round"/>
            <rect x="30" y="25" width="20" height="30" rx="2" fill="#FEF3C7"/>
            <path d="M34 30h12M34 35h8M34 40h5" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="60" cy="50" r="10" fill="white" stroke="#F59E0B" strokeWidth="2"/>
            <path d="M56 50h8" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round"/>
        </svg>
    </div>
);

export default AbandonedCheckoutIcon;
