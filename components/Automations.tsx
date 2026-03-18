import React, { useState } from 'react';
import BrowseAbandonmentIcon from './icons/BrowseAbandonmentIcon';
import AbandonedCartIcon from './icons/AbandonedCartIcon';
import AbandonedCheckoutIcon from './icons/AbandonedCheckoutIcon';
import RestockAlertsIcon from './icons/RestockAlertsIcon';
import LowStockIcon from './icons/LowStockIcon';
import ExternalLinkIcon from './icons/ExternalLinkIcon';
import PlusCircleIcon from './icons/PlusCircleIcon';
import { AutomationSetupModal } from './AutomationSetupModal';
import { AutomationType } from '../types';

type TagColor = 'blue' | 'green' | 'sky';

interface Automation {
  id: AutomationType;
  title: string;
  tags: { text: string; color: TagColor }[];
  description: string;
  buttonText: string;
  illustration: React.ReactNode;
  buttonLink?: boolean;
}

const automationsData: Automation[] = [
  {
    id: AutomationType.BrowseAbandonment,
    title: 'Browse Abandonment Message',
    tags: [
      { text: 'Standard Plan and above only', color: 'blue' },
      { text: 'All Stores Avg CVR: 3.2%', color: 'green' },
    ],
    description: 'Based on your customers\' browsing history, deliver your message as a recommended product.',
    buttonText: 'Setup Browse Abandonment Message',
    illustration: <BrowseAbandonmentIcon />,
  },
  {
    id: AutomationType.AbandonedCart,
    title: 'Abandoned Cart Message',
    tags: [
      { text: 'Standard Plan and above only', color: 'blue' },
      { text: 'All Stores Avg CVR: 18.7%', color: 'green' },
    ],
    description: 'Send a message to customers who have not completed their orders with products in their carts.',
    buttonText: 'Setup Abandoned Cart Message',
    illustration: <AbandonedCartIcon />,
  },
  {
    id: AutomationType.AbandonedCheckout,
    title: 'Abandoned Checkout Message',
    tags: [{ text: 'All Stores Avg CVR: 22.1%', color: 'green' }],
    description: 'Send a message to customers who have not completed their orders after proceeding to the checkout page.',
    buttonText: 'Setup Abandoned Checkout Message',
    illustration: <AbandonedCheckoutIcon />,
  },
  {
    id: AutomationType.RestockAlerts,
    title: 'Restock Alerts',
    tags: [{ text: 'Requires integration with the AMP - Back in Stock application', color: 'sky' }],
    description: 'Send a message to customers who have requested Restock Alerts.',
    buttonText: 'Setup Restock Alerts',
    illustration: <RestockAlertsIcon />,
  },
  {
    id: AutomationType.LowStock,
    title: 'Notification of low stock, price reductions, and restocking of favorite products',
    tags: [{ text: 'Prime Review application and Flow application required', color: 'sky' }],
    description: 'Send a message to your customers when products they have added to their favorites are low in stock, at a reduced price, or restocked.',
    buttonText: 'Find out how to work with Prime Review',
    illustration: <LowStockIcon />,
    buttonLink: true,
  },
];

const Tag: React.FC<{ text: string; color: TagColor }> = ({ text, color }) => {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-800',
    green: 'bg-green-100 text-green-800',
    sky: 'bg-sky-100 text-sky-800',
  };
  return <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${colorClasses[color]}`}>{text}</span>;
};

interface AutomationsProps {
  addToast: (message: string, type: 'success' | 'error') => void;
}

const AutomationCard: React.FC<{ automation: Automation, onSetupClick: (id: AutomationType) => void }> = ({ automation, onSetupClick }) => (
  <div className="bg-white p-6 rounded-lg shadow-md flex items-center justify-between">
    <div className="flex-1 pr-8">
      <h3 className="text-lg font-semibold text-gray-800">{automation.title}</h3>
      <div className="flex flex-wrap gap-2 my-2">
        {automation.tags.map((tag) => (
          <Tag key={tag.text} text={tag.text} color={tag.color} />
        ))}
      </div>
      <p className="text-gray-600 mt-3 text-sm">{automation.description}</p>
      <button 
        onClick={() => onSetupClick(automation.id)}
        className="mt-4 px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center"
      >
        {automation.buttonText}
        {automation.buttonLink && <ExternalLinkIcon />}
      </button>
    </div>
    <div className="flex-shrink-0">{automation.illustration}</div>
  </div>
);

const Automations: React.FC<AutomationsProps> = ({ addToast }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAutomation, setSelectedAutomation] = useState<Automation | null>(null);

  const handleSetupClick = (id: AutomationType) => {
    const automation = automationsData.find(a => a.id === id);
    if (automation) {
      setSelectedAutomation(automation);
      setIsModalOpen(true);
    }
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedAutomation(null);
  };

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-800">Automatic Delivery</h2>
      <p className="mt-2 text-gray-600">Messages are automatically delivered based on specific actions or conditions of customers, using templates.</p>
      <div className="mt-8 space-y-6">
        {automationsData.map((auto) => (
          <AutomationCard key={auto.id} automation={auto} onSetupClick={handleSetupClick} />
        ))}
      </div>

      <div className="mt-12">
        <h2 className="text-2xl font-bold text-gray-800">Auto-Tagging Rules</h2>
        <p className="mt-2 text-gray-600">Automatically group your customers based on their behavior and purchase history.</p>
        
        <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Rule Name</th>
                <th className="px-6 py-4">Condition</th>
                <th className="px-6 py-4">Action (Tag)</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              <tr className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-medium text-gray-900">High Spenders</td>
                <td className="px-6 py-4 text-sm text-gray-600">Total Sales &gt; 10,000 THB</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold">VIP</span>
                </td>
                <td className="px-6 py-4">
                  <span className="flex items-center text-green-600 text-xs font-bold">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span> Active
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">Edit</button>
                </td>
              </tr>
              <tr className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-medium text-gray-900">New Leads</td>
                <td className="px-6 py-4 text-sm text-gray-600">Joined in last 7 days</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">Newbie</span>
                </td>
                <td className="px-6 py-4">
                  <span className="flex items-center text-green-600 text-xs font-bold">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span> Active
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">Edit</button>
                </td>
              </tr>
              <tr className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-medium text-gray-900">Inactive Customers</td>
                <td className="px-6 py-4 text-sm text-gray-600">No purchase for 30 days</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">Churn Risk</span>
                </td>
                <td className="px-6 py-4">
                  <span className="flex items-center text-gray-400 text-xs font-bold">
                    <span className="w-2 h-2 bg-gray-300 rounded-full mr-2"></span> Paused
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">Edit</button>
                </td>
              </tr>
            </tbody>
          </table>
          <div className="p-4 bg-gray-50 border-t border-gray-100 text-center">
            <button className="text-indigo-600 hover:text-indigo-800 text-sm font-bold flex items-center justify-center mx-auto space-x-2">
              <PlusCircleIcon />
              <span>Add New Rule</span>
            </button>
          </div>
        </div>
      </div>
      
      {isModalOpen && selectedAutomation && (
        <AutomationSetupModal 
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          automation={selectedAutomation}
          addToast={addToast}
        />
      )}
    </div>
  );
};

export default Automations;