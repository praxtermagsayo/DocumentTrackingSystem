import { useCallback } from 'react';
import { useNavigate } from 'react-router';
import { Upload, FileText, X, CheckCircle } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { useUploadDocument, ALLOWED_EXTENSIONS } from '../hooks/useUploadDocument';
import { formatFileSize } from '../lib/format';
import { supabase } from '../lib/supabase';

export function UploadDocument() {
  const navigate = useNavigate();
  const { user, teams, refreshDocuments, refreshNotifications } = useApp();
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
    handleDrag,
    handleDrop,
    handleFileChange,
    clearFile,
    handleSubmit,
    categories,
  } = useUploadDocument(user, refreshDocuments, refreshNotifications, getUserId);

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
        <h2 className="text-2xl font-semibold" style={textStyle}>Upload Document</h2>
        <p className="mt-1" style={mutedStyle}>Add a new document to the tracking system</p>
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
            className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive ? 'border-blue-500 bg-blue-500/15' : 'hover:opacity-90'
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
              aria-required="true"
            />
            {formData.file ? (
              <div className="flex items-center justify-center gap-3">
                <FileText className="size-8 text-blue-600 dark:text-blue-400" />
                <div className="text-left">
                  <p className="font-medium" style={textStyle}>{formData.file.name}</p>
                  <p className="text-sm" style={mutedStyle}>{formatFileSize(formData.file.size)}</p>
                </div>
                <button
                  type="button"
                  onClick={clearFile}
                  className="ml-auto p-1 hover:opacity-80 transition-opacity"
                  style={mutedStyle}
                >
                  <X className="size-5" />
                </button>
              </div>
            ) : (
              <>
                <Upload className="mx-auto size-12 mb-4" style={mutedStyle} />
                <p className="mb-1" style={textStyle}>
                  <label htmlFor="file-upload" className="font-medium text-blue-600 dark:text-blue-400 cursor-pointer hover:underline">
                    Click to upload
                  </label>{' '}
                  or drag and drop
                </p>
                <p className="text-sm" style={mutedStyle}>PDF, DOC, DOCX, XLS, XLSX, images — max 10MB</p>
              </>
            )}
          </div>
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
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium mb-2" style={textStyle}>
              Initial Status <span className="text-red-500">*</span>
            </label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as typeof formData.status })}
              className="w-full pl-4 pr-8 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
              required
              style={inputStyle}
            >
              <option value="draft">Draft</option>
              <option value="under-review">Pending</option>
              <option value="approved">Approved</option>
            </select>
            <p className="mt-2 text-sm" style={mutedStyle}>
              Select the initial status for this document. You can change it later.
            </p>
          </div>

          {teams.length > 0 && (
            <div>
              <label htmlFor="team" className="block text-sm font-medium mb-2" style={textStyle}>
                Share with team
              </label>
              <select
                id="team"
                value={formData.teamId}
                onChange={(e) => setFormData({ ...formData, teamId: e.target.value })}
                className="w-full pl-4 pr-8 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                style={inputStyle}
              >
                <option value="">Only me</option>
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
              <p className="mt-2 text-sm" style={mutedStyle}>
                Select a team so its members can see this document. If you leave &quot;Only me&quot;, team members will not see it (you can change this later on the document page).
              </p>
            </div>
          )}
        </div>

        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={() => navigate('/documents')}
            disabled={isUploading}
            className="px-6 py-2 border rounded-lg transition-colors font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isUploading}
            className="min-h-[44px] min-w-[140px] px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
          >
            {isUploading ? 'Uploading...' : 'Upload Document'}
          </button>
        </div>
      </form>
    </div>
  );
}
