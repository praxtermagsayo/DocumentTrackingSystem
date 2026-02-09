import { useState } from 'react';
import { FileText, Clock, CheckCircle, AlertTriangle, MoreVertical } from 'lucide-react';
import { Link, useLocation } from 'react-router';
import { DocumentStatus } from '../types';
import { useApp } from '../contexts/AppContext';
import { formatDateShort, getStatusLabel } from '../lib/format';
import { documentMatchesSearch } from '../lib/search';
import { DocumentSourceBadge } from './document-source-badge';

export function Dashboard() {
  const location = useLocation();
  const { documents, searchQuery, currentUserId, teams } = useApp();
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'signed' | 'rejected'>('all');

  // Apply global search then take recent 6
  const searchFiltered = documents.filter((d) => documentMatchesSearch(d, searchQuery));

  // Calculate statistics using documents from context
  const stats = {
    total: documents.length,
    inProgress: documents.filter(d => d.status === 'under-review').length,
    completed: documents.filter(d => d.status === 'approved').length,
    needsAttention: documents.filter(d => d.status === 'rejected').length,
  };

  // Get recent documents (first 6) from search-filtered list
  const recentDocuments = searchFiltered.slice(0, 6);

  // Filter based on tab
  const filteredDocuments = recentDocuments.filter(doc => {
    if (activeTab === 'all') return true;
    if (activeTab === 'pending') return doc.status === 'under-review';
    if (activeTab === 'signed') return doc.status === 'approved';
    if (activeTab === 'rejected') return doc.status === 'rejected';
    return true;
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
      case 'PDF':
        return 'bg-red-500/15';
      case 'XLSX':
        return 'bg-green-500/15';
      case 'DOC':
      case 'DOCX':
        return 'bg-blue-500/15';
      case 'IMG':
        return 'bg-purple-500/15';
      default:
        return 'bg-slate-500/15';
    }
  };

  const cardStyle = { backgroundColor: 'var(--card)', borderColor: 'var(--border)' };
  const textStyle = { color: 'var(--foreground)' };
  const mutedStyle = { color: 'var(--muted-foreground)' };
  const mutedBgStyle = { backgroundColor: 'var(--muted)' };

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
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium opacity-90" style={{ ...mutedBgStyle, ...textStyle }}>
            {getStatusLabel(status)}
          </span>
        );
    }
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold" style={textStyle}>Dashboard Overview</h1>
        </div>
        <p className="text-sm" style={mutedStyle}>
          Last updated: {new Date().toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
        </p>
      </div>

      {/* Stats Cards - from Supabase documents */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="rounded-xl border p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer" style={cardStyle}>
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-blue-500/15 rounded-lg">
              <FileText className="size-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <p className="text-sm mb-1" style={mutedStyle}>Total Documents</p>
          <p className="text-xs mb-0.5" style={mutedStyle}>All statuses</p>
          <p className="text-3xl font-semibold" style={textStyle}>{stats.total.toLocaleString()}</p>
        </div>

        <div className="rounded-xl border p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer" style={cardStyle}>
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-yellow-500/15 rounded-lg">
              <Clock className="size-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
          <p className="text-sm mb-1" style={mutedStyle}>Pending</p>
          <p className="text-xs mb-0.5" style={mutedStyle}>Under review</p>
          <p className="text-3xl font-semibold" style={textStyle}>{stats.inProgress.toLocaleString()}</p>
        </div>

        <div className="rounded-xl border p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer" style={cardStyle}>
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-green-500/15 rounded-lg">
              <CheckCircle className="size-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <p className="text-sm mb-1" style={mutedStyle}>Approved</p>
          <p className="text-xs mb-0.5" style={mutedStyle}>Signed / completed</p>
          <p className="text-3xl font-semibold" style={textStyle}>{stats.completed.toLocaleString()}</p>
        </div>

        <div className="rounded-xl border p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer" style={cardStyle}>
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-red-500/15 rounded-lg">
              <AlertTriangle className="size-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <p className="text-sm mb-1" style={mutedStyle}>Needs Attention</p>
          <p className="text-xs mb-0.5" style={mutedStyle}>Rejected</p>
          <p className="text-3xl font-semibold" style={textStyle}>{stats.needsAttention.toLocaleString()}</p>
        </div>
      </div>

      {/* Recent Documents */}
      <div className="rounded-xl border" style={cardStyle}>
        {/* Header with Tabs */}
        <div className="px-6 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold" style={textStyle}>Recent Documents</h2>
            <div className="flex items-center gap-2">
              {(['all', 'pending', 'signed', 'rejected'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${activeTab === tab ? 'bg-blue-600 text-white' : 'hover:opacity-90'
                    }`}
                  style={activeTab === tab ? undefined : { color: 'var(--foreground)' }}
                >
                  {tab === 'all' ? 'All Files' : tab === 'signed' ? 'Signed' : tab === 'pending' ? 'Pending' : 'Rejected'}
                </button>
              ))}
              <Link
                to="/documents"
                className="px-3 py-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:opacity-80 rounded-lg transition-colors"
              >
                View All
              </Link>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b" style={mutedBgStyle}>
              <tr>
                {['Document Name', 'Category', 'Tracking ID', 'Last Updated', 'Owner', 'Status', 'Action'].map((label) => (
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
                      <div className={`p-2 rounded-lg ${getFileIconBg(doc.fileType)}`}>
                        {getFileIcon(doc.fileType)}
                      </div>
                      <div>
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
                    <span className="text-sm" style={mutedStyle}>{formatDateShort(doc.updatedAt)}</span>
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
                  <td className="px-6 py-4">
                    <button className="p-1 rounded transition-colors hover:opacity-80" style={mutedStyle}>
                      <MoreVertical className="size-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
          <p className="text-sm" style={mutedStyle}>Showing {Math.min(6, filteredDocuments.length)} of {documents.length} documents</p>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 text-sm font-medium rounded-lg transition-colors hover:opacity-90" style={{ color: 'var(--foreground)', backgroundColor: 'var(--accent)' }}>
              Previous
            </button>
            <button className="px-3 py-1.5 text-sm font-medium rounded-lg transition-colors hover:opacity-90" style={{ color: 'var(--foreground)', backgroundColor: 'var(--accent)' }}>
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}