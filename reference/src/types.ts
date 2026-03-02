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
}

export interface DocumentHistory {
  id: string;
  documentId: string;
  status: DocumentStatus;
  comment: string;
  updatedBy: string;
  timestamp: string;
}