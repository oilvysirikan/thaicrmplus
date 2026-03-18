import React, { useState, useEffect } from 'react';
import { View, DashboardMetrics } from '../types';
import { fetchDashboardMetrics } from '../api';
import UserGroupIcon from './icons/UserGroupIcon';
import CurrencyDollarIcon from './icons/CurrencyDollarIcon';
import MailIcon from './icons/MailIcon';
import TrendingUpIcon from './icons/TrendingUpIcon';
import ChartBarIcon from './icons/ChartBarIcon';
import BoxIcon from './icons/BoxIcon';
import CalendarIcon from './icons/CalendarIcon';
import ClipboardListIcon from './icons/ClipboardListIcon';
import BellIcon from './icons/BellIcon';

interface DashboardProps {
  setCurrentView: (view: View) => void;
}

const StatCard: React.FC<{ 
  title: string; 
  value: string | number | null; 
  icon: React.ReactNode; 
  change?: number; 
  changeType?: 'increase' | 'decrease'; 
  formatAsCurrency?: boolean; 
  suffix?: string;
}> = ({ title, value, icon, change, changeType, formatAsCurrency, suffix }) => (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between">
        <h4 className="text-gray-500 font-medium">{title}</h4>
        <div className="text-indigo-500 bg-indigo-100 p-2 rounded-lg">
          {icon}
        </div>
      </div>
      
      {value !== null ? (
        <p className="text-4xl font-bold text-gray-800 mt-4">
          {formatAsCurrency ? `$${Number(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : Number(value).toLocaleString()}
          {suffix}
        </p>
      ) : (
        <div className="h-10 mt-4 bg-gray-200 rounded-md animate-pulse"></div>
      )}
      
      {change !== undefined && (
        <p className={`text-sm mt-1 flex items-center ${changeType === 'increase' ? 'text-green-600' : 'text-red-600'}`}>
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            {changeType === 'increase' ? 
              <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" transform="rotate(180 10 10)"/> : 
              <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />}
          </svg>
          <span className="ml-1">{Math.abs(change).toLocaleString()} from last period</span>
        </p>
      )}
    </div>
);

const Dashboard: React.FC<DashboardProps> = ({ setCurrentView }) => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchDashboardMetrics();
        setMetrics(data);
      } catch (error) {
        console.error("Failed to load dashboard metrics", error);
      }
    };
    loadData();
  }, []);
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Overview</h2>
        <button 
          onClick={() => setCurrentView(View.Reports)}
          className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 flex items-center"
        >
          <ChartBarIcon />
          <span className="ml-2">View Detailed Report</span>
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Linked Users" 
          value={metrics?.linkedUsers.total ?? null} 
          icon={<UserGroupIcon />}
          change={metrics?.linkedUsers.change}
          changeType={metrics && metrics.linkedUsers.change >= 0 ? 'increase' : 'decrease'}
        />
        <StatCard 
          title="Sales via Automations" 
          value={metrics?.automationSales.total ?? null}
          icon={<CurrencyDollarIcon />}
          formatAsCurrency={true}
        />
        <StatCard 
          title="Automated Messages Sent" 
          value={metrics?.messagesSent ?? null}
          icon={<MailIcon />}
        />
        <StatCard 
          title="Conversion Rate" 
          value={metrics?.conversionRate ?? null}
          icon={<TrendingUpIcon />}
          suffix="%"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        {/* Sales Board */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Sales Board</h3>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full uppercase tracking-wider">Live Updates</span>
          </div>
          <div className="space-y-4">
            {[
              { id: 1, name: 'Premium Coffee Beans', amount: 1250, time: '2 mins ago', status: 'Paid' },
              { id: 2, name: 'Handcrafted Mug Set', amount: 850, time: '15 mins ago', status: 'Processing' },
              { id: 3, name: 'Organic Tea Sampler', amount: 450, time: '1 hour ago', status: 'Paid' },
            ].map((sale) => (
              <div key={sale.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-indigo-200 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-white rounded-lg shadow-sm text-indigo-600">
                    <BoxIcon />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{sale.name}</p>
                    <p className="text-xs text-gray-400">{sale.time}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">฿{sale.amount.toLocaleString()}</p>
                  <p className={`text-[10px] font-bold uppercase tracking-tighter ${sale.status === 'Paid' ? 'text-green-500' : 'text-yellow-500'}`}>
                    {sale.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <button 
            onClick={() => setCurrentView(View.Orders)}
            className="w-full mt-6 py-3 text-sm font-bold text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors border border-dashed border-indigo-200"
          >
            View All Sales
          </button>
        </div>

        {/* Notifications & Quick Actions */}
        <div className="space-y-8">
          <div className="bg-indigo-600 rounded-2xl shadow-lg p-6 text-white relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center space-x-2 mb-4">
                <BellIcon />
                <h3 className="font-bold uppercase tracking-widest text-xs opacity-80">Order Notifications</h3>
              </div>
              <p className="text-2xl font-bold mb-2">12 New Orders</p>
              <p className="text-sm opacity-70 mb-6">You have unread notifications from the last 24 hours.</p>
              <button 
                onClick={() => setCurrentView(View.Notifications)}
                className="bg-white text-indigo-600 px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-50 transition-colors"
              >
                Review Notifications
              </button>
            </div>
            <div className="absolute -right-8 -bottom-8 opacity-10 transform rotate-12">
              <BellIcon />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-bold text-gray-900 mb-4">Quick Access</h3>
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => setCurrentView(View.Bookings)}
                className="p-4 bg-gray-50 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-all group text-left"
              >
                <div className="text-gray-400 group-hover:text-indigo-600 mb-2">
                  <CalendarIcon />
                </div>
                <p className="text-xs font-bold uppercase tracking-wider">Bookings</p>
              </button>
              <button 
                onClick={() => setCurrentView(View.Surveys)}
                className="p-4 bg-gray-50 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-all group text-left"
              >
                <div className="text-gray-400 group-hover:text-indigo-600 mb-2">
                  <ClipboardListIcon />
                </div>
                <p className="text-xs font-bold uppercase tracking-wider">Surveys</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;