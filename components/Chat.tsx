
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Conversation, ChatMessage, CustomerProfile, Order, Tag } from '../types';
import { fetchConversations, fetchConversationDetails, sendMessage, addTagToCustomer, removeTagFromCustomer, saveInternalNotes } from '../api';
import SendIcon from './icons/SendIcon';
import XCircleIcon from './icons/XCircleIcon';
import BoxIcon from './icons/BoxIcon';
import ShieldCheckIcon from './icons/ShieldCheckIcon';
import StarIcon from './icons/StarIcon';
import RefreshIcon from './icons/RefreshIcon';
import PlatformLineIcon from './icons/PlatformLineIcon';
import PlatformFacebookIcon from './icons/PlatformFacebookIcon';
import LightningBoltIcon from './icons/LightningBoltIcon';
import { useAppContext } from '../hooks/useAppContext';

const useDebounce = (value: string, delay: number) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);
    return debouncedValue;
};


const Chat: React.FC = () => {
    const { addToast, quickReplies } = useAppContext();

    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [customerProfile, setCustomerProfile] = useState<CustomerProfile | null>(null);
    const [customerOrders, setCustomerOrders] = useState<Order[]>([]);

    const [loadingConversations, setLoadingConversations] = useState(true);
    const [loadingDetails, setLoadingDetails] = useState(false);

    const [newMessage, setNewMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    
    const [isQuickReplyOpen, setIsQuickReplyOpen] = useState(false);
    const [quickReplySearch, setQuickReplySearch] = useState('');


    const [newTag, setNewTag] = useState('');
    
    // For internal notes
    const [internalNotes, setInternalNotes] = useState('');
    const [isSavingNotes, setIsSavingNotes] = useState(false);
    const [notesStatus, setNotesStatus] = useState<'saved' | 'unsaved' | 'saving'>('saved');
    const debouncedNotes = useDebounce(internalNotes, 1500);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const quickReplyRef = useRef<HTMLDivElement>(null);


    useEffect(() => {
        const loadConversations = async () => {
            try {
                const data = await fetchConversations();
                setConversations(data);
            } catch (error) {
                addToast('Failed to load conversations', 'error');
            } finally {
                setLoadingConversations(false);
            }
        };
        loadConversations();
    }, [addToast]);
    
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);
    
    // Effect for autosaving notes
    const saveNotes = useCallback(async (notesToSave: string) => {
        if (!customerProfile) return;
        setIsSavingNotes(true);
        setNotesStatus('saving');
        try {
            await saveInternalNotes(customerProfile.id, notesToSave);
            setNotesStatus('saved');
        } catch (error) {
            addToast('Failed to save notes', 'error');
            setNotesStatus('unsaved');
        } finally {
            setIsSavingNotes(false);
        }
    }, [customerProfile, addToast]);

    useEffect(() => {
        if (debouncedNotes !== customerProfile?.internalNotes && notesStatus === 'unsaved') {
            saveNotes(debouncedNotes);
        }
    }, [debouncedNotes, customerProfile, notesStatus, saveNotes]);
    
    // Effect to close quick reply popover on outside click
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (quickReplyRef.current && !quickReplyRef.current.contains(event.target as Node)) {
                setIsQuickReplyOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [quickReplyRef]);


    const handleSelectConversation = async (conversation: Conversation) => {
        if (selectedConversation?.id === conversation.id) return;

        setSelectedConversation(conversation);
        setLoadingDetails(true);
        try {
            const details = await fetchConversationDetails(conversation.id);
            setMessages(details.messages);
            setCustomerProfile(details.customerProfile);
            setCustomerOrders(details.customerOrders);
            setInternalNotes(details.customerProfile.internalNotes || '');
            setNotesStatus('saved');
            
            // Mark as read
            setConversations(prev => prev.map(c => c.id === conversation.id ? {...c, unreadCount: 0} : c));

        } catch (error) {
            addToast('Failed to load conversation details', 'error');
        } finally {
            setLoadingDetails(false);
        }
    };

    const handleSendMessage = async () => {
        if (!newMessage.trim() || !selectedConversation) return;

        setIsSending(true);
        try {
            const sentMessage = await sendMessage(selectedConversation.id, newMessage);
            setMessages(prev => [...prev, sentMessage]);
            setNewMessage('');
        } catch (error) {
            addToast('Failed to send message', 'error');
        } finally {
            setIsSending(false);
        }
    };

    const handleAddTag = async (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && newTag.trim() && customerProfile) {
            e.preventDefault();
            const tagName = newTag.trim();
            try {
                const addedTag = await addTagToCustomer(customerProfile.id, tagName);
                setCustomerProfile(prev => prev ? { ...prev, tags: [...prev.tags, addedTag] } : null);
                setNewTag('');
                addToast(`Tag "${tagName}" added`, 'success');
            } catch (error: any) {
                addToast(error.message || 'Failed to add tag', 'error');
            }
        }
    }
    
    const handleRemoveTag = async (tagId: string) => {
        if (!customerProfile) return;
        try {
            await removeTagFromCustomer(customerProfile.id, tagId);
            setCustomerProfile(prev => prev ? { ...prev, tags: prev.tags.filter(t => t.id !== tagId) } : null);
            addToast('Tag removed', 'success');
        } catch (error) {
            addToast('Failed to remove tag', 'error');
        }
    }
    
    const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInternalNotes(e.target.value);
        setNotesStatus('unsaved');
    }

    const getNotesStatusText = () => {
        switch (notesStatus) {
            case 'saving': return 'Saving...';
            case 'saved': return 'All changes saved';
            case 'unsaved': return 'Unsaved changes';
            default: return '';
        }
    }
    
    const filteredQuickReplies = quickReplies.filter(reply => 
        reply.name.toLowerCase().includes(quickReplySearch.toLowerCase()) ||
        reply.text.toLowerCase().includes(quickReplySearch.toLowerCase())
    );

    return (
        <div className="flex h-full bg-white">
            {/* Left Panel: Conversations */}
            <div className="w-1/4 border-r border-gray-200 flex flex-col">
                <div className="p-4 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-800">All Chats</h2>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {loadingConversations ? (
                        <div className="p-4 space-y-4">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="flex items-center space-x-3 animate-pulse">
                                    <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <ul>
                            {conversations.map(convo => (
                                <li key={convo.id}>
                                    <button onClick={() => handleSelectConversation(convo)} className={`w-full text-left p-4 flex items-center space-x-3 hover:bg-gray-100 ${selectedConversation?.id === convo.id ? 'bg-indigo-50' : ''}`}>
                                        <div className="relative flex-shrink-0">
                                            <img src={convo.customer.avatarUrl} alt={convo.customer.name} className="w-12 h-12 rounded-full"/>
                                            <span className="absolute -bottom-1 -right-1 bg-white p-0.5 rounded-full shadow">
                                                {convo.platform === 'LINE' ? <PlatformLineIcon /> : <PlatformFacebookIcon />}
                                            </span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-center">
                                                <p className="font-semibold text-gray-800 truncate">{convo.customer.name}</p>
                                                <p className="text-xs text-gray-400">{convo.lastMessage.timestamp}</p>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <p className="text-sm text-gray-500 truncate">{convo.lastMessage.text}</p>
                                                {convo.unreadCount > 0 && (
                                                    <span className="bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">{convo.unreadCount}</span>
                                                )}
                                            </div>
                                        </div>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>

            {/* Middle Panel: Chat Window */}
            <div className="w-1/2 flex flex-col border-r border-gray-200 bg-gray-50">
                {selectedConversation ? (
                    <>
                        <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white">
                            <div>
                                <h3 className="text-lg font-bold text-gray-800">{selectedConversation.customer.name}</h3>
                                <p className="text-sm text-gray-500">Online</p>
                            </div>
                            <button onClick={() => handleSelectConversation(selectedConversation)} className="p-2 text-gray-500 hover:text-indigo-600 rounded-full hover:bg-gray-100">
                                <RefreshIcon />
                            </button>
                        </div>

                        <div className="flex-1 p-6 overflow-y-auto">
                            {loadingDetails ? (
                                <div className="flex items-center justify-center h-full text-gray-500">
                                    <div className="animate-spin h-6 w-6 border-2 border-indigo-500 border-t-transparent rounded-full mr-3"></div>
                                    Loading chat...
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {messages.map((msg, index) => (
                                        <div key={msg.id || index} className={`flex items-end gap-3 ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}>
                                            {msg.sender === 'customer' && <img src={selectedConversation.customer.avatarUrl} alt={selectedConversation.customer.name} className="w-8 h-8 rounded-full"/>}
                                            <div className={`px-4 py-2 rounded-lg max-w-lg shadow-sm ${msg.sender === 'admin' ? 'bg-indigo-500 text-white rounded-br-none' : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'}`}>
                                                <p className="text-sm">{msg.text}</p>
                                            </div>
                                        </div>
                                    ))}
                                    <div ref={messagesEndRef} />
                                </div>
                            )}
                        </div>

                        <div className="p-4 bg-white border-t border-gray-200">
                             <div className="relative">
                                <textarea
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSendMessage();
                                        }
                                    }}
                                    placeholder="Type your message... (Shift + Enter for new line)"
                                    className="w-full p-3 pr-24 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
                                    rows={1}
                                />
                                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center">
                                    <div ref={quickReplyRef} className="relative">
                                        <button onClick={() => setIsQuickReplyOpen(p => !p)} className="p-2 text-gray-500 hover:text-indigo-600" aria-label="Open quick replies">
                                            <LightningBoltIcon />
                                        </button>
                                        {isQuickReplyOpen && (
                                            <div className="absolute bottom-full right-0 mb-2 w-80 bg-white border rounded-lg shadow-xl z-10 p-2 flex flex-col">
                                                <input
                                                    type="text"
                                                    placeholder="Search replies..."
                                                    value={quickReplySearch}
                                                    onChange={e => setQuickReplySearch(e.target.value)}
                                                    className="p-2 border-b mb-2 focus:outline-none"
                                                />
                                                <div className="max-h-48 overflow-y-auto">
                                                {filteredQuickReplies.length > 0 ? filteredQuickReplies.map(reply => (
                                                    <button 
                                                        key={reply.id}
                                                        onClick={() => {
                                                            setNewMessage(reply.text);
                                                            setIsQuickReplyOpen(false);
                                                        }}
                                                        className="w-full text-left p-2 hover:bg-gray-100 rounded"
                                                    >
                                                        <p className="font-semibold text-sm">{reply.name}</p>
                                                        <p className="text-xs text-gray-500 truncate">"{reply.text}"</p>
                                                    </button>
                                                )) : <p className="text-xs text-gray-500 p-2 text-center">No matching replies.</p>}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <button onClick={handleSendMessage} disabled={isSending || !newMessage.trim()} className="p-2 text-indigo-500 hover:text-indigo-700 disabled:text-gray-400 disabled:cursor-not-allowed" aria-label="Send message">
                                        <SendIcon />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                        <p>Select a conversation to start chatting</p>
                    </div>
                )}
            </div>

            {/* Right Panel: Customer Details */}
            <div className="w-1/4 p-6 overflow-y-auto bg-white border-l border-gray-200">
                 {selectedConversation && customerProfile ? (
                     <div className="space-y-6">
                        <div>
                             <img src={customerProfile.avatarUrl} alt={customerProfile.name} className="w-24 h-24 rounded-full mx-auto border-4 border-white shadow-md"/>
                            <h3 className="text-center text-xl font-bold mt-2 text-gray-800">{customerProfile.name}</h3>
                            <div className="text-center text-sm text-gray-500 flex items-center justify-center space-x-2 mt-1">
                                <span>{customerProfile.tier} Tier</span>
                                <span className="text-gray-300">&bull;</span>
                                <span className="flex items-center"><StarIcon /> <span className="ml-1">{customerProfile.points} pts</span></span>
                            </div>
                        </div>

                        <div>
                            <h4 className="font-semibold text-gray-700 mb-2">Tags</h4>
                             <div className="flex flex-wrap gap-2 items-center">
                                {customerProfile.tags.map(tag => (
                                    <div key={tag.id} className="bg-gray-200 text-gray-700 text-xs font-medium px-2.5 py-1 rounded-full flex items-center">
                                        {tag.name}
                                        <button onClick={() => handleRemoveTag(tag.id)} className="ml-1.5 -mr-1 text-gray-400 hover:text-gray-600" aria-label={`Remove tag ${tag.name}`}>
                                            <XCircleIcon className="w-4 h-4"/>
                                        </button>
                                    </div>
                                ))}
                                <input 
                                    type="text"
                                    value={newTag}
                                    onChange={e => setNewTag(e.target.value)}
                                    onKeyDown={handleAddTag}
                                    placeholder="+ Add tag"
                                    className="bg-transparent text-sm p-1 focus:outline-none w-20"
                                />
                            </div>
                        </div>

                        <div>
                             <h4 className="font-semibold text-gray-700 mb-2 flex justify-between items-center">
                                <span>Internal Notes</span>
                                <span className={`text-xs ${notesStatus === 'saved' ? 'text-gray-400' : 'text-yellow-600'}`}>{getNotesStatusText()}</span>
                             </h4>
                            <textarea 
                                value={internalNotes}
                                onChange={handleNotesChange}
                                rows={4}
                                className="w-full text-sm p-2 border border-gray-200 rounded-md bg-gray-50 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                placeholder="Add private notes about this customer..."
                            />
                        </div>
                        
                        <div>
                            <h4 className="font-semibold text-gray-700 mb-2">Order History ({customerOrders.length})</h4>
                            <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                                {customerOrders.length > 0 ? customerOrders.map(order => (
                                    <div key={order.id} className="bg-gray-50 p-2 rounded-md border border-gray-200 text-sm">
                                        <p className="font-semibold text-gray-800">{order.externalOrderId}</p>
                                        <div className="flex justify-between text-xs text-gray-500">
                                            <span>{order.date}</span>
                                            <span>{order.status}</span>
                                        </div>
                                    </div>
                                )) : <p className="text-sm text-gray-400">No orders found.</p>}
                            </div>
                        </div>
                     </div>
                ) : (
                    <div className="text-center text-gray-400 pt-20">
                        <p>Customer details will appear here.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Chat;
