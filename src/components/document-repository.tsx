import { useState, useEffect, useMemo } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router';
import { DocumentStatus, RoutingStep } from '../types';
import { Search, FileText, X } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { documentMatchesSearch } from '../lib/search';
import { DocumentSourceBadge } from './document-source-badge';
import { getStatusLabel, getStatusColor } from '../lib/format';
import { PageTransition } from './page-transition';

type ViewTab = 'all' | 'inbox' | 'sent';
type StatusTab = 'all' | 'forwarded' | 'viewed' | 'acknowledged';

export function DocumentRepository() {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { documents, searchQuery: globalSearch, setSearchQuery: setGlobalSearch, currentUserId, user } = useApp();
  const [searchQuery, setSearchQuery] = useState(() => searchParams.get('q') ?? '');
  const [viewTab, setViewTab] = useState<ViewTab>(() => (searchParams.get('tab') as ViewTab) || 'all');
  const [statusTab, setStatusTab] = useState<StatusTab>('all');

  useEffect(() => {
    const tab = searchParams.get('tab') as ViewTab | null;
    if (tab && ['all', 'inbox', 'sent'].includes(tab)) {
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

  let baseDocs = documents.filter((d) => documentMatchesSearch(d, searchQuery));

  if (viewTab === 'inbox') {
    baseDocs = baseDocs.filter((d) => {
      // Inbox: Document where user is in routingSteps (pending) or is a recipient and not owner
      const isRecipient = d.recipients?.includes(user?.email || '');
      const isCurrentStepReceiver = d.routingSteps?.some((s: RoutingStep) => s.status === 'pending' && s.receiver_user_id === currentUserId);
      return (isRecipient || isCurrentStepReceiver) && d.ownerId !== currentUserId;
    });
  } else if (viewTab === 'sent') {
    baseDocs = baseDocs.filter((d) => {
      // Sent: Document where user is the owner or has been a sender in routing
      const isOwner = d.ownerId === currentUserId;
      const hasForwarded = d.routingSteps?.some((s: RoutingStep) => s.sender_user_id === currentUserId);
      const wasRecipient = d.recipients?.includes(user?.email || ''); // Added: docs user shared can also be in sent if they were once a sender
      return isOwner || hasForwarded;
    });
  }

  const searchFiltered = baseDocs;
  const filteredDocuments = searchFiltered.filter((doc) => {
    if (statusTab === 'all') return true;
    return doc.status === statusTab;
  });

  const sortedDocuments = useMemo(() => {
    return [...filteredDocuments].sort((a, b) =>
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }, [filteredDocuments]);

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
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${getStatusColor(status)}`}>
        {getStatusLabel(status)}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getInitials = (name: string) => name.split(' ').map((n) => n[0]).join('').toUpperCase();

  const viewTabs: { key: ViewTab; label: string }[] = [
    { key: 'all', label: 'All Documents' },
    { key: 'inbox', label: 'Inbox' },
    { key: 'sent', label: 'Sent' },
  ];

  return (
    <PageTransition className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold" style={textStyle}>Document Repository</h1>
        <p className="mt-1" style={mutedStyle}>
          {viewTab === 'all' && 'All documents shared with you or uploaded by you'}
          {viewTab === 'inbox' && 'Documents sent to you for review or action'}
          {viewTab === 'sent' && 'Documents you have uploaded or forwarded'}
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
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-elastic active-elastic-tap ${viewTab === key ? 'bg-blue-600 text-white shadow-md' : 'hover:opacity-90'
                    }`}
                  style={viewTab === key ? undefined : { color: 'var(--foreground)' }}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              {(['all', 'forwarded', 'viewed', 'acknowledged'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setStatusTab(tab)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-elastic active-elastic-tap ${statusTab === tab ? 'bg-blue-600/20 text-blue-700 dark:text-blue-400 shadow-sm' : 'hover:opacity-90'
                    }`}
                  style={statusTab === tab ? undefined : mutedStyle}
                >
                  {tab === 'all' ? 'All' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
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
            Showing <span className="font-medium" style={textStyle}>{sortedDocuments.length}</span> upload sessions
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b" style={mutedBgStyle}>
              <tr>
                {['Document Name', 'Category', 'Document ID', 'Last Updated', 'Owner', 'Status'].map((label) => (
                  <th key={label} className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={mutedStyle}>
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: 'var(--border)' }}>
              {sortedDocuments.map((doc: any) => (
                <tr key={doc.id} className="transition-elastic hover:opacity-95 animate-elastic-slide" style={{ backgroundColor: 'var(--card)' }}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${doc.files?.length > 1 ? 'bg-blue-600/10' : getFileIconBg(doc.files?.[0]?.type || '')} relative`}>
                        {doc.files?.length > 1 ? (
                          <div className="relative">
                            <FileText className="size-5 text-blue-600" />
                            <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-[10px] size-4 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900">
                              {doc.files?.length}
                            </span>
                          </div>
                        ) : getFileIcon(doc.files?.[0]?.type || '')}
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
                          {doc.files?.length > 1 && <span className="ml-2 text-xs font-normal opacity-60">({doc.files.length} files)</span>}
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
                    <span className="text-sm font-mono" style={mutedStyle}>#{doc.id.split('-')[0].toUpperCase()}</span>
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

        {sortedDocuments.length === 0 && (
          <div className="text-center py-12">
            <FileText className="mx-auto size-12" style={mutedStyle} />
            <h3 className="mt-4 text-lg font-medium" style={textStyle}>No documents found</h3>
            <p className="mt-2 text-sm" style={mutedStyle}>
              'Try adjusting your search or filters.'
            </p>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
