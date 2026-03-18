import React, { useState, useEffect, useCallback } from 'react';
import { AutomationType, AutomationSetting } from '../types';
import { fetchAutomationSettings, saveAutomationSettings } from '../api';
import { generateAbandonedCartTemplate } from '../gemini';
import ClockIcon from './icons/ClockIcon';
import PencilIcon from './icons/PencilIcon';
import SparklesIcon from './icons/SparklesIcon';
import ToggleSwitch from './ToggleSwitch';


interface AutomationSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  automation: { id: AutomationType; title: string; };
  addToast: (message: string, type: 'success' | 'error') => void;
}

export const AutomationSetupModal: React.FC<AutomationSetupModalProps> = ({ isOpen, onClose, automation, addToast }) => {
  const [settings, setSettings] = useState<AutomationSetting | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const loadSettings = useCallback(async () => {
    setLoading(true);
    try {
      const fetchedSettings = await fetchAutomationSettings(automation.id);
      
      // If template is empty, generate one with AI
      if (!fetchedSettings.messageTemplate) {
        addToast('Generating an AI template for you...', 'success');
        const generatedTemplate = await generateAbandonedCartTemplate();
        fetchedSettings.messageTemplate = generatedTemplate;
      }

      setSettings(fetchedSettings);
    } catch (error) {
      addToast('Failed to load settings.', 'error');
    } finally {
      setLoading(false);
    }
  }, [automation.id, addToast]);

  useEffect(() => {
    if (isOpen) {
      loadSettings();
    }
  }, [isOpen, loadSettings]);

  const handleSave = async () => {
      if (!settings) return;
      setIsSaving(true);
      try {
        await saveAutomationSettings(settings);
        addToast('Automation settings saved!', 'success');
        onClose();
      } catch (error) {
        addToast('Failed to save settings.', 'error');
      } finally {
        setIsSaving(false);
      }
  };
  
  const handleSettingChange = (field: keyof AutomationSetting, value: any) => {
    if (settings) {
        setSettings({ ...settings, [field]: value });
    }
  };

  if (!isOpen) return null;

  const renderContent = () => {
    if (loading || !settings) {
      return (
        <div className="flex items-center justify-center p-20">
          <div className="animate-spin h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full" />
        </div>
      );
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                <label htmlFor="enable-automation" className="font-semibold text-gray-700 text-lg">
                    Enable Automation
                </label>
                <ToggleSwitch enabled={settings.isEnabled} onChange={(val) => handleSettingChange('isEnabled', val)} />
            </div>

            {/* Timing */}
            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 flex items-center"><ClockIcon /> <span className="ml-2">Send message after...</span></label>
                <div className="flex items-center space-x-2">
                    <input 
                        type="number"
                        value={settings.delayValue}
                        onChange={(e) => handleSettingChange('delayValue', parseInt(e.target.value, 10) || 1)}
                        className="w-24 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <select
                        value={settings.delayUnit}
                        onChange={(e) => handleSettingChange('delayUnit', e.target.value)}
                        className="px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    >
                        <option value="minutes">Minutes</option>
                        <option value="hours">Hours</option>
                        <option value="days">Days</option>
                    </select>
                </div>
                <p className="text-xs text-gray-500">Time to wait after a cart is abandoned before sending the message.</p>
            </div>

            {/* Message Template */}
            <div className="space-y-2">
                 <label htmlFor="message-template" className="block text-sm font-medium text-gray-700 flex items-center">
                    <PencilIcon />
                    <span className="ml-2">Message Template</span>
                    <span className="ml-auto text-xs font-normal bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full flex items-center"><SparklesIcon /> <span className="ml-1">AI-Generated</span></span>
                 </label>
                 <textarea
                    id="message-template"
                    rows={8}
                    value={settings.messageTemplate}
                    onChange={(e) => handleSettingChange('messageTemplate', e.target.value)}
                    className="w-full p-3 font-mono text-sm bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                 />
                 <p className="text-xs text-gray-500">
                    Use placeholders like <code className="bg-gray-200 px-1 rounded-sm">{`{{customer_name}}`}</code>, 
                    <code className="bg-gray-200 px-1 rounded-sm">{`{{cart_items}}`}</code>, and 
                    <code className="bg-gray-200 px-1 rounded-sm">{`{{checkout_link}}`}</code>.
                </p>
            </div>
            
            {/* Recommendations */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <label htmlFor="enable-recommendations" className="font-semibold text-gray-700">
                    Include product recommendations
                </label>
                <ToggleSwitch enabled={settings.includeRecommendations ?? false} onChange={(val) => handleSettingChange('includeRecommendations', val)} />
            </div>

        </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-start pt-20" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">Setup: {automation.title}</h2>
        </div>
        
        {renderContent()}

        <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
          <button onClick={onClose} className="px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">Cancel</button>
          <button 
            onClick={handleSave}
            disabled={isSaving || loading}
            className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-wait flex items-center justify-center"
          >
            {isSaving && <div className="animate-spin h-5 w-5 mr-3 border-2 border-white border-t-transparent rounded-full"></div>}
            {isSaving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
};