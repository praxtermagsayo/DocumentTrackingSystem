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
  existingFiles: Array<{ id: string; name: string; size: string; type: string; path: string }>;
  recipients: { email: string; name: string; departmentId?: string; departmentName?: string }[];
  documentId?: string;
}

import { fetchUsersWithDepartments, fetchDepartments, UserProfileWithDepartment } from '../services/departments';
import { Department } from '../types';

const initialFormData: UploadFormData = {
  title: '',
  description: '',
  category: '',
  status: 'forwarded',
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
  const [availableUsers, setAvailableUsers] = useState<UserProfileWithDepartment[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);

  // Fetch dynamic categories, users, and departments
  const loadCategories = useCallback(async () => {
    try {
      const [cats, usersList, deptsList] = await Promise.all([
        docCategoryService.fetchDocumentCategories(),
        fetchUsersWithDepartments(),
        fetchDepartments()
      ]);
      setCategories(cats);
      setAvailableUsers(usersList);
      setDepartments(deptsList);
      if (cats.length > 0 && !formData.category) {
        setFormData(prev => ({ ...prev, category: cats[0].name }));
      }
    } catch (err) {
      console.error('Failed to load initial data', err);
    }
  }, [formData.category]);

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
        let createdDocId = '';
        if (formData.documentId) {
          // UPDATE MODE
          // 1. If there are NEW files, we need to upload them and get their JSON objects
          const newUploadedFiles = [];
          if (formData.files.length > 0) {
            for (const file of formData.files) {
              const fileId = crypto.randomUUID();
              const ext = file.name.split('.').pop() || 'bin';
              const file_path = `${userId}/${formData.documentId}/${fileId}.${ext}`;
              const { error: uploadError } = await supabase.storage.from('documents').upload(file_path, file, { upsert: false });
              if (uploadError) throw new Error(`Failed to upload ${file.name}`);

              newUploadedFiles.push({
                id: fileId,
                name: file.name,
                path: file_path,
                size: (file.size < 1024 * 1024) ? (file.size / 1024).toFixed(1) + ' KB' : (file.size / (1024 * 1024)).toFixed(1) + ' MB',
                type: ext.toUpperCase(),
              });
            }
          }

          // 2. Merge existing files (that weren't removed) with the newly uploaded files
          const finalFilesArray = [...formData.existingFiles, ...newUploadedFiles];

          const { error: updateErr } = await supabase
            .from('documents')
            .update({
              title: formData.title.trim(),
              description: formData.description.trim(),
              category: formData.category || 'Other',
              status: isDraft ? 'draft' : 'forwarded',
              recipients: formData.recipients.map(r => r.email),
              files: finalFilesArray,
              updated_at: new Date().toISOString(),
            })
            .eq('id', formData.documentId);
          if (updateErr) throw updateErr;

          createdDocId = formData.documentId;
        } else {
          // CREATE MODE
          const createdDoc = await documentService.createDocuments({
            userId,
            ownerName: user.name,
            ownerEmail: user.email,
            title: formData.title.trim(),
            description: formData.description.trim(),
            category: formData.category || 'Other',
            status: isDraft ? 'draft' : 'forwarded',
            recipients: formData.recipients.map(r => r.email),
            routingSteps: formData.recipients, // New field for routing steps
            files: formData.files,
          });
          createdDocId = createdDoc.id;
        }

        if (!isDraft) {
          setIsSending(true);
          await new Promise(resolve => setTimeout(resolve, 800));
        }

        if (isDraft) {
          await notificationService.createNotification({
            userId,
            title: 'Draft Updated',
            message: `"${formData.title}" has been updated.`,
            type: 'success',
            link: `/documents/${createdDocId}`,
          });
        } else if (formData.recipients.length > 0) {
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id, email')
            .in('email', formData.recipients);

          if (profiles && profiles.length > 0) {
            for (const profile of profiles) {
              await notificationService.createNotification({
                userId: profile.id,
                title: 'Document Uploaded',
                message: `"${formData.title}" has been uploaded by ${user.name || 'User'}.`,
                type: 'info',
                link: `/documents/${createdDocId}`,
              });
            }
          }
        }

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
        setFormData({
          title: doc.title,
          description: doc.description || '',
          category: doc.category,
          status: 'forwarded',
          files: [],
          existingFiles: Array.isArray(doc.files) ? doc.files.map((f: any) => ({
            id: f.id,
            name: f.name,
            size: f.size,
            type: f.type,
            path: f.path
          })) : [],
          recipients: Array.isArray(doc.recipients) ? doc.recipients.map((email: string) => ({ email, name: email })) : [],
          documentId: doc.id,
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

  const addRecipient = useCallback(
    (userToAdd: { email: string; display_name: string; department_id?: string; department_name?: string }) => {
      if (!userToAdd.email) return;

      setFormData((prev) => {
        // Prevent duplicate recipients
        if (prev.recipients.some(r => r.email === userToAdd.email)) {
          return prev;
        }

        return {
          ...prev,
          recipients: [
            ...prev.recipients,
            {
              email: userToAdd.email,
              name: userToAdd.display_name,
              departmentId: userToAdd.department_id,
              departmentName: userToAdd.department_name
            }
          ]
        };
      });
    },
    []
  );

  const removeRecipient = useCallback((index: number) => {
    setFormData((prev) => ({
      ...prev,
      recipients: prev.recipients.filter((_, i) => i !== index)
    }));
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
    addRecipient,
    removeRecipient,
    handleSubmit,
    categories,
    availableUsers,
    loadCategories,
    loadDraft,
    removeExistingFile,
    departments,
    discardDraft: useCallback(async (documentId: string) => {
      setIsUploading(true);
      try {
        await documentService.deleteDocument(documentId);
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
