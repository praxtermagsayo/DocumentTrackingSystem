import { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  ArrowLeft,
  Bell,
  Globe,
  Lock,
  Palette,
  Download,
  Trash2,
  Save,
} from 'lucide-react';
import { toast } from 'sonner';
import { useApp } from '../contexts/AppContext';

export function Settings() {
  const navigate = useNavigate();
  const { theme, setTheme } = useApp();
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    documentUpdates: true,
    weeklyDigest: true,
    language: 'en',
    timezone: 'America/Los_Angeles',
    autoSave: true,
    defaultView: 'grid',
  });

  const handleSave = () => {
    toast.success('Settings saved successfully');
  };

  const cardStyle = {
    backgroundColor: 'var(--card)',
    borderColor: 'var(--border)',
  };
  const textStyle = { color: 'var(--foreground)' };
  const mutedStyle = { color: 'var(--muted-foreground)' };
  const inputStyle = {
    backgroundColor: 'var(--input-background)',
    color: 'var(--foreground)',
    borderColor: 'var(--border)',
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm font-medium mb-2 transition-opacity hover:opacity-80"
          style={mutedStyle}
        >
          <ArrowLeft className="size-4" />
          Back
        </button>
        <h1 className="text-2xl font-semibold" style={textStyle}>Settings</h1>
        <p className="mt-1 text-sm" style={mutedStyle}>Manage your application preferences</p>
      </div>

      {/* Notifications Settings */}
      <div className="rounded-xl border p-6" style={cardStyle}>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-500/15 rounded-lg">
            <Bell className="size-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold" style={textStyle}>Notifications</h2>
            <p className="text-sm" style={mutedStyle}>Configure how you receive notifications</p>
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium" style={textStyle}>Email Notifications</p>
              <p className="text-sm" style={mutedStyle}>Receive email alerts for important updates</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.emailNotifications}
                onChange={(e) =>
                  setSettings({ ...settings, emailNotifications: e.target.checked })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 dark:bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white dark:after:bg-slate-300 after:border after:border-slate-300 dark:after:border-slate-500 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium" style={textStyle}>Push Notifications</p>
              <p className="text-sm" style={mutedStyle}>Receive browser push notifications</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.pushNotifications}
                onChange={(e) =>
                  setSettings({ ...settings, pushNotifications: e.target.checked })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 dark:bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white dark:after:bg-slate-300 after:border after:border-slate-300 dark:after:border-slate-500 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium" style={textStyle}>Document Updates</p>
              <p className="text-sm" style={mutedStyle}>Get notified when documents change status</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.documentUpdates}
                onChange={(e) =>
                  setSettings({ ...settings, documentUpdates: e.target.checked })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 dark:bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white dark:after:bg-slate-300 after:border after:border-slate-300 dark:after:border-slate-500 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium" style={textStyle}>Weekly Digest</p>
              <p className="text-sm" style={mutedStyle}>Receive a weekly summary of activity</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.weeklyDigest}
                onChange={(e) =>
                  setSettings({ ...settings, weeklyDigest: e.target.checked })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 dark:bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white dark:after:bg-slate-300 after:border after:border-slate-300 dark:after:border-slate-500 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Preferences */}
      <div className="rounded-xl border p-6" style={cardStyle}>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-purple-500/15 rounded-lg">
            <Globe className="size-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold" style={textStyle}>Preferences</h2>
            <p className="text-sm" style={mutedStyle}>Customize your experience</p>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={textStyle}>Language</label>
            <select
              value={settings.language}
              onChange={(e) => setSettings({ ...settings, language: e.target.value })}
              className="w-full pl-4 pr-8 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={inputStyle}
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={textStyle}>Timezone</label>
            <select
              value={settings.timezone}
              onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
              className="w-full pl-4 pr-8 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={inputStyle}
            >
              <option value="America/Los_Angeles">Pacific Time (PT)</option>
              <option value="America/Denver">Mountain Time (MT)</option>
              <option value="America/Chicago">Central Time (CT)</option>
              <option value="America/New_York">Eastern Time (ET)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={textStyle}>Default View</label>
            <select
              value={settings.defaultView}
              onChange={(e) => setSettings({ ...settings, defaultView: e.target.value })}
              className="w-full pl-4 pr-8 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={inputStyle}
            >
              <option value="grid">Grid View</option>
              <option value="list">List View</option>
              <option value="compact">Compact View</option>
            </select>
          </div>
        </div>
      </div>

      {/* Appearance */}
      <div className="rounded-xl border p-6" style={cardStyle}>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-pink-500/15 rounded-lg">
            <Palette className="size-5 text-pink-600 dark:text-pink-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold" style={textStyle}>Appearance</h2>
            <p className="text-sm" style={mutedStyle}>Customize the look and feel</p>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2" style={textStyle}>Theme</label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => {
                setTheme('light');
                toast.success('Theme set to light');
              }}
              className={`flex-1 p-4 border-2 rounded-lg transition-all ${
                theme === 'light'
                  ? 'border-blue-600 bg-blue-500/15'
                  : 'hover:opacity-90'
              }`}
              style={theme === 'light' ? undefined : { borderColor: 'var(--border)' }}
            >
              <p className="font-medium text-center" style={textStyle}>Light</p>
            </button>
            <button
              type="button"
              onClick={() => {
                setTheme('dark');
                toast.success('Theme set to dark');
              }}
              className={`flex-1 p-4 border-2 rounded-lg transition-all ${
                theme === 'dark'
                  ? 'border-blue-600 bg-blue-500/15'
                  : 'hover:opacity-90'
              }`}
              style={theme === 'dark' ? undefined : { borderColor: 'var(--border)' }}
            >
              <p className="font-medium text-center" style={textStyle}>Dark</p>
            </button>
            <button
              type="button"
              onClick={() => {
                setTheme('system');
                toast.success('Theme set to system');
              }}
              className={`flex-1 p-4 border-2 rounded-lg transition-all ${
                theme === 'system'
                  ? 'border-blue-600 bg-blue-500/15'
                  : 'hover:opacity-90'
              }`}
              style={theme === 'system' ? undefined : { borderColor: 'var(--border)' }}
            >
              <p className="font-medium text-center" style={textStyle}>System</p>
            </button>
          </div>
        </div>
      </div>

      {/* Privacy & Security */}
      <div className="rounded-xl border p-6" style={cardStyle}>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-green-500/15 rounded-lg">
            <Lock className="size-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold" style={textStyle}>Privacy & Security</h2>
            <p className="text-sm" style={mutedStyle}>Manage your data and security</p>
          </div>
        </div>
        <div className="space-y-3">
          <button
            className="w-full flex items-center justify-between p-4 border rounded-lg transition-colors hover:opacity-90"
            style={{ borderColor: 'var(--border)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--accent)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '';
            }}
          >
            <div className="flex items-center gap-3">
              <Download className="size-5" style={mutedStyle} />
              <div className="text-left">
                <p className="font-medium" style={textStyle}>Export Data</p>
                <p className="text-sm" style={mutedStyle}>Download all your documents and data</p>
              </div>
            </div>
          </button>

          <button className="w-full flex items-center justify-between p-4 border border-red-300 dark:border-red-800 rounded-lg hover:bg-red-500/10 transition-colors text-red-600 dark:text-red-400">
            <div className="flex items-center gap-3">
              <Trash2 className="size-5" />
              <div className="text-left">
                <p className="font-medium">Delete Account</p>
                <p className="text-sm opacity-90">Permanently delete your account and data</p>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          <Save className="size-4" />
          Save Changes
        </button>
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-2 border rounded-lg transition-colors font-medium hover:opacity-90"
          style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--accent)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '';
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
