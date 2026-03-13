import { useState, useCallback, useEffect } from 'react';
import type { DocumentStatus } from '../types';
import type { Document } from '../types';
import { fetchDocumentHistory, fetchDocumentRouting, processRoutingAction, type DocumentRoutingStep } from '../services/documents';
import * as documentService from '../services/documents';

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
  updateDocumentStatus: (docId: string, status: DocumentStatus, comment: string, updatedBy?: string) => Promise<void>,
  deleteDocument: (docId: string) => Promise<void>,
  addComment: (docId: string, comment: string) => Promise<void>
) {
  const [history, setHistory] = useState<DocumentHistoryItem[]>([]);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<DocumentStatus>('forwarded');
  const [statusComment, setStatusComment] = useState('');
  const [comment, setComment] = useState('');
  const [shareEmails, setShareEmails] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isAddingComment, setIsAddingComment] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [routingSteps, setRoutingSteps] = useState<DocumentRoutingStep[]>([]);
  const [isProcessingRouting, setIsProcessingRouting] = useState(false);

  const loadHistoryAndRouting = useCallback(() => {
    if (!documentId) return;
    fetchDocumentHistory(documentId)
      .then(setHistory)
      .catch(() => setHistory([]));

    fetchDocumentRouting(documentId)
      .then(setRoutingSteps)
      .catch(() => setRoutingSteps([]));
  }, [documentId]);

  useEffect(() => {
    loadHistoryAndRouting();
  }, [loadHistoryAndRouting]);

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
        loadHistoryAndRouting();
      } finally {
        setIsUpdatingStatus(false);
      }
    },
    [selectedStatus, statusComment, updateDocumentStatus, loadHistoryAndRouting]
  );

  const handleRoutingAction = useCallback(
    async (doc: Document, stepId: string, action: 'approve' | 'reject' | 'return', userName: string, userId: string, comment?: string) => {
      setIsProcessingRouting(true);
      try {
        await processRoutingAction(doc.id, stepId, action, userId, userName, comment);
        loadHistoryAndRouting();
      } finally {
        setIsProcessingRouting(false);
      }
    },
    [loadHistoryAndRouting]
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

  const [isForwarding, setIsForwarding] = useState(false);

  const handleForward = useCallback(
    async (
      doc: Document,
      receiver: { id: string; email: string; name: string; departmentId: string },
      sender: { id: string; name: string },
      comment?: string
    ) => {
      setIsForwarding(true);
      try {
        // Find if current user is a handler for a pending step
        const currentStep = routingSteps.find(s => s.status === 'pending' && s.receiver_user_id === sender.id);

        await documentService.forwardDocument({
          documentId: doc.id,
          currentStepId: currentStep?.id,
          senderId: sender.id,
          senderName: sender.name,
          receiverId: receiver.id,
          receiverEmail: receiver.email,
          receiverName: receiver.name,
          receiverDeptId: receiver.departmentId,
          comment: comment || ''
        });

        setShowShareModal(false);
        setShareEmails('');
        loadHistoryAndRouting();
      } finally {
        setIsForwarding(false);
      }
    },
    [routingSteps, loadHistoryAndRouting]
  );

  const isCurrentHandler = routingSteps.some(
    (step, index) =>
      step.status === 'pending' &&
      step.receiver_user_id === documents.find(d => d.id === documentId)?.ownerId === false && // placeholder logic, better to check against auth userId
      (!routingSteps[index - 1] || routingSteps[index - 1].status === 'approved')
  );

  return {
    history,
    loadHistory: loadHistoryAndRouting,
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
    handleDelete,
    handleUpdateStatus,
    handleAddComment,
    handleRoutingAction,
    handleForward,
    isUpdatingStatus,
    isAddingComment,
    isDeleting,
    isForwarding,
    routingSteps,
    isProcessingRouting,
  };
}
