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
}

/** Event category status for filtering/display */
export type EventCategoryStatus = 'active' | 'inactive';

export interface EventCategory {
  id: string;
  name: string;
  status: EventCategoryStatus;
  createdBy: string;
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
  createdAt: string;
}

export interface DocumentHistory {
  id: string;
  documentId: string;
  status: DocumentStatus;
  comment: string;
  updatedBy: string;
  timestamp: string;
}
