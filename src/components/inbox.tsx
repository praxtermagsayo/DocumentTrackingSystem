import { Link, useLocation } from 'react-router';
import { useState, useEffect } from 'react';
import { FileText, Clock, CheckCircle, AlertTriangle, Search, X } from 'lucide-react';
import { DocumentStatus } from '../types';
import { getStatusLabel } from '../lib/format';
import { useApp } from '../contexts/AppContext';
import { documentMatchesSearch } from '../lib/search';
import { DocumentSourceBadge } from './document-source-badge';

type StatusTab = 'all' | 'pending' | 'signed' | 'rejected';

export function Inbox() {
  const location = useLocation();
  const { documents, searchQuery: globalSearch, setSearchQuery: setGlobalSearch, currentUserId, teams } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<StatusTab>('all');

  // Inbox = documents awaiting review (under-review), then filter by search
  const inboxDocuments = documents
    .filter((d) => d.status === 'under-review')
    .filter((doc) => documentMatchesSearch(doc, searchQuery));
  const filteredDocuments = inboxDocuments.filter((doc) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'pending') return doc.status === 'under-review';
    if (activeTab === 'signed') return doc.status === 'approved';
    if (activeTab === 'rejected') return doc.status === 'rejected';
    return true;
  });

  // Sync with global search
  useEffect(() => {
    if (globalSearch) {
      setSearchQuery(globalSearch);
    }
  }, [globalSearch]);

  // Clear global search when component unmounts
  useEffect(() => {
    return () => {
      setGlobalSearch('');
    };
  }, [setGlobalSearch]);

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
  const inputStyle = { backgroundColor: 'var(--input-background)', color: 'var(--foreground)', borderColor: 'var(--border)' };

  const getStatusBadge = (status: DocumentStatus) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-green-500/20 text-green-700 dark:text-green-400">
            <CheckCircle className="size-3" />
            Approved
          </span>
        );
      case 'under-review':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-yellow-500/20 text-yellow-700 dark:text-yellow-400">
            <Clock className="size-3" />
            Pending
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-red-500/20 text-red-700 dark:text-red-400">
            <AlertTriangle className="size-3" />
            Rejected
          </span>
        );
        default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium opacity-90" style={{ backgroundColor: 'var(--muted)', color: 'var(--foreground)' }}>
            {getStatusLabel(status)}
          </span>
        );
    }
  };

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
        <h1 className="text-2xl font-semibold" style={textStyle}>Inbox</h1>
        <p className="mt-1" style={mutedStyle}>Documents received and awaiting your review</p>
      </div>

      <div className="rounded-xl border" style={cardStyle}>
        <div className="px-6 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              {(['all', 'pending', 'signed', 'rejected'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === tab ? 'bg-blue-600 text-white' : 'hover:opacity-90'
                  }`}
                  style={activeTab === tab ? undefined : { color: 'var(--foreground)' }}
                >
                  {tab === 'all' ? 'All' : tab === 'signed' ? 'Signed' : tab === 'pending' ? 'Pending' : 'Rejected'}
                </button>
              ))}
            </div>
            <p className="text-sm" style={mutedStyle}>
              <span className="font-medium" style={textStyle}>{filteredDocuments.length}</span> in inbox
            </p>
            <div className="relative">
              <input
                type="text"
                className="pl-10 pr-4 py-2 rounded-md border focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={inputStyle}
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4" style={mutedStyle} />
              {searchQuery && (
                <X
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 size-4 cursor-pointer hover:opacity-80"
                  style={mutedStyle}
                  onClick={() => setSearchQuery('')}
                />
              )}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b" style={mutedBgStyle}>
              <tr>
                {['Document Name', 'Category', 'Tracking ID', 'Received', 'From', 'Status'].map((label) => (
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
                      <div className={`p-2 ${getFileIconBg(doc.fileType)} rounded-lg`}>
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