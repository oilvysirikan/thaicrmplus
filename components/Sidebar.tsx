import React from 'react';
import { View } from '../types';
import HomeIcon from './icons/HomeIcon';
import LinkIcon from './icons/LinkIcon';
import BoxIcon from './icons/BoxIcon';
import BellIcon from './icons/BellIcon';
import SettingsIcon from './icons/SettingsIcon';
import LogoutIcon from './icons/LogoutIcon';
import ChatAltIcon from './icons/ChatAltIcon';
import MegaphoneIcon from './icons/MegaphoneIcon';
import RobotIcon from './icons/RobotIcon';
import TemplateIcon from './icons/TemplateIcon';
import DeliveryIcon from './icons/DeliveryIcon';
import ChartBarIcon from './icons/ChartBarIcon';
import DeviceMobileIcon from './icons/DeviceMobileIcon';
import ClipboardListIcon from './icons/ClipboardListIcon';
import CalendarIcon from './icons/CalendarIcon';
import LightBulbIcon from './icons/LightBulbIcon';

interface SidebarProps {
  currentView: View;
  setCurrentView: (view: View) => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView, onLogout }) => {
  const navItems = [
    { view: View.Dashboard, label: 'Dashboard', icon: <HomeIcon /> },
    { view: View.Reports, label: 'Reports', icon: <ChartBarIcon /> },
    { view: View.Orders, label: 'Orders', icon: <BoxIcon /> },
    { view: View.Bookings, label: 'Bookings', icon: <CalendarIcon /> },
    { view: View.Chat, label: 'Chat', icon: <ChatAltIcon /> },
    { view: View.Broadcast, label: 'Broadcast', icon: <MegaphoneIcon /> },
    { view: View.Surveys, label: 'Surveys', icon: <ClipboardListIcon /> },
    { view: View.Insights, label: 'Insights', icon: <LightBulbIcon /> },
    { view: View.Delivery, label: 'Delivery', icon: <DeliveryIcon /> },
    { view: View.Automations, label: 'Automations', icon: <RobotIcon /> },
    { view: View.Templates, label: 'Templates', icon: <TemplateIcon /> },
    { view: View.LiffPreview, label: 'LIFF Previews', icon: <DeviceMobileIcon /> },
    { view: View.Connections, label: 'Connections', icon: <LinkIcon /> },
    { view: View.Notifications, label: 'Notifications', icon: <BellIcon /> },
    { view: View.Settings, label: 'Settings', icon: <SettingsIcon /> },
  ];

  return (
    <aside className="w-64 flex-shrink-0 bg-white shadow-lg flex flex-col">
      <div className="flex items-center justify-center h-20 border-b flex-shrink-0">
        <h1 className="text-2xl font-bold text-indigo-600">SiamConnect</h1>
      </div>
      <div className="flex-1 flex flex-col justify-between">
        <nav className="mt-6">
          {navItems.map((item) => (
            <button
              key={item.view}
              onClick={() => setCurrentView(item.view)}
              className={`w-full flex items-center px-6 py-4 text-left transition-colors duration-200 justify-start ${
                currentView === item.view
                  ? 'bg-indigo-50 text-indigo-700 border-r-4 border-indigo-500'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              aria-current={currentView === item.view ? 'page' : undefined}
            >
              <span className="mr-4">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>
        
        <div className="p-6">
            <div className="mt-4 text-sm text-center text-gray-500">
              <p>&copy; 2024 Siam Connect Hub</p>
              <p>Version 2.4.0</p>
            </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;