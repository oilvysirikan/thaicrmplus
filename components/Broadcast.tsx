import React, { useState, useEffect, useCallback } from 'react';
import { Tag, BroadcastCampaign, CardMessageTemplate, FacebookLiveScript } from '../types';
import { fetchAllTags, getRecipientCountForTags, sendBroadcast, fetchBroadcastHistory, fetchMessageTemplates, fetchFacebookLiveScripts } from '../api';
import MegaphoneIcon from './icons/MegaphoneIcon';
import FacebookIcon from './icons/FacebookIcon';
import LineIcon from './icons/LineIcon';
import PlusCircleIcon from './icons/PlusCircleIcon';
import TrashIcon from './icons/TrashIcon';

interface BroadcastProps {
  addToast: (message: string, type: 'success' | 'error') => void;
}

const Broadcast: React.FC<BroadcastProps> = ({ addToast }) => {
  const [message, setMessage] = useState('');
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [allTemplates, setAllTemplates] = useState<CardMessageTemplate[]>([]);
  const [fbLiveScripts, setFbLiveScripts] = useState<FacebookLiveScript[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<Set<string>>(new Set());
  const [recipientCount, setRecipientCount] = useState<number | null>(null);
  const [history, setHistory] = useState<BroadcastCampaign[]>([]);
  
  const [messageType, setMessageType] = useState<'text' | 'card'>('text');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'broadcast' | 'live'>('broadcast');


  const [isLoadingTags, setIsLoadingTags] = useState(true);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(true);
  const [isLoadingLive, setIsLoadingLive] = useState(true);
  const [isCounting, setIsCounting] = useState(false);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoadingTags(true);
      setIsLoadingHistory(true);
      setIsLoadingTemplates(true);
      setIsLoadingLive(true);

      try {
        const [tagsData, historyData, templatesData, liveData] = await Promise.all([
          fetchAllTags(),
          fetchBroadcastHistory(),
          fetchMessageTemplates(),
          fetchFacebookLiveScripts()
        ]);
        setAllTags(tagsData);
        setHistory(historyData);
        setAllTemplates(templatesData);
        setFbLiveScripts(liveData);
      } catch (error) {
        addToast('Failed to load initial page data.', 'error');
      } finally {
        setIsLoadingTags(false);
        setIsLoadingHistory(false);
        setIsLoadingTemplates(false);
        setIsLoadingLive(false);
      }
    };
    loadInitialData();
  }, [addToast]);

  const updateRecipientCount = useCallback(async (tagIds: string[]) => {
      setIsCounting(true);
      try {
          const count = await getRecipientCountForTags(tagIds);
          setRecipientCount(count);
      } catch (error) {
          addToast('Could not calculate recipients.', 'error');
          setRecipientCount(0);
      } finally {
        setIsCounting(false);
      }
  }, [addToast]);
  
  useEffect(() => {
    if (selectedTagIds.size > 0) {
        updateRecipientCount(Array.from(selectedTagIds));
    } else {
        setRecipientCount(0);
    }
  }, [selectedTagIds, updateRecipientCount]);
  
  const handleTagClick = (tagId: string) => {
    setSelectedTagIds(prev => {
        const newSet = new Set(prev);
        if (newSet.has(tagId)) {
            newSet.delete(tagId);
        } else {
            newSet.add(tagId);
        }
        return newSet;
    });
  };

  const handleSendBroadcast = async () => {
    let finalMessage = message.trim();
    if(messageType === 'card') {
        if(!selectedTemplateId) {
            addToast('Please select a card template.', 'error');
            return;
        }
        const template = allTemplates.find(t => t.id === selectedTemplateId);
        finalMessage = `[Card: ${template?.name}]`;
    }

    if (!finalMessage) {
      addToast('Message cannot be empty.', 'error');
      return;
    }
    if (selectedTagIds.size === 0) {
      addToast('Please select at least one target tag.', 'error');
      return;
    }

    setIsSending(true);
    try {
      const newCampaign = await sendBroadcast(finalMessage, Array.from(selectedTagIds));
      setHistory(prev => [newCampaign, ...prev]);
      addToast('Broadcast sent successfully!', 'success');
      setMessage('');
      setSelectedTemplateId('');
      setSelectedTagIds(new Set());
    } catch (error) {
      addToast('Failed to send broadcast.', 'error');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Campaigns & Automation</h2>
      </div>

      <div className="flex space-x-4 mb-8 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('broadcast')}
          className={`pb-4 px-4 text-sm font-bold flex items-center space-x-2 transition-all border-b-2 ${activeTab === 'broadcast' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
        >
          <MegaphoneIcon />
          <span>Broadcast Campaigns</span>
        </button>
        <button
          onClick={() => setActiveTab('live')}
          className={`pb-4 px-4 text-sm font-bold flex items-center space-x-2 transition-all border-b-2 ${activeTab === 'live' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
        >
          <FacebookIcon />
          <span>Facebook Live Automation</span>
        </button>
      </div>

      {activeTab === 'broadcast' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Create Campaign */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-800 flex items-center">
                  <MegaphoneIcon />
                  <span className="ml-2">Create New Broadcast</span>
                </h3>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message Type</label>
                  <div className="flex rounded-md shadow-sm">
                      <button onClick={() => setMessageType('text')} className={`px-4 py-2 text-sm font-medium border rounded-l-md ${messageType === 'text' ? 'bg-indigo-600 text-white border-indigo-600 z-10' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}>
                          Text Message
                      </button>
                      <button onClick={() => setMessageType('card')} className={`-ml-px px-4 py-2 text-sm font-medium border rounded-r-md ${messageType === 'card' ? 'bg-indigo-600 text-white border-indigo-600 z-10' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}>
                          Card Message
                      </button>
                  </div>
                </div>

                {messageType === 'text' ? (
                  <div>
                    <label htmlFor="broadcast-message" className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                    <textarea
                      id="broadcast-message"
                      rows={6}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Enter your marketing message here..."
                    />
                  </div>
                ) : (
                  <div>
                    <label htmlFor="card-template" className="block text-sm font-medium text-gray-700 mb-1">Select Card Template</label>
                    {isLoadingTemplates ? <p>Loading templates...</p> : (
                      <select
                        id="card-template"
                        value={selectedTemplateId}
                        onChange={(e) => setSelectedTemplateId(e.target.value)}
                        className="w-full h-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value="" disabled>-- Select a template --</option>
                        {allTemplates.map(template => (
                          <option key={template.id} value={template.id}>{template.name}</option>
                        ))}
                      </select>
                    )}
                  </div>
                )}


                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Target Audience (by Tags)</label>
                  {isLoadingTags ? <p>Loading tags...</p> : (
                    <div className="flex flex-wrap gap-2">
                      {allTags.map(tag => (
                        <button
                          key={tag.id}
                          onClick={() => handleTagClick(tag.id)}
                          className={`px-3 py-1.5 text-sm font-medium rounded-full border transition-colors ${
                            selectedTagIds.has(tag.id)
                              ? 'bg-indigo-600 text-white border-indigo-600'
                              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                          }`}
                        >
                          {tag.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="p-4 bg-indigo-50 rounded-lg flex items-center justify-between">
                  <span className="font-semibold text-indigo-800">Estimated Recipients:</span>
                  {isCounting ? (
                      <div className="h-5 w-20 bg-indigo-200 rounded-md animate-pulse"></div>
                  ) : (
                      <span className="text-2xl font-bold text-indigo-600">{recipientCount?.toLocaleString() ?? '...'}</span>
                  )}
                </div>
                
                <div className="pt-2">
                  <button
                    onClick={handleSendBroadcast}
                    disabled={isSending}
                    className="w-full px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-75 transition-colors disabled:bg-indigo-400 disabled:cursor-wait flex items-center justify-center"
                  >
                    {isSending && <div className="animate-spin h-5 w-5 mr-3 border-2 border-white border-t-transparent rounded-full"></div>}
                    {isSending ? 'Sending...' : 'Send Broadcast Now'}
                  </button>
                </div>

              </div>
            </div>
          </div>

          {/* Right: History */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-800">History</h3>
              </div>
              <div className="p-2 max-h-[600px] overflow-y-auto">
                {isLoadingHistory ? <p className="p-4 text-center text-gray-500">Loading history...</p> : (
                  <ul className="divide-y divide-gray-200">
                    {history.map(campaign => (
                      <li key={campaign.id} className="p-4">
                        <p className="text-sm text-gray-700 mb-2">"{campaign.message}"</p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <div className="flex flex-wrap gap-1">
                            {campaign.tags.map(t => <span key={t.id} className="px-1.5 py-0.5 bg-gray-200 text-gray-600 rounded-full">{t.name}</span>)}
                          </div>
                          <span className="font-semibold">{campaign.recipientCount} recipients</span>
                        </div>
                        <p className="text-right text-xs text-gray-400 mt-2">{campaign.timestamp}</p>
                      </li>
                    ))}
                    {history.length === 0 && <p className="p-4 text-center text-gray-500">No campaigns sent yet.</p>}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold text-gray-800">Facebook Live Automation Scripts</h3>
              <p className="text-sm text-gray-500">Automatically reply to comments or send messages during Facebook Live.</p>
            </div>
            <button className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition-colors">
              <PlusCircleIcon />
              <span>Add New Script</span>
            </button>
          </div>

          {isLoadingLive ? (
            <div className="text-center py-12">Loading automation scripts...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {fbLiveScripts.map(script => (
                <div key={script.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-bold text-gray-900">{script.name}</h4>
                        <div className="flex items-center mt-1">
                          <span className="text-xs text-gray-400">Trigger Keyword:</span>
                          <span className="ml-2 px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded font-mono text-xs font-bold">{script.keyword}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className={`w-10 h-5 rounded-full relative transition-colors ${script.isActive ? 'bg-green-500' : 'bg-gray-300'}`}>
                          <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${script.isActive ? 'right-1' : 'left-1'}`}></div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center text-sm">
                        <span className="text-gray-400 w-20">Action:</span>
                        <span className="font-medium text-gray-700 capitalize">{script.action.replace(/_/g, ' ')}</span>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                        <p className="text-xs font-bold text-gray-400 uppercase mb-1">Reply Template</p>
                        <p className="text-sm text-gray-600 italic">"{script.messageTemplate}"</p>
                      </div>
                    </div>
                  </div>
                  <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                    <span className="text-[10px] text-gray-400">Last updated: {script.timestamp}</span>
                    <div className="flex space-x-3">
                      <button className="text-gray-400 hover:text-red-500 transition-colors">
                        <TrashIcon />
                      </button>
                      <button className="text-indigo-600 hover:text-indigo-800 font-bold text-sm">Edit</button>
                    </div>
                  </div>
                </div>
              ))}
              {fbLiveScripts.length === 0 && (
                <div className="col-span-full py-12 text-center border-2 border-dashed border-gray-200 rounded-xl">
                  <p className="text-gray-500">No automation scripts found. Create your first script to automate your Facebook Live sales!</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Broadcast;