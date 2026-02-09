import { useState, useCallback, useEffect } from 'react';
import type { DocumentStatus } from '../types';
import type { Document } from '../types';
import { fetchDocumentHistory } from '../services/documents';

export interface DocumentHistoryItem {
  id: string;
  documentId: string;
  status: DocumentStatus;
  comment: string;
  updatedBy: string;
  timestamp: string;
}

export function useDocumentDetail(
  documentId: string | undefined,
  documents: Document[],
  updateDocumentStatus: (docId: string, status: DocumentStatus, comment: string) => Promise<void>,
  deleteDocument: (docId: string) => Promise<void>,
  addComment: (docId: string, comment: string) => Promise<void>
) {
  const [history, setHistory] = useState<DocumentHistoryItem[]>([]);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<DocumentStatus>('draft');
  const [statusComment, setStatusComment] = useState('');
  const [comment, setComment] = useState('');
  const [shareEmails, setShareEmails] = useState('');
  const [sharePermission, setSharePermission] = useState('view');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isAddingComment, setIsAddingComment] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadHistory = useCallback(() => {
    if (!documentId) return;
    fetchDocumentHistory(documentId)
      .then(setHistory)
      .catch(() => setHistory([]));
  }, [documentId]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const currentIndex = documents.findIndex((d) => d.id === documentId);
  const previousDoc = currentIndex > 0 ? documents[currentIndex - 1] : null;
  const nextDoc = currentIndex >= 0 && currentIndex < documents.length - 1 ? documents[currentIndex + 1] : null;

  const handleDelete = useCallback(
    async (doc: Document) => {
      setIsDeleting(true);
      try {
        await deleteDocument(doc.id);
      } finally {
        setIsDeleting(false);
      }
    },
    [deleteDocument]
  );

  const handleUpdateStatus = useCallback(
    async (doc: Document) => {
      setIsUpdatingStatus(true);
      try {
        await updateDocumentStatus(doc.id, selectedStatus, statusComment);
        setShowStatusModal(false);
        setStatusComment('');
        loadHistory();
      } finally {
        setIsUpdatingStatus(false);
      }
    },
    [selectedStatus, statusComment, updateDocumentStatus, loadHistory]
  );

  const handleAddComment = useCallback(
    async (doc: Document) => {
      setIsAddingComment(true);
      try {
        await addComment(doc.id, comment);
        setShowCommentModal(false);
        setComment('');
      } finally {
        setIsAddingComment(false);
      }
    },
    [comment, addComment]
  );

  return {
    history,
    loadHistory,
    previousDoc,
    nextDoc,
    showStatusModal,
    setShowStatusModal,
    showCommentModal,
    setShowCommentModal,
    showShareModal,
    setShowShareModal,
    selectedStatus,
    setSelectedStatus,
    statusComment,
    setStatusComment,
    comment,
    setComment,
    shareEmails,
    setShareEmails,
    sharePermission,
    setSharePermission,
    handleDelete,
    handleUpdateStatus,
    handleAddComment,
    isUpdatingStatus,
    isAddingComment,
    isDeleting,
  };
}
