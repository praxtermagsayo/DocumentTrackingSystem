import { useState } from 'react';
import { Archive, Calendar, FileText, Download, Trash2, RotateCcw } from 'lucide-react';
import { Link } from 'react-router';

const retentionData = [
  {
    id: '1',
    title: 'Old Marketing Campaign 2024',
    category: 'Marketing',
    fileType: 'PDF',
    archivedDate: '2026-01-15',
    retentionPeriod: '7 years',
    expiryDate: '2033-01-15',
    size: '3.2 MB',
    archivedBy: 'Sarah Wilson',
  },
  {
    id: '2',
    title: 'Financial Records Q3 2024',
    category: 'Finance',
    fileType: 'XLSX',
    archivedDate: '2026-01-10',
    retentionPeriod: '10 years',
    expiryDate: '2036-01-10',
    size: '5.1 MB',
    archivedBy: 'Michael Chen',
  },
  {
    id: '3',
    title: 'Employee Records 2024',
    category: 'HR',
    fileType: 'DOC',
    archivedDate: '2026-01-05',
    retentionPeriod: '7 years',
    expiryDate: '2033-01-05',
    size: '2.8 MB',
    archivedBy: 'Emily Davis',
  },
  {
    id: '4',
    title: 'Project Alpha Documentation',
    category: 'Engineering',
    fileType: 'PDF',
    archivedDate: '2025-12-20',
    retentionPeriod: '5 years',
    expiryDate: '2030-12-20',
    size: '4.5 MB',
    archivedBy: 'David Miller',
  },
];

export function RetentionAndArchive() {
  const [filterCategory, setFilterCategory] = useState('all');

  const filteredData = retentionData.filter(
    item => filterCategory === 'all' || item.category.toLowerCase() === filterCategory.toLowerCase()
  );

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-800">Retention and Archive</h2>
          <p className="text-sm text-slate-600 mt-1">Manage archived documents and retention policies</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium text-slate-700">
            <Download className="size-4" />
            Export List
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Archive className="size-5 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-slate-600">Total Archived</span>
          </div>
          <p className="text-3xl font-bold text-slate-900">248</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-yellow-50 rounded-lg">
              <Calendar className="size-5 text-yellow-600" />
            </div>
            <span className="text-sm font-medium text-slate-600">Expiring Soon</span>
          </div>
          <p className="text-3xl font-bold text-slate-900">12</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-50 rounded-lg">
              <RotateCcw className="size-5 text-green-600" />
            </div>
            <span className="text-sm font-medium text-slate-600">Restored</span>
          </div>
          <p className="text-3xl font-bold text-slate-900">35</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-50 rounded-lg">
              <Trash2 className="size-5 text-red-600" />
            </div>
            <span className="text-sm font-medium text-slate-600">Deleted</span>
          </div>
          <p className="text-3xl font-bold text-slate-900">89</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <label className="text-sm font-medium text-slate-700">Filter by Category:</label>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Categories</option>
          <option value="marketing">Marketing</option>
          <option value="finance">Finance</option>
          <option value="hr">HR</option>
          <option value="engineering">Engineering</option>
        </select>
        <div className="ml-auto text-sm text-slate-600">
          Showing {filteredData.length} of {retentionData.length} documents
        </div>
      </div>

      {/* Archived Documents Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h3 className="font-semibold text-slate-800">Archived Documents</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Document</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Archived Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Retention Period</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Expiry Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Archived By</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredData.map((doc) => (
                <tr key={doc.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 ${getFileIconBg(doc.fileType)} rounded-lg`}>
                        {getFileIcon(doc.fileType)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{doc.title}</p>
                        <p className="text-xs text-slate-500">
                          {doc.fileType} • {doc.size}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700">
                      {doc.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {new Date(doc.archivedDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-900 font-medium">{doc.retentionPeriod}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {new Date(doc.expiryDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{doc.archivedBy}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Restore"
                      >
                        <RotateCcw className="size-4" />
                      </button>
                      <button
                        className="p-1.5 text-slate-600 hover:bg-slate-100 rounded transition-colors"
                        title="Download"
                      >
                        <Download className="size-4" />
                      </button>
                      <button
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Delete Permanently"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
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
    </div>
  );
}
