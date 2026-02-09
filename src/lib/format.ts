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
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

export function getStatusColor(status: DocumentStatus): string {
  switch (status) {
    case 'approved':
      return 'bg-green-100 text-green-800';
    case 'under-review':
      return 'bg-yellow-100 text-yellow-800';
    case 'draft':
      return 'bg-slate-100 text-slate-800';
    case 'rejected':
      return 'bg-red-100 text-red-800';
    case 'archived':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-slate-100 text-slate-800';
  }
}

export function getStatusLabel(status: DocumentStatus): string {
  switch (status) {
    case 'draft':
      return 'Draft';
    case 'under-review':
      return 'Pending';
    case 'approved':
      return 'Approved';
    case 'rejected':
      return 'Rejected';
    case 'archived':
      return 'Archived';
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
