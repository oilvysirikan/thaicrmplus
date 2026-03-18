
export enum View {
  Dashboard = 'DASHBOARD',
  Reports = 'REPORTS',
  Connections = 'CONNECTIONS',
  Orders = 'ORDERS',
  Notifications = 'NOTIFICATIONS',
  Settings = 'SETTINGS',
  Chat = 'CHAT',
  Broadcast = 'BROADCAST',
  Automations = 'AUTOMATIONS',
  Templates = 'TEMPLATES',
  Delivery = 'DELIVERY',
  LiffPreview = 'LIFF_PREVIEW',
  Surveys = 'SURVEYS',
  Bookings = 'BOOKINGS',
  Insights = 'INSIGHTS',
}

export enum ConnectionStatus {
  Connected = 'CONNECTED',
  Disconnected = 'DISCONNECTED',
  Pending = 'PENDING',
}

export interface LogEntry {
  timestamp: string;
  level: 'INFO' | 'ERROR' | 'SUCCESS';
  service: 'System' | 'Shopify' | 'SHIPPOP' | 'LINE' | 'Gemini';
  message: string;
}

export interface OrderEvent {
  timestamp: string;
  status: string;
  description: string;
  icon: 'clipboard' | 'truck' | 'chat';
  screenshotUrl?: string; // Can be a standard URL or a base64 data URL
  generatedText?: string; // For AI-generated text like LINE messages
}

export interface Order {
  id: string;
  externalOrderId: string;
  customerId: string; // Link to customer profile
  customerName: string;
  date: string;
  status: 'Pending' | 'Awaiting Payment' | 'Shipped' | 'Fulfilled' | 'Cancelled';
  trackingNumber: string | null;
  notificationStatus: 'Sent' | 'Pending' | 'Failed';
  events: OrderEvent[];
  logs: LogEntry[];
}

export interface Notification {
  id: string;
  orderId: string;
  recipient: string;
  type: 'Order Confirmation' | 'Shipping Update' | 'Payment Reminder';
  status: 'Sent' | 'Failed';
  timestamp: string;
}

// --- ANALYTICS & REPORTING ---
export interface DashboardMetrics {
  linkedUsers: {
    total: number;
    change: number;
  };
  automationSales: {
    total: number;
    currency: string;
  };
  messagesSent: number;
  conversionRate: number;
}

export interface DailyReportRow {
  id: string;
  automationType: string;
  deliveries: number;
  conversions: number;
  errorRate: number;
  sales: number;
  currency: string;
}


// --- CHAT & CRM ---

export interface Tag {
    id: string;
    name: string;
}

export interface CustomerProfile {
    id: string;
    name: string;
    avatarUrl: string;
    platform: 'LINE' | 'Facebook';
    platformUserId: string;
    tags: Tag[];
    tier: 'Gold' | 'Silver' | 'Bronze' | 'Standard';
    points: number;
    subscriptionStatus: 'Active' | 'Inactive' | 'Cancelled';
    internalNotes: string;
}

export interface ChatMessage {
    id: string;
    text: string;
    timestamp: string;
    sender: 'admin' | 'customer';
}

export interface Conversation {
    id: string;
    customer: CustomerProfile;
    platform: 'LINE' | 'Facebook';
    lastMessage: ChatMessage;
    unreadCount: number;
}

export interface QuickReply {
  id: string;
  name: string;
  text: string;
}

// --- BROADCAST ---

export interface BroadcastCampaign {
    id: string;
    message: string;
    tags: Tag[];
    recipientCount: number;
    timestamp: string;
    status: 'Sent' | 'Sending' | 'Failed';
}

// --- AUTOMATIONS ---

export enum AutomationType {
    BrowseAbandonment = 'browseAbandonment',
    AbandonedCart = 'abandonedCart',
    AbandonedCheckout = 'abandonedCheckout',
    RestockAlerts = 'restockAlerts',
    LowStock = 'lowStock',
}

export interface AutomationSetting {
    id: AutomationType;
    isEnabled: boolean;
    delayValue: number;
    delayUnit: 'minutes' | 'hours' | 'days';
    messageTemplate: string;
    includeRecommendations?: boolean;
}

export interface StoreDisplaySettings {
    myPage: boolean;
    thankYou: boolean;
    banner: boolean;
}


// --- CARD MESSAGE TEMPLATES ---

export interface CardMessageAction {
  id: string;
  label: string;
  url: string;
}

export interface CardMessageTemplate {
  id: string;
  name: string;
  imageUrl: string;
  title: string;
  text: string;
  actions: CardMessageAction[];
  timestamp: string;
}

// --- LIFF ---
export interface LiffApp {
  id: string;
  name: string;
  url: string;
}


// --- RICH MENUS ---

export type RichMenuLayout = '6-grid' | '4-grid' | '3-row';

export interface RichMenuAction {
  id: string;
  type: 'url' | 'liff';
  label: string;
  url: string;
  liffPageId?: string;
}

export interface RichMenuTemplate {
    id: string;
    name: string;
    chatBarText: string;
    imageUrl: string;
    layout: RichMenuLayout;
    actions: RichMenuAction[];
    timestamp: string;
    tabCount?: 0 | 2 | 3;
}

// --- SURVEYS ---
export interface SurveyQuestion {
  id: string;
  question: string;
  type: 'text' | 'choice' | 'rating';
  options?: string[];
}

export interface Survey {
  id: string;
  title: string;
  description: string;
  questions: SurveyQuestion[];
  responseCount: number;
  timestamp: string;
}

// --- BOOKINGS ---
export interface Booking {
  id: string;
  customerName: string;
  customerId: string;
  serviceName: string;
  date: string;
  time: string;
  status: 'Confirmed' | 'Pending' | 'Cancelled' | 'Completed';
  timestamp: string;
}

// --- INSIGHTS ---
export interface InterestInsight {
  id: string;
  category: string;
  score: number; // 0-100
  trend: 'up' | 'down' | 'stable';
}

// --- FACEBOOK CHATBOT ---
export interface FacebookMenuItem {
  id: string;
  type: 'web_url' | 'postback';
  title: string;
  url?: string;
  payload?: string;
}

export interface FacebookIceBreaker {
  id: string;
  question: string;
  payload: string;
}

export interface FacebookChatbotSettings {
  getStartedEnabled: boolean;
  persistentMenu: FacebookMenuItem[];
  iceBreakers: FacebookIceBreaker[];
}

// --- FACEBOOK WELCOME MESSAGES ---
export interface FacebookWelcomeTemplate {
  id: string;
  name: string;
  text: string;
  imageUrl?: string;
  buttons: { id: string; type: 'web_url' | 'postback'; title: string; url?: string; payload?: string }[];
  isActive: boolean;
  timestamp: string;
}

// --- FACEBOOK LIVE AUTOMATION ---
export interface FacebookLiveScript {
  id: string;
  name: string;
  keyword: string; // The keyword that triggers the script (e.g., "CF")
  action: 'send_message' | 'add_to_cart' | 'reply_comment';
  messageTemplate: string;
  isActive: boolean;
  timestamp: string;
}
