import { useState, useEffect } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router';
import { DocumentStatus } from '../types';
import { Search, Filter, FileText, X } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { documentMatchesSearch } from '../lib/search';
import { DocumentSourceBadge } from './document-source-badge';

export function DocumentsList() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { documents, searchQuery: globalSearch, setSearchQuery: setGlobalSearch, currentUserId, teams } = useApp();
  const [searchQuery, setSearchQuery] = useState(() => searchParams.get('q') ?? '');
  const [statusFilter, setStatusFilter] = useState<DocumentStatus | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Sync URL ?q= into global search when opening /documents?q=...
  useEffect(() => {
    const q = searchParams.get('q');
    if (q != null && q !== globalSearch) {
      setGlobalSearch(q);
    }
  }, [searchParams]);

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

  // Get unique categories from documents
  const categories = Array.from(new Set(documents.map(d => d.category))).sort();

  // Filter documents
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = documentMatchesSearch(doc, searchQuery);
    const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || doc.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const cardStyle = { backgroundColor: 'var(--card)', borderColor: 'var(--border)' };
  const textStyle = { color: 'var(--foreground)' };
  const mutedStyle = { color: 'var(--muted-foreground)' };
  const inputStyle = { backgroundColor: 'var(--input-background)', color: 'var(--foreground)', borderColor: 'var(--border)' };

  const getStatusColor = (status: DocumentStatus) => {
    switch (status) {
      case 'approved':
        return 'bg-green-500/20 text-green-800 dark:text-green-400';
      case 'under-review':
        return 'bg-yellow-500/20 text-yellow-800 dark:text-yellow-400';
      case 'draft':
        return 'bg-slate-500/20 text-slate-700 dark:text-slate-300';
      case 'rejected':
        return 'bg-red-500/20 text-red-800 dark:text-red-400';
      case 'archived':
        return 'bg-gray-500/20 text-gray-700 dark:text-gray-300';
    }
  };

  const getStatusLabel = (status: DocumentStatus) => {
    switch (status) {
      case 'under-review':
        return 'Pending';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold" style={textStyle}>All Documents</h2>
        <p className="mt-1" style={mutedStyle}>Browse and filter your documents</p>
      </div>

      {/* Filters */}
      <div className="rounded-lg shadow-sm border p-6" style={cardStyle}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="md:col-span-1">
            <label className="block text-sm font-medium mb-2" style={textStyle}>Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4" style={mutedStyle} />
              <input
                type="text"
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={inputStyle}
              />
              {searchQuery && (
                <button className="absolute right-3 top-1/2 -translate-y-1/2 size-4 hover:opacity-80" style={mutedStyle} onClick={() => setSearchQuery('')}>
                  <X />
                </button>
              )}
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium mb-2" style={textStyle}>Status</label>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 size-4" style={mutedStyle} />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as DocumentStatus | 'all')}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                style={inputStyle}
              >
                <option value="all">All Statuses</option>
                <option value="draft">Draft</option>
                <option value="under-review">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium mb-2" style={textStyle}>Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
              style={inputStyle}
            >
              <option value="all">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Results Count */}
        <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
          <p className="text-sm" style={mutedStyle}>
            Showing <span className="font-medium" style={textStyle}>{filteredDocuments.length}</span> of{' '}
            <span className="font-medium" style={textStyle}>{documents.length}</span> documents
          </p>
        </div>
      </div>

      {/* Documents List */}
      <div className="rounded-lg shadow-sm border overflow-hidden" style={cardStyle}>
        {filteredDocuments.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="mx-auto size-12" style={mutedStyle} />
            <h3 className="mt-4 text-lg font-medium" style={textStyle}>No documents found</h3>
            <p className="mt-2 text-sm" style={mutedStyle}>Try adjusting your filters or search query</p>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
            {filteredDocuments.map((doc) => (
              <Link
                key={doc.id}
                to={`/documents/${doc.id}`}
                state={{ from: location.pathname }}
                className="block px-6 py-5 transition-colors hover:opacity-90"
                style={{ backgroundColor: 'var(--card)' }}
              >
                <div className="flex items-start gap-4">
                  <div className="mt-1 p-2 bg-blue-500/15 rounded-lg">
                    <FileText className="size-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate" style={textStyle} title={doc.title}>{doc.title}</h3>
                        <div className="mt-1.5 flex flex-wrap items-center gap-2 gap-y-1">
                          <DocumentSourceBadge document={doc} currentUserId={currentUserId} teams={teams} />
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(doc.status)}`}>
                            {getStatusLabel(doc.status)}
                          </span>
                        </div>
                        <p className="mt-1 text-sm line-clamp-2" style={mutedStyle}>{doc.description}</p>
                      </div>
                      <div className="text-right text-sm whitespace-nowrap" style={mutedStyle}>
                        {formatDate(doc.updatedAt)}
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-4 text-xs" style={mutedStyle}>
                      <span className="inline-flex items-center gap-1">
                        <span className="font-medium" style={textStyle}>Category:</span>
                        {doc.category}
                      </span>
                      <span>•</span>
                      <span className="inline-flex items-center gap-1">
                        <span className="font-medium" style={textStyle}>Created by:</span>
                        {doc.createdBy}
                      </span>
                      <span>•</span>
                      <span className="inline-flex items-center gap-1">
                        <span className="font-medium" style={textStyle}>Type:</span>
                        {doc.fileType}
                      </span>
                      <span>•</span>
                      <span className="inline-flex items-center gap-1">
                        <span className="font-medium" style={textStyle}>Size:</span>
                        {doc.fileSize}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}