import React from 'react';

const FacebookIcon: React.FC = () => (
    <div className="p-3 bg-blue-100 rounded-full">
      <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2.04C6.5 2.04 2 6.53 2 12.06c0 5.52 4.5 10.02 10 10.02c1.66 0 3.22-.42 4.58-1.15l1.42 1.42c.2.2.51.2.71 0l1.15-1.15c.2-.2.2-.51 0-.71l-1.42-1.42C19.6 19.28 22 15.93 22 12.06c0-5.53-4.5-10.02-10-10.02zM13 17.5h-2v-6h2v6zm-1-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z" clipRule="evenodd" fillRule="evenodd"></path>
        <path d="m9.22 12.75 2.12-2.12c.2-.2.51-.2.71 0l2.12 2.12c.32.32.1.86-.35.86H9.57c-.45 0-.67-.54-.35-.86z"></path>
      </svg>
    </div>
);

export default FacebookIcon;