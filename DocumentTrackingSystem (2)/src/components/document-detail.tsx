import { useParams, Link, useNavigate } from 'react-router';
import { useState } from 'react';
import { mockDocuments, mockHistory } from '../data/mockData';
import { DocumentStatus } from '../types';
import {
  ArrowLeft,
  FileText,
  Calendar,
  User,
  Tag,
  FileType,
  HardDrive,
  Clock,
  Download,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Share2,
  FileDown,
  MessageSquare,
  X,
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { toast } from 'sonner@2.0.3';

export function DocumentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { updateDocumentStatus, deleteDocument, addComment, documents } = useApp();
  const document = documents.find((d) => d.id === id);
  const history = mockHistory[id || ''] || [];

  // Find current index for next/previous navigation
  const currentIndex = documents.findIndex((d) => d.id === id);
  const previousDoc = currentIndex > 0 ? documents[currentIndex - 1] : null;
  const nextDoc = currentIndex < documents.length - 1 ? documents[currentIndex + 1] : null;

  // Modal states
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  // Form states
  const [selectedStatus, setSelectedStatus] = useState<DocumentStatus>('draft');
  const [statusComment, setStatusComment] = useState('');
  const [comment, setComment] = useState('');
  const [shareEmails, setShareEmails] = useState('');
  const [sharePermission, setSharePermission] = useState('view');

  if (!document) {
    return (
      <div className="text-center py-12">
        <FileText className="mx-auto size-12 text-slate-400" />
        <h3 className="mt-4 text-lg font-medium text-slate-900">Document not found</h3>
        <p className="mt-2 text-sm text-slate-600">The document you're looking for doesn't exist</p>
        <Link
          to="/documents"
          className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          <ArrowLeft className="size-4" />
          Back to documents
        </Link>
      </div>
    );
  }

  const getStatusColor = (status: DocumentStatus) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'under-review':
        return 'bg-yellow-100 text-yellow-800';
      case 'draft':
        return 'bg-slate-100 text-slate-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'archived':
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: DocumentStatus) => {
    switch (status) {
      case 'under-review':
        return 'Under Review';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this document?')) {
      deleteDocument(document.id);
      toast.success('Document deleted successfully');
      navigate('/documents');
    }
  };

  const handleUpdateStatus = () => {
    updateDocumentStatus(document.id, selectedStatus, statusComment);
    setShowStatusModal(false);
    setStatusComment('');
    toast.success('Document status updated successfully');
  };

  const handleAddComment = () => {
    addComment(document.id, comment);
    setShowCommentModal(false);
    setComment('');
    toast.success('Comment added successfully');
  };

  const handleShare = () => {
    // Mock share functionality
    setShowShareModal(false);
    setShareEmails('');
    toast.success('Document shared successfully');
  };

  const handleDownload = () => {
    toast.success('Downloading document...');
    // In a real app, this would trigger a file download
  };

  const handleExportPDF = () => {
    toast.success('Exporting to PDF...');
    // In a real app, this would export the document as PDF
  };

  const handleEdit = () => {
    toast.info('Edit mode activated');
    // Navigate to edit mode or show edit modal
  };

  return (
    <div className="space-y-6">
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/documents"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="size-4" />
          Back to documents
        </Link>

        {/* Next/Previous buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => previousDoc && navigate(`/documents/${previousDoc.id}`)}
            disabled={!previousDoc}
            className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="size-4" />
            Previous
          </button>
          <button
            onClick={() => nextDoc && navigate(`/documents/${nextDoc.id}`)}
            disabled={!nextDoc}
            className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>

      {/* Document Header */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl font-semibold text-slate-900">{document.title}</h2>
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                  document.status
                )}`}
              >
                {getStatusLabel(document.status)}
              </span>
            </div>
            <p className="text-slate-600">{document.description}</p>
          </div>
          <div className="flex gap-2 ml-4">
            <button
              onClick={handleDownload}
              className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Download"
            >
              <Download className="size-5" />
            </button>
            <button
              onClick={handleEdit}
              className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Edit"
            >
              <Edit className="size-5" />
            </button>
            <button
              onClick={handleDelete}
              className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete"
            >
              <Trash2 className="size-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Document Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Information Card */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Document Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <div className="mt-1 p-2 bg-blue-50 rounded-lg">
                  <Tag className="size-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Category</p>
                  <p className="mt-1 font-medium text-slate-900">{document.category}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-1 p-2 bg-blue-50 rounded-lg">
                  <FileType className="size-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">File Type</p>
                  <p className="mt-1 font-medium text-slate-900">{document.fileType}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-1 p-2 bg-blue-50 rounded-lg">
                  <HardDrive className="size-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">File Size</p>
                  <p className="mt-1 font-medium text-slate-900">{document.fileSize}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-1 p-2 bg-blue-50 rounded-lg">
                  <User className="size-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Created By</p>
                  <p className="mt-1 font-medium text-slate-900">{document.createdBy}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-1 p-2 bg-blue-50 rounded-lg">
                  <Calendar className="size-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Created At</p>
                  <p className="mt-1 font-medium text-slate-900">
                    {formatDate(document.createdAt)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-1 p-2 bg-blue-50 rounded-lg">
                  <Clock className="size-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Last Updated</p>
                  <p className="mt-1 font-medium text-slate-900">
                    {formatDate(document.updatedAt)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Status History */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Status History</h3>
            {history.length === 0 ? (
              <p className="text-sm text-slate-600">No status history available</p>
            ) : (
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-200" />

                {/* History items */}
                <div className="space-y-6">
                  {history
                    .sort(
                      (a, b) =>
                        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
                    )
                    .map((item, index) => (
                      <div key={item.id} className="relative flex items-start gap-4 pl-10">
                        <div
                          className={`absolute left-0 p-2 rounded-full ${
                            index === 0 ? 'bg-blue-600' : 'bg-white border-2 border-slate-300'
                          }`}
                        >
                          <div className="size-2" />
                        </div>
                        <div className="flex-1 bg-slate-50 rounded-lg p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span
                                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                    item.status
                                  )}`}
                                >
                                  {getStatusLabel(item.status)}
                                </span>
                              </div>
                              <p className="text-sm text-slate-900">{item.comment}</p>
                              <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                                <User className="size-3" />
                                <span>{item.updatedBy}</span>
                              </div>
                            </div>
                            <div className="text-xs text-slate-500 whitespace-nowrap">
                              {formatDate(item.timestamp)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar - Quick Actions */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 sticky top-8">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button
                onClick={() => setShowStatusModal(true)}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
              >
                Update Status
              </button>
              <button
                onClick={() => setShowCommentModal(true)}
                className="w-full px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium text-sm flex items-center justify-center gap-2"
              >
                <MessageSquare className="size-4" />
                Add Comment
              </button>
              <button
                onClick={() => setShowShareModal(true)}
                className="w-full px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium text-sm flex items-center justify-center gap-2"
              >
                <Share2 className="size-4" />
                Share Document
              </button>
              <button
                onClick={handleExportPDF}
                className="w-full px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium text-sm flex items-center justify-center gap-2"
              >
                <FileDown className="size-4" />
                Export PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Status Update Modal */}
      <Dialog open={showStatusModal} onOpenChange={setShowStatusModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update Document Status</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                New Status
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as DocumentStatus)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="draft">Draft</option>
                <option value="under-review">Under Review</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Comment (optional)
              </label>
              <textarea
                value={statusComment}
                onChange={(e) => setStatusComment(e.target.value)}
                placeholder="Add a comment about this status change..."
                rows={3}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleUpdateStatus}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Update Status
              </button>
              <button
                onClick={() => setShowStatusModal(false)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Comment Modal */}
      <Dialog open={showCommentModal} onOpenChange={setShowCommentModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Comment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Your Comment
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Type your comment here..."
                rows={4}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleAddComment}
                disabled={!comment.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Comment
              </button>
              <button
                onClick={() => setShowCommentModal(false)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Share Document Modal */}
      <Dialog open={showShareModal} onOpenChange={setShowShareModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share Document</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email Addresses
              </label>
              <input
                type="text"
                value={shareEmails}
                onChange={(e) => setShareEmails(e.target.value)}
                placeholder="email1@example.com, email2@example.com"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="mt-1 text-xs text-slate-500">Separate multiple emails with commas</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Permission Level
              </label>
              <select
                value={sharePermission}
                onChange={(e) => setSharePermission(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="view">View only</option>
                <option value="comment">Can comment</option>
                <option value="edit">Can edit</option>
              </select>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleShare}
                disabled={!shareEmails.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Share
              </button>
              <button
                onClick={() => setShowShareModal(false)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
