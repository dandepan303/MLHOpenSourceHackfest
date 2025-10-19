'use client'
import { DefaultAPIRes } from "@/types/api_types";
import { createContext, useCallback, useContext, useEffect, useState } from "react";

interface Notification {
  id: string;
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning';
}

interface NotificationContextType {
  addNotification: (notification: { message: string; type?: 'success' | 'error' | 'info' | 'warning' }) => void;
  addNotificationStatus: (res: DefaultAPIRes & any) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function useNotification() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // TODO: REMOV
  useEffect(() => {console.log(notifications)}, [notifications]);

  const addNotification = useCallback((notification: { message: string; type?: 'success' | 'error' | 'info' | 'warning' }) => {
    const id = Date.now().toString() + Math.random().toString(36);
    setNotifications(prev => [...prev, { id, ...notification }]);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      removeNotification(id);
    }, 5000);
  }, []);

  const addNotificationStatus = useCallback((res: DefaultAPIRes & any) => {
    if (res.message.trim() === '') return;

    addNotification({
      message: res.message,
      type: res.status,
    })
  }, [addNotification]);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const getTypeStyles = (type?: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'info':
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  return (
    <NotificationContext.Provider value={{ addNotification, addNotificationStatus }}>
      <div className="w-full h-full relative">
        {/* Notification Banner Container */}
        {notifications.length > 0 && (
          <div className="fixed top-0 left-0 right-0 z-50 flex flex-col gap-2 p-4 pointer-events-none">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`pointer-events-auto mx-auto max-w-md w-full rounded-lg border shadow-lg p-4 flex items-center justify-between animate-slideDown ${getTypeStyles(notification.type)}`}
              >
                <p className="text-sm font-medium flex-1">{notification.message}</p>
                <button
                  onClick={() => removeNotification(notification.id)}
                  className="ml-4 text-gray-500 hover:text-gray-700 transition-colors"
                  aria-label="Close notification"
                >
                  <svg className="w-5 h-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Children */}
        {children}
      </div>
    </NotificationContext.Provider>
  );
}