import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router';
import type { DocumentStatus } from '../types';
import * as documentService from '../services/documents';
import * as notificationService from '../services/notifications';

/** Allowed MIME types and extensions for upload (PDF, Word, Excel, images) */
export const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/msword', // .doc
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  'application/vnd.ms-excel', // .xls
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
] as const;

export const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.jpg', '.jpeg', '.png', '.gif', '.webp'];
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

export const UPLOAD_CATEGORIES = [
  'Financial',
  'HR',
  'Marketing',
  'Legal',
  'Project Management',
  'Compliance',
  'Training',
  'Procurement',
  'IT',
  'Customer Service',
] as const;

export interface UploadFormData {
  title: string;
  description: string;
  category: string;
  status: DocumentStatus;
  file: File | null;
  /** Optional team to share the document with (team id) */
  teamId: string;
}

const initialFormData: UploadFormData = {
  title: '',
  description: '',
  category: '',
  status: 'draft',
  file: null,
  teamId: '',
};

export function useUploadDocument(
  user: { name: string; email: string; initials: string } | null,
  refreshDocuments: () => Promise<void>,
  refreshNotifications: () => Promise<void>,
  getUserId: () => Promise<string | null>
) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<UploadFormData>(initialFormData);
  const [dragActive, setDragActive] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const validateFile = useCallback((file: File): string | null => {
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return `File type not allowed. Use: ${ALLOWED_EXTENSIONS.join(', ')}`;
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return `File too large. Maximum size is 10MB (${(file.size / 1024 / 1024).toFixed(1)}MB selected).`;
    }
    return null;
  }, []);

  const setFile = useCallback(
    (file: File | null) => {
      if (file) {
        const err = validateFile(file);
        if (err) {
          setUploadError(err);
          return;
        }
        setUploadError('');
      }
      setFormData((prev) => ({ ...prev, file }));
    },
    [validateFile]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        setFile(e.dataTransfer.files[0]);
      }
    },
    [setFile]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        setFile(e.target.files[0]);
      }
      e.target.value = '';
    },
    [setFile]
  );

  const clearFile = useCallback(() => {
    setFormData((prev) => ({ ...prev, file: null }));
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setUploadError('');
      const userId = await getUserId();
      if (!userId || !user) {
        setUploadError('You must be logged in to upload.');
        return;
      }
      if (!formData.file) {
        setUploadError('Please select a file to upload.');
        return;
      }
      const fileError = validateFile(formData.file);
      if (fileError) {
        setUploadError(fileError);
        return;
      }
      setIsUploading(true);
      try {
        const created = await documentService.createDocument({
          userId,
          ownerName: user.name,
          title: formData.title.trim(),
          description: formData.description.trim(),
          category: formData.category || 'Other',
          status: formData.status,
          file: formData.file,
          teamId: formData.teamId?.trim() || undefined,
        });
        await notificationService.createNotification({
          userId,
          title: 'Document Uploaded',
          message: `"${formData.title}" has been added to your documents.`,
          type: 'success',
          link: `/documents/${created.id}`,
        });
        await refreshDocuments();
        await refreshNotifications();
        setSubmitted(true);
        setTimeout(() => navigate('/documents'), 1500);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Upload failed. Please try again.';
        setUploadError(message);
      } finally {
        setIsUploading(false);
      }
    },
    [formData, user, getUserId, validateFile, refreshDocuments, refreshNotifications, navigate]
  );

  return {
    formData,
    setFormData,
    dragActive,
    submitted,
    uploadError,
    isUploading,
    handleDrag,
    handleDrop,
    handleFileChange,
    clearFile,
    handleSubmit,
    categories: UPLOAD_CATEGORIES,
  };
}
