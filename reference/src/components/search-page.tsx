import { useState } from 'react';
import { Search as SearchIcon, Filter, FileText, Calendar, User } from 'lucide-react';
import { Link } from 'react-router';

const searchResults = [
  {
    id: '1',
    title: 'Service Agreement v2.pdf',
    category: 'Legal',
    fileType: 'PDF',
    fileSize: '2.4 MB',
    owner: 'Sarah Wilson',
    updatedAt: '2026-03-01',
    status: 'Under Review',
    trackingId: '#TRK-2024-001',
  },
  {
    id: '2',
    title: 'Q4 Financial Report.xlsx',
    category: 'Finance',
    fileType: 'XLSX',
    fileSize: '2.3 MB',
    owner: 'Michael Chen',
    updatedAt: '2026-02-28',
    status: 'Approved',
    trackingId: '#TRK-2024-002',
  },
  {
    id: '3',
    title: 'Employee Handbook Update.docx',
    category: 'HR',
    fileType: 'DOC',
    fileSize: '2.4 MB',
    owner: 'Emily Davis',
    updatedAt: '2026-02-27',
    status: 'Approved',
    trackingId: '#TRK-2024-003',
  },
];

export function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [status, setStatus] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [showResults, setShowResults] = useState(false);

  const handleSearch = () => {
    setShowResults(true);
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
      default:
        return <FileText className={`${iconClass} text-slate-600`} />;
    }
  };

  const getFileIconBg = (fileType: string) => {
    switch (fileType) {
      case 'PDF':
        return 'bg-red-50';
      case 'XLSX':
        return 'bg-green-50';
      case 'DOC':
      case 'DOCX':
        return 'bg-blue-50';
      default:
        return 'bg-slate-50';
    }
  };

  const getStatusBadge = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('approved')) {
      return 'bg-green-50 text-green-700';
    } else if (statusLower.includes('review')) {
      return 'bg-yellow-50 text-yellow-700';
    } else if (statusLower.includes('rejected')) {
      return 'bg-red-50 text-red-700';
    } else {
      return 'bg-slate-50 text-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-slate-800">Search Documents</h2>
        <p className="text-sm text-slate-600 mt-1">Find documents by name, ID, category, or content</p>
      </div>

      {/* Search Section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
        {/* Main Search Bar */}
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by document name, ID, or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-sm"
            />
          </div>
          <button
            onClick={handleSearch}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium shadow-sm"
          >
            Search
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 flex-wrap pt-2">
          <div className="flex items-center gap-2">
            <Filter className="size-4 text-slate-500" />
            <span className="text-sm font-medium text-slate-700">Filters:</span>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-slate-600">Category:</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              <option value="legal">Legal</option>
              <option value="finance">Finance</option>
              <option value="hr">HR</option>
              <option value="engineering">Engineering</option>
              <option value="marketing">Marketing</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-slate-600">Status:</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="review">Under Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-slate-600">Date:</label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
          </div>
        </div>
      </div>

      {/* Search Results */}
      {showResults && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-semibold text-slate-800">Search Results</h3>
            <p className="text-sm text-slate-600">{searchResults.length} documents found</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Document</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Tracking ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Owner</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Updated</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {searchResults.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 ${getFileIconBg(doc.fileType)} rounded-lg`}>
                          {getFileIcon(doc.fileType)}
                        </div>
                        <div>
                          <Link
                            to={`/documents/${doc.id}`}
                            className="text-sm font-medium text-slate-900 hover:text-blue-600"
                          >
                            {doc.title}
                          </Link>
                          <p className="text-xs text-slate-500">
                            {doc.fileType} • {doc.fileSize}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700">
                        {doc.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{doc.trackingId}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <User className="size-4 text-slate-400" />
                        <span className="text-sm text-slate-900">{doc.owner}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-sm text-slate-600">
                        <Calendar className="size-3" />
                        {new Date(doc.updatedAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${getStatusBadge(doc.status)}`}>
                        {doc.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
            <p className="text-sm text-slate-600">Page 1 of 1</p>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50" disabled>
                Previous
              </button>
              <button className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50" disabled>
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {!showResults && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center">
          <SearchIcon className="size-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">Start Your Search</h3>
          <p className="text-sm text-slate-600">
            Enter keywords, document ID, or use filters to find documents
          </p>
        </div>
      )}
    </div>
  );
}
