export type DocumentStatus = 'draft' | 'under-review' | 'approved' | 'rejected' | 'archived';

export interface Document {
  id: string;
  title: string;
  description: string;
  status: DocumentStatus;
  category: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  fileType: string;
  fileSize: string;
  trackingId: string;
  ownerName: string;
  ownerAvatar?: string;
  /** Owner's user id (for permission checks). */
  ownerId?: string;
  /** When set, document is shared with this team and all members can view it */
  teamId?: string | null;
  /** User id of the person this document is assigned to (for tracking). */
  assignedTo?: string | null;
  /** Display name of the assignee. */
  assignedToName?: string | null;
}

export interface Team {
  id: string;
  name: string;
  createdBy: string;
  createdAt: string;
  memberCount?: number;
}

/** Team role: set when added to a team (or Admin for the creator). */
export type TeamRole = 'admin' | 'manager' | 'member';

export interface TeamMember {
  id: string;
  teamId: string;
  userId: string;
  email: string | null;
  displayName: string | null;
  role: TeamRole;
  createdAt: string;
}

/** Short descriptions for team roles (for UI tooltips/help). */
export const TEAM_ROLE_DESCRIPTIONS: Record<TeamRole, string> = {
  admin: 'Created the team. Full control: add/remove members, assign roles, delete team.',
  manager: 'Can add and remove members (except other managers and admin). Can share documents with the team.',
  member: 'Can view and edit documents shared with the team. Cannot manage members.',
};

export interface DocumentHistory {
  id: string;
  documentId: string;
  status: DocumentStatus;
  comment: string;
  updatedBy: string;
  timestamp: string;
}
