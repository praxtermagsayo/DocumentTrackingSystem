import { useState, useEffect } from 'react';
import { Upload, Search, RefreshCw, Plus, ChevronDown, Clock } from 'lucide-react';
import { Link, useLocation } from 'react-router';
import { cardStyle, inputStyle } from '../styles/themeStyles';
import { useApp } from '../contexts/AppContext';
import { formatRelativeTime } from '../lib/format';
import { documentMatchesSearch } from '../lib/search';
import * as documentService from '../services/documents';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export function Dashboard() {
  const location = useLocation();
  const { documents, searchQuery, setSearchQuery, resolvedTheme } = useApp();
  const [searchTerm, setSearchTerm] = useState(searchQuery);
  const [recentActivity, setRecentActivity] = useState<documentService.RecentActivityItem[]>([]);
  const [activityLoading, setActivityLoading] = useState(true);

  const searchFiltered = documents.filter((d) => documentMatchesSearch(d, searchTerm || searchQuery));

  const stats = {
    draft: documents.filter((d) => d.status === 'draft').length,
    underReview: documents.filter((d) => d.status === 'under-review').length,
    approved: documents.filter((d) => d.status === 'approved').length,
    rejected: documents.filter((d) => d.status === 'rejected').length,
    archived: documents.filter((d) => d.status === 'archived').length,
  };

  const myTasks = searchFiltered
    .filter((d) => d.status === 'under-review' || d.status === 'rejected')
    .slice(0, 6);

  useEffect(() => {
    documentService.fetchRecentActivity(5).then(setRecentActivity).finally(() => setActivityLoading(false));
  }, [documents.length]);

  const getStageColor = (status: string) => {
    if (status === 'approved') return 'bg-green-500/20 text-green-700 dark:text-green-400';
    if (status === 'under-review') return 'bg-blue-500/20 text-blue-700 dark:text-blue-400';
    if (status === 'rejected') return 'bg-orange-500/20 text-orange-700 dark:text-orange-400';
    return 'bg-slate-500/20 text-slate-700 dark:text-slate-400';
  };

  const isDark = resolvedTheme === 'dark';
  const chartGrid = isDark ? '#334155' : '#e2e8f0';
  const chartAxis = isDark ? '#94a3b8' : '#64748b';
  const chartLine = isDark ? '#60a5fa' : '#3b82f6';

  const trendData = (() => {
    const byMonth: Record<string, number> = {};
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      byMonth[key] = 0;
    }
    documents.forEach((doc) => {
      const d = new Date(doc.createdAt);
      const key = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      if (key in byMonth) byMonth[key]++;
    });
    return Object.entries(byMonth).map(([name, count]) => ({ name, value: count }));
  })();

  const ageingData = [
    {
      name: 'Overdue', value: documents.filter((d) => {
        const days = Math.floor((Date.now() - new Date(d.updatedAt).getTime()) / (24 * 60 * 60 * 1000));
        return days < 0;
      }).length, fill: '#f97316'
    },
    {
      name: '0-7 days', value: documents.filter((d) => {
        const days = Math.floor((Date.now() - new Date(d.updatedAt).getTime()) / (24 * 60 * 60 * 1000));
        return days >= 0 && days <= 7;
      }).length, fill: '#8b5cf6'
    },
    {
      name: '8-14 days', value: documents.filter((d) => {
        const days = Math.floor((Date.now() - new Date(d.updatedAt).getTime()) / (24 * 60 * 60 * 1000));
        return days > 7 && days <= 14;
      }).length, fill: '#3b82f6'
    },
    {
      name: '15+ days', value: documents.filter((d) => {
        const days = Math.floor((Date.now() - new Date(d.updatedAt).getTime()) / (24 * 60 * 60 * 1000));
        return days > 14;
      }).length, fill: '#10b981'
    },
  ];

  return (
    <div className="dashboard-page space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-3xl font-semibold text-foreground">Dashboard</h2>
      </div>

      {/* Status Cards - 5 in one row (flex ensures layout regardless of Tailwind) */}
      <div style={{ display: 'flex', flexDirection: 'row', gap: '1rem', flexWrap: 'nowrap' }}>
        <div className="rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow animate-elastic-pop" style={{ backgroundColor: '#f97316', color: '#fff', flex: 1, minWidth: 0, animationDelay: '0s' }}>
          <div className="text-sm font-medium mb-2">Draft</div>
          <div className="text-4xl font-bold">{stats.draft}</div>
        </div>
        <div className="rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow animate-elastic-pop" style={{ backgroundColor: '#3b82f6', color: '#fff', flex: 1, minWidth: 0, animationDelay: '0.05s' }}>
          <div className="text-sm font-medium mb-2">For Review</div>
          <div className="text-4xl font-bold">{stats.underReview}</div>
        </div>
        <div className="rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow animate-elastic-pop" style={{ backgroundColor: '#22c55e', color: '#fff', flex: 1, minWidth: 0, animationDelay: '0.1s' }}>
          <div className="text-sm font-medium mb-2">Approval</div>
          <div className="text-4xl font-bold">{stats.approved}</div>
        </div>
        <div className="rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow animate-elastic-pop" style={{ backgroundColor: '#9333ea', color: '#fff', flex: 1, minWidth: 0, animationDelay: '0.15s' }}>
          <div className="text-sm font-medium mb-2">Rejected</div>
          <div className="text-4xl font-bold">{stats.rejected}</div>
        </div>
        <div className="rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow animate-elastic-pop" style={{ backgroundColor: '#94a3b8', color: '#fff', flex: 1, minWidth: 0, animationDelay: '0.2s' }}>
          <div className="text-sm font-medium mb-2">Archived</div>
          <div className="text-4xl font-bold">{stats.archived}</div>
        </div>
      </div>

      {/* Action Bar - same patterns as layout.tsx, activities.tsx, upload-document.tsx */}
      <div className="flex items-center gap-4 flex-wrap">
        <Link
          to="/upload"
          className="flex items-center gap-2 px-4 py-2 border rounded-lg font-medium text-sm transition-colors hover:opacity-90"
          style={{ ...cardStyle, color: 'var(--foreground)' }}
        >
          <Upload className="size-4 text-teal-600 dark:text-teal-400" />
          Upload Document
        </Link>
        <div className="flex-1 min-w-[200px] max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setSearchQuery(e.target.value);
              }}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              style={inputStyle}
            />
          </div>
        </div>
        <button
          type="button"
          onClick={() => setSearchQuery(searchTerm)}
          className="p-2 border rounded-lg transition-colors hover:opacity-90"
          style={{ ...cardStyle, color: 'var(--foreground)' }}
        >
          <RefreshCw className="size-4" />
        </button>
        <Link
          to="/document-categories"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          <Plus className="size-4" />
          Create Category
        </Link>
      </div>

      {/* Main Content Grid - exact copy from reference */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* My Tasks Table */}
          <div className="bg-card rounded-xl border border-border shadow-sm">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <h3 className="font-semibold text-foreground">My Tasks</h3>
              <Link
                to="/documents"
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent rounded-lg transition-colors"
              >
                <span>Action</span>
                <ChevronDown className="size-4" />
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground">Document ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground">Stage</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground">Due Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {myTasks.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-sm text-muted-foreground">
                        No tasks requiring action
                      </td>
                    </tr>
                  ) : (
                    myTasks.map((doc) => (
                      <tr key={doc.id} className="hover:bg-accent/50 transition-colors">
                        <td className="px-6 py-4 text-sm text-muted-foreground">{doc.trackingId}</td>
                        <td className="px-6 py-4 text-sm text-foreground font-medium">
                          <Link to={`/documents/${doc.id}`} state={{ from: location.pathname }} className="hover:text-blue-600 dark:hover:text-blue-400">
                            {doc.title}
                          </Link>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${getStageColor(doc.status)}`}>
                            {doc.status === 'approved' ? 'Approval' : doc.status === 'under-review' ? 'Review' : doc.status === 'rejected' ? 'Review again' : doc.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Clock className="size-3" />
                            {formatRelativeTime(doc.updatedAt)}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
              <h3 className="font-semibold text-foreground mb-4">Document Trends</h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartGrid} />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: chartAxis }} axisLine={{ stroke: chartGrid }} />
                  <YAxis tick={{ fontSize: 12, fill: chartAxis }} axisLine={{ stroke: chartGrid }} domain={[0, 'auto']} />
                  <Tooltip contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', color: 'var(--foreground)' }} />
                  <Line type="monotone" dataKey="value" stroke={chartLine} strokeWidth={2} dot={{ fill: chartLine, r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
              <h3 className="font-semibold text-foreground mb-4">Document Ageing</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={ageingData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartGrid} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: chartAxis }} axisLine={{ stroke: chartGrid }} />
                  <YAxis tick={{ fontSize: 12, fill: chartAxis }} axisLine={{ stroke: chartGrid }} domain={[0, 'auto']} />
                  <Tooltip contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', color: 'var(--foreground)' }} />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Recent Activity Sidebar - fits content height, max 5 items, larger avatars */}
        <div className="bg-card rounded-xl border border-border shadow-sm self-start">
          <div className="px-6 py-4 border-b border-border">
            <h3 className="font-semibold text-foreground">Recent Activity</h3>
          </div>
          <div className="p-6 space-y-4">
            {activityLoading ? (
              <div className="text-sm text-muted-foreground">Loading...</div>
            ) : recentActivity.length === 0 ? (
              <div className="text-sm text-muted-foreground">No recent activity</div>
            ) : (
              recentActivity.slice(0, 5).map((item) => (
                <Link
                  key={item.id}
                  to={`/documents/${item.documentId}`}
                  state={{ from: location.pathname }}
                  className="flex items-start gap-3"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                    {item.updatedBy.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground">
                      <span className="font-medium">{item.updatedBy}</span>{' '}
                      <span className="text-muted-foreground">{item.action}</span>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {item.documentTitle}
                    </p>
                    <p className="text-xs text-muted-foreground/80 mt-1">{formatRelativeTime(item.timestamp)}</p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center py-4">
        <p className="text-sm text-muted-foreground">© 24 DMIS Systems</p>
      </div>
    </div>
  );
}
