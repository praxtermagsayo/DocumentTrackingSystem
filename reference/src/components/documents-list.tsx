import { useState, useEffect } from 'react';
import { mockDocuments } from '../data/mockData';
import { Link } from 'react-router';
import { DocumentStatus } from '../types';
import { Search, Filter, FileText, X } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

export function DocumentsList() {
  const { searchQuery: globalSearch, setSearchQuery: setGlobalSearch } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<DocumentStatus | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

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

  // Get unique categories
  const categories = Array.from(new Set(mockDocuments.map(d => d.category))).sort();

  // Filter documents
  const filteredDocuments = mockDocuments.filter(doc => {
    const searchTerm = searchQuery.toLowerCase();
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm) ||
                         doc.description.toLowerCase().includes(searchTerm) ||
                         doc.trackingId.toLowerCase().includes(searchTerm) ||
                         doc.status.toLowerCase().includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || doc.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const getStatusColor = (status: DocumentStatus) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'under-review':
        return 'bg-yellow-100 text-yellow-800';
      case 'draft':
        return 'bg-slate-100 text-slate-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'archived':
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: DocumentStatus) => {
    switch (status) {
      case 'under-review':
        return 'Under Review';
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
        <h2 className="text-2xl font-semibold text-slate-900">All Documents</h2>
        <p className="mt-1 text-slate-600">Browse and filter your documents</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {searchQuery && (
                <button
                  className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-slate-400"
                  onClick={() => setSearchQuery('')}
                >
                  <X />
                </button>
              )}
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Status
            </label>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as DocumentStatus | 'all')}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
              >
                <option value="all">All Statuses</option>
                <option value="draft">Draft</option>
                <option value="under-review">Under Review</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Category
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
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
        <div className="mt-4 pt-4 border-t border-slate-200">
          <p className="text-sm text-slate-600">
            Showing <span className="font-medium text-slate-900">{filteredDocuments.length}</span> of{' '}
            <span className="font-medium text-slate-900">{mockDocuments.length}</span> documents
          </p>
        </div>
      </div>

      {/* Documents List */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        {filteredDocuments.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="mx-auto size-12 text-slate-400" />
            <h3 className="mt-4 text-lg font-medium text-slate-900">No documents found</h3>
            <p className="mt-2 text-sm text-slate-600">Try adjusting your filters or search query</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {filteredDocuments.map((doc) => (
              <Link
                key={doc.id}
                to={`/documents/${doc.id}`}
                className="block px-6 py-5 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="mt-1 p-2 bg-blue-50 rounded-lg">
                    <FileText className="size-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3">
                          <h3 className="font-medium text-slate-900">{doc.title}</h3>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(doc.status)}`}>
                            {getStatusLabel(doc.status)}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-slate-600 line-clamp-2">{doc.description}</p>
                      </div>
                      <div className="text-right text-sm text-slate-500 whitespace-nowrap">
                        {formatDate(doc.updatedAt)}
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-4 text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1">
                        <span className="font-medium text-slate-700">Category:</span>
                        {doc.category}
                      </span>
                      <span>•</span>
                      <span className="inline-flex items-center gap-1">
                        <span className="font-medium text-slate-700">Created by:</span>
                        {doc.createdBy}
                      </span>
                      <span>•</span>
                      <span className="inline-flex items-center gap-1">
                        <span className="font-medium text-slate-700">Type:</span>
                        {doc.fileType}
                      </span>
                      <span>•</span>
                      <span className="inline-flex items-center gap-1">
                        <span className="font-medium text-slate-700">Size:</span>
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