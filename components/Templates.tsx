import React, { useState, useEffect } from 'react';
import { CardMessageTemplate, FacebookWelcomeTemplate } from '../types';
import { fetchMessageTemplates, fetchFacebookWelcomeTemplates } from '../api';
import { CardMessageEditorModal } from './CardMessageEditorModal';
import FacebookIcon from './icons/FacebookIcon';
import LineIcon from './icons/LineIcon';
import PlusCircleIcon from './icons/PlusCircleIcon';

interface TemplatesProps {
  addToast: (message: string, type: 'success' | 'error') => void;
}

const TemplateCard: React.FC<{ template: CardMessageTemplate, onEdit: (template: CardMessageTemplate) => void }> = ({ template, onEdit }) => (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transform hover:-translate-y-1 transition-transform duration-300">
        <img src={template.imageUrl || 'https://placehold.co/600x400/e0e7ff/4338ca?text=No+Image'} alt={template.name} className="h-40 w-full object-cover" />
        <div className="p-4 border-t">
            <h3 className="font-bold text-gray-800 truncate">{template.name}</h3>
            <p className="text-sm text-gray-500 truncate">{template.title}</p>
            <p className="text-xs text-gray-400 mt-2">Last updated: {template.timestamp}</p>
        </div>
        <div className="p-4 bg-gray-50 border-t">
            <button 
                onClick={() => onEdit(template)}
                className="w-full text-sm font-semibold text-indigo-600 hover:text-indigo-800"
            >
                Edit Template
            </button>
        </div>
    </div>
);


const Templates: React.FC<TemplatesProps> = ({ addToast }) => {
    const [templates, setTemplates] = useState<CardMessageTemplate[]>([]);
    const [fbWelcomeTemplates, setFbWelcomeTemplates] = useState<FacebookWelcomeTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<CardMessageTemplate | null>(null);
    const [activeTab, setActiveTab] = useState<'line' | 'facebook'>('line');

    const loadTemplates = async () => {
        setLoading(true);
        try {
            const [lineData, fbData] = await Promise.all([
                fetchMessageTemplates(),
                fetchFacebookWelcomeTemplates()
            ]);
            setTemplates(lineData);
            setFbWelcomeTemplates(fbData);
        } catch (error) {
            addToast('Failed to load templates.', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTemplates();
    }, []);

    const handleOpenEditor = (template: CardMessageTemplate | null = null) => {
        setEditingTemplate(template);
        setIsEditorOpen(true);
    };

    const handleCloseEditor = () => {
        setIsEditorOpen(false);
        setEditingTemplate(null);
    };
    
    const handleSave = (savedTemplate: CardMessageTemplate) => {
        // Optimistically update the UI
        setTemplates(prev => {
            const index = prev.findIndex(t => t.id === savedTemplate.id);
            if (index > -1) {
                const newTemplates = [...prev];
                newTemplates[index] = savedTemplate;
                return newTemplates;
            }
            return [savedTemplate, ...prev];
        });
        handleCloseEditor();
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800">Message Templates</h2>
                <button
                    onClick={() => handleOpenEditor()}
                    className="px-5 py-2.5 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-75 transition-colors flex items-center"
                >
                    <PlusCircleIcon />
                    <span className="ml-2">Create New Template</span>
                </button>
            </div>

            <div className="flex space-x-4 mb-8 border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('line')}
                    className={`pb-4 px-4 text-sm font-bold flex items-center space-x-2 transition-all border-b-2 ${activeTab === 'line' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                >
                    <LineIcon />
                    <span>LINE Card Messages</span>
                </button>
                <button
                    onClick={() => setActiveTab('facebook')}
                    className={`pb-4 px-4 text-sm font-bold flex items-center space-x-2 transition-all border-b-2 ${activeTab === 'facebook' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                >
                    <FacebookIcon />
                    <span>Facebook Welcome Messages</span>
                </button>
            </div>

            {loading ? (
                <div className="text-center p-10">Loading templates...</div>
            ) : activeTab === 'line' ? (
                <>
                    <p className="text-gray-600 mb-8">
                        Create and manage reusable card message templates for your LINE broadcast campaigns.
                    </p>
                    {templates.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {templates.map(template => (
                                <TemplateCard key={template.id} template={template} onEdit={handleOpenEditor}/>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 border-2 border-dashed border-gray-300 rounded-lg">
                            <h3 className="text-xl font-semibold text-gray-700">No LINE Templates Yet</h3>
                            <p className="text-gray-500 mt-2">Click 'Create New Template' to get started.</p>
                        </div>
                    )}
                </>
            ) : (
                <>
                    <p className="text-gray-600 mb-8">
                        Manage welcome messages that are automatically sent to new customers on Facebook Messenger.
                    </p>
                    {fbWelcomeTemplates.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {fbWelcomeTemplates.map(template => (
                                <div key={template.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                                    <div className="p-6 flex-1">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="font-bold text-gray-900">{template.name}</h3>
                                            <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${template.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                                {template.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                        <div className="bg-gray-50 p-4 rounded-lg mb-4 text-sm text-gray-700 italic border-l-4 border-indigo-400">
                                            "{template.text}"
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Buttons</p>
                                            {template.buttons.map(btn => (
                                                <div key={btn.id} className="text-xs bg-white border border-gray-100 px-3 py-2 rounded shadow-sm flex items-center justify-between">
                                                    <span className="font-medium">{btn.title}</span>
                                                    <span className="text-[10px] text-gray-400 uppercase">{btn.type}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                                        <span className="text-[10px] text-gray-400">Updated: {template.timestamp}</span>
                                        <button className="text-indigo-600 hover:text-indigo-800 text-sm font-bold">Edit</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 border-2 border-dashed border-gray-300 rounded-lg">
                            <h3 className="text-xl font-semibold text-gray-700">No Facebook Welcome Templates Yet</h3>
                            <p className="text-gray-500 mt-2">Click 'Create New Template' to get started.</p>
                        </div>
                    )}
                </>
            )}
            
            {isEditorOpen && (
                <CardMessageEditorModal
                    isOpen={isEditorOpen}
                    onClose={handleCloseEditor}
                    addToast={addToast}
                    template={editingTemplate}
                    onSave={handleSave}
                />
            )}
        </div>
    );
};

export default Templates;
