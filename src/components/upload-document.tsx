import { Upload, FileText, X, CheckCircle, Mail, Plus, Trash2, Send, Save, Grid, Paperclip } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { useUploadDocument, ALLOWED_EXTENSIONS } from '../hooks/useUploadDocument';
import { formatFileSize } from '../lib/format';
import { supabase } from '../lib/supabase';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { toast } from 'sonner';

export function UploadDocument() {
  const navigate = useNavigate();
  const { user, refreshDocuments, refreshNotifications } = useApp();
  const getUserId = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.user?.id ?? null;
  }, []);

  const {
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
    discardDraft,
  } = useUploadDocument(user, refreshDocuments, refreshNotifications, getUserId);

  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');

  useEffect(() => {
    if (editId) {
      loadDraft(editId);
    }
  }, [editId, loadDraft]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const [recipientEmail, setRecipientEmail] = useState('');

  const addRecipient = () => {
    const email = recipientEmail.trim();
    if (!email) return;
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }
    if (formData.recipients.includes(email)) {
      toast.error('This email is already added');
      return;
    }
    setFormData({ ...formData, recipients: [...formData.recipients, email] });
    setRecipientEmail('');
  };

  const removeRecipient = (email: string) => {
    setFormData({ ...formData, recipients: formData.recipients.filter(r => r !== email) });
  };

  const accept = ALLOWED_EXTENSIONS.join(',');

  const cardStyle = { backgroundColor: 'var(--card)', borderColor: 'var(--border)' };
  const textStyle = { color: 'var(--foreground)' };
  const mutedStyle = { color: 'var(--muted-foreground)' };
  const inputStyle = { backgroundColor: 'var(--input-background)', color: 'var(--foreground)', borderColor: 'var(--border)' };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="rounded-lg shadow-sm border p-12 text-center" style={cardStyle}>
          <div className="mx-auto w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="size-8 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-2xl font-semibold mb-2" style={textStyle}>Document Uploaded Successfully!</h2>
          <p className="mb-6" style={mutedStyle}>Your document has been added to the tracking system.</p>
          <p className="text-sm" style={mutedStyle}>Redirecting to documents list...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold" style={textStyle}>
          {editId ? 'Edit Draft' : 'Upload Document'}
        </h2>
        <p className="mt-1" style={mutedStyle}>
          {editId ? 'Continue your drafted upload session' : 'Add a new document to the tracking system'}
        </p>
      </div>

      {uploadError && (
        <div className="mb-6 p-4 rounded-lg bg-red-500/20 border border-red-500/40 text-red-800 dark:text-red-300 text-sm">
          {uploadError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-lg shadow-sm border p-6" style={cardStyle}>
          <label className="block text-sm font-medium mb-3" style={textStyle}>
            Document File <span className="text-red-500">*</span>
          </label>
          <div
            className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${dragActive ? 'border-blue-500 bg-blue-500/15' : 'hover:opacity-90'
              }`}
            style={!dragActive ? { borderColor: 'var(--border)', backgroundColor: 'var(--muted)' } : undefined}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              id="file-upload"
              className="hidden"
              accept={accept}
              onChange={handleFileChange}
              multiple
              aria-required="true"
            />
            <div className="flex flex-col items-center">
              <Upload className="mx-auto size-12 mb-4" style={mutedStyle} />
              <p className="mb-1" style={textStyle}>
                <label htmlFor="file-upload" className="font-medium text-blue-600 dark:text-blue-400 cursor-pointer hover:underline">
                  Click to upload
                </label>{' '}
                or drag and drop
              </p>
              <p className="text-sm" style={mutedStyle}>PDF, DOC, DOCX, XLS, XLSX, images — max 10MB</p>
              {formData.files.length > 0 && (
                <p className="mt-2 text-sm font-medium text-blue-600 dark:text-blue-400">
                  {formData.files.length} file(s) selected
                </p>
              )}
            </div>
          </div>

          {(formData.files.length > 0 || formData.existingFiles.length > 0) && (
            <div className="mt-4 space-y-2">
              {/* Existing Attachments */}
              {formData.existingFiles.map((file) => (
                <div key={file.id} className="flex items-center gap-3 p-3 rounded-lg border bg-blue-500/5" style={{ borderColor: 'var(--border)' }}>
                  <Paperclip className="size-5 text-blue-500" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={textStyle}>{file.title}</p>
                    <p className="text-xs" style={mutedStyle}>{file.fileSize} • Attached</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeExistingFile(file.id)}
                    className="p-1 hover:text-red-500 transition-colors"
                    title="Remove attachment"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              ))}

              {/* New Files */}
              {formData.files.map((file, idx) => (
                <div key={`${file.name}-${idx}`} className="flex items-center gap-3 p-3 rounded-lg border bg-green-500/5 border-green-500/20">
                  <FileText className="size-5 text-green-500" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={textStyle}>{file.name}</p>
                    <p className="text-xs" style={mutedStyle}>{formatFileSize(file.size)} • New</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(idx)}
                    className="p-1 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={clearFile}
                className="text-xs text-red-500 hover:underline pl-1"
              >
                Clear new files
              </button>
            </div>
          )}
        </div>

        <div className="rounded-lg shadow-sm border p-6 space-y-4" style={cardStyle}>
          <h3 className="text-lg font-semibold" style={textStyle}>Document Information</h3>

          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-2" style={textStyle}>
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter document title"
              required
              style={inputStyle}
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-2" style={textStyle}>
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Enter document description"
              required
              style={inputStyle}
            />
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium mb-2" style={textStyle}>
              Category <span className="text-red-500">*</span>
            </label>
            <select
              id="category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full pl-4 pr-8 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
              required
              style={inputStyle}
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
            {categories.length === 0 && (
              <p className="mt-1 text-xs text-orange-500">
                No categories found. Please create one in the Activities/Events section first.
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={textStyle}>
              Send to (Recipients)
            </label>
            <div className="flex gap-2 mb-2">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-5" style={mutedStyle} />
                <input
                  type="email"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addRecipient())}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  style={inputStyle}
                />
              </div>
              <button
                type="button"
                onClick={addRecipient}
                className="px-3 py-2 bg-blue-600/10 text-blue-600 rounded-lg hover:bg-blue-600/20 transition-colors"
              >
                <Plus className="size-5" />
              </button>
            </div>

            {formData.recipients.length > 0 && (
              <div className="grid-flex gap-2 pt-1">
                {formData.recipients.map(email => (
                  <span key={email} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-600 text-xs font-medium border border-blue-500/20">
                    {email}
                    <button type="button" onClick={() => removeRecipient(email)} className="hover:text-red-500 transition-colors">
                      <X className="size-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

        </div>

        <div className="flex gap-3 justify-end items-center">
          {editId && (
            <button
              type="button"
              onClick={() => {
                if (confirm('Are you sure you want to discard this draft? This will delete all attached files in this session.')) {
                  discardDraft(formData.trackingId!);
                }
              }}
              disabled={isUploading}
              className="mr-auto px-4 py-2 text-sm text-red-600 hover:text-red-700 font-medium transition-colors"
            >
              Discard draft
            </button>
          )}

          <button
            type="button"
            onClick={(e) => handleSubmit(e, true)}
            disabled={isUploading}
            className="px-6 py-2 border rounded-lg transition-colors font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
          >
            <Save className="size-4" />
            Save as draft
          </button>
          <button
            type="submit"
            disabled={isUploading}
            className="min-h-[44px] min-w-[140px] px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation flex items-center justify-center gap-2"
          >
            {isUploading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {isSending ? 'Sending...' : 'Uploading...'}
              </>
            ) : (
              <>
                <Send className="size-4" />
                Upload & Send
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
