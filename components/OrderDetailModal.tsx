import React, { useState, useEffect, useCallback } from 'react';
import { Order, LogEntry } from '../types';
import { fetchOrderDetails, createShipmentForOrder } from '../api';
import { generateOrderSummarySpeech } from '../gemini';
import ClipboardListIcon from './icons/ClipboardListIcon';
import TruckIcon from './icons/TruckIcon';
import ChatBubbleIcon from './icons/ChatBubbleIcon';
import DocumentTextIcon from './icons/DocumentTextIcon';
import CameraIcon from './icons/CameraIcon';
import SparklesIcon from './icons/SparklesIcon';
import SpeakerIcon from './icons/SpeakerIcon';

interface OrderDetailModalProps {
  orderId: string;
  isOpen: boolean;
  onClose: () => void;
  onOrderUpdate: (updatedOrder: Order) => void;
}

const getStatusChipClass = (status: Order['status']) => {
  switch (status) {
    case 'Shipped': case 'Fulfilled': return 'bg-green-100 text-green-800';
    case 'Awaiting Payment': return 'bg-yellow-100 text-yellow-800';
    case 'Pending': return 'bg-blue-100 text-blue-800';
    case 'Cancelled': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getLogChipClass = (log: LogEntry) => {
    if (log.level === 'ERROR') return 'bg-red-100 text-red-800 border-red-200';
    if (log.level === 'SUCCESS') return 'bg-green-100 text-green-800 border-green-200';
    switch (log.service) {
        case 'Shopify': return 'bg-green-100 text-green-800 border-green-200';
        case 'SHIPPOP': return 'bg-blue-100 text-blue-800 border-blue-200';
        case 'LINE': return 'bg-teal-100 text-teal-800 border-teal-200';
        case 'Gemini': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
        default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
}

const TimelineIcon: React.FC<{ icon: 'clipboard' | 'truck' | 'chat' }> = ({ icon }) => {
    const baseClasses = "w-10 h-10 p-2 rounded-full flex items-center justify-center";
    switch (icon) {
        case 'clipboard': return <div className={`${baseClasses} bg-blue-100 text-blue-600`}><ClipboardListIcon /></div>;
        case 'truck': return <div className={`${baseClasses} bg-purple-100 text-purple-600`}><TruckIcon /></div>;
        case 'chat': return <div className={`${baseClasses} bg-teal-100 text-teal-600`}><ChatBubbleIcon /></div>;
    }
}

const OrderDetailModal: React.FC<OrderDetailModalProps> = ({ orderId, isOpen, onClose, onOrderUpdate }) => {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'timeline' | 'logs'>('timeline');
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  const loadOrderDetails = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchOrderDetails(orderId);
      setOrder(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch order details.');
    } finally {
      setLoading(false);
    }
  }, [orderId]);
  
  useEffect(() => {
    if (isOpen) {
      loadOrderDetails();
    }
  }, [isOpen, loadOrderDetails]);
  
  const handleCreateShipment = async () => {
    if (!order) return;
    setIsProcessing(true);
    try {
        const updatedOrder = await createShipmentForOrder(order.id);
        setOrder(updatedOrder);
        onOrderUpdate(updatedOrder);
    } catch (err: any) {
        // Here you would show a toast notification
        console.error(err.message);
        setError('Failed to process shipment. See console for details.');
    } finally {
        setIsProcessing(false);
    }
  };

  const handleSpeakSummary = async () => {
    if (!order || isSpeaking) return;
    setIsSpeaking(true);
    try {
      const base64Audio = await generateOrderSummarySpeech(order);
      const audio = new Audio(`data:audio/mp3;base64,${base64Audio}`);
      audio.onended = () => setIsSpeaking(false);
      await audio.play();
    } catch (err) {
      console.error("Failed to play order summary:", err);
      setIsSpeaking(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-details-title"
      >
        <div
          className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col"
          onClick={e => e.stopPropagation()}
        >
          <div className="p-6 border-b border-gray-200 flex justify-between items-center">
            {loading ? (
               <div className="h-7 bg-gray-200 rounded w-3/4 animate-pulse"></div>
            ) : order ? (
              <h2 id="order-details-title" className="text-2xl font-bold text-gray-800">
                Order {order.externalOrderId}
              </h2>
            ) : (
               <h2 id="order-details-title" className="text-2xl font-bold text-red-500">Error</h2>
            )}
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">&times;</button>
          </div>

          <div className="flex-1 overflow-y-auto">
             {loading && <div className="p-6">Loading...</div>}
             {error && <div className="p-6 text-red-500">{error}</div>}
             {order && (
                <div className="grid grid-cols-1 md:grid-cols-2">
                    {/* Left Column: Details & Actions */}
                    <div className="p-6 border-r border-gray-200 space-y-6">
                        <div>
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-semibold text-gray-700">Order Details</h3>
                            {order && (
                              <button
                                onClick={handleSpeakSummary}
                                disabled={isSpeaking}
                                className={`p-1.5 rounded-full transition-colors ${isSpeaking ? 'bg-indigo-100 text-indigo-600 animate-pulse' : 'bg-gray-100 text-gray-500 hover:bg-indigo-100 hover:text-indigo-600'}`}
                                title="Listen to Order Summary"
                              >
                                <SpeakerIcon />
                              </button>
                            )}
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            <p><strong>Customer:</strong> {order.customerName}</p>
                            <p><strong>Date:</strong> {order.date}</p>
                            <p><strong>Status:</strong> <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusChipClass(order.status)}`}>{order.status}</span></p>
                            <p><strong>Tracking:</strong> {order.trackingNumber || 'N/A'}</p>
                          </div>
                        </div>

                        {order.status === 'Pending' && (
                          <div>
                            <h3 className="font-semibold text-gray-700 mb-2">Actions</h3>
                            <button
                                onClick={handleCreateShipment}
                                disabled={isProcessing}
                                className="w-full px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-wait flex items-center justify-center transition-colors"
                            >
                                 {isProcessing && <div className="animate-spin h-5 w-5 mr-3 border-2 border-white border-t-transparent rounded-full"></div>}
                                 {isProcessing ? 'Processing...' : 'Create Shipment & Notify'}
                            </button>
                          </div>
                        )}
                    </div>
                    {/* Right Column: Timeline & Logs */}
                    <div className="p-6">
                        <div className="border-b border-gray-200">
                            <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                                <button onClick={() => setActiveTab('timeline')} className={`${activeTab === 'timeline' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}>
                                    <TruckIcon /> <span className="ml-2">Timeline</span>
                                </button>
                                <button onClick={() => setActiveTab('logs')} className={`${activeTab === 'logs' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}>
                                    <DocumentTextIcon /> <span className="ml-2">Detailed Logs</span>
                                </button>
                            </nav>
                        </div>

                        <div className="pt-6">
                            {activeTab === 'timeline' && (
                                <ol className="relative border-l border-gray-200">
                                  {order.events.map((event, index) => (
                                    <li key={index} className="mb-6 ml-6">
                                        <span className="absolute flex items-center justify-center w-6 h-6 -left-3">
                                            <TimelineIcon icon={event.icon} />
                                        </span>
                                        <div className="ml-5">
                                            <h4 className="flex items-center mb-1 text-md font-semibold text-gray-900">{event.status}</h4>
                                            <time className="block mb-2 text-sm font-normal leading-none text-gray-400">{event.timestamp}</time>
                                            <p className="text-sm text-gray-600 mb-2">{event.description}</p>
                                            {event.screenshotUrl && (
                                                <button onClick={() => setScreenshotUrl(event.screenshotUrl!)} className="text-sm text-indigo-600 hover:text-indigo-800 font-semibold flex items-center mb-2">
                                                    <CameraIcon />
                                                    <span className="ml-1">View Generated Label</span>
                                                </button>
                                            )}
                                            {event.generatedText && (
                                                <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                                    <div className="flex items-center text-sm font-semibold text-indigo-600 mb-2">
                                                      <SparklesIcon />
                                                      <span className="ml-1.5">Generated LINE Message</span>
                                                    </div>
                                                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{event.generatedText}</p>
                                                </div>
                                            )}
                                        </div>
                                    </li>
                                  ))}
                                  {order.events.length === 0 && <li className="ml-6 text-gray-500 text-sm">No timeline events for this order.</li>}
                                </ol>
                            )}
                            {activeTab === 'logs' && (
                                <div className="font-mono text-xs text-gray-700 space-y-2 max-h-96 overflow-y-auto">
                                    {order.logs.map((log, index) => (
                                        <div key={index} className="flex">
                                            <span className="text-gray-400 mr-2">{log.timestamp.split(' ')[1]}</span>
                                            <span className={`px-1.5 py-0.5 rounded-sm mr-2 text-xs font-semibold border ${getLogChipClass(log)}`}>{log.service}</span>
                                            <span>{log.message}</span>
                                        </div>
                                    ))}
                                    {order.logs.length === 0 && <div className="text-gray-500 text-sm">No detailed logs for this order.</div>}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
             )}
          </div>
          <div className="p-4 bg-gray-50 border-t border-gray-200 text-right">
            <button onClick={onClose} className="px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">Close</button>
          </div>
        </div>
      </div>
      
      {/* Screenshot viewer modal */}
      {screenshotUrl && (
          <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex justify-center items-center" onClick={() => setScreenshotUrl(null)}>
              <div className="p-4 bg-white rounded-lg shadow-2xl" onClick={e => e.stopPropagation()}>
                  <img src={screenshotUrl} alt="Generated Shipping Label" className="max-w-[80vw] max-h-[80vh]"/>
              </div>
          </div>
      )}
    </>
  );
};

export default OrderDetailModal;