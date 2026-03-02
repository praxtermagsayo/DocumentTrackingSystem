import { useState, useEffect } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router';
import { DocumentStatus } from '../types';
import { Search, FileText, X } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { documentMatchesSearch } from '../lib/search';
import { DocumentSourceBadge } from './document-source-badge';
import { getStatusLabel } from '../lib/format';
import { PageTransition } from './page-transition';

type ViewTab = 'all' | 'inbox' | 'sent' | 'drafts';
type StatusTab = 'all' | 'pending' | 'signed' | 'rejected';

export function DocumentRepository() {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { documents, searchQuery: globalSearch, setSearchQuery: setGlobalSearch, currentUserId } = useApp();
  const [searchQuery, setSearchQuery] = useState(() => searchParams.get('q') ?? '');
  const [viewTab, setViewTab] = useState<ViewTab>(() => (searchParams.get('tab') as ViewTab) || 'all');
  const [statusTab, setStatusTab] = useState<StatusTab>('all');

  useEffect(() => {
    const tab = searchParams.get('tab') as ViewTab | null;
    if (tab && ['all', 'inbox', 'sent', 'drafts'].includes(tab)) {
      setViewTab(tab);
    }
  }, [searchParams]);

  useEffect(() => {
    const q = searchParams.get('q');
    if (q != null && q !== globalSearch) {
      setGlobalSearch(q);
    }
  }, [searchParams]);

  useEffect(() => {
    if (globalSearch) setSearchQuery(globalSearch);
  }, [globalSearch]);

  useEffect(() => {
    return () => setGlobalSearch('');
  }, [setGlobalSearch]);

  const setTab = (tab: ViewTab) => {
    setViewTab(tab);
    setStatusTab('all');
    const next = new URLSearchParams(searchParams);
    next.set('tab', tab);
    setSearchParams(next, { replace: true });
  };

  let baseDocs = documents.filter((d) => d.status !== 'archived');
  if (viewTab === 'inbox') baseDocs = baseDocs.filter((d) => d.status === 'under-review');
  else if (viewTab === 'sent') baseDocs = baseDocs.filter((d) => d.status !== 'draft');
  else if (viewTab === 'drafts') baseDocs = baseDocs.filter((d) => d.status === 'draft');

  const searchFiltered = baseDocs.filter((d) => documentMatchesSearch(d, searchQuery));
  const filteredDocuments = searchFiltered.filter((doc) => {
    if (statusTab === 'all') return true;
    if (statusTab === 'pending') return doc.status === 'under-review';
    if (statusTab === 'signed') return doc.status === 'approved';
    if (statusTab === 'rejected') return doc.status === 'rejected';
    return true;
  });

  const cardStyle = { backgroundColor: 'var(--card)', borderColor: 'var(--border)' };
  const textStyle = { color: 'var(--foreground)' };
  const mutedStyle = { color: 'var(--muted-foreground)' };
  const mutedBgStyle = { backgroundColor: 'var(--muted)' };
  const inputStyle = { backgroundColor: 'var(--input-background)', color: 'var(--foreground)', borderColor: 'var(--border)' };

  const getFileIcon = (fileType: string) => {
    const iconClass = 'size-5';
    switch (fileType) {
      case 'PDF': return <FileText className={`${iconClass} text-red-600`} />;
      case 'XLSX': return <FileText className={`${iconClass} text-green-600`} />;
      case 'DOC':
      case 'DOCX': return <FileText className={`${iconClass} text-blue-600`} />;
      case 'IMG': return <FileText className={`${iconClass} text-purple-600`} />;
      default: return <FileText className={`${iconClass} text-slate-600`} />;
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

  const getStatusBadge = (status: DocumentStatus) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-green-500/20 text-green-700 dark:text-green-400">
            Approved
          </span>
        );
      case 'under-review':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-yellow-500/20 text-yellow-700 dark:text-yellow-400">
            Pending
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-red-500/20 text-red-700 dark:text-red-400">
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium opacity-90" style={{ ...mutedBgStyle, ...textStyle }}>
            {getStatusLabel(status)}
          </span>
        );
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getInitials = (name: string) => name.split(' ').map((n) => n[0]).join('').toUpperCase();

  const viewTabs: { key: ViewTab; label: string }[] = [
    { key: 'all', label: 'All Documents' },
    { key: 'inbox', label: 'Inbox' },
    { key: 'sent', label: 'Sent' },
    { key: 'drafts', label: 'Drafts' },
  ];

  const showStatusTabs = viewTab !== 'drafts';

  return (
    <PageTransition className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold" style={textStyle}>Document Repository</h1>
        <p className="mt-1" style={mutedStyle}>
          {viewTab === 'all' && 'All your documents'}
          {viewTab === 'inbox' && 'Documents awaiting your review'}
          {viewTab === 'sent' && 'Documents you\'ve submitted'}
          {viewTab === 'drafts' && 'Documents you\'re working on'}
        </p>
      </div>

      <div className="rounded-xl border" style={cardStyle}>
        <div className="px-6 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              {viewTabs.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setTab(key)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                    viewTab === key ? 'bg-blue-600 text-white' : 'hover:opacity-90'
                  }`}
                  style={viewTab === key ? undefined : { color: 'var(--foreground)' }}
                >
                  {label}
                </button>
              ))}
            </div>
            {showStatusTabs && (
              <div className="flex items-center gap-2">
                {(['all', 'pending', 'signed', 'rejected'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setStatusTab(tab)}
                    className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                      statusTab === tab ? 'bg-blue-600/20 text-blue-700 dark:text-blue-400' : 'hover:opacity-90'
                    }`}
                    style={statusTab === tab ? undefined : mutedStyle}
                  >
                    {tab === 'all' ? 'All' : tab === 'signed' ? 'Signed' : tab === 'pending' ? 'Pending' : 'Rejected'}
                  </button>
                ))}
              </div>
            )}
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4" style={mutedStyle} />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={inputStyle}
              />
              {searchQuery && (
                <button
                  className="absolute right-3 top-1/2 -translate-y-1/2 hover:opacity-80"
                  style={mutedStyle}
                  onClick={() => setSearchQuery('')}
                >
                  <X className="size-4" />
                </button>
              )}
            </div>
          </div>
          <p className="mt-2 text-sm" style={mutedStyle}>
            Showing <span className="font-medium" style={textStyle}>{filteredDocuments.length}</span> of {baseDocs.length} documents
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b" style={mutedBgStyle}>
              <tr>
                {['Document Name', 'Category', 'Tracking ID', 'Last Updated', 'Owner', 'Status'].map((label) => (
                  <th key={label} className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={mutedStyle}>
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: 'var(--border)' }}>
              {filteredDocuments.map((doc) => (
                <tr key={doc.id} className="transition-app hover:opacity-90" style={{ backgroundColor: 'var(--card)' }}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${getFileIconBg(doc.fileType)}`}>
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
                          <DocumentSourceBadge document={doc} currentUserId={currentUserId} />
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

        {filteredDocuments.length === 0 && (
          <div className="text-center py-12">
            <FileText className="mx-auto size-12" style={mutedStyle} />
            <h3 className="mt-4 text-lg font-medium" style={textStyle}>No documents found</h3>
            <p className="mt-2 text-sm" style={mutedStyle}>
              {viewTab === 'drafts' ? (
                <>
                  <Link to="/upload" className="text-blue-600 dark:text-blue-400 hover:underline">Upload a document</Link> to get started.
                </>
              ) : (
                'Try adjusting your search or filters.'
              )}
            </p>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
