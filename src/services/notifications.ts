import { supabase } from '../lib/supabase';

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface NotificationRow {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  created_at: string;
  link?: string | null;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: NotificationType;
  /** Optional path to open when the notification is clicked (e.g. /documents/abc-123) */
  link?: string | null;
}

function rowToNotification(row: NotificationRow): Notification {
  return {
    id: row.id,
    title: row.title,
    message: row.message,
    timestamp: row.created_at,
    read: row.read,
    type: row.type as NotificationType,
    link: row.link ?? undefined,
  };
}

export async function fetchNotifications(userId: string): Promise<Notification[]> {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(rowToNotification);
}

export async function markNotificationRead(notificationId: string): Promise<void> {
  await supabase.from('notifications').update({ read: true }).eq('id', notificationId);
}

export async function markAllNotificationsRead(userId: string): Promise<void> {
  await supabase.from('notifications').update({ read: true }).eq('user_id', userId);
}

export async function createNotification(params: {
  userId: string;
  title: string;
  message: string;
  type?: NotificationType;
  /** Optional path to open when the notification is clicked (e.g. /documents/abc-123). Omitted if not set so DB without link column still works. */
  link?: string | null;
}): Promise<void> {
  const row: Record<string, unknown> = {
    user_id: params.userId,
    title: params.title,
    message: params.message,
    type: params.type || 'info',
    read: false,
  };
  if (params.link != null && params.link !== '') {
    row.link = params.link;
  }
  const { error } = await supabase.from('notifications').insert(row);
  if (error) {
    if (row.link !== undefined && error.message?.includes('link')) {
      delete row.link;
      const { error: retryError } = await supabase.from('notifications').insert(row);
      if (retryError) throw retryError;
      return;
    }
    throw error;
  }
}
