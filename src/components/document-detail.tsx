import { useParams, useNavigate, useLocation } from 'react-router';
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
  Trash2,
  UserPlus,
  ChevronLeft,
  ChevronRight,
  Share2,
  FileDown,
  MessageSquare,
  Loader2,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { useDocumentDetail } from '../hooks/useDocumentDetail';
import { formatDate, getStatusColor, getStatusLabel } from '../lib/format';
import { toast } from 'sonner';

export function DocumentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { updateDocumentStatus, updateDocumentTeam, updateDocumentAssignment, deleteDocument, addComment, documents, teams, currentUserId, fetchTeamMembers } = useApp();
  const document = documents.find((d) => d.id === id);

  const {
    history,
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
  } = useDocumentDetail(id, documents, updateDocumentStatus, deleteDocument, addComment);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isUpdatingTeam, setIsUpdatingTeam] = useState(false);
  const [isUpdatingAssignment, setIsUpdatingAssignment] = useState(false);
  const [teamMembers, setTeamMembers] = useState<import('../types').TeamMember[]>([]);

  const backPath = (location.state as { from?: string } | null)?.from ?? '/documents';

  if (!document) {
    return (
      <div className="text-center py-12">
        <FileText className="mx-auto size-12" style={{ color: 'var(--muted-foreground)' }} />
        <h3 className="mt-4 text-lg font-medium" style={{ color: 'var(--foreground)' }}>Document not found</h3>
        <p className="mt-2 text-sm" style={{ color: 'var(--muted-foreground)' }}>The document you&apos;re looking for doesn&apos;t exist</p>
        <button
          type="button"
          onClick={() => navigate(backPath)}
          className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:opacity-80"
        >
          <ArrowLeft className="size-4" />
          Back
        </button>
      </div>
    );
  }

  const onDelete = async () => {
    setShowDeleteConfirm(false);
    try {
      await handleDelete(document);
      toast.success('Document deleted successfully');
      navigate(backPath);
    } catch {
      toast.error('Failed to delete document');
    }
  };

  const onUpdateStatus = async () => {
    try {
      await handleUpdateStatus(document);
      toast.success('Document status updated successfully');
    } catch {
      toast.error('Failed to update status');
    }
  };

  const onAddComment = async () => {
    try {
      await handleAddComment(document);
      toast.success('Comment added successfully');
    } catch {
      toast.error('Failed to add comment');
    }
  };

  const onShare = () => {
    setShowShareModal(false);
    setShareEmails('');
    toast.success('Document shared successfully');
  };

  const onDownload = () => toast.success('Downloading document...');
  const onExportPDF = () => toast.success('Exporting to PDF...');

  const cardStyle = { backgroundColor: 'var(--card)', borderColor: 'var(--border)' };
  const textStyle = { color: 'var(--foreground)' };
  const mutedStyle = { color: 'var(--muted-foreground)' };
  const mutedBgStyle = { backgroundColor: 'var(--muted)' };
  const iconBgStyle = { backgroundColor: 'var(--muted)' };

  const isOwner = Boolean(currentUserId && document.ownerId && document.ownerId === currentUserId);

  // Load team members when document is shared with a team (for Assign to dropdown)
  useEffect(() => {
    if (!document.teamId || !fetchTeamMembers) return;
    fetchTeamMembers(document.teamId).then(setTeamMembers).catch(() => setTeamMembers([]));
  }, [document.teamId, fetchTeamMembers]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate(backPath)}
          className="inline-flex items-center gap-2 text-sm font-medium hover:opacity-80 transition-opacity"
          style={mutedStyle}
        >
          <ArrowLeft className="size-4" />
          Back
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={() => previousDoc && navigate(`/documents/${previousDoc.id}`, { state: { from: backPath } })}
            disabled={!previousDoc}
            className="flex items-center gap-1 px-3 py-2 text-sm font-medium border rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ ...cardStyle, color: 'var(--foreground)' }}
          >
            <ChevronLeft className="size-4" />
            Previous
          </button>
          <button
            onClick={() => nextDoc && navigate(`/documents/${nextDoc.id}`, { state: { from: backPath } })}
            disabled={!nextDoc}
            className="flex items-center gap-1 px-3 py-2 text-sm font-medium border rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ ...cardStyle, color: 'var(--foreground)' }}
          >
            Next
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>

      <div className="rounded-lg shadow-sm border p-6" style={cardStyle}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl font-semibold" style={textStyle}>{document.title}</h2>
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(document.status)}`}
              >
                {getStatusLabel(document.status)}
              </span>
            </div>
            <p style={mutedStyle}>{document.description}</p>
          </div>
          <div className="flex gap-2 ml-4">
            <button
              onClick={onDownload}
              className="p-2 rounded-lg transition-colors hover:opacity-80"
              style={mutedStyle}
              title="Download"
            >
              <Download className="size-5" />
            </button>
            {isOwner && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="p-2 text-red-600 dark:text-red-400 rounded-lg transition-colors hover:opacity-80"
                title="Delete (owner only)"
              >
                <Trash2 className="size-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-lg shadow-sm border p-6" style={cardStyle}>
            <h3 className="text-lg font-semibold mb-4" style={textStyle}>Document Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <div className="mt-1 p-2 rounded-lg" style={iconBgStyle}>
                  <Tag className="size-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-xs" style={mutedStyle}>Category</p>
                  <p className="mt-1 font-medium" style={textStyle}>{document.category}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 p-2 rounded-lg" style={iconBgStyle}>
                  <FileType className="size-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-xs" style={mutedStyle}>File Type</p>
                  <p className="mt-1 font-medium" style={textStyle}>{document.fileType}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 p-2 rounded-lg" style={iconBgStyle}>
                  <HardDrive className="size-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-xs" style={mutedStyle}>File Size</p>
                  <p className="mt-1 font-medium" style={textStyle}>{document.fileSize}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 p-2 rounded-lg" style={iconBgStyle}>
                  <User className="size-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-xs" style={mutedStyle}>Created By</p>
                  <p className="mt-1 font-medium" style={textStyle}>{document.createdBy}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 p-2 rounded-lg" style={iconBgStyle}>
                  <Calendar className="size-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-xs" style={mutedStyle}>Created At</p>
                  <p className="mt-1 font-medium" style={textStyle}>{formatDate(document.createdAt)}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 p-2 rounded-lg" style={iconBgStyle}>
                  <Clock className="size-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-xs" style={mutedStyle}>Last Updated</p>
                  <p className="mt-1 font-medium" style={textStyle}>{formatDate(document.updatedAt)}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 p-2 rounded-lg" style={iconBgStyle}>
                  <UserPlus className="size-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-xs" style={mutedStyle}>Assigned to</p>
                  <p className="mt-1 font-medium" style={textStyle}>{document.assignedToName || 'Not assigned'}</p>
                </div>
              </div>
            </div>
          </div>

          {isOwner && document.teamId && teamMembers.length > 0 && (
            <div className="rounded-lg shadow-sm border p-6" style={cardStyle}>
              <h3 className="text-lg font-semibold mb-2" style={textStyle}>Assign to</h3>
              <p className="text-sm mb-3" style={mutedStyle}>
                Track responsibility by assigning this document to a team member.
              </p>
              <select
                value={document.assignedTo ?? ''}
                onChange={async (e) => {
                  const value = e.target.value;
                  const userId = value || null;
                  const member = teamMembers.find((m) => m.userId === value);
                  const name = member ? (member.displayName || member.email || 'Unknown') : null;
                  if (isUpdatingAssignment) return;
                  setIsUpdatingAssignment(true);
                  try {
                    await updateDocumentAssignment(document.id, userId, name);
                    toast.success(userId ? `Assigned to ${name}` : 'Unassigned');
                  } catch {
                    toast.error('Failed to update assignment');
                  } finally {
                    setIsUpdatingAssignment(false);
                  }
                }}
                disabled={isUpdatingAssignment}
                className="w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                style={{ backgroundColor: 'var(--input-background)', color: 'var(--foreground)', borderColor: 'var(--border)' }}
              >
                <option value="">Unassigned</option>
                {teamMembers.map((m) => (
                  <option key={m.id} value={m.userId}>{m.displayName || m.email || m.userId}</option>
                ))}
              </select>
            </div>
          )}

          {currentUserId && document.ownerId === currentUserId && teams.length > 0 && (
            <div className="rounded-lg shadow-sm border p-6" style={cardStyle}>
              <h3 className="text-lg font-semibold mb-2" style={textStyle}>Share with team</h3>
              <p className="text-sm mb-3" style={mutedStyle}>
                Team members can only see this document when it’s shared with a team. Choose a team so members can view it.
              </p>
              <select
                value={document.teamId ?? ''}
                onChange={async (e) => {
                  const teamId = e.target.value || null;
                  if (isUpdatingTeam) return;
                  setIsUpdatingTeam(true);
                  try {
                    await updateDocumentTeam(document.id, teamId);
                    toast.success(teamId ? 'Document shared with team' : 'Document is now only visible to you');
                  } catch {
                    toast.error('Failed to update sharing');
                  } finally {
                    setIsUpdatingTeam(false);
                  }
                }}
                disabled={isUpdatingTeam}
                className="w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                style={{ backgroundColor: 'var(--input-background)', color: 'var(--foreground)', borderColor: 'var(--border)' }}
              >
                <option value="">Only me</option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
          )}

          <div className="rounded-lg shadow-sm border p-6" style={cardStyle}>
            <h3 className="text-lg font-semibold mb-4" style={textStyle}>Status History</h3>
            {history.length === 0 ? (
              <p className="text-sm" style={mutedStyle}>No status history available</p>
            ) : (
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5" style={mutedBgStyle} />
                <div className="space-y-6">
                  {[...history]
                    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                    .map((item, index) => (
                      <div key={item.id} className="relative flex items-start gap-4 pl-10">
                        <div
                          className={`absolute left-0 p-2 rounded-full ${index === 0 ? 'bg-blue-600' : ''}`}
                          style={index === 0 ? undefined : { backgroundColor: 'var(--card)', border: '2px solid var(--border)' }}
                        >
                          <div className="size-2" />
                        </div>
                        <div className="flex-1 rounded-lg p-4" style={mutedBgStyle}>
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span
                                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}
                                >
                                  {getStatusLabel(item.status)}
                                </span>
                              </div>
                              <p className="text-sm" style={textStyle}>{item.comment}</p>
                              <div className="mt-2 flex items-center gap-2 text-xs" style={mutedStyle}>
                                <User className="size-3" />
                                <span>{item.updatedBy}</span>
                              </div>
                            </div>
                            <div className="text-xs whitespace-nowrap" style={mutedStyle}>
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

        <div className="lg:col-span-1">
          <div className="rounded-lg shadow-sm border p-6 sticky top-8" style={cardStyle}>
            <h3 className="text-lg font-semibold mb-4" style={textStyle}>Quick Actions</h3>
            {!isOwner && (
              <p className="text-sm mb-3" style={mutedStyle}>
                You can add comments. Only the document owner can update status, share, or delete.
              </p>
            )}
            <div className="space-y-3">
              {isOwner && (
                <button
                  onClick={() => setShowStatusModal(true)}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
                >
                  Update Status
                </button>
              )}
              <button
                onClick={() => setShowCommentModal(true)}
                className="w-full px-4 py-2 border rounded-lg transition-colors font-medium text-sm flex items-center justify-center gap-2"
                style={{ ...cardStyle, color: 'var(--foreground)' }}
              >
                <MessageSquare className="size-4" />
                Add Comment
              </button>
              {isOwner && (
                <button
                  onClick={() => setShowShareModal(true)}
                  className="w-full px-4 py-2 border rounded-lg transition-colors font-medium text-sm flex items-center justify-center gap-2"
                  style={{ ...cardStyle, color: 'var(--foreground)' }}
                >
                  <Share2 className="size-4" />
                  Share Document
                </button>
              )}
              <button
                onClick={onExportPDF}
                className="w-full px-4 py-2 border rounded-lg transition-colors font-medium text-sm flex items-center justify-center gap-2"
                style={{ ...cardStyle, color: 'var(--foreground)' }}
              >
                <FileDown className="size-4" />
                Export PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete document?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The document &quot;{document.title}&quot; will be permanently removed from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={onDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white focus:ring-red-600 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isDeleting && <Loader2 className="size-4 animate-spin" />}
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={showStatusModal} onOpenChange={setShowStatusModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update Document Status</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={textStyle}>New Status</label>
              <Select value={selectedStatus} onValueChange={(v) => setSelectedStatus(v as DocumentStatus)}>
                <SelectTrigger className="w-full h-10 rounded-lg border focus:ring-2 focus:ring-blue-500 bg-[var(--input-background)] [border-color:var(--border)] text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent
                  className="border"
                  style={{
                    backgroundColor: 'var(--popover)',
                    color: 'var(--popover-foreground)',
                    borderColor: 'var(--border)',
                  }}
                >
                  <SelectItem value="draft" className="focus:bg-[var(--accent)] focus:text-[var(--accent-foreground)] text-[var(--popover-foreground)]">
                    Draft
                  </SelectItem>
                  <SelectItem value="under-review" className="focus:bg-[var(--accent)] focus:text-[var(--accent-foreground)] text-[var(--popover-foreground)]">
                    Pending
                  </SelectItem>
                  <SelectItem value="approved" className="focus:bg-[var(--accent)] focus:text-[var(--accent-foreground)] text-[var(--popover-foreground)]">
                    Approved
                  </SelectItem>
                  <SelectItem value="rejected" className="focus:bg-[var(--accent)] focus:text-[var(--accent-foreground)] text-[var(--popover-foreground)]">
                    Rejected
                  </SelectItem>
                  <SelectItem value="archived" className="focus:bg-[var(--accent)] focus:text-[var(--accent-foreground)] text-[var(--popover-foreground)]">
                    Archived
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={textStyle}>Comment (optional)</label>
              <textarea
                value={statusComment}
                onChange={(e) => setStatusComment(e.target.value)}
                placeholder="Add a comment about this status change..."
                rows={3}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none bg-[var(--input-background)]"
                style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onUpdateStatus}
                disabled={isUpdatingStatus}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isUpdatingStatus && <Loader2 className="size-4 animate-spin" />}
                {isUpdatingStatus ? 'Updating...' : 'Update Status'}
              </button>
              <button
                type="button"
                onClick={() => setShowStatusModal(false)}
                disabled={isUpdatingStatus}
                className="px-4 py-2 border rounded-lg transition-colors disabled:opacity-50"
                style={{ ...cardStyle, color: 'var(--foreground)' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showCommentModal} onOpenChange={setShowCommentModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Comment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={textStyle}>Your Comment</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Type your comment here..."
                rows={4}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none bg-[var(--input-background)]"
                style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
              />
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onAddComment}
                disabled={!comment.trim() || isAddingComment}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isAddingComment && <Loader2 className="size-4 animate-spin" />}
                {isAddingComment ? 'Adding...' : 'Add Comment'}
              </button>
              <button
                type="button"
                onClick={() => setShowCommentModal(false)}
                disabled={isAddingComment}
                className="px-4 py-2 border rounded-lg transition-colors disabled:opacity-50"
                style={{ ...cardStyle, color: 'var(--foreground)' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showShareModal} onOpenChange={setShowShareModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share Document</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={textStyle}>Email Addresses</label>
              <input
                type="text"
                value={shareEmails}
                onChange={(e) => setShareEmails(e.target.value)}
                placeholder="email1@example.com, email2@example.com"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-[var(--input-background)]"
                style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
              />
              <p className="mt-1 text-xs" style={mutedStyle}>Separate multiple emails with commas</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={textStyle}>Permission Level</label>
              <Select value={sharePermission} onValueChange={setSharePermission}>
                <SelectTrigger className="w-full h-10 rounded-lg border focus:ring-2 focus:ring-blue-500 bg-[var(--input-background)] [border-color:var(--border)] text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent
                  className="border"
                  style={{
                    backgroundColor: 'var(--popover)',
                    color: 'var(--popover-foreground)',
                    borderColor: 'var(--border)',
                  }}
                >
                  <SelectItem value="view" className="focus:bg-[var(--accent)] focus:text-[var(--accent-foreground)] text-[var(--popover-foreground)]">
                    View only
                  </SelectItem>
                  <SelectItem value="comment" className="focus:bg-[var(--accent)] focus:text-[var(--accent-foreground)] text-[var(--popover-foreground)]">
                    Can comment
                  </SelectItem>
                  <SelectItem value="edit" className="focus:bg-[var(--accent)] focus:text-[var(--accent-foreground)] text-[var(--popover-foreground)]">
                    Can edit
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={onShare}
                disabled={!shareEmails.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Share
              </button>
              <button
                onClick={() => setShowShareModal(false)}
                className="px-4 py-2 border rounded-lg transition-colors"
                style={{ ...cardStyle, color: 'var(--foreground)' }}
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
