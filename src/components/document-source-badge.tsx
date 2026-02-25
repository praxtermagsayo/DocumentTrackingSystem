import type { Document } from '../types';
import { User } from 'lucide-react';

interface DocumentSourceBadgeProps {
  document: Document;
  currentUserId: string | null;
  className?: string;
}

/**
 * Renders a badge indicating when the document is owned by you.
 */
export function DocumentSourceBadge({ document, currentUserId, className = '' }: DocumentSourceBadgeProps) {
  const isMine = Boolean(currentUserId && document.ownerId && document.ownerId === currentUserId);

  if (!isMine) return null;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-blue-500/15 text-blue-700 dark:text-blue-400 ${className}`}
      title="You created this document"
    >
      <User className="size-3" />
      Mine
    </span>
  );
}
