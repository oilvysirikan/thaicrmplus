import React, { useState, useEffect } from 'react';
import { CardMessageTemplate, CardMessageAction } from '../types';
import { saveMessageTemplate } from '../api';
import PhotographIcon from './icons/PhotographIcon';
import PlusCircleIcon from './icons/PlusCircleIcon';
import XCircleIcon from './icons/XCircleIcon';

interface CardMessageEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  addToast: (message: string, type: 'success' | 'error') => void;
  template: CardMessageTemplate | null;
  onSave: (template: CardMessageTemplate) => void;
}

const emptyTemplate: Omit<CardMessageTemplate, 'id' | 'timestamp'> = {
  name: '',
  imageUrl: '',
  title: '',
  text: '',
  actions: [{ id: 'a1', label: '', url: '' }],
};

export const CardMessageEditorModal: React.FC<CardMessageEditorModalProps> = ({ isOpen, onClose, addToast, template, onSave }) => {
  const [formData, setFormData] = useState(emptyTemplate);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (template) {
      setFormData(template);
    } else {
      setFormData(emptyTemplate);
    }
  }, [template]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleActionChange = (index: number, field: keyof CardMessageAction, value: string) => {
      const newActions = [...formData.actions];
      newActions[index] = {...newActions[index], [field]: value};
      setFormData({...formData, actions: newActions});
  };

  const addAction = () => {
      if(formData.actions.length < 3) {
          const newActions = [...formData.actions, { id: `a${Date.now()}`, label: '', url: ''}];
          setFormData({...formData, actions: newActions});
      }
  }
  
  const removeAction = (index: number) => {
      const newActions = formData.actions.filter((_, i) => i !== index);
      setFormData({...formData, actions: newActions});
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const reader = new FileReader();
          reader.onload = (event) => {
              setFormData({...formData, imageUrl: event.target?.result as string});
          };
          reader.readAsDataURL(e.target.files[0]);
      }
  };

  const handleSave = async () => {
      if (!formData.name || !formData.title || !formData.text) {
          addToast('Template Name, Title, and Text are required.', 'error');
          return;
      }
      setIsSaving(true);
      try {
          // Note: In a real app, we might not pass the full template object if it contains an ID for an existing one.
          // This is a simplification for the mock API.
          const saved = await saveMessageTemplate(formData);
          addToast('Template saved successfully!', 'success');
          onSave(saved);
      } catch (error) {
          addToast('Failed to save template.', 'error');
      } finally {
          setIsSaving(false);
      }
  };


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-gray-50 rounded-lg shadow-xl w-full max-w-5xl max-h-[95vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">{template ? 'Edit' : 'Create'} Card Message Template</h2>
        </div>
        
        <div className="flex-1 flex overflow-hidden">
          {/* Left: Editor Form */}
          <div className="w-3/5 p-6 space-y-4 overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-700">Content</h3>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Template Name</label>
              <input type="text" name="name" id="name" value={formData.name} onChange={handleInputChange} className="mt-1 w-full form-input" placeholder="e.g., 'Welcome Offer'" />
              <p className="text-xs text-gray-500 mt-1">For internal reference only.</p>
            </div>
            
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
              <input type="text" name="title" id="title" value={formData.title} onChange={handleInputChange} className="mt-1 w-full form-input" placeholder="Card title (bold)" maxLength={40}/>
            </div>

            <div>
              <label htmlFor="text" className="block text-sm font-medium text-gray-700">Text</label>
              <textarea name="text" id="text" value={formData.text} onChange={handleInputChange} rows={4} className="mt-1 w-full form-input" placeholder="Main message content" maxLength={160} />
            </div>

            <div className="pt-4 border-t">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Image</h3>
                <div>
                  <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700">Image URL</label>
                  <input type="text" name="imageUrl" id="imageUrl" value={formData.imageUrl} onChange={handleInputChange} className="mt-1 w-full form-input" placeholder="https://example.com/image.png" />
                </div>
                <div className="relative flex items-center my-4">
                    <div className="flex-grow border-t border-gray-200"></div>
                    <span className="flex-shrink mx-4 text-gray-400 text-xs">OR</span>
                    <div className="flex-grow border-t border-gray-200"></div>
                </div>
                <div>
                     <label htmlFor="imageUpload" className="block text-sm font-medium text-gray-700 mb-1">Upload Image</label>
                     <input type="file" id="imageUpload" className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" accept="image/*" onChange={handleImageUpload} />
                </div>
            </div>

            <h3 className="text-lg font-semibold text-gray-700 pt-4 border-t">Actions</h3>
            <div className="space-y-3">
              {formData.actions.map((action, index) => (
                <div key={action.id} className="p-3 bg-white border rounded-md flex items-center gap-3">
                  <span className="text-gray-500 font-bold">{index + 1}</span>
                  <input type="text" value={action.label} onChange={e => handleActionChange(index, 'label', e.target.value)} placeholder="Button Label" className="flex-1 form-input"/>
                  <input type="text" value={action.url} onChange={e => handleActionChange(index, 'url', e.target.value)} placeholder="https://example.com" className="flex-1 form-input"/>
                  <button onClick={() => removeAction(index)} className="text-red-500 hover:text-red-700">
                      <XCircleIcon className="w-6 h-6" />
                  </button>
                </div>
              ))}
               {formData.actions.length < 3 && (
                <button onClick={addAction} className="w-full flex items-center justify-center gap-2 p-2 text-sm text-indigo-600 border-2 border-dashed border-gray-300 rounded-md hover:bg-indigo-50">
                    <PlusCircleIcon /> Add Action
                </button>
               )}
            </div>
          </div>
          
          {/* Right: Preview */}
          <div className="w-2/5 p-6 bg-gray-700 flex flex-col items-center justify-center">
             <div className="w-full max-w-sm mx-auto">
                <p className="text-center text-white text-sm mb-2 font-mono">LINE Preview</p>
                <div className="bg-white rounded-lg overflow-hidden shadow-2xl">
                    {/* Image Area */}
                    <div className="h-40 bg-gray-200 flex items-center justify-center">
                      {formData.imageUrl ? (
                        <img src={formData.imageUrl} alt="preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-center text-gray-500">
                          <PhotographIcon />
                          <p className="text-sm mt-1">Image Preview</p>
                          <p className="text-xs mt-1 text-gray-400">Add an image URL or upload a file.</p>
                        </div>
                      )}
                    </div>
                    {/* Content Area */}
                    <div className="p-4">
                        <h4 className="font-bold text-lg text-gray-900 break-words">{formData.title || "Card Title"}</h4>
                        <p className="text-gray-600 text-sm mt-1 break-words">{formData.text || "This is the main body text for the card message. It can span multiple lines."}</p>
                    </div>
                    {/* Actions Area */}
                    <div className="border-t border-gray-200">
                        {formData.actions.map((action, index) => (
                          action.label && <div key={index} className="text-center text-blue-600 font-semibold py-3 border-b border-gray-200 last:border-b-0">
                              {action.label}
                          </div>
                        ))}
                    </div>
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
            {isSaving ? 'Saving...' : 'Save Template'}
          </button>
        </div>
      </div>
    </div>
  );
};