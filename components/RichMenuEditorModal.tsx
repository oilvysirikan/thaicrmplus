import React, { useState, useEffect } from 'react';
import { RichMenuTemplate, RichMenuLayout, RichMenuAction, LiffApp } from '../types';
import { saveRichMenu, fetchLiffApps } from '../api';
import PhotographIcon from './icons/PhotographIcon';
import XCircleIcon from './icons/XCircleIcon';
import LayoutGridIcon from './icons/LayoutGridIcon';
import LayoutListIcon from './icons/LayoutListIcon';
import UserCardIcon from './icons/UserCardIcon';
import UserCircleIcon from './icons/UserCircleIcon';
import HomeIcon from './icons/HomeIcon';

interface RichMenuEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  addToast: (message: string, type: 'success' | 'error') => void;
  template: RichMenuTemplate | null;
  onSave: (template: RichMenuTemplate) => void;
}

const layoutTemplates: { id: RichMenuLayout; name: string; areas: number; icon: React.ReactNode, gridClasses: string }[] = [
    { id: '6-grid', name: '6 Buttons (Grid)', areas: 6, icon: <LayoutGridIcon />, gridClasses: 'grid grid-cols-3 grid-rows-2' },
    { id: '4-grid', name: '4 Buttons (Grid)', areas: 4, icon: <LayoutGridIcon />, gridClasses: 'grid grid-cols-2 grid-rows-2' },
    { id: '3-row', name: '3 Buttons (Row)', areas: 3, icon: <LayoutListIcon />, gridClasses: 'grid grid-cols-1 grid-rows-3' },
];

const emptyTemplate: Omit<RichMenuTemplate, 'id' | 'timestamp'> = {
  name: '',
  chatBarText: 'Menu',
  imageUrl: '',
  layout: '6-grid',
  actions: [],
  tabCount: 0,
};

export const RichMenuEditorModal: React.FC<RichMenuEditorModalProps> = ({ isOpen, onClose, addToast, template, onSave }) => {
  const [formData, setFormData] = useState(emptyTemplate);
  const [isSaving, setIsSaving] = useState(false);
  const [liffApps, setLiffApps] = useState<LiffApp[]>([]);

  useEffect(() => {
    fetchLiffApps().then(setLiffApps).catch(() => addToast('Could not load LIFF apps.', 'error'));
  }, [addToast]);
  
  const generateInitialActions = (layout: RichMenuLayout) => {
    const { areas } = layoutTemplates.find(l => l.id === layout) || layoutTemplates[0];
    return Array.from({ length: areas }, (_, i) => ({
      id: `action-${i}`,
      type: 'url' as 'url' | 'liff',
      label: `Button ${i + 1}`,
      url: ''
    }));
  };

  useEffect(() => {
    if (template) {
      setFormData(template);
    } else {
      const initialActions = generateInitialActions(emptyTemplate.layout);
      setFormData({...emptyTemplate, actions: initialActions });
    }
  }, [template]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleLayoutChange = (layoutId: RichMenuLayout) => {
    const selectedLayout = layoutTemplates.find(l => l.id === layoutId);
    if (!selectedLayout) return;

    const newActions = Array.from({ length: selectedLayout.areas }, (_, i) => ({
        id: `action-${i}`,
        type: formData.actions[i]?.type || 'url',
        label: formData.actions[i]?.label || `Button ${i+1}`,
        url: formData.actions[i]?.url || '',
        liffPageId: formData.actions[i]?.liffPageId
    }));

    setFormData({ ...formData, layout: layoutId, actions: newActions });
  }

  const handleActionChange = (index: number, field: keyof RichMenuAction, value: any) => {
      const newActions = [...formData.actions];
      const actionToUpdate = { ...newActions[index], [field]: value };

      if(field === 'type' && value === 'liff') {
        actionToUpdate.url = ''; // Clear URL when switching to LIFF
      }
      
      if(field === 'liffPageId') {
        const selectedLiff = liffApps.find(app => app.id === value);
        actionToUpdate.url = selectedLiff?.url || '';
      }
      
      newActions[index] = actionToUpdate;
      setFormData({...formData, actions: newActions});
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const reader = new FileReader();
          reader.onload = (event) => {
              setFormData({...formData, imageUrl: event.target?.result as string});
          };
          reader.readAsDataURL(e.target.files[0]);
      }
  };
  
  const handleTabCountChange = (count: 0 | 2 | 3) => {
      setFormData({...formData, tabCount: count });
  }

  const handleSave = async () => {
      if (!formData.name || !formData.chatBarText || !formData.imageUrl) {
          addToast('Menu Name, Chat Bar Text, and an Image are required.', 'error');
          return;
      }
      setIsSaving(true);
      try {
          const saved = await saveRichMenu(formData);
          addToast('Rich Menu saved successfully!', 'success');
          onSave(saved);
      } catch (error) {
          addToast('Failed to save Rich Menu.', 'error');
      } finally {
          setIsSaving(false);
      }
  };

  if (!isOpen) return null;
  
  const currentLayout = layoutTemplates.find(l => l.id === formData.layout);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-gray-50 rounded-lg shadow-xl w-full max-w-6xl max-h-[95vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">{template ? 'Edit' : 'Create'} Rich Menu</h2>
        </div>
        
        <div className="flex-1 flex overflow-hidden">
          {/* Left: Editor Form */}
          <div className="w-3/5 p-6 space-y-4 overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-700">Configuration</h3>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Menu Name</label>
              <input type="text" name="name" id="name" value={formData.name} onChange={handleInputChange} className="mt-1 w-full form-input" placeholder="e.g., 'Main Menu - Summer'" />
              <p className="text-xs text-gray-500 mt-1">For internal reference.</p>
            </div>
            <div>
              <label htmlFor="chatBarText" className="block text-sm font-medium text-gray-700">Chat Bar Text</label>
              <input type="text" name="chatBarText" id="chatBarText" value={formData.chatBarText} onChange={handleInputChange} className="mt-1 w-full form-input" placeholder="e.g., 'Click here for menu'" maxLength={14}/>
            </div>
            
            <h3 className="text-lg font-semibold text-gray-700 pt-4 border-t">Layout</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700">Background Image</label>
              <p className="text-xs text-gray-500 mt-1 mb-2">Recommended size: 2500x1686 or 2500x843 pixels.</p>
              <input type="file" id="richMenuImageUpload" className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" accept="image/png, image/jpeg" onChange={handleImageUpload} />
            </div>
             <div>
                <label className="block text-sm font-medium text-gray-700">Layout Template</label>
                <div className="mt-2 grid grid-cols-3 gap-4">
                    {layoutTemplates.map(lt => (
                        <button key={lt.id} onClick={() => handleLayoutChange(lt.id)} className={`p-2 border-2 rounded-lg flex flex-col items-center justify-center ${formData.layout === lt.id ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 bg-white hover:border-indigo-400'}`}>
                           <span className="text-gray-500">{lt.icon}</span>
                           <span className="text-sm font-medium mt-1">{lt.name}</span>
                        </button>
                    ))}
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Tab Bar</label>
                 <div className="mt-2 flex rounded-md shadow-sm">
                    <button onClick={() => handleTabCountChange(0)} className={`px-4 py-2 text-sm font-medium border rounded-l-md ${formData.tabCount === 0 ? 'bg-indigo-600 text-white border-indigo-600 z-10' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}>No Tabs</button>
                    <button onClick={() => handleTabCountChange(2)} className={`-ml-px px-4 py-2 text-sm font-medium border ${formData.tabCount === 2 ? 'bg-indigo-600 text-white border-indigo-600 z-10' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}>2 Tabs</button>
                    <button onClick={() => handleTabCountChange(3)} className={`-ml-px px-4 py-2 text-sm font-medium border rounded-r-md ${formData.tabCount === 3 ? 'bg-indigo-600 text-white border-indigo-600 z-10' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}>3 Tabs</button>
                </div>
            </div>

            <h3 className="text-lg font-semibold text-gray-700 pt-4 border-t">Actions</h3>
            <div className="space-y-3">
              {formData.actions.map((action, index) => (
                <div key={action.id} className="p-3 bg-white border rounded-md space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="text-gray-500 font-bold">{index + 1}</span>
                    <input type="text" value={action.label} onChange={e => handleActionChange(index, 'label', e.target.value)} placeholder="Button Label" className="flex-1 form-input text-sm"/>
                     <select value={action.type} onChange={e => handleActionChange(index, 'type', e.target.value)} className="form-select text-sm">
                        <option value="url">URL</option>
                        <option value="liff">LIFF App</option>
                     </select>
                  </div>
                  {action.type === 'liff' ? (
                      <select value={action.liffPageId} onChange={e => handleActionChange(index, 'liffPageId', e.target.value)} className="w-full form-select text-sm">
                        <option value="">-- Select LIFF App --</option>
                        {liffApps.map(app => (
                          <option key={app.id} value={app.id}>{app.name}</option>
                        ))}
                      </select>
                  ) : (
                    <input type="text" value={action.url} onChange={e => handleActionChange(index, 'url', e.target.value)} placeholder="https://example.com" className="w-full form-input text-sm"/>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          {/* Right: Preview */}
          <div className="w-2/5 p-6 bg-gray-700 flex flex-col items-center justify-center">
             <div className="w-full max-w-sm mx-auto">
                <p className="text-center text-white text-sm mb-2 font-mono">LINE Rich Menu Preview</p>
                <div className="w-full aspect-[2500/1686] bg-gray-500 rounded-t-lg overflow-hidden relative shadow-2xl">
                    {formData.imageUrl ? (
                        <img src={formData.imageUrl} alt="Rich Menu background" className="w-full h-full object-cover"/>
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                            <PhotographIcon />
                            <p className="text-sm mt-1">Upload an image</p>
                        </div>
                    )}
                    {/* Layout Overlay */}
                    <div className={`absolute inset-0 ${currentLayout?.gridClasses ?? ''}`}>
                        {formData.actions.map((action, index) => (
                            <div key={index} className="border border-dashed border-white/50 flex items-center justify-center bg-black/20 backdrop-blur-sm group hover:bg-black/40 transition-colors">
                                <span className="text-white text-xs font-bold opacity-50 group-hover:opacity-100 transition-opacity">{action.label || `Area ${index+1}`}</span>
                            </div>
                        ))}
                    </div>
                </div>
                {/* Tab Bar Preview */}
                {formData.tabCount && formData.tabCount > 0 && (
                    <div className={`grid ${formData.tabCount === 2 ? 'grid-cols-2' : 'grid-cols-3'} w-full bg-white text-center shadow-2xl`}>
                       <div className="py-2 flex flex-col items-center justify-center border-r border-t border-gray-200">
                           <UserCardIcon/>
                           <span className="text-xs mt-1">Members</span>
                       </div>
                       <div className="py-2 flex flex-col items-center justify-center border-r border-t border-gray-200">
                           <HomeIcon/>
                           <span className="text-xs mt-1">Home</span>
                       </div>
                       {formData.tabCount === 3 && (
                            <div className="py-2 flex flex-col items-center justify-center border-t border-gray-200">
                                <UserCircleIcon/>
                                <span className="text-xs mt-1">My Page</span>
                            </div>
                       )}
                    </div>
                )}
                <div className="w-full bg-white text-center py-2 rounded-b-lg shadow-2xl">
                    <span className="text-sm font-semibold">{formData.chatBarText}</span>
                </div>
             </div>
          </div>
        </div>

        <div className="p-4 bg-gray-100 border-t border-gray-200 flex justify-end space-x-3">
          <button onClick={onClose} className="px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">Cancel</button>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-wait flex items-center justify-center"
          >
            {isSaving && <div className="animate-spin h-5 w-5 mr-3 border-2 border-white border-t-transparent rounded-full"></div>}
            {isSaving ? 'Saving...' : 'Save Rich Menu'}
          </button>
        </div>
      </div>
    </div>
  );
};