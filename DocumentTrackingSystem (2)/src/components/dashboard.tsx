import { useState } from 'react';
import { mockDocuments } from '../data/mockData';
import { FileText, Clock, CheckCircle, AlertTriangle, TrendingUp, TrendingDown, MoreVertical } from 'lucide-react';
import { Link } from 'react-router';
import { DocumentStatus } from '../types';
import { useApp } from '../contexts/AppContext';

export function Dashboard() {
  const { documents } = useApp();
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'signed' | 'rejected'>('all');

  // Calculate statistics using documents from context
  const stats = {
    total: documents.length,
    inProgress: documents.filter(d => d.status === 'under-review').length,
    completed: documents.filter(d => d.status === 'approved').length,
    needsAttention: documents.filter(d => d.status === 'rejected').length,
  };

  // Get recent documents (first 6)
  const recentDocuments = documents.slice(0, 6);

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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Dashboard Overview</h1>
        </div>
        <p className="text-sm text-slate-500">Last updated: Today, 09:41 AM</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <FileText className="size-6 text-blue-600" />
            </div>
            <span className="text-xs font-medium text-green-600 flex items-center gap-1">
              <TrendingUp className="size-3" />
              +12% this week
            </span>
          </div>
          <p className="text-sm text-slate-600 mb-1">Total Documents</p>
          <p className="text-3xl font-semibold text-slate-900">1,248</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-yellow-50 rounded-lg">
              <Clock className="size-6 text-yellow-600" />
            </div>
            <span className="text-xs font-medium text-red-600 flex items-center gap-1">
              <TrendingDown className="size-3" />
              -2% this week
            </span>
          </div>
          <p className="text-sm text-slate-600 mb-1">In Progress</p>
          <p className="text-3xl font-semibold text-slate-900">45</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-green-50 rounded-lg">
              <CheckCircle className="size-6 text-green-600" />
            </div>
            <span className="text-xs font-medium text-green-600 flex items-center gap-1">
              <TrendingUp className="size-3" />
              +3% this week
            </span>
          </div>
          <p className="text-sm text-slate-600 mb-1">Completed</p>
          <p className="text-3xl font-semibold text-slate-900">850</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-red-50 rounded-lg">
              <AlertTriangle className="size-6 text-red-600" />
            </div>
            <span className="text-xs font-medium text-red-600 flex items-center gap-1">
              <TrendingUp className="size-3" />
              +1% this week
            </span>
          </div>
          <p className="text-sm text-slate-600 mb-1">Needs Attention</p>
          <p className="text-3xl font-semibold text-slate-900">8</p>
        </div>
      </div>

      {/* Recent Documents */}
      <div className="bg-white rounded-xl border border-slate-200">
        {/* Header with Tabs */}
        <div className="px-6 py-4 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Recent Documents</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === 'all'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                All Files
              </button>
              <button
                onClick={() => setActiveTab('pending')}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === 'pending'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Pending
              </button>
              <button
                onClick={() => setActiveTab('signed')}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === 'signed'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Signed
              </button>
              <button
                onClick={() => setActiveTab('rejected')}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === 'rejected'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Rejected
              </button>
              <Link
                to="/documents"
                className="px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                View All
              </Link>
            </div>
          </div>
        </div>

        {/* Table */}
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
                  Last Updated
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Owner
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Action
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
                  <td className="px-6 py-4">
                    <button className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors">
                      <MoreVertical className="size-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          <p className="text-sm text-slate-600">Showing 6 of 1,248 documents</p>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
              Previous
            </button>
            <button className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}