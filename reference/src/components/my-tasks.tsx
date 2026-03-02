import { useState } from 'react';
import { Clock, ChevronDown, Filter, Download } from 'lucide-react';

const tasksData = [
  { id: 'DOC-2024-01123', title: 'Project Plan', stage: 'Review', dueDate: '3 days ago', priority: 'High', assignedBy: 'Sarah Wilson', stageColor: 'text-blue-600 bg-blue-50' },
  { id: 'DOC-2024-01115', title: 'Budget Report', stage: 'Approve', dueDate: '4 days ago', priority: 'Medium', assignedBy: 'Michael Chen', stageColor: 'text-green-600 bg-green-50' },
  { id: 'DOC-2024-00098', title: 'Work Instruction', stage: 'Review', dueDate: '2 days ago', priority: 'High', assignedBy: 'Emily Davis', stageColor: 'text-orange-600 bg-orange-50' },
  { id: 'DOC-2024-00087', title: 'Meeting Minutes', stage: 'Approve', dueDate: '4 days ago', priority: 'Low', assignedBy: 'David Miller', stageColor: 'text-green-600 bg-green-50' },
  { id: 'DOC-2024-00076', title: 'Policy Update Document', stage: 'Review', dueDate: '1 day ago', priority: 'High', assignedBy: 'Jessica Taylor', stageColor: 'text-blue-600 bg-blue-50' },
  { id: 'DOC-2024-00065', title: 'Technical Specification', stage: 'Approve', dueDate: '5 days ago', priority: 'Medium', assignedBy: 'James Wilson', stageColor: 'text-green-600 bg-green-50' },
  { id: 'DOC-2024-00054', title: 'Training Material Review', stage: 'Review', dueDate: '3 days ago', priority: 'Low', assignedBy: 'Rachel Kim', stageColor: 'text-orange-600 bg-orange-50' },
];

export function MyTasks() {
  const [filterStage, setFilterStage] = useState<'all' | 'review' | 'approve'>('all');
  const [filterPriority, setFilterPriority] = useState<'all' | 'high' | 'medium' | 'low'>('all');

  const filteredTasks = tasksData.filter(task => {
    const stageMatch = filterStage === 'all' || task.stage.toLowerCase() === filterStage;
    const priorityMatch = filterPriority === 'all' || task.priority.toLowerCase() === filterPriority;
    return stageMatch && priorityMatch;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'text-red-700 bg-red-50';
      case 'medium':
        return 'text-yellow-700 bg-yellow-50';
      case 'low':
        return 'text-slate-700 bg-slate-100';
      default:
        return 'text-slate-700 bg-slate-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-800">My Tasks</h2>
          <p className="text-sm text-slate-600 mt-1">Review and approve pending documents</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium text-slate-700">
            <Download className="size-4" />
            Export
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Filter className="size-4 text-slate-500" />
          <span className="text-sm font-medium text-slate-700">Filters:</span>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-slate-600">Stage:</label>
          <select
            value={filterStage}
            onChange={(e) => setFilterStage(e.target.value as any)}
            className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Stages</option>
            <option value="review">Review</option>
            <option value="approve">Approve</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-slate-600">Priority:</label>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value as any)}
            className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
        <div className="ml-auto text-sm text-slate-600">
          Showing {filteredTasks.length} of {tasksData.length} tasks
        </div>
      </div>

      {/* Tasks Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Document ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Stage</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Priority</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Due Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Assigned By</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredTasks.map((task) => (
                <tr key={task.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-slate-600">{task.id}</td>
                  <td className="px-6 py-4 text-sm text-slate-900 font-medium">{task.title}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${task.stageColor}`}>
                      {task.stage}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 text-sm text-slate-600">
                      <Clock className="size-3" />
                      {task.dueDate}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{task.assignedBy}</td>
                  <td className="px-6 py-4">
                    <button className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      View
                      <ChevronDown className="size-3 rotate-[-90deg]" />
                    </button>
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
