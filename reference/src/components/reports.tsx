import { useState } from 'react';
import { BarChart3, Download, TrendingUp, FileText, Clock, CheckCircle } from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const documentsByCategory = [
  { name: 'Legal', value: 145, fill: '#3b82f6' },
  { name: 'Finance', value: 98, fill: '#10b981' },
  { name: 'HR', value: 76, fill: '#8b5cf6' },
  { name: 'Engineering', value: 124, fill: '#f59e0b' },
  { name: 'Marketing', value: 87, fill: '#ef4444' },
];

const monthlyDocuments = [
  { month: 'Jan', created: 45, approved: 38, rejected: 7 },
  { month: 'Feb', created: 52, approved: 45, rejected: 5 },
  { month: 'Mar', created: 48, approved: 42, rejected: 6 },
  { month: 'Apr', created: 61, approved: 55, rejected: 4 },
  { month: 'May', created: 58, approved: 51, rejected: 7 },
  { month: 'Jun', created: 65, approved: 60, rejected: 5 },
];

const statusDistribution = [
  { name: 'Draft', value: 12, fill: '#f97316' },
  { name: 'Under Review', value: 7, fill: '#3b82f6' },
  { name: 'Approved', value: 38, fill: '#10b981' },
  { name: 'Rejected', value: 3, fill: '#ef4444' },
  { name: 'Archived', value: 6, fill: '#64748b' },
];

const userActivityData = [
  { user: 'Sarah Wilson', documents: 45, reviews: 32, approvals: 28 },
  { user: 'Michael Chen', documents: 38, reviews: 29, approvals: 25 },
  { user: 'Emily Davis', documents: 42, reviews: 35, approvals: 30 },
  { user: 'David Miller', documents: 35, reviews: 28, approvals: 22 },
  { user: 'Jessica Taylor', documents: 40, reviews: 31, approvals: 27 },
];

export function Reports() {
  const [reportType, setReportType] = useState('overview');
  const [dateRange, setDateRange] = useState('6months');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-800">Reports & Analytics</h2>
          <p className="text-sm text-slate-600 mt-1">View document statistics and performance metrics</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="1month">Last Month</option>
            <option value="3months">Last 3 Months</option>
            <option value="6months">Last 6 Months</option>
            <option value="1year">Last Year</option>
          </select>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
            <Download className="size-4" />
            Export Report
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-50 rounded-lg">
              <FileText className="size-5 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-slate-600">Total Documents</span>
          </div>
          <p className="text-3xl font-bold text-slate-900">1,248</p>
          <div className="flex items-center gap-1 mt-2 text-xs text-green-600">
            <TrendingUp className="size-3" />
            <span>+12% from last period</span>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-yellow-50 rounded-lg">
              <Clock className="size-5 text-yellow-600" />
            </div>
            <span className="text-sm font-medium text-slate-600">Pending Review</span>
          </div>
          <p className="text-3xl font-bold text-slate-900">45</p>
          <div className="flex items-center gap-1 mt-2 text-xs text-slate-600">
            <span>Average: 3.2 days</span>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-50 rounded-lg">
              <CheckCircle className="size-5 text-green-600" />
            </div>
            <span className="text-sm font-medium text-slate-600">Approval Rate</span>
          </div>
          <p className="text-3xl font-bold text-slate-900">92%</p>
          <div className="flex items-center gap-1 mt-2 text-xs text-green-600">
            <TrendingUp className="size-3" />
            <span>+3% from last period</span>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-50 rounded-lg">
              <BarChart3 className="size-5 text-purple-600" />
            </div>
            <span className="text-sm font-medium text-slate-600">Avg. Review Time</span>
          </div>
          <p className="text-3xl font-bold text-slate-900">2.4d</p>
          <div className="flex items-center gap-1 mt-2 text-xs text-slate-600">
            <span>Target: 3 days</span>
          </div>
        </div>
      </div>

      {/* Report Type Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setReportType('overview')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            reportType === 'overview'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setReportType('categories')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            reportType === 'categories'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          By Category
        </button>
        <button
          onClick={() => setReportType('users')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            reportType === 'users'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          User Activity
        </button>
      </div>

      {/* Charts */}
      {reportType === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Document Trends */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <h3 className="font-semibold text-slate-800 mb-4">Document Activity Trends</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyDocuments}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="created" stroke="#3b82f6" strokeWidth={2} name="Created" />
                <Line type="monotone" dataKey="approved" stroke="#10b981" strokeWidth={2} name="Approved" />
                <Line type="monotone" dataKey="rejected" stroke="#ef4444" strokeWidth={2} name="Rejected" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Status Distribution */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <h3 className="font-semibold text-slate-800 mb-4">Status Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  dataKey="value"
                >
                  {statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {reportType === 'categories' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h3 className="font-semibold text-slate-800 mb-4">Documents by Category</h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={documentsByCategory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
              <Tooltip />
              <Bar dataKey="value" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {reportType === 'users' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <h3 className="font-semibold text-slate-800">User Activity Report</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Documents Created</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Reviews Completed</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Approvals Given</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Activity Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {userActivityData.map((user, index) => (
                  <tr key={index} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
                          {user.user.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span className="text-sm font-medium text-slate-900">{user.user}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-900">{user.documents}</td>
                    <td className="px-6 py-4 text-sm text-slate-900">{user.reviews}</td>
                    <td className="px-6 py-4 text-sm text-slate-900">{user.approvals}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-slate-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${(user.documents + user.reviews + user.approvals) / 3}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-slate-900">
                          {Math.round((user.documents + user.reviews + user.approvals) / 3)}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
