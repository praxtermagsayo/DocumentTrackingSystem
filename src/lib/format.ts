import type { DocumentStatus } from '../types';

export function formatDate(dateString: string, options?: Intl.DateTimeFormatOptions): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: options?.month ?? 'long',
    day: 'numeric',
    year: 'numeric',
    hour: options?.hour ?? '2-digit',
    minute: options?.minute ?? '2-digit',
    ...options,
  });
}

export function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

export function formatDateShort(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

export function formatNotificationTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return `${Math.max(1, seconds)} second${seconds === 1 ? '' : 's'} ago`;
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`;
  return date.toLocaleDateString();
}

/** Relative time like "3d ago", "10m ago" for dashboard/activity */
export function formatRelativeTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const mins = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return date.toLocaleDateString();
}

export function getStatusColor(status: DocumentStatus): string {
  switch (status) {
    case 'forwarded':
      return 'status-sent';
    case 'viewed':
      return 'status-viewed';
    case 'acknowledged':
    case 'approved':
    case 'completed':
      return 'status-acknowledged';
    case 'returned':
    case 'rejected':
      return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/30';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200';
  }
}

export function getStatusLabel(status: DocumentStatus): string {
  switch (status) {
    case 'forwarded':
      return 'Forwarded';
    case 'viewed':
      return 'Viewed';
    case 'acknowledged':
      return 'Acknowledged';
    case 'approved':
      return 'Approved';
    case 'returned':
      return 'Returned';
    case 'rejected':
      return 'Rejected';
    case 'completed':
      return 'Completed';
    default:
      return status.charAt(0).toUpperCase() + status.slice(1);
  }
}

export function getNotificationIconClass(type: string): string {
  switch (type) {
    case 'success':
      return 'bg-green-500/20 text-green-600 dark:text-green-400';
    case 'warning':
      return 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400';
    case 'error':
      return 'bg-red-500/20 text-red-600 dark:text-red-400';
    default:
      return 'bg-blue-500/20 text-blue-600 dark:text-blue-400';
  }
}
