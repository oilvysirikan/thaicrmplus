
import React, { useState } from 'react';
import { View } from './types';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Connections from './components/Connections';
import Orders from './components/Orders';
import Notifications from './components/Notifications';
import Settings from './components/Settings';
import Chat from './components/Chat';
import Broadcast from './components/Broadcast';
import Automations from './components/Automations';
import Templates from './components/Templates';
import Delivery from './components/Delivery';
import Surveys from './components/Surveys';
import Bookings from './components/Bookings';
import Insights from './components/Insights';
import Reports from './components/Reports';
import CheckCircleIcon from './components/icons/CheckCircleIcon';
import XCircleIcon from './components/icons/XCircleIcon';
import LiffPreviewHost from './components/LiffPreviewHost';
import { useAppContext } from './hooks/useAppContext';


const App: React.FC = () => {
  const { 
    loadingInitialState, 
    toasts, 
    addToast
  } = useAppContext();

  const [currentView, setCurrentView] = useState<View>(View.Dashboard);

  const renderView = () => {
    switch (currentView) {
      case View.Dashboard:
        return <Dashboard setCurrentView={setCurrentView} />;
      case View.Reports:
        return <Reports />;
      case View.Connections:
        return <Connections />;
      case View.Orders:
        return <Orders />;
      case View.Notifications:
        return <Notifications />;
      case View.Settings:
        return <Settings />;
      case View.Chat:
        return <Chat />;
      case View.Broadcast:
        return <Broadcast addToast={addToast} />;
      case View.Automations:
        return <Automations addToast={addToast} />;
      case View.Templates:
        return <Templates addToast={addToast} />;
      case View.Delivery:
        return <Delivery addToast={addToast} />;
      case View.LiffPreview:
        return <LiffPreviewHost />;
      case View.Surveys:
        return <Surveys />;
      case View.Bookings:
        return <Bookings />;
      case View.Insights:
        return <Insights />;
      default:
        return <Dashboard setCurrentView={setCurrentView} />;
    }
  };
  
  if (loadingInitialState) {
    return (
        <div className="flex items-center justify-center h-screen bg-gray-100">
            <div className="text-center">
                <div className="flex justify-center items-center mb-4">
                    <div className="animate-spin h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full" role="status">
                        <span className="sr-only">Loading...</span>
                    </div>
                </div>
                <div className="text-xl font-semibold text-gray-600">Loading Siam Connect Hub...</div>
            </div>
        </div>
    );
  }

  const mainContentClass = currentView === View.Chat || currentView === View.LiffPreview ? "flex-1 flex flex-col overflow-hidden" : "flex-1 flex flex-col overflow-hidden relative";

  return (
    <div className="flex h-screen bg-gray-50 text-gray-800">
      <Sidebar currentView={currentView} setCurrentView={setCurrentView} onLogout={() => { setCurrentView(View.Dashboard); }} />
      <main className={mainContentClass}>
        {/* Toast Container */}
        <div aria-live="assertive" className="fixed top-5 right-5 z-50 w-full max-w-sm space-y-3 pointer-events-none">
          {toasts.map(toast => (
            <div
              key={toast.id}
              className={`flex items-center p-4 rounded-lg shadow-lg text-white ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}
            >
              {toast.type === 'success' ? <CheckCircleIcon /> : <XCircleIcon />}
              <span className="ml-3 font-medium">{toast.message}</span>
            </div>
          ))}
        </div>

        { currentView === View.Chat || currentView === View.LiffPreview ? renderView() : (
          <div className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
            <div className="container mx-auto px-6 py-8">
              {renderView()}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
