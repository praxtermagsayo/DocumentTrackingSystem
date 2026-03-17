import { useParams, useNavigate, useLocation } from 'react-router';
import { DocumentStatus, type DocumentAcknowledgement } from '../types';
import {
  ArrowLeft,
  FileText,
  Calendar,
  User,
  Tag,
  HardDrive,
  Clock,
  Download,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Forward,
  FileDown,
  MessageSquare,
  Loader2,
  Paperclip,
  ExternalLink,
  CheckCircle2,
  Plus,
  X,
  Search,
  Users,
  Mail,
  ChevronDown,
  History,
} from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { useApp } from '../contexts/AppContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { useDocumentDetail } from '../hooks/useDocumentDetail';
import { formatDate, getStatusColor, getStatusLabel } from '../lib/format';
import {
  getFileUrl,
  fetchAcknowledgements,
  acknowledgeDocument,
  updateDocumentRecipients,
  recordDocumentView,
} from '../services/documents';
import * as notificationService from '../services/notifications';
import { FullScreenLoader } from './ui/full-screen-loader';
import { UserAvatar } from './ui/UserAvatar';
import { toast } from '../lib/toast';

export function DocumentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { updateDocumentStatus, deleteDocument, addComment, documents, currentUserId, refreshDocuments, user: useApp_user } = useApp();
  const document = documents.find((d) => d.id === id);
  const files = document?.files || [];

  const handleOpenFile = async (filePath?: string) => {
    if (!filePath) {
      toast.info('No file available to view');
      return;
    }
    const url = await getFileUrl(filePath);
    if (url) {
      window.open(url, '_blank');
    } else {
      toast.error('Could not load file. The storage bucket may not exist yet.');
    }
  };

  const {
    history,
    loadHistory,
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
  } = useDocumentDetail(id, documents, updateDocumentStatus, deleteDocument, addComment);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [documentAcknowledgements, setDocumentAcknowledgements] = useState<DocumentAcknowledgement[]>([]);
  const [isAckLoading, setIsAckLoading] = useState(false);
  const [isApproveLoading, setIsApproveLoading] = useState(false);

  const PRESIDENCY_DEPT_NAME = "Office of the President";
  const [presidencyDeptId, setPresidencyDeptId] = useState<string | null>(null);

  const [sharedEmails, setSharedEmails] = useState<string[]>(document?.recipients ?? []);
  const [newRecipientEmail, setNewRecipientEmail] = useState('');
  const [isSavingRecipients, setIsSavingRecipients] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);
  const [selDeptId, setSelDeptId] = useState('');
  const [selUserEmail, setSelUserEmail] = useState('');

  // Routing action modal state
  const [routingModal, setRoutingModal] = useState<{ action: 'approve' | 'reject' | 'return', stepId: string } | null>(null);
  const [routingComment, setRoutingComment] = useState('');

  // Confirmation dialogs
  const [showAckConfirm, setShowAckConfirm] = useState(false);
  const [showApproveConfirm, setShowApproveConfirm] = useState(false);
  const [currentUserDeptId, setCurrentUserDeptId] = useState<string | null>(null);

  // Forwarding searchable selector state
  const [searchTerm, setSearchTerm] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [forwardComment, setForwardComment] = useState('');
  const [selectedRecipients, setSelectedRecipients] = useState<any[]>([]);

  const isOwner = Boolean(currentUserId && document?.ownerId && document.ownerId === currentUserId);
  const isAcknowledgedByMe = documentAcknowledgements.some(a => a.userId === currentUserId) || 
    history.some(h => h.status === 'acknowledged' && (h.updatedBy === useApp_user?.name || h.comment?.includes(useApp_user?.name || '')));
  
  const isCurrentHandler = routingSteps.some(
    (step, index) =>
      step.status === 'pending' &&
      step.receiver_user_id === currentUserId &&
      (!routingSteps[index - 1] || routingSteps[index - 1].status === 'approved' || routingSteps[index - 1].status === 'forwarded')
  );

  const lastReturnedStep = [...routingSteps].reverse().find(s => s.status === 'returned');
  const canResend = document?.status === 'returned' && lastReturnedStep?.sender_user_id === currentUserId;

  // Document can't be forwarded if it's not yet acknowledged (unless owner or Presidency user)
  const isPresidencyUser = currentUserDeptId === presidencyDeptId;
  const canForward = isOwner || isPresidencyUser || (isAcknowledgedByMe && isCurrentHandler) || (isAcknowledgedByMe && !isCurrentHandler && canResend);
  // Actually, let's simplify: 
  const mustAcknowledgeFirst = !isOwner && !isAcknowledgedByMe && !isPresidencyUser;
  const showForwardButton = isOwner || isPresidencyUser || (isAcknowledgedByMe && (isCurrentHandler || canForward || canResend));

  useEffect(() => {
    import('../services/departments').then(m => {
      m.fetchDepartments().then(depts => {
          const op = depts.find(d => d.name === PRESIDENCY_DEPT_NAME || d.code === 'OP');
          if (op) setPresidencyDeptId(op.id);
      });
      m.fetchUsersWithDepartments().then(users => {
          setAvailableUsers(users);
          const me = users.find(u => u.id === currentUserId);
          if (me) setCurrentUserDeptId(me.department_id);
      });
    });
  }, [currentUserId]);




  const filteredResults = availableUsers.filter(u =>
    u.department_id &&
    (!selDeptId || u.department_id === selDeptId) &&
    (u.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const fetchAcks = useCallback(async () => {
    if (!id) return;
    try {
      const acks = await fetchAcknowledgements([id]);
      setDocumentAcknowledgements(acks);
    } catch (err) {
      console.error('Failed to fetch acknowledgements', err);
    }
  }, [id]);

  useEffect(() => {
    fetchAcks();
  }, [fetchAcks]);

  const handleAcknowledgeDocument = async () => {
    if (!id || !currentUserId || !useApp_user || isAckLoading || !document) return;
    setShowAckConfirm(false);
    setIsAckLoading(true);
    try {
      await acknowledgeDocument(id, currentUserId, useApp_user.name);
      toast.success('Document acknowledged');
      await fetchAcks();

      // Notify owner
      if (document.ownerId && document.ownerId !== currentUserId) {
        notificationService.createNotification({
          userId: document.ownerId,
          title: 'Document Acknowledged',
          message: `${useApp_user.name} acknowledged "${document.title}"`,
          type: 'success',
          link: `/documents/${document.id}`,
        }).catch(() => { });
      }

      await refreshDocuments();
      loadHistory();
    } catch (err) {
      toast.error('Failed to acknowledge document');
    } finally {
      setIsAckLoading(false);
    }
  };

  const handleApproveDocument = async () => {
    if (!id || !currentUserId || !useApp_user || isApproveLoading || !document) return;
    const pendingStep = routingSteps.find(s => s.status === 'pending' && s.receiver_user_id === currentUserId);
    if (!pendingStep) return;

    setShowApproveConfirm(false);
    setIsApproveLoading(true);
    try {
      // Auto-acknowledge for OP if hasn't yet
      if (!isAcknowledgedByMe) {
        await acknowledgeDocument(id, currentUserId, useApp_user.name);
      }

      await handleRoutingAction(document, pendingStep.id, 'approve', useApp_user.name, currentUserId, 'Document approved and completed.');
      toast.success('Document approved successfully');
    } catch {
      toast.error('Failed to approve document');
    } finally {
      setIsApproveLoading(false);
    }
  };


  const addRecipient = () => {
    const email = newRecipientEmail.trim().toLowerCase();
    if (!email) return;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) { toast.error('Enter a valid email address'); return; }
    if (sharedEmails.includes(email)) { toast.error('Email already added'); return; }
    setSharedEmails((prev) => [...prev, email]);
    setNewRecipientEmail('');
  };

  const removeRecipient = (email: string) => {
    setSharedEmails((prev) => prev.filter((e) => e !== email));
  };

  const saveRecipients = async () => {
    if (!document) return;
    setIsSavingRecipients(true);
    try {
      await updateDocumentRecipients(document.id, sharedEmails);
      await refreshDocuments();
      setShowShareModal(false);
      toast.success('Recipients updated successfully.');
    } catch {
      toast.error('Failed to save recipients.');
    } finally {
      setIsSavingRecipients(false);
    }
  };

  const backPath = (location.state as { from?: string } | null)?.from ?? '/documents';

  const cardStyle = { backgroundColor: 'var(--card)', borderColor: 'var(--border)' };
  const textStyle = { color: 'var(--foreground)' };
  const mutedStyle = { color: 'var(--muted-foreground)' };
  const mutedBgStyle = { backgroundColor: 'var(--muted)' };
  const iconBgStyle = { backgroundColor: 'var(--muted)' };
  const inputStyle = {
    backgroundColor: 'var(--input-background)',
    borderColor: 'var(--border)',
    color: 'var(--foreground)',
  };

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
      if (!document) return;
      await handleUpdateStatus(document);
      toast.success('Status updated successfully');
    } catch {
      toast.error('Failed to update status');
    }
  };

  const onAddComment = async () => {
    try {
      if (!document) return;
      await handleAddComment(document);
      toast.success('Comment added successfully');
    } catch {
      toast.error('Failed to add comment');
    }
  };

  const onDownload = () => toast.success('Downloading document...');
  const onExportPDF = () => toast.success('Exporting to PDF...');

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
                  <User className="size-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-xs" style={mutedStyle}>Sent by</p>
                  <p className="mt-1 font-medium" style={textStyle}>{document.ownerName}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 p-2 rounded-lg" style={iconBgStyle}>
                  <Calendar className="size-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-xs" style={mutedStyle}>Created</p>
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
            </div>
          </div>

          {/* Attached Files */}
          <div className="rounded-lg shadow-sm border p-6" style={cardStyle}>
            <div className="flex items-center gap-2 mb-4">
              <Paperclip className="size-5 text-blue-600 dark:text-blue-400" />
              <h3 className="text-lg font-semibold" style={textStyle}>
                Attached Files
                {files.length > 1 && (
                  <span className="ml-2 text-sm font-normal" style={mutedStyle}>({files.length} files)</span>
                )}
              </h3>
            </div>
            <div className="grid gap-3 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 max-h-[400px] overflow-y-auto pr-2 fade-scroll">
              {files.map((file: any) => {
                const fileIconColor =
                  file.type === 'PDF' ? 'text-red-600' :
                    file.type === 'XLSX' ? 'text-green-600' :
                      (file.type === 'DOC' || file.type === 'DOCX') ? 'text-blue-600' :
                        file.type === 'IMG' ? 'text-purple-600' : 'text-slate-600';
                const fileIconBg =
                  file.type === 'PDF' ? 'bg-red-500/15' :
                    file.type === 'XLSX' ? 'bg-green-500/15' :
                      (file.type === 'DOC' || file.type === 'DOCX') ? 'bg-blue-500/15' :
                        file.type === 'IMG' ? 'bg-purple-500/15' : 'bg-slate-500/15';

                return (
                  <div
                    key={file.id}
                    className="rounded-lg border overflow-hidden transition-all hover:shadow-md group"
                    style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)' }}
                  >
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => handleOpenFile(file.path)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleOpenFile(file.path); }}
                      className="flex items-center gap-3 p-3 cursor-pointer"
                    >
                      <div className={`p-2 rounded-lg ${fileIconBg}`}>
                        <FileText className={`size-5 ${fileIconColor}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" style={textStyle} title={file.name}>
                          {file.name}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-xs" style={mutedStyle}>
                        <span className="px-2 py-0.5 rounded-md bg-black/5 dark:bg-white/5 font-semibold" style={textStyle}>
                          {file.type}
                        </span>
                        <span className="flex items-center gap-1">
                          <HardDrive className="size-3" />
                          {file.size}
                        </span>
                        <ExternalLink className="size-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-blue-600 dark:text-blue-400 ml-auto" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>


          {/* Document History & Workflow */}
          <div className="rounded-lg shadow-sm border p-6" style={cardStyle}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold" style={textStyle}>Document History</h3>
            </div>

            <div className="space-y-6">
              {/* Tracked routing steps - Shown as a separate progress section if needed, 
                  but for now we keep them at the top as "Routing Track" */}
              {routingSteps.length > 0 && (
                <div className="mb-6 pb-6 border-b border-slate-200 dark:border-slate-800">
                  <h3 className="text-xs font-bold uppercase tracking-wider mb-4 opacity-50 flex items-center gap-2">
                    <History className="size-3" />
                    Routing Track
                  </h3>
                  <div className="space-y-4">
                    {routingSteps.map((step, index) => {
                      const isCurrent = step.status === 'pending' && 
                        (!routingSteps[index - 1] || routingSteps[index - 1].status === 'approved' || routingSteps[index - 1].status === 'forwarded');
                      
                      return (
                        <div key={step.id} className="relative pl-8 pb-4 border-l-2 border-slate-200 dark:border-slate-800 last:pb-0">
                          <div className="flex justify-between items-start gap-4">
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold truncate" style={textStyle}>
                                {step.receiver_name}
                              </p>
                              <p className="text-[10px] opacity-60" style={mutedStyle}>
                                {step.receiver_department_name}
                              </p>
                              {step.comment && (
                                <div className="mt-2 p-2 rounded bg-black/5 dark:bg-white/5 border-l-2 border-blue-500/50">
                                  <p className="text-xs italic" style={textStyle}>&ldquo;{step.comment}&rdquo;</p>
                                </div>
                              )}
                            </div>

                            <div className="flex flex-col items-end gap-2 shrink-0">
                              <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded 
                                ${step.status === 'approved' || step.status === 'forwarded' ? 'bg-green-500/10 text-green-600' :
                                  step.status === 'rejected' ? 'bg-red-500/10 text-red-600' :
                                    step.status === 'returned' ? 'bg-orange-500/10 text-orange-600' :
                                      isCurrent ? 'bg-blue-500/10 text-blue-600' : 'bg-slate-500/10 text-slate-500'}`}
                              >
                                {step.status}
                              </span>
                              {step.action_at && (
                                <p className="text-[10px]" style={mutedStyle}>{formatDate(step.action_at)}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* General history logs (acknowledgments, create, etc.) */}
              <h3 className="text-xs font-bold uppercase tracking-wider mb-4 opacity-50 flex items-center gap-2">
                <History className="size-3" />
                History Log
              </h3>
              <div className="space-y-4">
                {history.map((h) => (
                  <div key={h.id} className="relative pl-10 pb-4 border-l-2 border-slate-200 dark:border-slate-800 last:pb-0">
                    <div className="absolute -left-[11px] top-0 w-5 h-5 rounded-full flex items-center justify-center border-2 bg-slate-100 dark:bg-slate-900 border-slate-300 dark:border-slate-700">
                      <History className="size-3 text-slate-500" />
                    </div>
                    <div className="p-3 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-slate-800">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <p className="text-sm font-medium" style={textStyle}>
                            {h.updatedBy} <span className="font-normal opacity-60" style={mutedStyle}>
                              {h.status === 'acknowledged' ? 'acknowledged the document' : 
                               h.status === 'forwarded' ? `forwarded: ${h.comment}` :
                               h.comment}
                            </span>
                          </p>
                          <p className="text-[10px] mt-1" style={mutedStyle}>{formatDate(h.timestamp)}</p>
                        </div>
                        <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded 
                          ${h.status === 'acknowledged' ? 'bg-green-500/10 text-green-600' : 'bg-slate-500/10 text-slate-500'}`}>
                          {h.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="rounded-lg shadow-sm border p-6 sticky top-8" style={cardStyle}>
            <h3 className="text-lg font-semibold mb-4" style={textStyle}>Quick Actions</h3>
            
            <div className="space-y-3">
              {isOwner && (
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => setShowShareModal(true)}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm flex items-center justify-center gap-2"
                  >
                    <Users className="size-4" />
                    Manage Participants
                  </button>

                  {document.status === 'returned' && (
                    <button
                      onClick={() => setShowShareModal(true)}
                      className="w-full px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium text-sm flex items-center justify-center gap-2"
                    >
                      <Forward className="size-4" />
                      Resubmit Document
                    </button>
                  )}
                </div>
              )}

              {!isOwner && !isAcknowledgedByMe && !isPresidencyUser && (
                <button
                  onClick={() => setShowAckConfirm(true)}
                  disabled={isAckLoading}
                  className="w-full px-4 py-2 bg-green-600/10 text-green-600 hover:bg-green-600 hover:text-white rounded-lg transition-all font-medium text-sm flex items-center justify-center gap-2 border border-green-600/20"
                >
                  {isAckLoading ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
                  Acknowledge Document
                </button>
              )}

              {/* Action buttons for Current Handler */}
              {!isOwner && isCurrentHandler && (
                <div className="flex flex-col gap-2">
                  {/* Approve button - only if not presidency user (who is the last one) */}
                  {/* Actually, presidency users approve to FINISH. Others forward. */}
                  {/* If user is in OP, they Approve to Complete. If not, they Forward. */}
                  
                  {currentUserDeptId === presidencyDeptId ? (
                    <button
                      onClick={() => setShowApproveConfirm(true)}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="size-4" />
                      Final Approval (Complete)
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          const isFirstStep = routingSteps.length === 0;
                          setForwardComment(isFirstStep ? "Initial routing step" : "Forwarded to next department");
                          setShowShareModal(true);
                        }}
                        disabled={!isAcknowledgedByMe}
                        className="w-full px-4 py-2 border rounded-lg transition-colors font-medium text-sm flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:text-slate-400"
                        style={{ 
                          backgroundColor: !isAcknowledgedByMe ? undefined : 'transparent',
                          borderColor: 'var(--border)',
                          color: !isAcknowledgedByMe ? undefined : 'var(--foreground)'
                        }}
                      >
                        <Forward className="size-4" />
                        Forward to Next
                      </button>
                    </>
                  )}

                  <button
                    onClick={() => {
                      const step = routingSteps.find(s => s.status === 'pending' && s.receiver_user_id === currentUserId);
                      if (step) {
                        setRoutingModal({ action: 'return', stepId: step.id });
                        setRoutingComment('');
                      }
                    }}
                    className="w-full px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium text-sm flex items-center justify-center gap-2"
                  >
                    <ArrowLeft className="size-4" />
                    Return Document
                  </button>
                </div>
              )}

              {/* Resend button for returned documents (non-owners) */}
              {!isOwner && canResend && isAcknowledgedByMe && (
                <button
                  onClick={() => setShowShareModal(true)}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm flex items-center justify-center gap-2"
                >
                  <Forward className="size-4" />
                  Resend Document
                </button>
              )}
              
              {!isOwner && isAcknowledgedByMe && !isCurrentHandler && !canResend && (
                <p className="text-xs text-center italic" style={mutedStyle}>
                  Document acknowledged. Pending action from next handler.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="uppercase tracking-widest text-center text-red-600 font-bold">
              {files.length > 1 ? `Delete all ${files.length} files?` : 'Delete document?'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="p-4 rounded-full bg-red-500/10 border border-red-500/20">
                <Trash2 className="size-8 text-red-600" />
              </div>
              <p className="text-sm font-medium leading-relaxed">
                {files.length > 1
                  ? `This action cannot be undone. All ${files.length} files in this upload will be permanently removed from the system.`
                  : `This action cannot be undone. The document "${document?.title || ''}" will be permanently removed from the system.`}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                disabled={isDeleting}
                onClick={onDelete}
                className="flex-1 py-3 text-white rounded-xl font-bold text-sm uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg shadow-red-500/20"
                style={{backgroundColor: '#d4183d'}}
                >
                {isDeleting && <Loader2 className="size-4 animate-spin" />}
                Delete Permanently
              </button>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="px-6 py-3 border rounded-xl text-sm font-bold uppercase tracking-widest transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <FullScreenLoader isOpen={isDeleting} message={files.length > 1 ? `Deleting ${files.length} files...` : 'Deleting Document...'} />

      <Dialog open={showStatusModal} onOpenChange={setShowStatusModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update Document Status</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={textStyle}>New Status</label>
              <Select value={selectedStatus} onValueChange={(v: DocumentStatus) => setSelectedStatus(v)}>
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
                  <SelectItem value="sent" className="focus:bg-[var(--accent)] focus:text-[var(--accent-foreground)] text-[var(--popover-foreground)]">
                    Sent
                  </SelectItem>
                  <SelectItem value="viewed" className="focus:bg-[var(--accent)] focus:text-[var(--accent-foreground)] text-[var(--popover-foreground)]">
                    Viewed
                  </SelectItem>
                  <SelectItem value="acknowledged" className="focus:bg-[var(--accent)] focus:text-[var(--accent-foreground)] text-[var(--popover-foreground)]">
                    Acknowledged
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
            <DialogTitle>{isOwner ? 'Manage Participants' : 'Forward Document'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {isOwner ? (
              <>
                <p className="text-sm" style={mutedStyle}>
                  Manage the initial list of recipients who will receive this document.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase mb-1.5 opacity-60" style={textStyle}>Filter By Department</label>
                    <select
                      value={selDeptId}
                      onChange={(e) => setSelDeptId(e.target.value)}
                      className="w-full text-sm px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-sans"
                      style={inputStyle}
                    >
                      <option value="">All Departments</option>
                      {Array.from(new Set(availableUsers.filter(u => u.department_id).map(u => JSON.stringify({ id: u.department_id, name: u.department_name }))))
                        .map(s => JSON.parse(s))
                        .map(dept => (
                          <option key={dept.id} value={dept.id}>{dept.name}</option>
                        ))
                      }
                    </select>
                  </div>

                  <div className="relative">
                    <label className="block text-[10px] font-bold uppercase mb-1.5 opacity-60" style={textStyle}>Add Recipient</label>
                    <div
                      className="flex items-center px-4 py-2.5 rounded-xl border focus-within:ring-2 focus-within:ring-blue-500 transition-all font-sans"
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

                    {showResults && (searchTerm || selDeptId) && (
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
                                  if (!sharedEmails.includes(u.email)) {
                                    setSharedEmails((prev) => [...prev, u.email]);
                                  } else {
                                    toast.error('Email already added');
                                  }
                                  setSearchTerm('');
                                  setShowResults(false);
                                }}
                                className="w-full text-left p-3.5 hover:bg-blue-600/10 transition-colors border-b last:border-0 flex items-center gap-3"
                                style={{ borderColor: 'var(--border)' }}
                              >
                                <div className="w-8 h-8 rounded-full bg-blue-600/10 flex items-center justify-center text-blue-600 font-bold text-xs font-sans">
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

                  {sharedEmails.length > 0 && (
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                      {sharedEmails.map((email) => (
                        <div
                          key={email}
                          className="flex items-center justify-between p-2 rounded-lg bg-[var(--muted)] border"
                          style={{ borderColor: 'var(--border)' }}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-blue-600/10 flex items-center justify-center text-blue-600 shadow-inner">
                              <Mail className="size-4" />
                            </div>
                            <div className="min-w-0">
                              <span className="text-xs font-semibold truncate max-w-[200px]" style={textStyle}>{email}</span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeRecipient(email)}
                            className="p-1 text-red-600 hover:bg-red-500/10 rounded-md transition-colors"
                          >
                            <X className="size-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={saveRecipients}
                      disabled={isSavingRecipients}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
                    >
                      {isSavingRecipients && <Loader2 className="size-4 animate-spin" />}
                      Save Recipients
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowShareModal(false)}
                      className="px-4 py-2 border rounded-lg"
                      style={{ ...cardStyle, color: 'var(--foreground)' }}
                    >
                      Cancel
                    </button>
                  </div>
              </>
            ) : (
              <>
                <p className="text-sm" style={mutedStyle}>
                  Select the next department or personnel to handle this document.
                </p>

                {presidencyDeptId && (
                  <button
                    onClick={async () => {
                      const president = availableUsers.find(u => u.department_id === presidencyDeptId);
                      if (!president) {
                        toast.error("No personnel found in the Office of the President.");
                        return;
                      }
                      
                      const currentStep = routingSteps.find(s => s.status === 'pending' && s.receiver_user_id === currentUserId);
                      setIsSavingRecipients(true);
                      try {
                        const finalForwardComment = forwardComment || "Forwarded to Office of the President";
                        await handleForward(
                          document,
                          {
                            id: president.id,
                            email: president.email,
                            name: president.display_name,
                            departmentId: presidencyDeptId
                          },
                          {
                            id: currentUserId!,
                            name: useApp_user?.name || ''
                          },
                          finalForwardComment
                        );
                        toast.success("Forwarded to Office of the President");
                        setShowShareModal(false);
                        setForwardComment('');
                        await refreshDocuments();
                      } catch (err) {
                        toast.error("Failed to forward document.");
                      } finally {
                        setIsSavingRecipients(false);
                      }
                    }}
                    disabled={isSavingRecipients || isForwarding}
                    className="w-full p-6 border-2 border-dashed border-blue-500/30 rounded-xl hover:bg-blue-500/5 hover:border-blue-500 transition-all group flex flex-col items-center gap-2"
                    onMouseEnter={() => {
                        if (!forwardComment || forwardComment === "Forwarded to next department" || forwardComment === "Initial routing step") {
                            setForwardComment("Forwarded to Office of the President");
                        }
                    }}
                  >
                    <CheckCircle2 className="size-8 text-blue-600 group-hover:scale-110 transition-transform" />
                    <span className="font-bold text-blue-700 dark:text-blue-400">Forward to Office of the President</span>
                    <p className="text-[10px] opacity-60">Immediate routing to the President's Office</p>
                  </button>
                )}

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase mb-1.5 opacity-60" style={textStyle}>Filter By Department</label>
                    <select
                      value={selDeptId}
                      onChange={(e) => setSelDeptId(e.target.value)}
                      className="w-full text-sm px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      style={inputStyle}
                    >
                      <option value="">All Departments</option>
                      {Array.from(new Set(availableUsers.filter(u => u.department_id).map(u => JSON.stringify({ id: u.department_id, name: u.department_name }))))
                        .map(s => JSON.parse(s))
                        .map(dept => (
                          <option key={dept.id} value={dept.id}>{dept.name}</option>
                        ))
                      }
                    </select>
                  </div>

                  <div className="relative">
                    <label className="block text-[10px] font-bold uppercase mb-1.5 opacity-60" style={textStyle}>Select Next Handler</label>
                    <div
                      className="flex items-center px-4 py-2.5 rounded-xl border focus-within:ring-2 focus-within:ring-blue-500 transition-all font-sans"
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

                    {showResults && (searchTerm || selDeptId) && (
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
                                  if (!selectedRecipients.find(r => r.id === u.id)) {
                                    setSelectedRecipients(prev => [...prev, u]);
                                  }
                                  setSearchTerm('');
                                  setShowResults(false);
                                }}
                                className="w-full text-left p-3.5 hover:bg-blue-600/10 transition-colors border-b last:border-0 flex items-center gap-3"
                                style={{ borderColor: 'var(--border)' }}
                              >
                                <div className="w-8 h-8 rounded-full bg-blue-600/10 flex items-center justify-center text-blue-600 font-bold text-xs font-sans">
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

                  {selectedRecipients.length > 0 && (
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                      {selectedRecipients.map((recipient) => (
                        <div key={recipient.id} className="p-3 rounded-xl border bg-[var(--muted)] flex items-center justify-between shadow-sm" style={{ borderColor: 'var(--border)' }}>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-blue-600/10 flex items-center justify-center text-blue-600 shadow-inner">
                              <Mail className="size-4" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-semibold truncate max-w-[150px]" style={textStyle}>{recipient.display_name}</p>
                              <p className="text-[10px] opacity-60 truncate max-w-[150px]" style={mutedStyle}>
                                {recipient.department_name}
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setSelectedRecipients(prev => prev.filter(r => r.id !== recipient.id))}
                            className="p-1.5 hover:bg-red-500/10 text-red-600 rounded-lg transition-all"
                            title="Remove"
                          >
                            <X className="size-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div>
                    <label className="block text-[10px] font-bold uppercase mb-1.5 opacity-60" style={textStyle}>Forwarding Comment</label>
                    <textarea
                      value={forwardComment}
                      onChange={(e) => setForwardComment(e.target.value)}
                      placeholder="Add a reason for forwarding..."
                      rows={3}
                      className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none bg-[var(--input-background)] text-sm"
                      style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={async () => {
                      if (selectedRecipients.length > 0 && document && useApp_user && currentUserId) {
                        for (const recipient of selectedRecipients) {
                          await handleForward(
                            document,
                            {
                              id: recipient.id,
                              email: recipient.email,
                              name: recipient.display_name,
                              departmentId: recipient.department_id
                            },
                            {
                              id: currentUserId,
                              name: useApp_user.name
                            },
                            forwardComment
                          );
                        }
                        setSelectedRecipients([]);
                        setForwardComment('');
                        toast.success("Document forwarded.");
                        setShowShareModal(false);
                      }
                    }}
                    disabled={selectedRecipients.length === 0 || isForwarding}
                    className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-bold text-sm uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isForwarding && <Loader2 className="size-4 animate-spin" />}
                    {isForwarding ? 'Forwarding...' : 'Confirm Forward'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowShareModal(false)}
                    disabled={isForwarding}
                    className="px-6 py-3 border rounded-xl transition-colors font-bold text-sm uppercase tracking-widest"
                    style={{ ...cardStyle, color: 'var(--foreground)' }}
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={!!routingModal} onOpenChange={(open) => !open && setRoutingModal(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="uppercase tracking-widest text-center">
              Confirm {routingModal?.action}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className={`p-4 rounded-lg border text-center ${routingModal?.action === 'approve' ? 'bg-green-500/10 border-green-500/20 text-green-700' :
              routingModal?.action === 'return' ? 'bg-orange-500/10 border-orange-500/20 text-orange-700' :
                'bg-red-500/10 border-red-500/20 text-red-700'
              }`}>
              <p className="text-sm font-semibold">
                Are you sure you want to <strong>{routingModal?.action}</strong> this document?
              </p>
              {routingModal?.action === 'approve' && <p className="text-xs mt-1 opacity-80">This will forward it to the next recipient in the chain.</p>}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={mutedStyle}>
                Add a comment (Optional)
              </label>
              <textarea
                value={routingComment}
                onChange={(e) => setRoutingComment(e.target.value)}
                placeholder={`Why are you ${routingModal?.action}ing this?`}
                rows={3}
                className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none bg-[var(--input-background)] text-sm"
                style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                disabled={isProcessingRouting}
                onClick={async () => {
                  if (routingModal && document && useApp_user && currentUserId) {
                    try {
                      await handleRoutingAction(document, routingModal.stepId, routingModal.action, useApp_user.name, currentUserId, routingComment);
                      setRoutingModal(null);
                      toast.success(`Document ${routingModal.action}d successfully`);
                    } catch (err) {
                      toast.error(`Failed to ${routingModal.action} document`);
                    }
                  }
                }}
                className={`flex-1 py-3 text-white rounded-xl font-bold text-sm uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 ${routingModal?.action === 'approve' ? 'bg-green-600 hover:bg-green-700' :
                  routingModal?.action === 'return' ? 'bg-orange-500 hover:bg-orange-600' :
                    'bg-red-600 hover:bg-red-700'
                  }`}
              >
                {isProcessingRouting && <Loader2 className="size-4 animate-spin" />}
                Confirm {routingModal?.action}
              </button>
              <button
                type="button"
                onClick={() => setRoutingModal(null)}
                className="px-6 py-3 border rounded-xl text-sm font-bold uppercase tracking-widest transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showAckConfirm} onOpenChange={setShowAckConfirm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="uppercase tracking-widest text-center">
              Confirm Acknowledgment
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="p-4 rounded-full bg-green-500/10 border border-green-500/20">
                <CheckCircle2 className="size-8 text-green-600" />
              </div>
              <p className="text-sm font-medium leading-relaxed">
                Are you sure you want to <strong>acknowledge</strong> this document? <br/>
                <span className="text-xs opacity-60">This will unlock further actions like forwarding and history updates.</span>
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                disabled={isAckLoading}
                onClick={handleAcknowledgeDocument}
                className="flex-1 py-3 text-white rounded-xl font-bold text-sm uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                style={{backgroundColor: '#52b71aff'}}
              >
                {isAckLoading && <Loader2 className="size-4 animate-spin" />}
                Confirm Acknowledge
              </button>
              <button
                type="button"
                onClick={() => setShowAckConfirm(false)}
                className="px-6 py-3 border rounded-xl text-sm font-bold uppercase tracking-widest transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showApproveConfirm} onOpenChange={setShowApproveConfirm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="uppercase tracking-widest text-center">
              Final Approval Confirmation
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="p-4 rounded-full bg-blue-500/10 border border-blue-500/20">
                <CheckCircle2 className="size-8 text-blue-600" />
              </div>
              <p className="text-sm font-medium leading-relaxed">
                You are providing the <strong>final approval</strong> for this document. <br/>
                <span className="text-xs opacity-60 text-red-500 font-semibold">This action is irreversible and will mark the workflow as Completed.</span>
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                disabled={isApproveLoading}
                onClick={handleApproveDocument}
                className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm uppercase tracking-widest transition-all hover:bg-blue-700 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
              >
                {isApproveLoading && <Loader2 className="size-4 animate-spin" />}
                Confirm Final Approval
              </button>
              <button
                type="button"
                onClick={() => setShowApproveConfirm(false)}
                className="px-6 py-3 border rounded-xl text-sm font-bold uppercase tracking-widest transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div >
  );
}
