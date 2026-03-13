export type DocumentStatus = 'draft' | 'forwarded' | 'viewed' | 'acknowledged' | 'archived' | 'approved' | 'returned' | 'rejected' | 'completed';

export interface Document {
  id: string;
  title: string;
  description: string;
  status: DocumentStatus;
  category: string;
  categoryId?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  files: DocumentFile[];
  recipients?: string[];
  ownerName: string;
  ownerAvatar?: string;
  /** Owner's user id (for permission checks). */
  ownerId?: string;
  currentRoutingStepId?: string;
  routingSteps?: RoutingStep[];
}

export interface Department {
  id: string;
  name: string;
  code: string;
  createdAt: string;
}

export interface RoutingStep {
  id: string;
  document_id: string;
  step_number: number;
  sender_user_id: string;
  receiver_user_id?: string;
  sender_department_id?: string;
  receiver_department_id?: string;
  status: 'pending' | 'approved' | 'rejected' | 'returned' | 'forwarded';
  comment?: string;
  created_at: string;
  action_at?: string;
  age_in_days: number;
}

export interface AuditEntry {
  id: string;
  documentId: string;
  actionBy: string;
  actionType: 'created' | 'viewed' | 'acknowledged' | 'approved' | 'rejected' | 'returned' | 'forwarded';
  fromDepartmentId?: string;
  toDepartmentId?: string;
  comment?: string;
  timestamp: string;
  durationDays?: number;
}


export interface DocumentFile {
  id: string;
  name: string;
  path: string;
  size: string;
  type: string;
}

/** Event category status for filtering/display */
export type EventCategoryStatus = 'active' | 'inactive';

export interface EventCategory {
  id: string;
  name: string;
  status: EventCategoryStatus;
  createdBy: string;
  creatorName?: string;
  createdAt: string;
}

export type DocumentCategoryStatus = 'active' | 'inactive';

export interface DocumentCategory {
  id: string;
  name: string;
  status: DocumentCategoryStatus;
  createdBy: string;
  creatorName?: string;
  createdAt: string;
}

export interface Activity {
  id: string;
  userId: string;
  postDate: string;
  eventStart: string;
  eventEnd: string;
  categoryId: string;
  categoryName?: string;
  description: string;
  creatorName?: string;
  createdAt: string;
}

export interface DocumentHistory {
  id: string;
  documentId: string;
  fileId?: string;
  status: DocumentStatus;
  comment: string;
  updatedBy: string;
  timestamp: string;
}

export interface DocumentAcknowledgement {
  id: string;
  documentId: string;
  fileId?: string;
  userId: string;
  acknowledgedByName: string;
  timestamp: string;
}
