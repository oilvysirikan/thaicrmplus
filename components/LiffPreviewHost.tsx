import React from 'react';
import LiffMembershipPage from './LiffMembershipPage';

const LiffPreviewHost: React.FC = () => {
  return (
    <div className="w-full h-full bg-gray-800 flex flex-col items-center justify-center p-8 overflow-hidden">
        <h2 className="text-2xl font-bold text-white mb-4">LIFF Application Preview</h2>
        <p className="text-gray-400 mb-8 max-w-2xl text-center">
            This is a simulation of how your LIFF (LINE Front-end Framework) pages will appear to customers inside the LINE app.
            You can link to these pages from your Rich Menus.
        </p>
        
        {/* Phone Mockup */}
        <div className="w-full max-w-sm bg-black border-8 border-gray-900 rounded-[40px] shadow-2xl">
            <div className="w-full h-2 rounded-t-3xl bg-gray-900 flex justify-center pt-2">
                <div className="w-20 h-4 bg-black rounded-b-lg"></div>
            </div>
            <div className="w-full h-[700px] bg-white overflow-hidden">
                {/* Render the LIFF Page Component Here */}
                <LiffMembershipPage />
            </div>
        </div>
    </div>
  );
};

export default LiffPreviewHost;
