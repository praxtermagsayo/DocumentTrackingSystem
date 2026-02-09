import { Link, useLocation } from 'react-router';
import { FileText, Edit, Trash2 } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { documentMatchesSearch } from '../lib/search';
import { DocumentSourceBadge } from './document-source-badge';

export function Drafts() {
  const location = useLocation();
  const { documents, searchQuery, currentUserId, teams } = useApp();
  const draftDocuments = documents
    .filter((d) => d.status === 'draft')
    .filter((d) => documentMatchesSearch(d, searchQuery));
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
              You have <span className="font-medium" style={textStyle}>{draftDocuments.length}</span> draft documents
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
              {draftDocuments.map((doc) => (
                <tr key={doc.id} className="transition-colors hover:opacity-90" style={{ backgroundColor: 'var(--card)' }}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 ${getFileIconBg(doc.fileType)} rounded-lg`}>
                        {getFileIcon(doc.fileType)}
                      </div>
                      <div className="min-w-0">
                        <Link
                          to={`/documents/${doc.id}`}
                          state={{ from: location.pathname }}
                          className="text-sm font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors block truncate"
                          style={textStyle}
                          title={doc.title}
                        >
                          {doc.title}
                        </Link>
                        <div className="mt-1 flex flex-wrap items-center gap-1.5">
                          <DocumentSourceBadge document={doc} currentUserId={currentUserId} teams={teams} />
                        </div>
                        <p className="text-xs mt-0.5" style={mutedStyle}>
                          {doc.fileType} • {doc.fileSize}
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
                    <span className="text-sm" style={mutedStyle}>{doc.trackingId}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm" style={mutedStyle}>{formatDate(doc.updatedAt)}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button className="p-1.5 text-blue-600 dark:text-blue-400 hover:opacity-80 rounded transition-colors">
                        <Edit className="size-4" />
                      </button>
                      <button className="p-1.5 text-red-600 dark:text-red-400 hover:opacity-80 rounded transition-colors">
                        <Trash2 className="size-4" />
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
