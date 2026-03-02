import { useState } from 'react';
import { 
  Settings, 
  Users, 
  Shield, 
  Bell, 
  Database, 
  Folder, 
  AlertTriangle,
  Check,
  Save
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

export function AdminSettings() {
  const [activeTab, setActiveTab] = useState<'general' | 'users' | 'security' | 'notifications' | 'categories' | 'retention'>('general');
  const [settings, setSettings] = useState({
    siteName: 'DocTrack',
    maxFileSize: '50',
    allowedFileTypes: 'PDF, DOCX, XLSX, PPT, ZIP',
    autoArchiveDays: '365',
    notifyOnUpload: true,
    notifyOnApproval: true,
    notifyOnRejection: true,
    requireApproval: true,
    enableVersioning: true,
    enableComments: true,
  });

  const handleSave = () => {
    toast.success('Settings saved successfully!');
  };

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'categories', label: 'Categories', icon: Folder },
    { id: 'retention', label: 'Retention Policies', icon: Database },
  ];

  const users = [
    { id: '1', name: 'Sarah Wilson', email: 'sarah@doctrack.com', role: 'Admin', status: 'Active' },
    { id: '2', name: 'Michael Chen', email: 'michael@doctrack.com', role: 'Manager', status: 'Active' },
    { id: '3', name: 'Emily Davis', email: 'emily@doctrack.com', role: 'User', status: 'Active' },
    { id: '4', name: 'David Miller', email: 'david@doctrack.com', role: 'User', status: 'Inactive' },
  ];

  const categories = [
    { id: '1', name: 'Legal', documentCount: 145, color: 'blue' },
    { id: '2', name: 'Finance', documentCount: 98, color: 'green' },
    { id: '3', name: 'HR', documentCount: 76, color: 'purple' },
    { id: '4', name: 'Engineering', documentCount: 124, color: 'orange' },
    { id: '5', name: 'Marketing', documentCount: 87, color: 'red' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-slate-800">Admin Settings</h2>
        <p className="text-sm text-slate-600 mt-1">Manage system configuration and user settings</p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <Icon className="size-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        {/* General Settings */}
        {activeTab === 'general' && (
          <div className="p-6 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-4">General Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Site Name
                  </label>
                  <input
                    type="text"
                    value={settings.siteName}
                    onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Maximum File Size (MB)
                  </label>
                  <input
                    type="number"
                    value={settings.maxFileSize}
                    onChange={(e) => setSettings({ ...settings, maxFileSize: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Allowed File Types
                  </label>
                  <input
                    type="text"
                    value={settings.allowedFileTypes}
                    onChange={(e) => setSettings({ ...settings, allowedFileTypes: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="PDF, DOCX, XLSX, etc."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Auto-Archive After (Days)
                  </label>
                  <input
                    type="number"
                    value={settings.autoArchiveDays}
                    onChange={(e) => setSettings({ ...settings, autoArchiveDays: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="requireApproval"
                    checked={settings.requireApproval}
                    onChange={(e) => setSettings({ ...settings, requireApproval: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <label htmlFor="requireApproval" className="text-sm text-slate-700">
                    Require approval for all documents
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="enableVersioning"
                    checked={settings.enableVersioning}
                    onChange={(e) => setSettings({ ...settings, enableVersioning: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <label htmlFor="enableVersioning" className="text-sm text-slate-700">
                    Enable document versioning
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="enableComments"
                    checked={settings.enableComments}
                    onChange={(e) => setSettings({ ...settings, enableComments: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <label htmlFor="enableComments" className="text-sm text-slate-700">
                    Enable comments on documents
                  </label>
                </div>
              </div>
            </div>
            <div className="flex justify-end pt-4 border-t border-slate-200">
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                <Save className="size-4" />
                Save Changes
              </button>
            </div>
          </div>
        )}

        {/* User Management */}
        {activeTab === 'users' && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-800">User Management</h3>
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                <Users className="size-4" />
                Add User
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
                            {user.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <span className="text-sm font-medium text-slate-900">{user.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">{user.email}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${
                          user.role === 'Admin' ? 'bg-purple-50 text-purple-700' :
                          user.role === 'Manager' ? 'bg-blue-50 text-blue-700' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${
                          user.status === 'Active' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                        }`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                            Edit
                          </button>
                          <button className="text-red-600 hover:text-red-700 text-sm font-medium">
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Security Settings */}
        {activeTab === 'security' && (
          <div className="p-6 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Security Settings</h3>
              <div className="space-y-4">
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3">
                  <AlertTriangle className="size-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-yellow-900">Security Alert</p>
                    <p className="text-sm text-yellow-700 mt-1">
                      Two-factor authentication is recommended for all admin accounts
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-slate-900">Two-Factor Authentication</p>
                    <p className="text-xs text-slate-600 mt-1">Add an extra layer of security to your account</p>
                  </div>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                    Enable
                  </button>
                </div>
                <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-slate-900">Session Timeout</p>
                    <p className="text-xs text-slate-600 mt-1">Automatically log out users after inactivity</p>
                  </div>
                  <select className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>15 minutes</option>
                    <option>30 minutes</option>
                    <option>1 hour</option>
                    <option>4 hours</option>
                  </select>
                </div>
                <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-slate-900">Password Policy</p>
                    <p className="text-xs text-slate-600 mt-1">Minimum password requirements for all users</p>
                  </div>
                  <button className="px-4 py-2 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium text-slate-700">
                    Configure
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Notifications */}
        {activeTab === 'notifications' && (
          <div className="p-6 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Notification Preferences</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-slate-900">Document Upload Notifications</p>
                    <p className="text-xs text-slate-600 mt-1">Notify users when new documents are uploaded</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.notifyOnUpload}
                    onChange={(e) => setSettings({ ...settings, notifyOnUpload: e.target.checked })}
                    className="w-5 h-5 text-blue-600 border-slate-300 rounded focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-slate-900">Approval Notifications</p>
                    <p className="text-xs text-slate-600 mt-1">Notify users when documents are approved</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.notifyOnApproval}
                    onChange={(e) => setSettings({ ...settings, notifyOnApproval: e.target.checked })}
                    className="w-5 h-5 text-blue-600 border-slate-300 rounded focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-slate-900">Rejection Notifications</p>
                    <p className="text-xs text-slate-600 mt-1">Notify users when documents are rejected</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.notifyOnRejection}
                    onChange={(e) => setSettings({ ...settings, notifyOnRejection: e.target.checked })}
                    className="w-5 h-5 text-blue-600 border-slate-300 rounded focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end pt-4 border-t border-slate-200">
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                <Save className="size-4" />
                Save Changes
              </button>
            </div>
          </div>
        )}

        {/* Categories */}
        {activeTab === 'categories' && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-800">Document Categories</h3>
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                <Folder className="size-4" />
                Add Category
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categories.map((category) => (
                <div key={category.id} className="p-4 border border-slate-200 rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 bg-${category.color}-100 rounded-lg flex items-center justify-center`}>
                        <Folder className={`size-5 text-${category.color}-600`} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{category.name}</p>
                        <p className="text-xs text-slate-600">{category.documentCount} documents</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                        Edit
                      </button>
                      <button className="text-red-600 hover:text-red-700 text-sm font-medium">
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Retention Policies */}
        {activeTab === 'retention' && (
          <div className="p-6 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Document Retention Policies</h3>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
                  <Check className="size-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">Default Retention Policy</p>
                    <p className="text-sm text-blue-700 mt-1">
                      Documents are automatically archived after 365 days of inactivity
                    </p>
                  </div>
                </div>
                <div className="p-4 border border-slate-200 rounded-lg">
                  <p className="text-sm font-medium text-slate-900 mb-3">Category-Specific Policies</p>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-700">Legal Documents</span>
                      <span className="text-sm font-medium text-slate-900">7 years</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-700">Financial Records</span>
                      <span className="text-sm font-medium text-slate-900">10 years</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-700">HR Documents</span>
                      <span className="text-sm font-medium text-slate-900">7 years</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-700">Marketing Materials</span>
                      <span className="text-sm font-medium text-slate-900">3 years</span>
                    </div>
                  </div>
                </div>
                <button className="w-full px-4 py-3 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium text-slate-700">
                  Configure Retention Policies
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
