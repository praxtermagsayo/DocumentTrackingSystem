import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Upload, FileText, X, CheckCircle } from 'lucide-react';
import { DocumentStatus } from '../types';

export function UploadDocument() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    status: 'draft' as DocumentStatus,
    file: null as File | null,
  });
  const [dragActive, setDragActive] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const categories = [
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
  ];

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFormData({ ...formData, file: e.dataTransfer.files[0] });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, file: e.target.files[0] });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would upload the document
    setSubmitted(true);
    setTimeout(() => {
      navigate('/documents');
    }, 2000);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-12 text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="size-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-semibold text-slate-900 mb-2">Document Uploaded Successfully!</h2>
          <p className="text-slate-600 mb-6">Your document has been added to the tracking system.</p>
          <p className="text-sm text-slate-500">Redirecting to documents list...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-slate-900">Upload Document</h2>
        <p className="mt-1 text-slate-600">Add a new document to the tracking system</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* File Upload */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <label className="block text-sm font-medium text-slate-700 mb-3">
            Document File <span className="text-red-500">*</span>
          </label>
          <div
            className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive
                ? 'border-blue-500 bg-blue-50'
                : 'border-slate-300 hover:border-slate-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              id="file-upload"
              className="hidden"
              onChange={handleFileChange}
              required
            />
            {formData.file ? (
              <div className="flex items-center justify-center gap-3">
                <FileText className="size-8 text-blue-600" />
                <div className="text-left">
                  <p className="font-medium text-slate-900">{formData.file.name}</p>
                  <p className="text-sm text-slate-500">{formatFileSize(formData.file.size)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, file: null })}
                  className="ml-auto p-1 text-slate-400 hover:text-slate-600"
                >
                  <X className="size-5" />
                </button>
              </div>
            ) : (
              <>
                <Upload className="mx-auto size-12 text-slate-400 mb-4" />
                <p className="text-slate-700 mb-1">
                  <label htmlFor="file-upload" className="font-medium text-blue-600 cursor-pointer hover:text-blue-700">
                    Click to upload
                  </label>{' '}
                  or drag and drop
                </p>
                <p className="text-sm text-slate-500">PDF, DOCX, XLSX up to 10MB</p>
              </>
            )}
          </div>
        </div>

        {/* Document Information */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 space-y-4">
          <h3 className="text-lg font-semibold text-slate-900">Document Information</h3>

          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter document title"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Enter document description"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-slate-700 mb-2">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              id="category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
              required
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Initial Status */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-slate-700 mb-2">
              Initial Status <span className="text-red-500">*</span>
            </label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as DocumentStatus })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
              required
            >
              <option value="draft">Draft</option>
              <option value="under-review">Under Review</option>
              <option value="approved">Approved</option>
            </select>
            <p className="mt-2 text-sm text-slate-500">
              Select the initial status for this document. You can change it later.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={() => navigate('/documents')}
            className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Upload Document
          </button>
        </div>
      </form>
    </div>
  );
}
