
import React, { useState, useEffect } from 'react';
import { ConnectionStatus } from '../types';
import ShopifyIcon from './icons/ShopifyIcon';
import ShippopIcon from './icons/ShippopIcon';
import LineIcon from './icons/LineIcon';
import FacebookIcon from './icons/FacebookIcon';
import CheckCircleIcon from './icons/CheckCircleIcon';
import PlusCircleIcon from './icons/PlusCircleIcon';
import TrashIcon from './icons/TrashIcon';
import ExternalLinkIcon from './icons/ExternalLinkIcon';
import { saveShippopKey, saveLineCredentials, saveFacebookCredentials, fetchFacebookChatbotSettings, saveFacebookChatbotSettings } from '../api';
import { useAppContext } from '../hooks/useAppContext';
import { FacebookChatbotSettings, FacebookMenuItem, FacebookIceBreaker } from '../types';

const ConnectionCard: React.FC<{
  title: string;
  description: string;
  icon: React.ReactNode;
  status: ConnectionStatus;
  children: React.ReactNode;
}> = ({ title, description, icon, status, children }) => (
  <div className="bg-white rounded-lg shadow-md overflow-hidden">
    <div className="p-6 border-b border-gray-200">
      <div className="flex items-start">
        <div className="mr-4 flex-shrink-0">{icon}</div>
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
          <p className="text-gray-500 mt-1">{description}</p>
        </div>
        {status === ConnectionStatus.Connected && (
          <div className="flex items-center text-sm text-green-600 bg-green-100 px-3 py-1 rounded-full">
            <CheckCircleIcon />
            <span className="ml-1.5">Connected</span>
          </div>
        )}
      </div>
    </div>
    <div className="p-6 bg-gray-50">{children}</div>
  </div>
);

const Connections: React.FC = () => {
  const {
    shopifyStatus, setShopifyStatus,
    shippopStatus, setShippopStatus,
    lineStatus, setLineStatus,
    facebookStatus, setFacebookStatus,
    addToast
  } = useAppContext();
  
  const [shippopKey, setShippopKey] = useState('');
  const [lineToken, setLineToken] = useState('');
  const [lineSecret, setLineSecret] = useState('');
  const [facebookPageId, setFacebookPageId] = useState('');
  const [facebookToken, setFacebookToken] = useState('');
  const [fbChatbotSettings, setFbChatbotSettings] = useState<FacebookChatbotSettings | null>(null);

  const [isSavingShippop, setIsSavingShippop] = useState(false);
  const [isSavingLine, setIsSavingLine] = useState(false);
  const [isSavingFacebook, setIsSavingFacebook] = useState(false);
  const [isSavingFbChatbot, setIsSavingFbChatbot] = useState(false);

  useEffect(() => {
    if (facebookStatus === ConnectionStatus.Connected) {
      fetchFacebookChatbotSettings().then(setFbChatbotSettings);
    }
  }, [facebookStatus]);

  const handleConnectShopify = () => {
    setShopifyStatus(ConnectionStatus.Pending);
    addToast('Redirecting to Shopify for authentication...', 'success');
    setTimeout(() => {
      setShopifyStatus(ConnectionStatus.Connected);
      addToast('Shopify connected successfully!', 'success');
    }, 2500);
  };
  
  const handleSaveShippop = async () => {
    if (!shippopKey) {
        addToast('Please enter a SHIPPOP API key.', 'error');
        return;
    }
    setIsSavingShippop(true);
    try {
      await saveShippopKey(shippopKey);
      setShippopStatus(ConnectionStatus.Connected);
      addToast('SHIPPOP API key saved!', 'success');
    } catch (error: any) {
      setShippopStatus(ConnectionStatus.Disconnected);
      addToast(error.message || 'Failed to save SHIPPOP key.', 'error');
    } finally {
      setIsSavingShippop(false);
    }
  };

  const handleSaveLine = async () => {
    if (!lineToken || !lineSecret) {
        addToast('Please enter both LINE credentials.', 'error');
        return;
    }
    setIsSavingLine(true);
    try {
      await saveLineCredentials(lineToken, lineSecret);
      setLineStatus(ConnectionStatus.Connected);
      addToast('LINE API credentials saved!', 'success');
    } catch (error: any) {
      setLineStatus(ConnectionStatus.Disconnected);
      addToast(error.message || 'Failed to save LINE credentials.', 'error');
    } finally {
      setIsSavingLine(false);
    }
  };

  const handleSaveFacebook = async () => {
    if (!facebookPageId || !facebookToken) {
        addToast('Please enter both Facebook credentials.', 'error');
        return;
    }
    setIsSavingFacebook(true);
    try {
      await saveFacebookCredentials(facebookPageId, facebookToken);
      setFacebookStatus(ConnectionStatus.Connected);
      addToast('Facebook API credentials saved!', 'success');
    } catch (error: any) {
      setFacebookStatus(ConnectionStatus.Disconnected);
      addToast(error.message || 'Failed to save Facebook credentials.', 'error');
    } finally {
      setIsSavingFacebook(false);
    }
  };

  const handleSaveFbChatbot = async () => {
    if (!fbChatbotSettings) return;
    setIsSavingFbChatbot(true);
    try {
      await saveFacebookChatbotSettings(fbChatbotSettings);
      addToast('Facebook Chatbot settings saved!', 'success');
    } catch (error: any) {
      addToast(error.message || 'Failed to save Chatbot settings.', 'error');
    } finally {
      setIsSavingFbChatbot(false);
    }
  };

  const addMenuItem = () => {
    if (!fbChatbotSettings) return;
    const newItem: FacebookMenuItem = { id: `m${Date.now()}`, type: 'web_url', title: 'New Menu Item', url: 'https://' };
    setFbChatbotSettings({ ...fbChatbotSettings, persistentMenu: [...fbChatbotSettings.persistentMenu, newItem] });
  };

  const removeMenuItem = (id: string) => {
    if (!fbChatbotSettings) return;
    setFbChatbotSettings({ ...fbChatbotSettings, persistentMenu: fbChatbotSettings.persistentMenu.filter(m => m.id !== id) });
  };

  const addIceBreaker = () => {
    if (!fbChatbotSettings) return;
    const newItem: FacebookIceBreaker = { id: `i${Date.now()}`, question: 'New Question?', payload: 'NEW_PAYLOAD' };
    setFbChatbotSettings({ ...fbChatbotSettings, iceBreakers: [...fbChatbotSettings.iceBreakers, newItem] });
  };

  const removeIceBreaker = (id: string) => {
    if (!fbChatbotSettings) return;
    setFbChatbotSettings({ ...fbChatbotSettings, iceBreakers: fbChatbotSettings.iceBreakers.filter(i => i.id !== id) });
  };


  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-800 mb-6">API Connections</h2>
      <div className="space-y-8">
        {/* Shopify */}
        <ConnectionCard
          title="Shopify"
          description="Connect your Shopify store to sync orders automatically."
          icon={<ShopifyIcon />}
          status={shopifyStatus}
        >
          {shopifyStatus === ConnectionStatus.Connected ? (
            <div className="text-center">
              <p className="text-lg font-medium text-gray-700">Your Shopify store is connected.</p>
              <p className="text-gray-500">Webhooks for `orders/create` are active.</p>
              <button
                onClick={() => {
                  setShopifyStatus(ConnectionStatus.Disconnected);
                  addToast('Shopify disconnected.', 'success');
                }}
                className="mt-4 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <div>
              <p className="text-gray-600 mb-4">
                Clicking 'Connect' will redirect you to Shopify to authorize Siam Connect Hub. We require `read_orders` and `write_fulfillments` permissions.
              </p>
              <button
                onClick={handleConnectShopify}
                disabled={shopifyStatus === ConnectionStatus.Pending}
                className="w-full px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-75 transition-colors disabled:bg-indigo-400 disabled:cursor-wait"
              >
                {shopifyStatus === ConnectionStatus.Pending ? 'Connecting...' : 'Connect to Shopify'}
              </button>
            </div>
          )}
        </ConnectionCard>

        {/* SHIPPOP */}
        <ConnectionCard
          title="SHIPPOP"
          description="Enter your SHIPPOP API key to enable automated shipping."
          icon={<ShippopIcon />}
          status={shippopStatus}
        >
          <div className="space-y-4">
            <div>
              <label htmlFor="shippop-key" className="block text-sm font-medium text-gray-700">SHIPPOP API Key</label>
              <input
                id="shippop-key"
                type="password"
                value={shippopKey}
                onChange={(e) => setShippopKey(e.target.value)}
                placeholder="Enter your API Key"
                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <button
              onClick={handleSaveShippop}
              disabled={isSavingShippop}
              className="w-full px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-75 transition-colors disabled:bg-indigo-400 disabled:cursor-wait flex items-center justify-center"
            >
              {isSavingShippop && <div className="animate-spin h-5 w-5 mr-3 border-2 border-white border-t-transparent rounded-full"></div>}
              {isSavingShippop ? 'Saving...' : 'Save & Connect'}
            </button>
          </div>
        </ConnectionCard>
        
        {/* LINE */}
        <ConnectionCard
          title="LINE Messaging API"
          description="Connect your LINE Official Account to send order notifications."
          icon={<LineIcon />}
          status={lineStatus}
        >
          <div className="space-y-4">
            <div>
              <label htmlFor="line-token" className="block text-sm font-medium text-gray-700">Channel Access Token</label>
              <input
                id="line-token"
                type="password"
                value={lineToken}
                onChange={(e) => setLineToken(e.target.value)}
                placeholder="Enter your Channel Access Token"
                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label htmlFor="line-secret" className="block text-sm font-medium text-gray-700">Channel Secret</label>
              <input
                id="line-secret"
                type="password"
                value={lineSecret}
                onChange={(e) => setLineSecret(e.target.value)}
                placeholder="Enter your Channel Secret"
                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <button
              onClick={handleSaveLine}
              disabled={isSavingLine}
              className="w-full px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-75 transition-colors disabled:bg-indigo-400 disabled:cursor-wait flex items-center justify-center"
            >
              {isSavingLine && <div className="animate-spin h-5 w-5 mr-3 border-2 border-white border-t-transparent rounded-full"></div>}
              {isSavingLine ? 'Saving...' : 'Save & Connect'}
            </button>
          </div>
        </ConnectionCard>

        {/* Facebook */}
        <ConnectionCard
          title="Facebook Messenger"
          description="Connect your Facebook Page to manage conversations and Chatbot."
          icon={<FacebookIcon />}
          status={facebookStatus}
        >
          {facebookStatus === ConnectionStatus.Connected ? (
            <div className="space-y-8">
              <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
                <div>
                  <p className="font-semibold text-gray-800">Page ID: {facebookPageId || '100001234567890'}</p>
                  <p className="text-sm text-gray-500">Connected to Facebook Messenger API</p>
                </div>
                <button
                  onClick={() => {
                    setFacebookStatus(ConnectionStatus.Disconnected);
                    addToast('Facebook disconnected.', 'success');
                  }}
                  className="px-3 py-1.5 bg-red-50 text-red-600 font-medium rounded-md hover:bg-red-100 transition-colors text-sm"
                >
                  Disconnect
                </button>
              </div>

              {fbChatbotSettings && (
                <div className="space-y-6">
                  <div className="border-t border-gray-200 pt-6">
                    <h4 className="text-lg font-bold text-gray-800 mb-4">Chatbot Settings</h4>
                    
                    {/* Get Started Button */}
                    <div className="flex items-center justify-between mb-6 p-4 bg-indigo-50 rounded-xl">
                      <div>
                        <p className="font-bold text-indigo-900">Get Started Button</p>
                        <p className="text-sm text-indigo-700">Show a "Get Started" button to new customers.</p>
                      </div>
                      <button
                        onClick={() => setFbChatbotSettings({...fbChatbotSettings, getStartedEnabled: !fbChatbotSettings.getStartedEnabled})}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${fbChatbotSettings.getStartedEnabled ? 'bg-indigo-600' : 'bg-gray-200'}`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${fbChatbotSettings.getStartedEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                    </div>

                    {/* Ice Breakers */}
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-bold text-gray-700">Ice Breakers (FAQ)</h5>
                        <button onClick={addIceBreaker} className="text-indigo-600 hover:text-indigo-800 flex items-center text-sm font-bold">
                          <PlusCircleIcon />
                          <span className="ml-1">Add Question</span>
                        </button>
                      </div>
                      <div className="space-y-3">
                        {fbChatbotSettings.iceBreakers.map((ib, idx) => (
                          <div key={ib.id} className="flex items-center space-x-2 bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                            <div className="flex-1 space-y-2">
                              <input
                                type="text"
                                value={ib.question}
                                onChange={(e) => {
                                  const newIB = [...fbChatbotSettings.iceBreakers];
                                  newIB[idx].question = e.target.value;
                                  setFbChatbotSettings({...fbChatbotSettings, iceBreakers: newIB});
                                }}
                                placeholder="Question"
                                className="w-full text-sm border-none bg-gray-50 rounded px-2 py-1 focus:ring-1 focus:ring-indigo-500"
                              />
                              <input
                                type="text"
                                value={ib.payload}
                                onChange={(e) => {
                                  const newIB = [...fbChatbotSettings.iceBreakers];
                                  newIB[idx].payload = e.target.value;
                                  setFbChatbotSettings({...fbChatbotSettings, iceBreakers: newIB});
                                }}
                                placeholder="Payload"
                                className="w-full text-xs border-none bg-gray-50 rounded px-2 py-1 focus:ring-1 focus:ring-indigo-500 text-gray-500 font-mono"
                              />
                            </div>
                            <button onClick={() => removeIceBreaker(ib.id)} className="text-red-400 hover:text-red-600 p-1">
                              <TrashIcon />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Persistent Menu */}
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-bold text-gray-700">Persistent Menu</h5>
                        <button onClick={addMenuItem} className="text-indigo-600 hover:text-indigo-800 flex items-center text-sm font-bold">
                          <PlusCircleIcon />
                          <span className="ml-1">Add Menu Item</span>
                        </button>
                      </div>
                      <div className="space-y-3">
                        {fbChatbotSettings.persistentMenu.map((m, idx) => (
                          <div key={m.id} className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm space-y-2">
                            <div className="flex items-center justify-between">
                              <input
                                type="text"
                                value={m.title}
                                onChange={(e) => {
                                  const newMenu = [...fbChatbotSettings.persistentMenu];
                                  newMenu[idx].title = e.target.value;
                                  setFbChatbotSettings({...fbChatbotSettings, persistentMenu: newMenu});
                                }}
                                placeholder="Menu Title"
                                className="font-bold text-sm border-none bg-gray-50 rounded px-2 py-1 focus:ring-1 focus:ring-indigo-500"
                              />
                              <button onClick={() => removeMenuItem(m.id)} className="text-red-400 hover:text-red-600 p-1">
                                <TrashIcon />
                              </button>
                            </div>
                            <div className="flex items-center space-x-2">
                              <select
                                value={m.type}
                                onChange={(e) => {
                                  const newMenu = [...fbChatbotSettings.persistentMenu];
                                  newMenu[idx].type = e.target.value as any;
                                  setFbChatbotSettings({...fbChatbotSettings, persistentMenu: newMenu});
                                }}
                                className="text-xs border-none bg-gray-50 rounded px-2 py-1 focus:ring-1 focus:ring-indigo-500"
                              >
                                <option value="web_url">URL</option>
                                <option value="postback">Postback</option>
                              </select>
                              {m.type === 'web_url' ? (
                                <input
                                  type="text"
                                  value={m.url}
                                  onChange={(e) => {
                                    const newMenu = [...fbChatbotSettings.persistentMenu];
                                    newMenu[idx].url = e.target.value;
                                    setFbChatbotSettings({...fbChatbotSettings, persistentMenu: newMenu});
                                  }}
                                  placeholder="https://"
                                  className="flex-1 text-xs border-none bg-gray-50 rounded px-2 py-1 focus:ring-1 focus:ring-indigo-500"
                                />
                              ) : (
                                <input
                                  type="text"
                                  value={m.payload}
                                  onChange={(e) => {
                                    const newMenu = [...fbChatbotSettings.persistentMenu];
                                    newMenu[idx].payload = e.target.value;
                                    setFbChatbotSettings({...fbChatbotSettings, persistentMenu: newMenu});
                                  }}
                                  placeholder="PAYLOAD"
                                  className="flex-1 text-xs border-none bg-gray-50 rounded px-2 py-1 focus:ring-1 focus:ring-indigo-500 font-mono"
                                />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={handleSaveFbChatbot}
                      disabled={isSavingFbChatbot}
                      className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-md hover:bg-indigo-700 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                    >
                      {isSavingFbChatbot ? (
                        <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                      ) : (
                        <span>Save Chatbot Settings</span>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label htmlFor="fb-page-id" className="block text-sm font-medium text-gray-700">Facebook Page ID</label>
                <input
                  id="fb-page-id"
                  type="text"
                  value={facebookPageId}
                  onChange={(e) => setFacebookPageId(e.target.value)}
                  placeholder="Enter your Page ID"
                  className="mt-1 block w-full px-3 py-2 bg-white border border-gray-200 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label htmlFor="fb-token" className="block text-sm font-medium text-gray-700">Page Access Token</label>
                <input
                  id="fb-token"
                  type="password"
                  value={facebookToken}
                  onChange={(e) => setFacebookToken(e.target.value)}
                  placeholder="Enter your Page Access Token"
                  className="mt-1 block w-full px-3 py-2 bg-white border border-gray-200 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <button
                onClick={handleSaveFacebook}
                disabled={isSavingFacebook}
                className="w-full px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-75 transition-colors disabled:bg-indigo-400 disabled:cursor-wait flex items-center justify-center"
              >
                {isSavingFacebook && <div className="animate-spin h-5 w-5 mr-3 border-2 border-white border-t-transparent rounded-full"></div>}
                {isSavingFacebook ? 'Saving...' : 'Save & Connect'}
              </button>
              <p className="text-xs text-center text-gray-400 mt-2">
                Need help? <a href="https://support.shoplineapp.com/hc/th/articles/900001072666" target="_blank" rel="noopener noreferrer" className="text-indigo-500 hover:underline inline-flex items-center">View Setup Guide <ExternalLinkIcon /></a>
              </p>
            </div>
          )}
        </ConnectionCard>

      </div>
    </div>
  );
};

export default Connections;
