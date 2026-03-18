import React from 'react';

const LowStockIcon: React.FC = () => (
    <div className="w-28 h-28 flex items-center justify-center bg-purple-50 rounded-full">
        <svg width="64" height="64" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="25" y="10" width="30" height="60" rx="5" fill="white" stroke="#D1D5DB" strokeWidth="2"/>
            <path d="M30 18H50" stroke="#D1D5DB" strokeWidth="2" strokeLinecap="round"/>
            
            <circle cx="35" cy="30" r="5" fill="#EDE9FE" stroke="#8B5CF6" strokeWidth="1.5"/>
            <path d="M33 30l2 2 3-3" stroke="#8B5CF6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>

            <rect x="42" y="38" width="10" height="10" rx="2" fill="#EDE9FE" stroke="#8B5CF6" strokeWidth="1.5" />
            
            <path d="M30 50 L 35 45 L 40 50 Z" fill="#EDE9FE" stroke="#8B5CF6" strokeWidth="1.5"/>
        </svg>
    </div>
);

export default LowStockIcon;
