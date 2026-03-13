import { Upload, FileText, X, CheckCircle, Mail, Search, Trash2, Send, Save, Grid, Paperclip, Loader2, Users, ChevronDown, ChevronUp } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { useUploadDocument, ALLOWED_EXTENSIONS } from '../hooks/useUploadDocument';
import { formatFileSize } from '../lib/format';
import { supabase } from '../lib/supabase';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { toast } from '../lib/toast';
import { FullScreenLoader } from './ui/full-screen-loader';

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
    addRecipient,
    removeRecipient,
    handleSubmit,
    categories,
    availableUsers,
    departments,
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

  const [selectedDeptId, setSelectedDeptId] = useState('');
  const [selectedUserEmail, setSelectedUserEmail] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [showResults, setShowResults] = useState(false);

  const filteredResults = availableUsers.filter(u =>
    u.department_id &&
    (!selectedDeptId || u.department_id === selectedDeptId) &&
    (u.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
            <div className="mt-4 space-y-2 max-h-[300px] overflow-y-auto pr-2 fade-scroll">
              {/* Existing Attachments */}
              {formData.existingFiles.map((file) => (
                <div key={file.id} className="flex items-center gap-3 p-3 rounded-lg border bg-blue-500/5" style={{ borderColor: 'var(--border)' }}>
                  <Paperclip className="size-5 text-blue-500" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={textStyle}>{file.name}</p>
                    <p className="text-xs" style={mutedStyle}>{file.size} • Attached</p>
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
                No categories found. Please create one in the Document Categories screen first.
              </p>
            )}
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-medium" style={textStyle}>
              Send to (Initial Recipient)
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs mb-1.5 opacity-70" style={textStyle}>Filter By Department</label>
                <select
                  value={selectedDeptId}
                  onChange={(e) => {
                    setSelectedDeptId(e.target.value);
                  }}
                  className="w-full text-sm px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  style={inputStyle}
                >
                  <option value="">All Departments</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="relative">
                <label className="block text-xs mb-1.5 opacity-70" style={textStyle}>Select Recipient</label>
                <div
                  className="flex items-center px-4 py-2.5 rounded-xl border focus-within:ring-2 focus-within:ring-blue-500 transition-all"
                  style={inputStyle}
                >
                  <Search className="size-4 mr-2 opacity-50" />
                  <input
                    type="text"
                    placeholder="Search name or email..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setShowResults(true);
                    }}
                    onFocus={() => setShowResults(true)}
                    className="bg-transparent border-none outline-none flex-1 text-sm placeholder:opacity-50"
                  />
                  {searchTerm ? (
                    <button onClick={() => setSearchTerm('')} type="button" className="opacity-50 hover:opacity-100">
                      <X className="size-4" />
                    </button>
                  ) : <ChevronDown className="size-4 opacity-30" />}
                </div>

                {showResults && (searchTerm || selectedDeptId) && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowResults(false)} />
                    <div className="absolute z-50 w-full mt-2 max-h-60 overflow-y-auto rounded-xl border shadow-2xl bg-white dark:bg-slate-900 animate-in fade-in zoom-in-95 duration-200" style={{ borderColor: 'var(--border)' }}>
                      {filteredResults.length === 0 ? (
                        <div className="p-8 text-center" style={mutedStyle}>
                          <Users className="size-8 mx-auto mb-2 opacity-20" />
                          <p className="text-sm">No users found</p>
                        </div>
                      ) : (
                        filteredResults.map(u => (
                          <button
                            key={u.id}
                            type="button"
                            onClick={() => {
                              addRecipient({
                                email: u.email,
                                display_name: u.display_name,
                                department_id: u.department_id || undefined,
                                department_name: u.department_name
                              });
                              setSearchTerm('');
                              setShowResults(false);
                            }}
                            className="w-full text-left p-3.5 hover:bg-blue-600/10 transition-colors border-b last:border-0 flex items-center gap-3"
                            style={{ borderColor: 'var(--border)' }}
                          >
                            <div className="w-8 h-8 rounded-full bg-blue-600/10 flex items-center justify-center text-blue-600 font-bold text-xs">
                              {u.display_name?.charAt(0)}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold truncate" style={textStyle}>{u.display_name}</p>
                              <p className="text-[10px] opacity-60 truncate" style={mutedStyle}>{u.email} • {u.department_name}</p>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>

            {formData.recipients.length > 0 ? (
              <div className="mt-4 p-4 rounded-xl border bg-[var(--muted)] transition-all animate-in fade-in slide-in-from-top-2 flex items-center justify-between shadow-sm" style={{ borderColor: 'var(--border)' }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600/10 flex items-center justify-center text-blue-600 shadow-inner">
                    <Mail className="size-5" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider opacity-50 mb-0.5" style={textStyle}>Target Handler</label>
                    <p className="text-sm font-semibold" style={textStyle}>{formData.recipients[0].name}</p>
                    <p className="text-xs opacity-60" style={mutedStyle}>
                      {formData.recipients[0].departmentName} • {formData.recipients[0].email}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeRecipient()}
                  className="p-2.5 hover:bg-red-500/10 text-red-600 rounded-xl transition-all"
                  title="Remove Recipient"
                >
                  <Trash2 className="size-5" />
                </button>
              </div>
            ) : (
              <div className="py-8 text-center rounded-xl border-2 border-dashed" style={{ borderColor: 'var(--border)' }}>
                <Users className="size-8 mx-auto mb-2 opacity-20" style={textStyle} />
                <p className="text-sm" style={mutedStyle}>No recipient selected. Search above to define the initial route.</p>
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
                  discardDraft(formData.documentId!);
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
            className="min-h-[44px] min-w-[140px] px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-all font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
          >
            <Send className="size-4" />
            Upload & Send
          </button>
        </div>
      </form>
      <FullScreenLoader isOpen={isUploading} message={isSending ? 'Sending to recipients...' : 'Uploading secure document...'} />
    </div>
  );
}
