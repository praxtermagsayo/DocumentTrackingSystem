import { Link } from 'react-router';
import { useState, useEffect } from 'react';
import { inboxDocuments } from '../data/categorizedData';
import { FileText, Clock, CheckCircle, AlertTriangle, Search, X } from 'lucide-react';
import { DocumentStatus } from '../types';
import { useApp } from '../contexts/AppContext';

export function Inbox() {
  const { searchQuery: globalSearch, setSearchQuery: setGlobalSearch } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

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

  // Filter documents based on search
  const filteredDocuments = inboxDocuments.filter(doc => {
    const searchTerm = searchQuery.toLowerCase();
    return doc.title.toLowerCase().includes(searchTerm) ||
           doc.trackingId.toLowerCase().includes(searchTerm) ||
           doc.ownerName.toLowerCase().includes(searchTerm) ||
           doc.category.toLowerCase().includes(searchTerm) ||
           doc.status.toLowerCase().includes(searchTerm);
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
        return 'bg-red-50';
      case 'XLSX':
        return 'bg-green-50';
      case 'DOC':
      case 'DOCX':
        return 'bg-blue-50';
      case 'IMG':
        return 'bg-purple-50';
      default:
        return 'bg-slate-50';
    }
  };

  const getStatusBadge = (status: DocumentStatus) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-green-50 text-green-700">
            <CheckCircle className="size-3" />
            Approved
          </span>
        );
      case 'under-review':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-yellow-50 text-yellow-700">
            <Clock className="size-3" />
            Pending
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-red-50 text-red-700">
            <AlertTriangle className="size-3" />
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-50 text-slate-700">
            {status}
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
        <h1 className="text-2xl font-semibold text-slate-900">Inbox</h1>
        <p className="mt-1 text-slate-600">Documents received and awaiting your review</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-600">
              You have <span className="font-medium text-slate-900">{inboxDocuments.length}</span> documents in your inbox
            </p>
            <div className="relative">
              <input
                type="text"
                className="pl-10 pr-4 py-2 rounded-md border border-slate-300 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-slate-500" />
              {searchQuery && (
                <X
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 size-4 text-slate-500 cursor-pointer"
                  onClick={() => setSearchQuery('')}
                />
              )}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Document Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Tracking ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Received
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  From
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {filteredDocuments.map((doc) => (
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
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-600">{doc.trackingId}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-600">{formatDate(doc.updatedAt)}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
                        {getInitials(doc.ownerName)}
                      </div>
                      <span className="text-sm text-slate-900">{doc.ownerName}</span>
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