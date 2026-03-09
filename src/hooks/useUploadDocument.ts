import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { supabase } from '../lib/supabase';
import type { DocumentStatus } from '../types';
import * as documentService from '../services/documents';
import * as docCategoryService from '../services/documentCategories';
import * as notificationService from '../services/notifications';
import { DocumentCategory } from '../types';

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

export const UPLOAD_CATEGORIES = [] as const; // No longer used, categories are dynamic

export interface UploadFormData {
  title: string;
  description: string;
  category: string;
  status: DocumentStatus;
  files: File[];
  existingFiles: Array<{ id: string; title: string; fileSize: string; fileType: string }>;
  recipients: string[];
  trackingId?: string;
}

const initialFormData: UploadFormData = {
  title: '',
  description: '',
  category: '',
  status: 'under-review', // Default to review if not draft
  files: [],
  existingFiles: [],
  recipients: [],
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
  const [isSending, setIsSending] = useState(false);
  const [categories, setCategories] = useState<DocumentCategory[]>([]);

  // Fetch dynamic categories
  const loadCategories = useCallback(async () => {
    const userId = await getUserId();
    if (!userId) return;
    try {
      const data = await docCategoryService.fetchDocumentCategories(userId);
      setCategories(data);
      if (data.length > 0 && !formData.category) {
        setFormData(prev => ({ ...prev, category: data[0].name }));
      }
    } catch (err) {
      console.error('Failed to load categories', err);
    }
  }, [getUserId, formData.category]);

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

  const addFiles = useCallback(
    (newFiles: FileList | null) => {
      if (!newFiles) return;
      const validFiles: File[] = [];
      let lastError = '';

      Array.from(newFiles).forEach(file => {
        const error = validateFile(file);
        if (error) {
          lastError = error;
        } else {
          validFiles.push(file);
        }
      });

      if (lastError) setUploadError(lastError);
      if (validFiles.length > 0) {
        setFormData(prev => ({ ...prev, files: [...prev.files, ...validFiles] }));
      }
    },
    [validateFile]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        addFiles(e.dataTransfer.files);
      }
    },
    [addFiles]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        addFiles(e.target.files);
      }
      e.target.value = '';
    },
    [addFiles]
  );

  const removeFile = useCallback((index: number) => {
    setFormData((prev) => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index)
    }));
  }, []);

  const clearFile = useCallback(() => {
    setFormData((prev) => ({ ...prev, files: [] }));
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent, isDraft = false) => {
      e?.preventDefault();
      setUploadError('');
      const userId = await getUserId();
      if (!userId || !user) {
        setUploadError('You must be logged in to upload.');
        return;
      }
      if (formData.files.length === 0) {
        setUploadError('Please select at least one file to upload.');
        return;
      }

      setIsUploading(true);
      try {
        let createdDocs;
        if (formData.trackingId) {
          // UPDATE MODE
          // 1. Update metadata for all existing documents in this batch
          const { error: updateErr } = await supabase
            .from('documents')
            .update({
              title: formData.title.trim(),
              description: formData.description.trim(),
              category: formData.category || 'Other',
              status: isDraft ? 'draft' : 'sent',
              recipients: formData.recipients,
              updated_at: new Date().toISOString(),
            })
            .eq('tracking_id', formData.trackingId);
          if (updateErr) throw updateErr;

          // 2. Upload any NEW files with the same trackingId
          if (formData.files.length > 0) {
            await documentService.createDocuments({
              userId,
              ownerName: user.name,
              title: formData.title.trim(),
              description: formData.description.trim(),
              category: formData.category || 'Other',
              status: isDraft ? 'draft' : 'sent',
              recipients: formData.recipients,
              files: formData.files,
              trackingId: formData.trackingId,
            });
          }

          // We don't have a single "id" for a batch, but we can use the first existing file's ID for the notification link
          const existing = await documentService.fetchDocumentsByTrackingId(formData.trackingId);
          createdDocs = existing;
        } else {
          // CREATE MODE
          createdDocs = await documentService.createDocuments({
            userId,
            ownerName: user.name,
            title: formData.title.trim(),
            description: formData.description.trim(),
            category: formData.category || 'Other',
            status: isDraft ? 'draft' : 'sent',
            recipients: formData.recipients,
            files: formData.files,
          });
        }

        if (!isDraft) {
          setIsSending(true);
          await new Promise(resolve => setTimeout(resolve, 800));
        }

        await notificationService.createNotification({
          userId,
          title: isDraft ? 'Draft Updated' : 'Documents Sent',
          message: isDraft
            ? `"${formData.title}" has been updated.`
            : `"${formData.title}" has been sent to ${formData.recipients.length} recipients.`,
          type: 'success',
          link: `/documents/${createdDocs[0].id}`,
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
        setIsSending(false);
      }
    },
    [formData, user, getUserId, refreshDocuments, refreshNotifications, navigate]
  );

  const loadDraft = useCallback(async (documentId: string) => {
    try {
      const { data: doc, error } = await supabase
        .from('documents')
        .select('*')
        .eq('id', documentId)
        .single();
      if (error) throw error;
      if (doc) {
        // Load the whole batch
        const batch = await documentService.fetchDocumentsByTrackingId(doc.tracking_id);
        setFormData({
          title: doc.title,
          description: doc.description || '',
          category: doc.category,
          status: 'draft',
          files: [],
          existingFiles: batch.map(d => ({
            id: d.id,
            title: d.title,
            fileSize: d.fileSize,
            fileType: d.fileType
          })),
          recipients: doc.recipients || [],
          trackingId: doc.tracking_id,
        });
      }
    } catch (err) {
      console.error('Failed to load draft', err);
      setUploadError('Failed to load draft document.');
    }
  }, []);

  const removeExistingFile = useCallback(async (fileId: string) => {
    try {
      await documentService.deleteDocument(fileId);
      setFormData(prev => ({
        ...prev,
        existingFiles: prev.existingFiles.filter(f => f.id !== fileId)
      }));
    } catch (err) {
      console.error('Failed to remove attachment', err);
    }
  }, []);

  return {
    formData,
    setFormData,
    dragActive,
    submitted,
    uploadError,
    isUploading,
    isSending,
    handleDrag,
    handleDrop,
    handleFileChange,
    removeFile,
    clearFile,
    handleSubmit,
    categories,
    loadCategories,
    loadDraft,
    removeExistingFile,
    discardDraft: useCallback(async (trackingId: string) => {
      setIsUploading(true);
      try {
        const batch = await documentService.fetchDocumentsByTrackingId(trackingId);
        for (const doc of batch) {
          await documentService.deleteDocument(doc.id);
        }
        await refreshDocuments();
        navigate('/documents');
      } catch (err) {
        setUploadError('Failed to discard draft.');
      } finally {
        setIsUploading(false);
      }
    }, [navigate, refreshDocuments]),
  };
}
