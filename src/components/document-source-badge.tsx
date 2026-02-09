import type { Document, Team } from '../types';
import { User, Users } from 'lucide-react';

interface DocumentSourceBadgeProps {
  document: Document;
  currentUserId: string | null;
  teams: Team[];
  className?: string;
}

/**
 * Renders badges indicating where the document is from: owned by you (Mine) and/or shared with a team.
 */
export function DocumentSourceBadge({ document, currentUserId, teams, className = '' }: DocumentSourceBadgeProps) {
  const isMine = Boolean(currentUserId && document.ownerId && document.ownerId === currentUserId);
  const team = document.teamId ? teams.find((t) => t.id === document.teamId) : null;

  if (!isMine && !team) return null;

  return (
    <div className={`inline-flex flex-wrap items-center gap-1.5 ${className}`}>
      {isMine && (
        <span
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-blue-500/15 text-blue-700 dark:text-blue-400"
          title="You created this document"
        >
          <User className="size-3" />
          Mine
        </span>
      )}
      {team && (
        <span
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-violet-500/15 text-violet-700 dark:text-violet-400"
          title={`Shared with team: ${team.name}`}
        >
          <Users className="size-3" />
          Team: {team.name}
        </span>
      )}
    </div>
  );
}
