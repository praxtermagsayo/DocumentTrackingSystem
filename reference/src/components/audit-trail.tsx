import { useState } from 'react';
import { FileBarChart, Filter, Calendar, User, Activity } from 'lucide-react';

const auditTrailData = [
  {
    id: '1',
    timestamp: '2026-03-02 14:23:15',
    user: 'Sarah Wilson',
    action: 'Document Created',
    document: 'Service Agreement v2.pdf',
    trackingId: '#TRK-2024-001',
    ipAddress: '192.168.1.100',
    details: 'New document uploaded to Legal category',
  },
  {
    id: '2',
    timestamp: '2026-03-02 13:45:32',
    user: 'Michael Chen',
    action: 'Status Changed',
    document: 'Q4 Financial Report.xlsx',
    trackingId: '#TRK-2024-002',
    ipAddress: '192.168.1.101',
    details: 'Status changed from Draft to Under Review',
  },
  {
    id: '3',
    timestamp: '2026-03-02 12:18:47',
    user: 'Emily Davis',
    action: 'Document Approved',
    document: 'Employee Handbook Update.docx',
    trackingId: '#TRK-2024-003',
    ipAddress: '192.168.1.102',
    details: 'Document approved by HR Director',
  },
  {
    id: '4',
    timestamp: '2026-03-02 11:05:21',
    user: 'David Miller',
    action: 'Document Edited',
    document: 'Project Alpha Specs.pdf',
    trackingId: '#TRK-2024-004',
    ipAddress: '192.168.1.103',
    details: 'Document metadata updated',
  },
  {
    id: '5',
    timestamp: '2026-03-02 10:32:54',
    user: 'Jessica Taylor',
    action: 'Document Downloaded',
    document: 'Marketing Assets Bundle.zip',
    trackingId: '#TRK-2024-005',
    ipAddress: '192.168.1.104',
    details: 'Document downloaded for review',
  },
  {
    id: '6',
    timestamp: '2026-03-02 09:15:38',
    user: 'James Wilson',
    action: 'Document Archived',
    document: 'Vendor Contract Global.pdf',
    trackingId: '#TRK-2024-006',
    ipAddress: '192.168.1.105',
    details: 'Document moved to archive',
  },
  {
    id: '7',
    timestamp: '2026-03-01 16:42:19',
    user: 'Rachel Kim',
    action: 'Comment Added',
    document: 'Training Materials - Cybersecurity',
    trackingId: '#TRK-2024-007',
    ipAddress: '192.168.1.106',
    details: 'Comment: "Please review section 3 for accuracy"',
  },
  {
    id: '8',
    timestamp: '2026-03-01 15:27:03',
    user: 'Tom Martinez',
    action: 'Document Shared',
    document: 'Vendor Contract - Office Supplies',
    trackingId: '#TRK-2024-008',
    ipAddress: '192.168.1.107',
    details: 'Shared with Finance Team',
  },
];

export function AuditTrail() {
  const [filterAction, setFilterAction] = useState('all');
  const [filterUser, setFilterUser] = useState('all');
  const [dateRange, setDateRange] = useState('today');

  const filteredData = auditTrailData.filter(item => {
    const actionMatch = filterAction === 'all' || item.action.toLowerCase().includes(filterAction.toLowerCase());
    const userMatch = filterUser === 'all' || item.user === filterUser;
    return actionMatch && userMatch;
  });

  const getActionColor = (action: string) => {
    const actionLower = action.toLowerCase();
    if (actionLower.includes('created') || actionLower.includes('uploaded')) {
      return 'bg-blue-50 text-blue-700';
    } else if (actionLower.includes('approved')) {
      return 'bg-green-50 text-green-700';
    } else if (actionLower.includes('rejected') || actionLower.includes('deleted')) {
      return 'bg-red-50 text-red-700';
    } else if (actionLower.includes('changed') || actionLower.includes('edited')) {
      return 'bg-yellow-50 text-yellow-700';
    } else {
      return 'bg-slate-50 text-slate-700';
    }
  };

  const uniqueUsers = Array.from(new Set(auditTrailData.map(item => item.user)));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-800">Audit Trail</h2>
          <p className="text-sm text-slate-600 mt-1">Track all document activities and changes</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
          <FileBarChart className="size-4" />
          Export Audit Log
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Activity className="size-5 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-slate-600">Total Activities</span>
          </div>
          <p className="text-3xl font-bold text-slate-900">1,248</p>
          <p className="text-xs text-slate-500 mt-1">+12% from last week</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-50 rounded-lg">
              <User className="size-5 text-green-600" />
            </div>
            <span className="text-sm font-medium text-slate-600">Active Users</span>
          </div>
          <p className="text-3xl font-bold text-slate-900">24</p>
          <p className="text-xs text-slate-500 mt-1">Today</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-yellow-50 rounded-lg">
              <FileBarChart className="size-5 text-yellow-600" />
            </div>
            <span className="text-sm font-medium text-slate-600">Documents Modified</span>
          </div>
          <p className="text-3xl font-bold text-slate-900">156</p>
          <p className="text-xs text-slate-500 mt-1">This week</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-50 rounded-lg">
              <Calendar className="size-5 text-purple-600" />
            </div>
            <span className="text-sm font-medium text-slate-600">Login Events</span>
          </div>
          <p className="text-3xl font-bold text-slate-900">342</p>
          <p className="text-xs text-slate-500 mt-1">This week</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Filter className="size-4 text-slate-500" />
          <span className="text-sm font-medium text-slate-700">Filters:</span>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-slate-600">Action:</label>
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Actions</option>
            <option value="created">Created</option>
            <option value="approved">Approved</option>
            <option value="changed">Changed</option>
            <option value="downloaded">Downloaded</option>
            <option value="archived">Archived</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-slate-600">User:</label>
          <select
            value={filterUser}
            onChange={(e) => setFilterUser(e.target.value)}
            className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Users</option>
            {uniqueUsers.map(user => (
              <option key={user} value={user}>{user}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-slate-600">Date:</label>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="all">All Time</option>
          </select>
        </div>
        <div className="ml-auto text-sm text-slate-600">
          Showing {filteredData.length} of {auditTrailData.length} events
        </div>
      </div>

      {/* Audit Trail Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h3 className="font-semibold text-slate-800">Activity Log</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Timestamp</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Action</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Document</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Tracking ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">IP Address</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredData.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">{item.timestamp}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
                        {item.user.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className="text-sm text-slate-900">{item.user}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${getActionColor(item.action)}`}>
                      {item.action}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-900 max-w-xs truncate">{item.document}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{item.trackingId}</td>
                  <td className="px-6 py-4 text-sm text-slate-600 font-mono">{item.ipAddress}</td>
                  <td className="px-6 py-4 text-sm text-slate-600 max-w-xs truncate">{item.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          <p className="text-sm text-slate-600">Page 1 of 156</p>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
              Previous
            </button>
            <button className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-lg">
              1
            </button>
            <button className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
              2
            </button>
            <button className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
              3
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
