import { useState } from 'react';
import { Link, useLocation } from 'react-router';
import { FileText, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { DocumentStatus } from '../types';
import { getStatusLabel } from '../lib/format';
import { useApp } from '../contexts/AppContext';
import { documentMatchesSearch } from '../lib/search';
import { DocumentSourceBadge } from './document-source-badge';

type StatusTab = 'all' | 'forwarded' | 'viewed' | 'acknowledged';

export function Sent() {
  const location = useLocation();
  const { documents, searchQuery, currentUserId } = useApp();
  const [activeTab, setActiveTab] = useState<StatusTab>('all');
  // Sent = all non-draft documents for this user, then filter by global search
  const sentDocuments = documents
    .filter((d) => documentMatchesSearch(d, searchQuery));
  const filteredDocuments = sentDocuments.filter((doc) => {
    if (activeTab === 'all') return true;
    return doc.status === activeTab;
  });
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

  const getStatusBadge = (status: DocumentStatus) => {
    switch (status) {
      case 'acknowledged':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-teal-500/20 text-teal-700 dark:text-teal-400">
            <CheckCircle className="size-3" />
            Acknowledged
          </span>
        );
      case 'viewed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-yellow-500/20 text-yellow-700 dark:text-yellow-400">
            <Clock className="size-3" />
            Viewed
          </span>
        );
      case 'forwarded':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-blue-500/20 text-blue-700 dark:text-blue-400">
            Forwarded
          </span>
        );
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold" style={textStyle}>Sent Documents</h1>
        <p className="mt-1" style={mutedStyle}>Documents you have sent to others</p>
      </div>

      <div className="rounded-xl border" style={cardStyle}>
        <div className="px-6 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              {(['all', 'forwarded', 'viewed', 'acknowledged'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${activeTab === tab ? 'bg-blue-600 text-white' : 'hover:opacity-90'
                    }`}
                  style={activeTab === tab ? undefined : { color: 'var(--foreground)' }}
                >
                  {tab === 'all' ? 'All' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
            <p className="text-sm" style={mutedStyle}>
              <span className="font-medium" style={textStyle}>{filteredDocuments.length}</span> documents
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b" style={mutedBgStyle}>
              <tr>
                {['Document Name', 'Category', 'Tracking ID', 'Sent Date', 'Status'].map((label) => (
                  <th key={label} className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={mutedStyle}>
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: 'var(--border)' }}>
              {filteredDocuments.map((doc) => (
                <tr key={doc.id} className="transition-colors hover:opacity-90" style={{ backgroundColor: 'var(--card)' }}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 ${doc.files?.length > 1 ? 'bg-blue-600/10' : getFileIconBg(doc.files?.[0]?.type || '')} rounded-lg relative`}>
                        {doc.files?.length > 1 ? (
                          <>
                            <FileText className="size-5 text-blue-600" />
                            <span className="absolute -bottom-1 -right-1 bg-blue-800 text-white text-[0.6rem] rounded-full px-1">
                              {doc.files.length}
                            </span>
                          </>
                        ) : (
                          getFileIcon(doc.files?.[0]?.type || '')
                        )}
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
                          <DocumentSourceBadge document={doc} currentUserId={currentUserId} />
                        </div>
                        <p className="text-xs m-0 mt-0.5 text-left" style={mutedStyle}>
                          {doc.files?.length > 1
                            ? (doc.files.length > 3
                              ? `${doc.files.slice(0, 3).map((f: any) => f.type).join(', ')} (+${doc.files.length - 3} more)`
                              : `${doc.files.map((f: any) => f.type).join(', ')}`)
                            : `${doc.files?.[0]?.type || 'Unknown'} • ${doc.files?.[0]?.size || '0 B'}`}
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
                    <span className="text-sm" style={mutedStyle}>#{doc.id.split('-')[0].toUpperCase()}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm" style={mutedStyle}>{formatDate(doc.createdAt)}</span>
                  </td>
                  <td className="px-6 py-4">{getStatusBadge(doc.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
