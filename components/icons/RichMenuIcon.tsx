import React from 'react';

const RichMenuIcon: React.FC = () => (
    <div className="w-28 h-28 flex items-center justify-center">
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="25" y="10" width="30" height="60" rx="5" fill="white" stroke="#D1D5DB" strokeWidth="2"/>
            <path d="M30 18H50" stroke="#D1D5DB" strokeWidth="2" strokeLinecap="round"/>
            <rect x="25" y="50" width="30" height="20" rx="5" fill="#D1FAE5"/>
            <path d="M33 60h4M43 60h4M53 60h4" stroke="#10B981" strokeWidth="2" strokeLinecap="round" transform="translate(-10 0)"/>
        </svg>
    </div>
);

export default RichMenuIcon;
