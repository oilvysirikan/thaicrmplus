
import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './firebaseConfig';
import { fetchConnectionStatuses, fetchQuickReplies, logout } from './api';
import { ConnectionStatus, QuickReply } from './types';
import { fetchLineConfig, fetchLineSession, lineLogout, LineConfig, LineSessionProfile } from './lineApi';

interface ToastMessage {
  id: number;
  message: string;
  type: 'success' | 'error';
}

interface AppContextType {
  user: User | null;
  loadingInitialState: boolean;
  authView: 'login' | 'signup';
  setAuthView: (view: 'login' | 'signup') => void;
  
  // Connection Statuses
  shopifyStatus: ConnectionStatus;
  shippopStatus: ConnectionStatus;
  lineStatus: ConnectionStatus;
  facebookStatus: ConnectionStatus;
  setShopifyStatus: (status: ConnectionStatus) => void;
  setShippopStatus: (status: ConnectionStatus) => void;
  setLineStatus: (status: ConnectionStatus) => void;
  setFacebookStatus: (status: ConnectionStatus) => void;

  // Quick Replies
  quickReplies: QuickReply[];
  refetchQuickReplies: () => void;

  // LINE Login (via backend)
  lineConfig: LineConfig | null;
  lineProfile: LineSessionProfile | null;
  refetchLineSession: () => Promise<void>;
  handleLineLogout: () => Promise<void>;

  // Toasts
  toasts: ToastMessage[];
  addToast: (message: string, type: 'success' | 'error') => void;

  // Auth functions
  handleLogout: () => Promise<void>;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loadingInitialState, setLoadingInitialState] = useState<boolean>(true);
  const [authView, setAuthView] = useState<'login' | 'signup'>('login');
  
  const [shopifyStatus, setShopifyStatus] = useState<ConnectionStatus>(ConnectionStatus.Pending);
  const [shippopStatus, setShippopStatus] = useState<ConnectionStatus>(ConnectionStatus.Pending);
  const [lineStatus, setLineStatus] = useState<ConnectionStatus>(ConnectionStatus.Pending);
  const [facebookStatus, setFacebookStatus] = useState<ConnectionStatus>(ConnectionStatus.Pending);

  const [quickReplies, setQuickReplies] = useState<QuickReply[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [lineConfig, setLineConfig] = useState<LineConfig | null>(null);
  const [lineProfile, setLineProfile] = useState<LineSessionProfile | null>(null);

  const addToast = useCallback((message: string, type: 'success' | 'error') => {
    const id = Date.now();
    setToasts(prevToasts => [...prevToasts, { id, message, type }]);
    setTimeout(() => {
      setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
    }, 5000);
  }, []);

  const refetchLineSession = useCallback(async () => {
    try {
      const session = await fetchLineSession();
      setLineProfile(session.authenticated && session.profile ? session.profile : null);
    } catch (error) {
      console.error('Failed to fetch LINE session', error);
      setLineProfile(null);
    }
  }, []);

  const handleLineLogout = useCallback(async () => {
    try {
      await lineLogout();
      setLineProfile(null);
      addToast('Logged out of LINE.', 'success');
    } catch (error) {
      addToast('Failed to log out of LINE.', 'error');
    }
  }, [addToast]);

  const loadQuickReplies = useCallback(async () => {
    if (!user) return;
    try {
        const replies = await fetchQuickReplies();
        setQuickReplies(replies);
    } catch (error) {
        console.error("Failed to fetch quick replies", error);
        addToast('Could not load quick replies.', 'error');
    }
  }, [user, addToast]);


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoadingInitialState(true);
      
      // Always try to load data, using default-user-id if not logged in
      setUser(firebaseUser); 
      
      try {
        const [statuses, replies] = await Promise.all([
            fetchConnectionStatuses(),
            fetchQuickReplies()
        ]);
        setShopifyStatus(statuses.shopify);
        setShippopStatus(statuses.shippop);
        setLineStatus(statuses.line);
        setFacebookStatus(statuses.facebook);
        setQuickReplies(replies);
        // Load LINE backend config + session in parallel (non-fatal on failure).
        fetchLineConfig().then(setLineConfig).catch(() => setLineConfig(null));
        refetchLineSession();
      } catch (error) {
        console.error("Failed to fetch initial data", error);
        // We don't want to show an error toast here if it's just because the mock user has no data yet
      }
      
      setLoadingInitialState(false);
    });
    return () => unsubscribe();
  }, [addToast, refetchLineSession]);
  
  const handleLogout = async () => {
    try {
        await logout();
        addToast('You have been logged out.', 'success');
    } catch (error) {
        addToast('Failed to log out.', 'error');
    }
  };

  const value = {
    user,
    loadingInitialState,
    authView,
    setAuthView,
    shopifyStatus,
    shippopStatus,
    lineStatus,
    facebookStatus,
    setShopifyStatus,
    setShippopStatus,
    setLineStatus,
    setFacebookStatus,
    quickReplies,
    refetchQuickReplies: loadQuickReplies,
    lineConfig,
    lineProfile,
    refetchLineSession,
    handleLineLogout,
    toasts,
    addToast,
    handleLogout,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
