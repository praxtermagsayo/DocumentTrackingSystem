import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { Document, DocumentStatus, Team } from '../types';
import { supabase } from '../lib/supabase';
import * as themeLib from '../lib/theme';
import type { User } from '@supabase/supabase-js';
import * as documentService from '../services/documents';
import * as notificationService from '../services/notifications';
import * as teamService from '../services/teams';

export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'info' | 'success' | 'warning' | 'error';
  /** Optional path to open when clicked (e.g. /documents/abc-123) */
  link?: string | null;
}

interface AppContextType {
  // Authentication
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  user: {
    name: string;
    email: string;
    initials: string;
  } | null;

  // Documents (from database)
  documents: Document[];
  refreshDocuments: () => Promise<void>;
  updateDocumentStatus: (docId: string, status: DocumentStatus, comment: string) => Promise<void>;
  updateDocumentTeam: (docId: string, teamId: string | null) => Promise<void>;
  updateDocumentAssignment: (docId: string, assignedTo: string | null, assignedToName: string | null) => Promise<void>;
  deleteDocument: (docId: string) => Promise<void>;
  addComment: (docId: string, comment: string) => Promise<void>;
  /** Current user's id (for ownership checks). */
  currentUserId: string | null;

  // Teams (view others' documents via team membership)
  teams: Team[];
  refreshTeams: () => Promise<void>;
  createTeam: (name: string) => Promise<Team>;
  addTeamMemberByEmail: (teamId: string, email: string, role: 'manager' | 'member') => Promise<void>;
  removeTeamMember: (teamId: string, userId: string) => Promise<void>;
  fetchTeamMembers: (teamId: string) => Promise<import('../types').TeamMember[]>;

  // Notifications (from database)
  notifications: Notification[];
  refreshNotifications: (userId?: string) => Promise<void>;
  markNotificationAsRead: (notificationId: string) => Promise<void>;
  markAllNotificationsAsRead: () => Promise<void>;
  unreadCount: number;

  // Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Theme: 'system' follows OS preference
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  /** Resolved theme for UI (e.g. toasts) — always 'light' or 'dark' */
  resolvedTheme: 'light' | 'dark';
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<AppContextType['user']>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [theme, setThemeState] = useState<'light' | 'dark' | 'system'>(() => themeLib.getStoredTheme());
  const [systemResolved, setSystemResolved] = useState<'light' | 'dark'>(() =>
    themeLib.getSystemPrefersDark() ? 'dark' : 'light'
  );
  const resolvedTheme = theme === 'system' ? systemResolved : theme;
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // When theme is 'system', react to OS preference changes
  useEffect(() => {
    if (theme !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      const next = mq.matches ? 'dark' : 'light';
      setSystemResolved(next);
      themeLib.applyThemeToDocument('system');
    };
    handler(); // sync once
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [theme]);

  const upsertProfile = async (u: User) => {
    const name = (u.user_metadata?.full_name as string) || u.email?.split('@')[0] || '';
    await supabase.from('profiles').upsert(
      { id: u.id, email: u.email ?? null, display_name: name || null },
      { onConflict: 'id' }
    );
  };

  // Map Supabase User to app user
  const mapSupabaseUser = (u: User | null): AppContextType['user'] => {
    if (!u?.email) return null;
    const name = (u.user_metadata?.full_name as string) || u.email.split('@')[0] || 'User';
    const initials = name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
    return { name, email: u.email, initials };
  };

  // Apply theme on mount and when theme changes
  useEffect(() => {
    themeLib.applyThemeToDocument(theme);
  }, [theme]);

  const setTheme = (next: 'light' | 'dark' | 'system') => {
    setThemeState(next);
    themeLib.applyThemeToDocument(next);
  };

  const refreshDocuments = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) return;
    try {
      const list = await documentService.fetchDocuments(session.user.id);
      setDocuments(list);
    } catch {
      setDocuments([]);
    }
  }, []);

  const refreshNotifications = useCallback(async (userId?: string) => {
    let uid = userId;
    if (uid == null) {
      const { data: { session } } = await supabase.auth.getSession();
      uid = session?.user?.id ?? undefined;
    }
    if (!uid) return;
    try {
      const list = await notificationService.fetchNotifications(uid);
      setNotifications(list);
    } catch {
      setNotifications((prev) => prev);
    }
  }, []);

  const refreshTeams = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) return;
    try {
      const list = await teamService.fetchMyTeams(session.user.id);
      setTeams(list);
    } catch {
      setTeams([]);
    }
  }, []);

  // Restore session and listen for auth changes (Supabase); load documents and notifications when logged in
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setIsAuthenticated(true);
        setUser(mapSupabaseUser(session.user));
        setCurrentUserId(session.user.id);
        upsertProfile(session.user);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setIsAuthenticated(true);
        setUser(mapSupabaseUser(session.user));
        setCurrentUserId(session.user.id);
      } else {
        setIsAuthenticated(false);
        setUser(null);
        setCurrentUserId(null);
        setDocuments([]);
        setNotifications([]);
        setTeams([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const run = async () => {
      await refreshTeams();
      await refreshDocuments();
      await refreshNotifications();
    };
    run();
  }, [user, refreshTeams, refreshDocuments, refreshNotifications]);

  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    if (data.user) {
      setIsAuthenticated(true);
      setUser(mapSupabaseUser(data.user));
      setCurrentUserId(data.user.id);
      await upsertProfile(data.user);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    setUser(null);
  };

  const updateDocumentStatus = async (docId: string, status: DocumentStatus, comment: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) return;
    const doc = documents.find((d) => d.id === docId);
    const ownerName = user?.name || session.user.email || 'User';
    await documentService.updateDocumentStatus(docId, status, comment, ownerName);
    await refreshDocuments();
    if (doc) {
      await notificationService.createNotification({
        userId: session.user.id,
        title: 'Status Updated',
        message: `${doc.title} status changed to ${status}`,
        type: 'success',
        link: `/documents/${docId}`,
      });
      await refreshNotifications();
    }
  };

  const updateDocumentTeam = async (docId: string, teamId: string | null) => {
    await documentService.updateDocumentTeam(docId, teamId);
    await refreshDocuments();
  };

  const updateDocumentAssignment = async (docId: string, assignedTo: string | null, assignedToName: string | null) => {
    await documentService.updateDocumentAssignment(docId, assignedTo, assignedToName);
    await refreshDocuments();
  };

  const deleteDocumentAsync = async (docId: string) => {
    await documentService.deleteDocument(docId);
    await refreshDocuments();
  };

  const addCommentAsync = async (docId: string, comment: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) return;
    const doc = documents.find((d) => d.id === docId);
    const ownerName = user?.name || session.user.email || 'User';
    await documentService.addDocumentHistory(docId, doc?.status ?? 'draft', comment, ownerName);
    if (doc) {
      await notificationService.createNotification({
        userId: session.user.id,
        title: 'Comment Added',
        message: `Comment added to ${doc.title}`,
        type: 'info',
        link: `/documents/${docId}`,
      });
      await refreshNotifications();
    }
  };

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      await notificationService.markNotificationRead(notificationId);
    } finally {
      await refreshNotifications();
    }
  };

  const markAllNotificationsAsRead = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) return;
    try {
      await notificationService.markAllNotificationsRead(session.user.id);
    } finally {
      await refreshNotifications();
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const createTeam = async (name: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) throw new Error('Not signed in');
    const team = await teamService.createTeam(name.trim(), session.user.id);
    await refreshTeams();
    await refreshDocuments();
    return team;
  };

  const addTeamMemberByEmail = async (teamId: string, email: string, role: 'manager' | 'member') => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) throw new Error('Not signed in');
    await teamService.addTeamMemberByEmail(teamId, email, role, session.user.id);
    await refreshTeams();
    await refreshDocuments();
  };

  const removeTeamMember = async (teamId: string, userId: string) => {
    await teamService.removeTeamMember(teamId, userId);
    await refreshTeams();
    await refreshDocuments();
  };

  const fetchTeamMembers = async (teamId: string) => {
    return teamService.fetchTeamMembers(teamId);
  };

  return (
    <AppContext.Provider
      value={{
        isAuthenticated,
        login,
        logout,
        user,
        documents,
        refreshDocuments,
        updateDocumentStatus,
        updateDocumentTeam,
        updateDocumentAssignment,
        deleteDocument: deleteDocumentAsync,
        addComment: addCommentAsync,
        currentUserId,
        teams,
        refreshTeams,
        createTeam,
        addTeamMemberByEmail,
        removeTeamMember,
        fetchTeamMembers,
        notifications,
        refreshNotifications,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        unreadCount,
        searchQuery,
        setSearchQuery,
        theme,
        setTheme,
        resolvedTheme,
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
