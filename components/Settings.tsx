
import React, { useState, useEffect } from 'react';
import ToggleSwitch from './ToggleSwitch';
import { StoreDisplaySettings } from '../types';
import { saveQuickReply, deleteQuickReply, saveStoreDisplaySettings, fetchStoreDisplaySettings } from '../api';
import { auth } from '../firebaseConfig';
import TrashIcon from './icons/TrashIcon';
import DataSeeder from './DataSeeder';
import { useAppContext } from '../hooks/useAppContext';

const SettingsCard: React.FC<{ title: string; children: React.ReactNode; footer?: React.ReactNode }> = ({ title, children, footer }) => (
  <div className="bg-white rounded-lg shadow-md flex flex-col">
    <div className="p-6 border-b border-gray-200">
      <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
    </div>
    <div className="p-6 flex-1">
      {children}
    </div>
    {footer && (
        <div className="p-4 bg-gray-50 border-t border-gray-200 text-right">
            {footer}
        </div>
    )}
  </div>
);


const Settings: React.FC = () => {
  const { addToast, quickReplies, refetchQuickReplies } = useAppContext();

  const [newReplyName, setNewReplyName] = useState('');
  const [newReplyText, setNewReplyText] = useState('');
  const [isSavingReply, setIsSavingReply] = useState(false);
  
  const [displaySettings, setDisplaySettings] = useState<StoreDisplaySettings>({
      myPage: true,
      thankYou: true,
      banner: false,
  });
  const [loadingDisplaySettings, setLoadingDisplaySettings] = useState(true);
  
  useEffect(() => {
    const loadSettings = async () => {
        setLoadingDisplaySettings(true);
        try {
            const settings = await fetchStoreDisplaySettings();
            setDisplaySettings(settings);
        } catch (error) {
            addToast('Could not load display settings.', 'error');
        } finally {
            setLoadingDisplaySettings(false);
        }
    }
    loadSettings();
  }, [addToast]);


  const handleDisplaySettingChange = (key: keyof typeof displaySettings, value: boolean) => {
    setDisplaySettings(prev => ({ ...prev, [key]: value }));
  }

  const handleSaveDisplaySettings = async () => {
    try {
        await saveStoreDisplaySettings(displaySettings);
        addToast('Display settings saved!', 'success');
    } catch (error) {
        addToast('Failed to save display settings.', 'error');
    }
  };


  const handleAddReply = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if(!newReplyName.trim() || !newReplyText.trim()) {
        addToast('Reply name and text cannot be empty.', 'error');
        return;
    }
    setIsSavingReply(true);
    try {
        await saveQuickReply(newReplyName, newReplyText);
        refetchQuickReplies(); // Refetch from context
        setNewReplyName('');
        setNewReplyText('');
        addToast('Quick reply added!', 'success');
    } catch (error) {
        addToast('Failed to add quick reply.', 'error');
    } finally {
        setIsSavingReply(false);
    }
  };
  
  const handleDeleteReply = async (replyId: string) => {
    try {
        await deleteQuickReply(replyId);
        refetchQuickReplies(); // Refetch from context
        addToast('Quick reply deleted.', 'success');
    } catch (error) {
        addToast('Failed to delete quick reply.', 'error');
    }
  }

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Settings</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        
        {/* Left Column: Connection & Display Settings */}
        <div className="space-y-8">
            <SettingsCard title="LINE Channel Settings">
                <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); addToast('Connection checked successfully!', 'success')}}>
                    <div>
                        <label htmlFor="channel-id" className="block text-sm font-medium text-gray-700">Channel ID</label>
                        <input type="text" id="channel-id" className="mt-1 w-full form-input" placeholder="Enter Channel ID" />
                    </div>
                    <div>
                        <label htmlFor="channel-secret" className="block text-sm font-medium text-gray-700">Channel Secret</label>
                        <input type="password" id="channel-secret" className="mt-1 w-full form-input" placeholder="Enter Channel Secret" />
                    </div>
                    <div className="pt-2 flex items-center space-x-4">
                        <button
                            type="submit"
                            className="px-5 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700"
                        >
                            Check Connection
                        </button>
                        <a href="#" className="text-sm text-indigo-600 hover:underline">Setup Guide</a>
                    </div>
                </form>
            </SettingsCard>
            
            <SettingsCard title="Quick Replies">
                <div className="space-y-4">
                    <form className="space-y-3 p-4 bg-gray-50 rounded-lg border" onSubmit={handleAddReply}>
                        <h4 className="font-semibold text-gray-700">Add New Reply</h4>
                        <div>
                            <label htmlFor="reply-name" className="text-sm font-medium text-gray-600">Name</label>
                            <input type="text" id="reply-name" value={newReplyName} onChange={e => setNewReplyName(e.target.value)} className="mt-1 w-full form-input" placeholder="e.g., 'Greeting'" />
                        </div>
                        <div>
                            <label htmlFor="reply-text" className="text-sm font-medium text-gray-600">Text</label>
                            <textarea id="reply-text" value={newReplyText} onChange={e => setNewReplyText(e.target.value)} rows={3} className="mt-1 w-full form-input" placeholder="Enter the full reply message..."></textarea>
                        </div>
                        <button type="submit" disabled={isSavingReply} className="w-full px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-indigo-400">
                            {isSavingReply ? 'Adding...' : 'Add Quick Reply'}
                        </button>
                    </form>
                    
                    <div>
                        <h4 className="font-semibold text-gray-700 mb-2">Saved Replies</h4>
                        <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                            {quickReplies.length > 0 ? quickReplies.map(reply => (
                                <div key={reply.id} className="p-3 bg-white border rounded-md flex justify-between items-start">
                                    <div>
                                        <p className="font-semibold text-gray-800">{reply.name}</p>
                                        <p className="text-sm text-gray-600 mt-1">"{reply.text}"</p>
                                    </div>
                                    <button onClick={() => handleDeleteReply(reply.id)} className="text-gray-400 hover:text-red-500 flex-shrink-0 ml-2">
                                        <TrashIcon />
                                    </button>
                                </div>
                            )) : <p className="text-sm text-gray-500 text-center py-4">No quick replies yet.</p>}
                        </div>
                    </div>
                </div>
            </SettingsCard>
        </div>
        
        {/* Right Column: Account & Subscription */}
        <div className="space-y-8">
            <SettingsCard 
                title="Store Display Settings" 
                footer={
                    <button 
                        onClick={handleSaveDisplaySettings}
                        className="px-5 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700"
                    >
                        Save Display Settings
                    </button>
                }
            >
                {loadingDisplaySettings ? (
                    <div className="space-y-6 animate-pulse">
                        <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-5 bg-gray-200 rounded w-full"></div>
                        <div className="h-5 bg-gray-200 rounded w-1/2"></div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label htmlFor="toggle-my-page" className="font-medium text-gray-700">Show on "My Page"</label>
                            <ToggleSwitch enabled={displaySettings.myPage} onChange={(val) => handleDisplaySettingChange('myPage', val)} />
                        </div>
                        <p className="text-sm text-gray-500 -mt-2">Display connect/disconnect button on customer account page.</p>

                        <div className="flex items-center justify-between">
                            <label htmlFor="toggle-thank-you" className="font-medium text-gray-700">Show on "Thank You" Page</label>
                            <ToggleSwitch enabled={displaySettings.thankYou} onChange={(val) => handleDisplaySettingChange('thankYou', val)} />
                        </div>
                        <p className="text-sm text-gray-500 -mt-2">Show invitation to connect LINE after an order is completed.</p>
                        
                        <div className="flex items-center justify-between">
                            <label htmlFor="toggle-banner" className="font-medium text-gray-700">Show Promotion Banner</label>
                            <ToggleSwitch enabled={displaySettings.banner} onChange={(val) => handleDisplaySettingChange('banner', val)} />
                        </div>
                        <p className="text-sm text-gray-500 -mt-2">Display a promotional banner on the storefront.</p>
                    </div>
                )}
            </SettingsCard>

            <SettingsCard title="Account Information">
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); addToast('Password updated!', 'success'); }}>
                <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                <input
                    type="email"
                    id="email"
                    name="email"
                    defaultValue={auth.currentUser?.email || ''}
                    disabled
                    className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm text-gray-500 cursor-not-allowed"
                />
                </div>
                <div>
                <label htmlFor="current-password" className="block text-sm font-medium text-gray-700">Current Password</label>
                <input
                    type="password"
                    id="current-password"
                    name="current-password"
                    autoComplete="current-password"
                    className="mt-1 block w-full form-input"
                />
                </div>
                <div>
                <label htmlFor="new-password" className="block text-sm font-medium text-gray-700">New Password</label>
                <input
                    type="password"
                    id="new-password"
                    name="new-password"
                    autoComplete="new-password"
                    className="mt-1 block w-full form-input"
                />
                </div>
                <div className="pt-2">
                    <button
                        type="submit"
                        className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700"
                    >
                        Update Password
                    </button>
                </div>
            </form>
            </SettingsCard>

            <SettingsCard title="Workspace & Subscription">
            <div className="text-gray-600">
                <p><span className="font-medium text-gray-800">Workspace:</span> My E-commerce Store</p>
                <p className="mt-2"><span className="font-medium text-gray-800">Current Plan:</span> Pro Plan</p>
                <p className="mt-2 text-sm text-gray-500">Your plan renews on August 1, 2024.</p>
                <div className="mt-4">
                    <button
                        className="px-6 py-2 border border-indigo-600 text-indigo-600 font-semibold rounded-lg hover:bg-indigo-50"
                    >
                        Manage Subscription
                    </button>
                </div>
            </div>
            </SettingsCard>
            
            <DataSeeder addToast={addToast} />
        </div>

      </div>
    </div>
  );
};

export default Settings;
