import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Document, DocumentStatus } from '../types';
import { mockDocuments } from '../data/mockData';

export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'info' | 'success' | 'warning' | 'error';
}

interface AppContextType {
  // Authentication
  isAuthenticated: boolean;
  login: (email: string, password: string) => void;
  logout: () => void;
  user: {
    name: string;
    email: string;
    initials: string;
  } | null;

  // Documents
  documents: Document[];
  updateDocumentStatus: (docId: string, status: DocumentStatus, comment: string) => void;
  deleteDocument: (docId: string) => void;
  addComment: (docId: string, comment: string) => void;

  // Notifications
  notifications: Notification[];
  markNotificationAsRead: (notificationId: string) => void;
  markAllNotificationsAsRead: () => void;
  unreadCount: number;

  // Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<AppContextType['user']>(null);
  const [documents, setDocuments] = useState<Document[]>(mockDocuments);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'Document Approved',
      message: 'Q4 Financial Report has been approved',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      read: false,
      type: 'success',
    },
    {
      id: '2',
      title: 'New Document',
      message: 'Legal Contract Draft received from Sarah Johnson',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      read: false,
      type: 'info',
    },
    {
      id: '3',
      title: 'Review Required',
      message: 'Employee Handbook needs your review',
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      read: true,
      type: 'warning',
    },
  ]);

  // Check authentication on mount
  useEffect(() => {
    const authStatus = localStorage.getItem('isAuthenticated');
    const userEmail = localStorage.getItem('userEmail');
    const userName = localStorage.getItem('userName');

    if (authStatus === 'true' && userEmail && userName) {
      setIsAuthenticated(true);
      const initials = userName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase();
      setUser({ name: userName, email: userEmail, initials });
    }
  }, []);

  const login = (email: string, password: string) => {
    // Mock login
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('userEmail', email);
    localStorage.setItem('userName', 'Alex Morgan');
    setIsAuthenticated(true);
    setUser({ name: 'Alex Morgan', email, initials: 'AM' });
  };

  const logout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    setIsAuthenticated(false);
    setUser(null);
  };

  const updateDocumentStatus = (docId: string, status: DocumentStatus, comment: string) => {
    setDocuments((prev) =>
      prev.map((doc) =>
        doc.id === docId
          ? { ...doc, status, updatedAt: new Date().toISOString() }
          : doc
      )
    );

    // Add notification
    const doc = documents.find((d) => d.id === docId);
    if (doc) {
      setNotifications((prev) => [
        {
          id: Date.now().toString(),
          title: 'Status Updated',
          message: `${doc.title} status changed to ${status}`,
          timestamp: new Date().toISOString(),
          read: false,
          type: 'success',
        },
        ...prev,
      ]);
    }
  };

  const deleteDocument = (docId: string) => {
    setDocuments((prev) => prev.filter((doc) => doc.id !== docId));
  };

  const addComment = (docId: string, comment: string) => {
    // In a real app, this would add to a comments array
    const doc = documents.find((d) => d.id === docId);
    if (doc) {
      setNotifications((prev) => [
        {
          id: Date.now().toString(),
          title: 'Comment Added',
          message: `Comment added to ${doc.title}`,
          timestamp: new Date().toISOString(),
          read: false,
          type: 'info',
        },
        ...prev,
      ]);
    }
  };

  const markNotificationAsRead = (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })));
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <AppContext.Provider
      value={{
        isAuthenticated,
        login,
        logout,
        user,
        documents,
        updateDocumentStatus,
        deleteDocument,
        addComment,
        notifications,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        unreadCount,
        searchQuery,
        setSearchQuery,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
