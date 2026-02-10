import { Link, useLocation } from 'react-router';
import { FileText, RotateCcw } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { documentMatchesSearch } from '../lib/search';
import { DocumentSourceBadge } from './document-source-badge';

export function Archived() {
  const location = useLocation();
  const { documents, searchQuery, currentUserId, teams } = useApp();
  const archivedDocuments = documents
    .filter((d) => d.status === 'archived')
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

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold" style={textStyle}>Archived Documents</h1>
        <p className="mt-1" style={mutedStyle}>Documents that have been archived</p>
      </div>

      <div className="rounded-xl border" style={cardStyle}>
        <div className="px-6 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center justify-between">
            <p className="text-sm" style={mutedStyle}>
              You have <span className="font-medium" style={textStyle}>{archivedDocuments.length}</span> archived documents
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b" style={mutedBgStyle}>
              <tr>
                {['Document Name', 'Category', 'Tracking ID', 'Archived Date', 'Owner', 'Actions'].map((label) => (
                  <th key={label} className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={mutedStyle}>
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: 'var(--border)' }}>
              {archivedDocuments.map((doc) => (
                <tr key={doc.id} className="transition-colors hover:opacity-90" style={{ backgroundColor: 'var(--card)' }}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 ${getFileIconBg(doc.fileType)} rounded-lg opacity-60`}>
                        {getFileIcon(doc.fileType)}
                      </div>
                      <div className="min-w-0 text-left">
                        <Link
                          to={`/documents/${doc.id}`}
                          state={{ from: location.pathname }}
                          className="text-sm font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors block truncate"
                          style={textStyle}
                          title={doc.title}
                        >
                          {doc.title}
                        </Link>
                        <div className="mt-1 flex flex-wrap items-center gap-1.5 justify-start">
                          <DocumentSourceBadge document={doc} currentUserId={currentUserId} teams={teams} />
                        </div>
                        <p className="text-xs m-0 mt-0.5 text-left" style={mutedStyle}>
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
                      <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
                        {getInitials(doc.ownerName)}
                      </div>
                      <span className="text-sm" style={textStyle}>{doc.ownerName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 hover:opacity-80 rounded-lg transition-colors">
                      <RotateCcw className="size-3" />
                      Restore
                    </button>
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
