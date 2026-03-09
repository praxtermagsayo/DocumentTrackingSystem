import { Link, useLocation } from 'react-router';
import { useMemo, useState } from 'react';
import { FileText, Edit, Trash2 } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { documentMatchesSearch } from '../lib/search';
import { DocumentSourceBadge } from './document-source-badge';
import * as documentService from '../services/documents';

export function Drafts() {
  const location = useLocation();
  const { documents, searchQuery, currentUserId, refreshDocuments } = useApp();
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const draftDocuments = documents
    .filter((d) => d.status === 'draft')
    .filter((d) => documentMatchesSearch(d, searchQuery));

  const groupedDrafts = useMemo(() => {
    const groups: Record<string, any> = {};
    draftDocuments.forEach(doc => {
      const tid = doc.trackingId;
      if (!groups[tid]) {
        groups[tid] = { ...doc, files: [doc] };
      } else {
        groups[tid].files.push(doc);
        if (new Date(doc.updatedAt) > new Date(groups[tid].updatedAt)) {
          groups[tid].updatedAt = doc.updatedAt;
        }
      }
    });
    return Object.values(groups).sort((a: any, b: any) =>
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }, [draftDocuments]);

  const handleDeleteDraft = async (trackingId: string) => {
    if (!confirm('Are you sure you want to delete this draft and all its attachments?')) return;
    setIsDeleting(trackingId);
    try {
      const batch = await documentService.fetchDocumentsByTrackingId(trackingId);
      for (const doc of batch) {
        await documentService.deleteDocument(doc.id);
      }
      await refreshDocuments();
    } catch (err) {
      console.error('Failed to delete draft', err);
      alert('Failed to delete draft.');
    } finally {
      setIsDeleting(null);
    }
  };
  const getFileIcon = (fileType: string) => {
    const iconClass = 'size-5';
    switch (fileType) {
      case 'PDF':
        return <FileText className={`${iconClass} text-red-600`} />;
      case 'XLSX':
        return <FileText className={`${iconClass} text-green-600`} />;
      case 'DOC':
      case 'DOCX':
        return <FileText className={`${iconClass} text-blue-600`} />;
      case 'IMG':
        return <FileText className={`${iconClass} text-purple-600`} />;
      default:
        return <FileText className={`${iconClass} text-slate-600`} />;
    }
  };

  const getFileIconBg = (fileType: string) => {
    switch (fileType) {
      case 'PDF': return 'bg-red-500/15';
      case 'XLSX': return 'bg-green-500/15';
      case 'DOC':
      case 'DOCX': return 'bg-blue-500/15';
      case 'IMG': return 'bg-purple-500/15';
      default: return 'bg-slate-500/15';
    }
  };

  const cardStyle = { backgroundColor: 'var(--card)', borderColor: 'var(--border)' };
  const textStyle = { color: 'var(--foreground)' };
  const mutedStyle = { color: 'var(--muted-foreground)' };
  const mutedBgStyle = { backgroundColor: 'var(--muted)' };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold" style={textStyle}>Draft Documents</h1>
        <p className="mt-1" style={mutedStyle}>Documents you're currently working on</p>
      </div>

      <div className="rounded-xl border" style={cardStyle}>
        <div className="px-6 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center justify-between">
            <p className="text-sm" style={mutedStyle}>
              You have <span className="font-medium" style={textStyle}>{groupedDrafts.length}</span> draft sessions
            </p>
            <Link
              to="/upload"
              className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:opacity-80"
            >
              Create New Draft
            </Link>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b" style={mutedBgStyle}>
              <tr>
                {['Document Name', 'Category', 'Tracking ID', 'Last Modified', 'Actions'].map((label) => (
                  <th key={label} className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={mutedStyle}>
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: 'var(--border)' }}>
              {groupedDrafts.map((doc: any) => (
                <tr key={doc.trackingId} className="transition-colors hover:opacity-90" style={{ backgroundColor: 'var(--card)' }}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 ${doc.files.length > 1 ? 'bg-blue-600/10' : getFileIconBg(doc.fileType)} rounded-lg relative`}>
                        {doc.files.length > 1 ? (
                          <div className="relative">
                            <FileText className="size-5 text-blue-600" />
                            <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-[10px] size-4 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900">
                              {doc.files.length}
                            </span>
                          </div>
                        ) : getFileIcon(doc.fileType)}
                      </div>
                      <div className="min-w-0 text-left">
                        <Link
                          to={`/upload?edit=${doc.id}`}
                          state={{ from: location.pathname }}
                          className="text-sm font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors block truncate"
                          style={textStyle}
                          title={doc.title}
                        >
                          {doc.title}
                          {doc.files.length > 1 && <span className="ml-2 text-xs font-normal opacity-60">({doc.files.length} files)</span>}
                        </Link>
                        <div className="mt-1 flex flex-wrap items-center gap-1.5 justify-start">
                          <DocumentSourceBadge document={doc} currentUserId={currentUserId} />
                        </div>
                        <p className="text-xs m-0 mt-0.5 text-left" style={mutedStyle}>
                          {doc.files.length > 1
                            ? `${doc.files.map((f: any) => f.fileType).join(', ')}`
                            : `${doc.fileType} • ${doc.fileSize}`}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium" style={mutedBgStyle}>
                      <span style={textStyle}>{doc.category}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-mono" style={mutedStyle}>{doc.trackingId}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm" style={mutedStyle}>{formatDate(doc.updatedAt)}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/upload?edit=${doc.id}`}
                        className="p-1.5 text-blue-600 dark:text-blue-400 hover:opacity-80 rounded transition-colors"
                      >
                        <Edit className="size-4" />
                      </Link>
                      <button
                        onClick={() => handleDeleteDraft(doc.trackingId)}
                        disabled={isDeleting === doc.trackingId}
                        className="p-1.5 text-red-600 dark:text-red-400 hover:opacity-80 rounded transition-colors disabled:opacity-50"
                      >
                        {isDeleting === doc.trackingId ? (
                          <div className="size-4 border-2 border-red-600/30 border-t-red-600 rounded-full animate-spin" />
                        ) : (
                          <Trash2 className="size-4" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
