import React, { useState, useEffect } from 'react';
import ExternalLinkIcon from './icons/ExternalLinkIcon';
import StepMessagesIcon from './icons/StepMessagesIcon';
import BroadcastDeliveryIcon from './icons/BroadcastDeliveryIcon';
import RichMenuIcon from './icons/RichMenuIcon';
import RichMenuFlowIcon from './icons/RichMenuFlowIcon';
import { RichMenuTemplate } from '../types';
import { RichMenuEditorModal } from './RichMenuEditorModal';
import { fetchRichMenus } from '../api';

interface DeliveryProps {
  addToast: (message: string, type: 'success' | 'error') => void;
}

interface DeliveryOption {
  id: string;
  title: string;
  description: string;
  buttonText: string;
  illustration: React.ReactNode;
  isExternalLink?: boolean;
}

const deliveryOptions: DeliveryOption[] = [
  {
    id: 'step-messages',
    title: 'Step Messages',
    description: 'Deliver messages in multiple steps, starting with shipping completion and LINE ID linkage.',
    buttonText: 'Create Broadcast List Segmentation',
    illustration: <StepMessagesIcon />,
    isExternalLink: false,
  },
  {
    id: 'broadcast',
    title: 'Broadcast',
    description: 'Deliver messages to all Friends or to specific Friends narrowed down by segments.',
    buttonText: 'Create Broadcast',
    illustration: <BroadcastDeliveryIcon />,
    isExternalLink: true,
  },
  {
    id: 'rich-menu-all',
    title: 'Rich Menu (All Friends)',
    description: 'Deliver rich menus to all friends.',
    buttonText: 'Create Rich Menu',
    illustration: <RichMenuIcon />,
    isExternalLink: false, // Changed to false to trigger modal
  },
  {
    id: 'rich-menu-specific',
    title: 'Rich Menu (Specific Friends)',
    description: 'Deliver rich menus to specific friends filtered by segments.',
    buttonText: 'Create Rich Menu',
    illustration: <RichMenuIcon />,
    isExternalLink: false, // Changed to false to trigger modal
  },
  {
    id: 'rich-menu-flow',
    title: 'Rich Menu Delivery Using Shopify Flow',
    description: 'Deliver rich menus based on customer purchasing behavior using Shopify Flow.',
    buttonText: 'Check Delivery Method',
    illustration: <RichMenuFlowIcon />,
    isExternalLink: true,
  },
];

const DeliveryCard: React.FC<{ option: DeliveryOption, onButtonClick: () => void }> = ({ option, onButtonClick }) => (
  <div className="bg-white p-6 rounded-lg shadow-md flex items-center justify-between">
    <div className="flex-1 pr-8">
      <h3 className="text-lg font-semibold text-gray-800">{option.title}</h3>
      <p className="text-gray-600 mt-2 text-sm">{option.description}</p>
      <button 
        onClick={onButtonClick}
        className="mt-4 px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center"
      >
        {option.buttonText}
        {option.isExternalLink && <ExternalLinkIcon />}
      </button>
    </div>
    <div className="flex-shrink-0">{option.illustration}</div>
  </div>
);

const SavedRichMenuCard: React.FC<{ menu: RichMenuTemplate, onEdit: (menu: RichMenuTemplate) => void }> = ({ menu, onEdit }) => (
    <div className="bg-white rounded-lg shadow-md flex items-center p-4">
        <img src={menu.imageUrl} alt={menu.name} className="w-24 h-16 object-cover rounded-md bg-gray-200" />
        <div className="flex-1 ml-4">
            <h4 className="font-semibold text-gray-800">{menu.name}</h4>
            <p className="text-sm text-gray-500">Chat Bar: "{menu.chatBarText}"</p>
            <p className="text-xs text-gray-400 mt-1">Updated: {menu.timestamp}</p>
        </div>
        <button onClick={() => onEdit(menu)} className="px-3 py-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-800">
            Edit
        </button>
    </div>
);


const Delivery: React.FC<DeliveryProps> = ({ addToast }) => {
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState<RichMenuTemplate | null>(null);
  const [savedMenus, setSavedMenus] = useState<RichMenuTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  
  const loadMenus = async () => {
    setLoading(true);
    try {
        const menus = await fetchRichMenus();
        setSavedMenus(menus);
    } catch(e) {
        addToast('Failed to load rich menus', 'error');
    } finally {
        setLoading(false);
    }
  }

  useEffect(() => {
    loadMenus();
  }, []);

  const handleOpenEditor = (menu: RichMenuTemplate | null) => {
    setEditingMenu(menu);
    setIsEditorOpen(true);
  };
  
  const handleCloseEditor = () => {
    setIsEditorOpen(false);
    setEditingMenu(null);
  };
  
  const handleSave = (savedMenu: RichMenuTemplate) => {
    setSavedMenus(prev => {
        const index = prev.findIndex(m => m.id === savedMenu.id);
        if(index > -1) {
            const newMenus = [...prev];
            newMenus[index] = savedMenu;
            return newMenus;
        }
        return [savedMenu, ...prev];
    });
    handleCloseEditor();
  }

  const handleCardButtonClick = (option: DeliveryOption) => {
    if (option.id.startsWith('rich-menu-')) {
        handleOpenEditor(null);
    } else {
        addToast(`Action for "${option.title}" is not implemented yet.`, 'success');
    }
  };


  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-800">Delivery</h2>
      <div className="mt-8 space-y-6">
        {deliveryOptions.map((option) => (
          <DeliveryCard key={option.id} option={option} onButtonClick={() => handleCardButtonClick(option)} />
        ))}
      </div>

      <div className="mt-12">
        <h3 className="text-2xl font-bold text-gray-800 mb-4">Saved Rich Menus</h3>
        {loading ? (
             <p>Loading menus...</p>
        ) : savedMenus.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {savedMenus.map(menu => (
                    <SavedRichMenuCard key={menu.id} menu={menu} onEdit={handleOpenEditor} />
                ))}
            </div>
        ) : (
            <p className="text-gray-500">No Rich Menus have been created yet.</p>
        )}
      </div>

      {isEditorOpen && (
        <RichMenuEditorModal 
            isOpen={isEditorOpen}
            onClose={handleCloseEditor}
            addToast={addToast}
            template={editingMenu}
            onSave={handleSave}
        />
      )}
    </div>
  );
};

export default Delivery;