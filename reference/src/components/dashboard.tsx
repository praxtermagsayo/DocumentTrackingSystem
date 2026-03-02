import { useState } from 'react';
import { 
  Upload, 
  Search, 
  RefreshCw, 
  Plus,
  ChevronDown,
  TrendingUp,
  Clock
} from 'lucide-react';
import { Link } from 'react-router';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { useApp } from '../contexts/AppContext';

const documentTrendsData = [
  { month: 'Feb', value: 45 },
  { month: 'Mon', value: 42 },
  { month: 'Dun', value: 58 },
  { month: 'Jul', value: 44 },
  { month: 'Aug', value: 48 },
  { month: 'Nex', value: 44 },
  { month: 'Munt', value: 60 },
];

const documentAgeingData = [
  { name: 'Overdue', value: 10, fill: '#f97316' },
  { name: '0-7 days', value: 85, fill: '#8b5cf6' },
  { name: '8-14 days', value: 100, fill: '#3b82f6' },
  { name: '15+ days', value: 65, fill: '#10b981' },
];

const myTasksData = [
  { id: 'DOC-2024-01123', title: 'Project Plan', stage: 'Review', dueDate: '3 Ago', stageColor: 'text-blue-600 bg-blue-50' },
  { id: 'DOC-2024-01115', title: 'Budget Report', stage: 'Approve', dueDate: '4 Ago', stageColor: 'text-green-600 bg-green-50' },
  { id: 'DOC-2024-00098', title: 'Work Instruction', stage: 'Review', dueDate: '2 Ago', stageColor: 'text-orange-600 bg-orange-50' },
  { id: 'DOC-2024-00087', title: 'Meeting Minutes', stage: 'Approve', dueDate: '4 Ago', stageColor: 'text-green-600 bg-green-50' },
];

const recentActivityData = [
  {
    user: 'Jennifer Smith',
    action: 'uploaded',
    item: 'New document',
    detail: 'Budget Report',
    time: '10m ago',
    avatar: 'JS'
  },
  {
    user: 'Michael Lee',
    action: 'approved',
    item: 'Policy Update',
    detail: '',
    time: '1h ago',
    avatar: 'ML'
  },
  {
    user: 'Sarah Johnson',
    action: 'submitted',
    item: 'document',
    detail: 'Work Procedure',
    time: '2h ago',
    avatar: 'SJ'
  },
  {
    user: 'Admin',
    action: 'archived',
    item: '1 document - Old Procedures',
    detail: '',
    time: '3h ago',
    avatar: 'AD'
  },
];

export function Dashboard() {
  const { documents } = useApp();
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-3xl font-semibold text-slate-800">Dashboard</h2>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-orange-500 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
          <div className="text-sm font-medium mb-2">Draft</div>
          <div className="text-4xl font-bold">12</div>
        </div>
        <div className="bg-blue-500 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
          <div className="text-sm font-medium mb-2">For Review</div>
          <div className="text-4xl font-bold">7</div>
        </div>
        <div className="bg-green-500 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
          <div className="text-sm font-medium mb-2">Passproval</div>
          <div className="text-4xl font-bold">5</div>
        </div>
        <div className="bg-purple-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
          <div className="text-sm font-medium mb-2">Released</div>
          <div className="text-4xl font-bold">38</div>
        </div>
        <div className="bg-slate-400 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
          <div className="text-sm font-medium mb-2">Archived</div>
          <div className="text-4xl font-bold">6</div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex items-center gap-4 flex-wrap">
        <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium text-slate-700 shadow-sm">
          <Upload className="size-4 text-teal-600" />
          Upload Document
        </button>
        <div className="flex-1 min-w-[200px] max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
        </div>
        <button className="p-2.5 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
          <RefreshCw className="size-4 text-slate-600" />
        </button>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium shadow-sm">
          <Plus className="size-4" />
          Create Category
        </button>
        <button className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium shadow-sm">
          Search
        </button>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* My Tasks Section - Takes 2 columns */}
        <div className="lg:col-span-2 space-y-6">
          {/* My Tasks Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-semibold text-slate-800">My Tasks</h3>
              <button className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
                <span>Action</span>
                <ChevronDown className="size-4" />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500">Document ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500">Stage</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500">Due Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {myTasksData.map((task) => (
                    <tr key={task.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-slate-600">{task.id}</td>
                      <td className="px-6 py-4 text-sm text-slate-900 font-medium">{task.title}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${task.stageColor}`}>
                          {task.stage}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 text-sm text-slate-600">
                          <Clock className="size-3" />
                          {task.dueDate}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Document Trends */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <h3 className="font-semibold text-slate-800 mb-4">Document Trends</h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={documentTrendsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fontSize: 12, fill: '#64748b' }}
                    axisLine={{ stroke: '#e2e8f0' }}
                  />
                  <YAxis 
                    tick={{ fontSize: 12, fill: '#64748b' }}
                    axisLine={{ stroke: '#e2e8f0' }}
                    domain={[0, 100]}
                  />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    dot={{ fill: '#3b82f6', r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Document Ageing */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <h3 className="font-semibold text-slate-800 mb-4">Document Ageing</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={documentAgeingData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    axisLine={{ stroke: '#e2e8f0' }}
                  />
                  <YAxis 
                    tick={{ fontSize: 12, fill: '#64748b' }}
                    axisLine={{ stroke: '#e2e8f0' }}
                    domain={[0, 120]}
                  />
                  <Tooltip />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Recent Activity Sidebar */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm h-fit">
          <div className="px-6 py-4 border-b border-slate-200">
            <h3 className="font-semibold text-slate-800">Recent Activity</h3>
          </div>
          <div className="p-6 space-y-4">
            {recentActivityData.map((activity, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
                  {activity.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-900">
                    <span className="font-medium">{activity.user}</span>{' '}
                    <span className="text-slate-600">{activity.action}</span>
                  </p>
                  <p className="text-sm text-slate-600">
                    {activity.item}
                    {activity.detail && (
                      <>
                        <br />
                        <span className="font-medium">{activity.detail}</span>
                      </>
                    )}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center py-4">
        <p className="text-sm text-slate-500">© 24 DMIS Systems</p>
      </div>
    </div>
  );
}
