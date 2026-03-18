

import { ConnectionStatus, Order, Notification, OrderEvent, LogEntry, CustomerProfile, Tag, ChatMessage, Conversation, BroadcastCampaign, AutomationSetting, AutomationType, CardMessageTemplate, RichMenuTemplate, RichMenuLayout, QuickReply, DashboardMetrics, DailyReportRow, LiffApp, StoreDisplaySettings, Survey, Booking, InterestInsight, FacebookChatbotSettings, FacebookWelcomeTemplate, FacebookLiveScript } from './types';
import { generateShippingLabelImage, generateLineNotificationText, generateAbandonedCartTemplate } from './gemini';
import { auth, db } from './firebaseConfig';
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut,
} from 'firebase/auth';
import { 
    getFirestore,
    collection, 
    doc, 
    getDocs, 
    getDoc,
    setDoc, 
    addDoc,
    deleteDoc,
    updateDoc,
    writeBatch,
    query,
    where,
    documentId,
    limit,
    DocumentReference
} from 'firebase/firestore';

// --- MOCK DATA FOR SEEDING ---
// This data is used once by the `seedDatabase` function to populate a new Firebase project.

const mockTagsData: { id: string, data: Omit<Tag, 'id'> }[] = [
    { id: 't1', data: { name: 'VIP' } }, { id: 't2', data: { name: 'New Customer' } }, { id: 't3', data: { name: 'High Spender' } }, { id: 't4', data: { name: 'Has Subscription' } },
];
const mockCustomersData: { id: string, data: Omit<CustomerProfile, 'id'|'tags'> & {tagIds: string[]} }[] = [
    { id: 'c1', data: { name: 'John Doe', avatarUrl: 'https://i.pravatar.cc/150?u=john-doe', platform: 'LINE', platformUserId: 'Ua1b2c3d4e5f6g7h8', tagIds: ['t1','t3','t4'], tier: 'Gold', points: 1250, subscriptionStatus: 'Active', internalNotes: 'Prefers express shipping. Contacted support about size issues on order #1050.' } },
    { id: 'c2', data: { name: 'Jane Smith', avatarUrl: 'https://i.pravatar.cc/150?u=jane-smith', platform: 'LINE', platformUserId: 'Ub2c3d4e5f6g7h8i9', tagIds: ['t2','t4'], tier: 'Silver', points: 550, subscriptionStatus: 'Active', internalNotes: '' } },
    { id: 'c3', data: { name: 'Peter Jones', avatarUrl: 'https://i.pravatar.cc/150?u=peter-jones', platform: 'LINE', platformUserId: 'Uc3d4e5f6g7h8i9j0', tagIds: [], tier: 'Bronze', points: 120, subscriptionStatus: 'Inactive', internalNotes: '' } },
    { id: 'c4', data: { name: 'Mary Williams', avatarUrl: 'https://i.pravatar.cc/150?u=mary-williams', platform: 'LINE', platformUserId: 'Ud4e5f6g7h8i9j0k1', tagIds: ['t2'], tier: 'Standard', points: 45, subscriptionStatus: 'Cancelled', internalNotes: '' } },
    { id: 'c5', data: { name: 'David Lee', avatarUrl: 'https://i.pravatar.cc/150?u=david-lee', platform: 'Facebook', platformUserId: '100001234567890', tagIds: ['t3'], tier: 'Silver', points: 800, subscriptionStatus: 'Active', internalNotes: 'Interested in bulk orders.' } },
    { id: 'c6', data: { name: 'Sarah Chen', avatarUrl: 'https://i.pravatar.cc/150?u=sarah-chen', platform: 'Facebook', platformUserId: '100009876543210', tagIds: [], tier: 'Standard', points: 15, subscriptionStatus: 'Inactive', internalNotes: '' } },
];
const mockOrdersData: Omit<Order, 'id'>[] = [
    { externalOrderId: '#SCH-1051', customerId: 'c1', customerName: 'John Doe', date: '2024-07-28', status: 'Shipped', trackingNumber: 'SPP123456789TH', notificationStatus: 'Sent', events: [ { timestamp: '2024-07-28 10:00:00', status: 'Order Received', description: 'From Shopify Webhook', icon: 'clipboard' }, { timestamp: '2024-07-28 14:30:00', status: 'Shipment Created', description: 'Tracking #: SPP123456789TH', icon: 'truck' }, { timestamp: '2024-07-28 14:31:00', status: 'Notification Sent', description: 'Shipping update sent via LINE', icon: 'chat' } ], logs: [ { timestamp: '2024-07-28 10:00:01', service: 'Shopify', level: 'INFO', message: 'Webhook received for order #SCH-1051' } ] },
    { externalOrderId: '#SCH-1050', customerId: 'c1', customerName: 'John Doe', date: '2024-07-25', status: 'Fulfilled', trackingNumber: 'SPP098765432TH', notificationStatus: 'Sent', events: [], logs: [] },
    { externalOrderId: '#SCH-1049', customerId: 'c2', customerName: 'Jane Smith', date: '2024-07-28', status: 'Pending', trackingNumber: null, notificationStatus: 'Pending', events: [ { timestamp: '2024-07-28 11:30:00', status: 'Order Received', description: 'From Shopify Webhook', icon: 'clipboard' } ], logs: [ { timestamp: '2024-07-28 11:30:01', service: 'Shopify', level: 'INFO', message: 'Webhook received for order #SCH-1049' } ] },
    { externalOrderId: '#SCH-1048', customerId: 'c5', customerName: 'David Lee', date: '2024-07-27', status: 'Awaiting Payment', trackingNumber: null, notificationStatus: 'Pending', events: [], logs: [] },
];
const mockNotificationsData: Omit<Notification, 'id'>[] = [
    { orderId: '#SCH-1051', recipient: 'Ua1b2c3d4e5f6g7h8', type: 'Shipping Update', status: 'Sent', timestamp: '2024-07-28 14:31:00' },
];
const mockConversationsData: {id: string, data: Omit<Conversation, 'id'|'customer'> & {customerId: string}}[] = [
    { id: 'conv1', data: { customerId: 'c1', platform: 'LINE', lastMessage: {id: 'm1', text: 'Thank you!', timestamp: '1 day ago', sender: 'customer' }, unreadCount: 1 } },
    { id: 'conv2', data: { customerId: 'c5', platform: 'Facebook', lastMessage: {id: 'm2', text: 'Okay, I will check the new products.', timestamp: '3 days ago', sender: 'customer' }, unreadCount: 0 } },
];
const mockMessagesData: {[convId: string]: Omit<ChatMessage, 'id'>[]} = {
    'conv1': [{ text: 'Your order #SCH-1051 has shipped!', timestamp: '1 day ago', sender: 'admin'}, { text: 'Thank you!', timestamp: '1 day ago', sender: 'customer' }],
    'conv2': [{ text: 'Hi David, our new collection is now available.', timestamp: '3 days ago', sender: 'admin'}, { text: 'Okay, I will check the new products.', timestamp: '3 days ago', sender: 'customer' }],
};
const mockQuickRepliesData: Omit<QuickReply, 'id'>[] = [
    { name: 'Greeting', text: 'Hello! How can I help you today?' }, { name: 'Thank You', text: 'Thank you for your purchase!' },
];
const mockCardTemplatesData: Omit<CardMessageTemplate, 'id'|'timestamp'>[] = [
    { name: 'Welcome Offer', imageUrl: 'https://placehold.co/600x400/e0e7ff/4338ca?text=Welcome!', title: 'Special Welcome Gift!', text: 'Thank you for joining. Here is a special coupon for your first purchase.', actions: [{id: 'a1', label: 'Get Coupon', url: '#'}, {id: 'a2', label: 'Shop Now', url: '#'}] }
];
const mockRichMenusData: Omit<RichMenuTemplate, 'id'|'timestamp'>[] = [
    { name: 'Main Summer Menu', chatBarText: 'Menu', imageUrl: 'https://placehold.co/2500x1686/fefce8/f59e0b?text=Summer+Sale', layout: '6-grid', actions: [], tabCount: 3 }
];
const mockLiffAppsData: Omit<LiffApp, 'id'>[] = [ { name: 'Membership Page', url: '/liff/membership' }];
const mockBroadcastHistoryData: (Omit<BroadcastCampaign, 'id'|'tags'> & {tagIds: string[]})[] = [
    { message: 'Announcing our new summer collection!', tagIds: ['t2','t3'], recipientCount: 350, timestamp: '2 days ago', status: 'Sent'}
];


// --- AUTHENTICATION ---
const getUid = () => {
    const user = auth.currentUser;
    if (!user) return "default-user-id"; // Bypass auth for now
    return user.uid;
};
export const signup = (email: string, password: string) => createUserWithEmailAndPassword(auth, email, password);
export const login = (email: string, password: string) => signInWithEmailAndPassword(auth, email, password);
export const logout = () => signOut(auth);

// --- DATABASE SEEDER ---
export const seedDatabase = async () => {
    const uid = getUid();
    const batch = writeBatch(db);

    // Seed Tags
    mockTagsData.forEach(t => batch.set(doc(db, `users/${uid}/tags`, t.id), t.data));
    
    // Seed Customers
    mockCustomersData.forEach(c => {
        const { tagIds, ...customerData } = c.data;
        const tagRefs = tagIds.map(tid => doc(db, `users/${uid}/tags`, tid));
        batch.set(doc(db, `users/${uid}/customers`, c.id), { ...customerData, tags: tagRefs });
    });
    
    // Seed Orders
    mockOrdersData.forEach(o => batch.set(doc(collection(db, `users/${uid}/orders`)), o));
    
    // Seed Notifications
    mockNotificationsData.forEach(n => batch.set(doc(collection(db, `users/${uid}/notifications`)), n));
    
    // Seed Conversations & Messages
    mockConversationsData.forEach(c => {
        const customerRef = doc(db, `users/${uid}/customers`, c.data.customerId);
        batch.set(doc(db, `users/${uid}/conversations`, c.id), { ...c.data, customer: customerRef });
        mockMessagesData[c.id]?.forEach(m => batch.set(doc(collection(db, `users/${uid}/conversations/${c.id}/messages`)), m));
    });

    // Seed Quick Replies
    mockQuickRepliesData.forEach(qr => batch.set(doc(collection(db, `users/${uid}/quickReplies`)), qr));
    
    // Seed Templates
    mockCardTemplatesData.forEach(t => batch.set(doc(collection(db, `users/${uid}/cardTemplates`)), { ...t, timestamp: new Date().toLocaleString() }));
    mockRichMenusData.forEach(m => batch.set(doc(collection(db, `users/${uid}/richMenus`)), { ...m, timestamp: new Date().toLocaleString() }));
    
    // Seed LIFF Apps
    mockLiffAppsData.forEach(l => batch.set(doc(collection(db, `users/${uid}/liffApps`)), l));

    // Seed Broadcast History
    mockBroadcastHistoryData.forEach(b => {
        const { tagIds, ...broadcastData } = b;
        const tagRefs = tagIds.map(tid => doc(db, `users/${uid}/tags`, tid));
        batch.set(doc(collection(db, `users/${uid}/broadcastHistory`)), { ...broadcastData, tags: tagRefs });
    });

    // Seed Settings (optional, can use defaults)
    batch.set(doc(db, `users/${uid}/settings`, 'display'), { myPage: true, thankYou: true, banner: false });
    
    await batch.commit();
}


// --- HELPER FUNCTIONS ---

/**
 * Resolves an array of Firestore DocumentReferences to full Tag objects.
 * @param tagRefs An array of DocumentReferences pointing to Tag documents.
 * @returns A promise that resolves to an array of full Tag objects.
 */
const resolveTagReferences = async (tagRefs: DocumentReference[]): Promise<Tag[]> => {
    if (!tagRefs || tagRefs.length === 0) return [];
    
    try {
        const tagPromises = tagRefs.map(ref => getDoc(ref));
        const tagSnaps = await Promise.all(tagPromises);
        
        return tagSnaps
            .filter(snap => snap.exists())
            .map(snap => ({ id: snap.id, ...snap.data() } as Tag));
    } catch (error) {
        console.error("Error resolving tag references:", error);
        return [];
    }
}


// --- API FUNCTIONS ---

// -- Connections --
export const fetchConnectionStatuses = async (): Promise<{shopify:ConnectionStatus, shippop:ConnectionStatus, line:ConnectionStatus, facebook:ConnectionStatus}> => {
    const uid = getUid();
    const docRef = doc(db, `users/${uid}/settings`, 'connections');
    const docSnap = await getDoc(docRef);
    if(docSnap.exists()){
        const data = docSnap.data();
        return {
            shopify: data.shopifyKey ? ConnectionStatus.Connected : ConnectionStatus.Disconnected,
            shippop: data.shippopKey ? ConnectionStatus.Connected : ConnectionStatus.Disconnected,
            line: data.lineToken ? ConnectionStatus.Connected : ConnectionStatus.Disconnected,
            facebook: data.facebookToken ? ConnectionStatus.Connected : ConnectionStatus.Disconnected,
        }
    }
    return { shopify: ConnectionStatus.Disconnected, shippop: ConnectionStatus.Disconnected, line: ConnectionStatus.Disconnected, facebook: ConnectionStatus.Disconnected };
};
export const saveShippopKey = (apiKey: string) => setDoc(doc(db, `users/${getUid()}/settings`, 'connections'), { shippopKey: apiKey }, { merge: true });
export const saveLineCredentials = (token: string, secret: string) => setDoc(doc(db, `users/${getUid()}/settings`, 'connections'), { lineToken: token, lineSecret: secret }, { merge: true });
export const saveFacebookCredentials = (pageId: string, token: string) => setDoc(doc(db, `users/${getUid()}/settings`, 'connections'), { facebookPageId: pageId, facebookToken: token }, { merge: true });

// -- Orders --
export const fetchOrders = async (): Promise<Order[]> => {
    const q = query(collection(db, `users/${getUid()}/orders`));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
};

export const fetchOrderDetails = async (orderId: string): Promise<Order> => {
    const docRef = doc(db, `users/${getUid()}/orders`, orderId);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) throw new Error("Order not found");
    return { id: docSnap.id, ...docSnap.data() } as Order;
};

export const createShipmentForOrder = async (orderId: string): Promise<Order> => {
    const orderRef = doc(db, `users/${getUid()}/orders`, orderId);
    const orderSnap = await getDoc(orderRef);
    if (!orderSnap.exists()) throw new Error("Order not found");

    let orderData = { id: orderSnap.id, ...orderSnap.data() } as Order;
    
    const trackingNumber = `SPP${Date.now()}`;
    let updatedOrderData = { ...orderData, trackingNumber, status: 'Shipped' as const };

    const [imageUrl, messageText] = await Promise.all([
        generateShippingLabelImage(updatedOrderData),
        generateLineNotificationText(updatedOrderData),
    ]);

    const timestamp = new Date().toLocaleString('en-US');
    const newEvent: OrderEvent = { timestamp, status: 'Shipment Created', description: `Tracking #: ${trackingNumber}`, icon: 'truck', screenshotUrl: imageUrl };
    const newNotificationEvent: OrderEvent = { timestamp, status: 'Notification Sent', description: 'Sent shipping update to customer via LINE.', icon: 'chat', generatedText: messageText };

    const finalOrderState: Order = {
        ...updatedOrderData,
        events: [...orderData.events, newEvent, newNotificationEvent],
        logs: [...orderData.logs, { service: 'System', level: 'SUCCESS', message: `Shipment created for order ${orderData.externalOrderId}`, timestamp }],
        notificationStatus: 'Sent'
    };
    
    await updateDoc(orderRef, {
        status: finalOrderState.status,
        trackingNumber: finalOrderState.trackingNumber,
        events: finalOrderState.events,
        logs: finalOrderState.logs,
        notificationStatus: finalOrderState.notificationStatus,
    });
    
    return finalOrderState;
};

export const sendOrderNotification = async (orderId: string): Promise<Order> => {
    const orderRef = doc(db, `users/${getUid()}/orders`, orderId);
    const orderSnap = await getDoc(orderRef);
    if (!orderSnap.exists()) throw new Error("Order not found");

    let orderData = { id: orderSnap.id, ...orderSnap.data() } as Order;
    
    const messageText = await generateLineNotificationText(orderData);

    const timestamp = new Date().toLocaleString('en-US');
    const newNotificationEvent: OrderEvent = { 
        timestamp, 
        status: 'Notification Sent', 
        description: 'Manual notification sent to customer via LINE.', 
        icon: 'chat', 
        generatedText: messageText 
    };

    const finalOrderState: Order = {
        ...orderData,
        events: [...orderData.events, newNotificationEvent],
        logs: [...orderData.logs, { service: 'LINE', level: 'INFO', message: `Manual notification sent for order ${orderData.externalOrderId}`, timestamp }],
        notificationStatus: 'Sent'
    };
    
    await updateDoc(orderRef, {
        events: finalOrderState.events,
        logs: finalOrderState.logs,
        notificationStatus: finalOrderState.notificationStatus,
    });
    
    return finalOrderState;
};

// -- Notifications --
export const fetchNotifications = async (): Promise<Notification[]> => {
    const q = query(collection(db, `users/${getUid()}/notifications`));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification));
};

// -- Analytics --
export const fetchDashboardMetrics = async (): Promise<DashboardMetrics> => ({
  linkedUsers: { total: 1420, change: 15 },
  automationSales: { total: 5830.50, currency: 'THB' },
  messagesSent: 890,
  conversionRate: 18.7,
});

export const fetchDailyReportData = async (): Promise<DailyReportRow[]> => ([
    { id: '1', automationType: 'Abandoned Cart', deliveries: 250, conversions: 50, errorRate: 0.8, sales: 25000, currency: 'THB' },
    { id: '2', automationType: 'Abandoned Checkout', deliveries: 180, conversions: 45, errorRate: 0.5, sales: 28500, currency: 'THB' },
    { id: '3', automationType: 'Restock Alerts', deliveries: 80, conversions: 20, errorRate: 1.2, sales: 15000, currency: 'THB' },
    { id: '4', automationType: 'Browse Abandonment', deliveries: 400, conversions: 12, errorRate: 0.2, sales: 8000, currency: 'THB' },
]);

// -- CRM / Chat --
export const fetchConversations = async (): Promise<Conversation[]> => {
    const q = query(collection(db, `users/${getUid()}/conversations`));
    const snapshot = await getDocs(q);
    
    const convos = await Promise.all(snapshot.docs.map(async (docSnap) => {
        const data = docSnap.data();
        const customerSnap = await getDoc(data.customer);
        
        let customerData = customerSnap.data() as any;
        if (customerData) {
            const resolvedTags = await resolveTagReferences(customerData.tags || []);
            customerData.tags = resolvedTags;
        }
        
        const customer = { id: customerSnap.id, ...customerData } as CustomerProfile;
        return { id: docSnap.id, ...data, customer } as Conversation;
    }));
    return convos;
};

export const fetchConversationDetails = async (conversationId: string): Promise<{ messages: ChatMessage[], customerProfile: CustomerProfile, customerOrders: Order[] }> => {
    const uid = getUid();
    const convoRef = doc(db, `users/${uid}/conversations`, conversationId);
    const convoSnap = await getDoc(convoRef);
    if (!convoSnap.exists()) throw new Error("Conversation not found");
    
    const convoData = convoSnap.data();
    
    const messagesQuery = query(collection(db, `users/${uid}/conversations/${conversationId}/messages`));
    const messagesSnap = await getDocs(messagesQuery);
    const messages = messagesSnap.docs.map(d => ({id: d.id, ...d.data()}) as ChatMessage);

    const customerSnap = await getDoc(convoData.customer);
    const customerProfile = await fetchCustomerProfile(customerSnap.id);

    const ordersQuery = query(collection(db, `users/${uid}/orders`), where('customerId', '==', customerProfile.id));
    const ordersSnap = await getDocs(ordersQuery);
    const customerOrders = ordersSnap.docs.map(d => ({id: d.id, ...d.data()}) as Order);

    return { messages, customerProfile, customerOrders };
};

export const sendMessage = async (conversationId: string, text: string): Promise<ChatMessage> => {
    const uid = getUid();
    const newMessage = { text, sender: 'admin' as const, timestamp: new Date().toLocaleTimeString() };
    const docRef = await addDoc(collection(db, `users/${uid}/conversations/${conversationId}/messages`), newMessage);
    await updateDoc(doc(db, `users/${uid}/conversations`, conversationId), { lastMessage: { ...newMessage, id: docRef.id } });
    return { id: docRef.id, ...newMessage };
};

export const fetchAllTags = async (): Promise<Tag[]> => {
    const q = query(collection(db, `users/${getUid()}/tags`));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Tag));
};

export const addTagToCustomer = async (customerId: string, tagName: string): Promise<Tag> => {
    const uid = getUid();
    // First check if tag already exists
    const q = query(collection(db, `users/${uid}/tags`), where("name", "==", tagName), limit(1));
    const querySnapshot = await getDocs(q);
    
    let tagRef: DocumentReference;
    if (querySnapshot.empty) {
        tagRef = await addDoc(collection(db, `users/${uid}/tags`), { name: tagName });
    } else {
        tagRef = querySnapshot.docs[0].ref;
    }

    const customerRef = doc(db, `users/${uid}/customers`, customerId);
    const customerSnap = await getDoc(customerRef);
    const existingTags: DocumentReference[] = customerSnap.data()?.tags || [];
    
    // Prevent adding duplicate tags
    if (existingTags.some(ref => ref.path === tagRef.path)) {
        return { id: tagRef.id, name: tagName };
    }
    
    await updateDoc(customerRef, { tags: [...existingTags, tagRef] });
    return { id: tagRef.id, name: tagName };
};

export const removeTagFromCustomer = async (customerId: string, tagId: string): Promise<void> => {
    const uid = getUid();
    const customerRef = doc(db, `users/${uid}/customers`, customerId);
    const customerSnap = await getDoc(customerRef);
    const existingTags: DocumentReference[] = customerSnap.data()?.tags || [];
    const updatedTags = existingTags.filter((t_ref) => t_ref.id !== tagId);
    await updateDoc(customerRef, { tags: updatedTags });
};

export const saveInternalNotes = async (customerId: string, notes: string): Promise<void> => {
    await updateDoc(doc(db, `users/${getUid()}/customers`, customerId), { internalNotes: notes });
};

// -- Broadcasts --
export const sendBroadcast = async (message: string, tagIds: string[]): Promise<BroadcastCampaign> => {
    const uid = getUid();
    const tagRefs = tagIds.map(id => doc(db, `users/${uid}/tags`, id));
    
    // Fetch full tag objects for the return value
    const resolvedTags = await resolveTagReferences(tagRefs);
    
    const recipientCount = await getRecipientCountForTags(tagIds);
    
    const newCampaignData = { 
        message, 
        tags: tagRefs, // Store references in Firestore
        recipientCount, 
        status: 'Sent' as const, 
        timestamp: new Date().toLocaleString() 
    };
    
    const docRef = await addDoc(collection(db, `users/${uid}/broadcastHistory`), newCampaignData);
    
    // Return the campaign with resolved tags for the UI
    return { id: docRef.id, ...newCampaignData, tags: resolvedTags };
};

export const fetchBroadcastHistory = async (): Promise<BroadcastCampaign[]> => {
    const q = query(collection(db, `users/${getUid()}/broadcastHistory`));
    const snapshot = await getDocs(q);
    
    return await Promise.all(snapshot.docs.map(async (docSnap) => {
        const data = docSnap.data();
        const resolvedTags = await resolveTagReferences(data.tags || []);
        return { id: docSnap.id, ...data, tags: resolvedTags } as BroadcastCampaign;
    }));
};

export const getRecipientCountForTags = async (tagIds: string[]): Promise<number> => {
    if(tagIds.length === 0) return 0;
    const uid = getUid();
    const tagRefs = tagIds.map(id => doc(db, `users/${uid}/tags`, id));
    const q = query(collection(db, `users/${uid}/customers`), where('tags', 'array-contains-any', tagRefs));
    const snapshot = await getDocs(q);
    return snapshot.size;
}

// -- Automations & Templates --
export const fetchAutomationSettings = async (automationId: AutomationType): Promise<AutomationSetting> => {
    const docRef = doc(db, `users/${getUid()}/automationSettings`, automationId);
    const docSnap = await getDoc(docRef);
    if(docSnap.exists()){
        return {id: docSnap.id as AutomationType, ...docSnap.data()} as AutomationSetting;
    }
    return { id: automationId, isEnabled: false, delayValue: 1, delayUnit: 'hours', messageTemplate: '', includeRecommendations: false };
};

export const saveAutomationSettings = (settings: AutomationSetting) => setDoc(doc(db, `users/${getUid()}/automationSettings`, settings.id), settings);

export const fetchMessageTemplates = async (): Promise<CardMessageTemplate[]> => {
    const q = query(collection(db, `users/${getUid()}/cardTemplates`));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CardMessageTemplate));
};

export const saveMessageTemplate = async (template: Omit<CardMessageTemplate, 'id'|'timestamp'>): Promise<CardMessageTemplate> => {
    const uid = getUid();
    const newTemplate = { ...template, timestamp: new Date().toLocaleString() };
    const docRef = await addDoc(collection(db, `users/${uid}/cardTemplates`), newTemplate);
    return { id: docRef.id, ...newTemplate };
};

export const fetchRichMenus = async (): Promise<RichMenuTemplate[]> => {
    const q = query(collection(db, `users/${getUid()}/richMenus`));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as RichMenuTemplate));
};

export const saveRichMenu = async (menu: Omit<RichMenuTemplate, 'id'|'timestamp'>): Promise<RichMenuTemplate> => {
    const uid = getUid();
    const newMenu = { ...menu, timestamp: new Date().toLocaleString() };
    const docRef = await addDoc(collection(db, `users/${getUid()}/richMenus`), newMenu);
    return { id: docRef.id, ...newMenu };
};

export const fetchLiffApps = async (): Promise<LiffApp[]> => {
    const q = query(collection(db, `users/${getUid()}/liffApps`));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LiffApp));
};


// -- Quick Replies --
export const fetchQuickReplies = async (): Promise<QuickReply[]> => {
    const q = query(collection(db, `users/${getUid()}/quickReplies`));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as QuickReply));
};

export const saveQuickReply = async (name: string, text: string): Promise<QuickReply> => {
    const docRef = await addDoc(collection(db, `users/${getUid()}/quickReplies`), { name, text });
    return { id: docRef.id, name, text };
};

export const deleteQuickReply = (replyId: string) => deleteDoc(doc(db, `users/${getUid()}/quickReplies`, replyId));

// -- Settings --
export const fetchStoreDisplaySettings = async (): Promise<StoreDisplaySettings> => {
    const docRef = doc(db, `users/${getUid()}/settings`, 'display');
    const docSnap = await getDoc(docRef);
    if(docSnap.exists()){
        return docSnap.data() as StoreDisplaySettings;
    }
    return { myPage: true, thankYou: true, banner: false };
};

export const saveStoreDisplaySettings = (settings: StoreDisplaySettings) => setDoc(doc(db, `users/${getUid()}/settings`, 'display'), settings, { merge: true });

export const fetchCustomerProfile = async (customerId: string): Promise<CustomerProfile> => {
    const docRef = doc(db, `users/${getUid()}/customers`, customerId);
    let docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        const data = docSnap.data();
        // Resolve tag references
        const resolvedTags = await resolveTagReferences(data.tags || []);
        return { id: docSnap.id, ...data, tags: resolvedTags } as CustomerProfile;
    }
    throw new Error("Customer not found");
};

// -- SURVEYS --
export const fetchSurveys = async (): Promise<Survey[]> => {
    const q = query(collection(db, `users/${getUid()}/surveys`));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
        // Return some mock data if empty
        return [
            {
                id: '1',
                title: 'Customer Satisfaction 2024',
                description: 'General feedback survey for our services.',
                questions: [
                    { id: 'q1', question: 'How satisfied are you with our service?', type: 'rating' },
                    { id: 'q2', question: 'What can we improve?', type: 'text' }
                ],
                responseCount: 124,
                timestamp: new Date().toLocaleString()
            }
        ];
    }
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Survey));
};

// -- BOOKINGS --
export const fetchBookings = async (): Promise<Booking[]> => {
    const q = query(collection(db, `users/${getUid()}/bookings`));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
        return [
            {
                id: 'b1',
                customerName: 'Somchai Jaidee',
                customerId: 'c1',
                serviceName: 'Haircut & Styling',
                date: '2024-03-20',
                time: '14:00',
                status: 'Confirmed',
                timestamp: new Date().toLocaleString()
            },
            {
                id: 'b2',
                customerName: 'Jane Doe',
                customerId: 'c2',
                serviceName: 'Facial Treatment',
                date: '2024-03-21',
                time: '10:30',
                status: 'Pending',
                timestamp: new Date().toLocaleString()
            }
        ];
    }
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking));
};

// -- INSIGHTS --
export const fetchInterestInsights = async (): Promise<InterestInsight[]> => {
    // This would typically be calculated from analytics
    return [
        { id: 'i1', category: 'Fashion', score: 85, trend: 'up' },
        { id: 'i2', category: 'Electronics', score: 62, trend: 'stable' },
        { id: 'i3', category: 'Home Decor', score: 45, trend: 'down' },
        { id: 'i4', category: 'Beauty', score: 78, trend: 'up' }
    ];
};

// -- FACEBOOK CHATBOT --
export const fetchFacebookChatbotSettings = async (): Promise<FacebookChatbotSettings> => {
    const docRef = doc(db, `users/${getUid()}/settings`, 'facebookChatbot');
    const docSnap = await getDoc(docRef);
    if(docSnap.exists()){
        return docSnap.data() as FacebookChatbotSettings;
    }
    return {
        getStartedEnabled: true,
        persistentMenu: [
            { id: 'm1', type: 'web_url', title: 'Visit Website', url: 'https://example.com' },
            { id: 'm2', type: 'postback', title: 'Track Order', payload: 'TRACK_ORDER' }
        ],
        iceBreakers: [
            { id: 'i1', question: 'What are your opening hours?', payload: 'OPENING_HOURS' },
            { id: 'i2', question: 'Where are you located?', payload: 'LOCATION' }
        ]
    };
};

export const saveFacebookChatbotSettings = (settings: FacebookChatbotSettings) => setDoc(doc(db, `users/${getUid()}/settings`, 'facebookChatbot'), settings);

// -- FACEBOOK WELCOME TEMPLATES --
export const fetchFacebookWelcomeTemplates = async (): Promise<FacebookWelcomeTemplate[]> => {
    const q = query(collection(db, `users/${getUid()}/facebookWelcomeTemplates`));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
        return [
            { id: 'w1', name: 'Standard Welcome', text: 'Hello! Welcome to our store. How can we help you today?', isActive: true, timestamp: new Date().toLocaleString(), buttons: [{ id: 'b1', type: 'postback', title: 'Shop Now', payload: 'SHOP_NOW' }] }
        ];
    }
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FacebookWelcomeTemplate));
};

export const saveFacebookWelcomeTemplate = async (template: Omit<FacebookWelcomeTemplate, 'id'|'timestamp'>): Promise<FacebookWelcomeTemplate> => {
    const uid = getUid();
    const newTemplate = { ...template, timestamp: new Date().toLocaleString() };
    const docRef = await addDoc(collection(db, `users/${uid}/facebookWelcomeTemplates`), newTemplate);
    return { id: docRef.id, ...newTemplate };
};

// -- FACEBOOK LIVE SCRIPTS --
export const fetchFacebookLiveScripts = async (): Promise<FacebookLiveScript[]> => {
    const q = query(collection(db, `users/${getUid()}/facebookLiveScripts`));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
        return [
            { id: 's1', name: 'CF Automation', keyword: 'CF', action: 'send_message', messageTemplate: 'Thank you for your interest! Please check your inbox to complete the order.', isActive: true, timestamp: new Date().toLocaleString() }
        ];
    }
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FacebookLiveScript));
};

export const saveFacebookLiveScript = async (script: Omit<FacebookLiveScript, 'id'|'timestamp'>): Promise<FacebookLiveScript> => {
    const uid = getUid();
    const newScript = { ...script, timestamp: new Date().toLocaleString() };
    const docRef = await addDoc(collection(db, `users/${uid}/facebookLiveScripts`), newScript);
    return { id: docRef.id, ...newScript };
};
