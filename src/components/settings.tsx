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
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../lib/supabase';
import { useApp } from '../contexts/AppContext';
import * as userDataService from '../services/userData';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';

export function Settings() {
  const navigate = useNavigate();
  const { theme, setTheme, logout } = useApp();
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');
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

  const handleExportData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) {
      toast.error('Please sign in to export your data');
      return;
    }
    setIsExporting(true);
    try {
      const data = await userDataService.exportAllUserData(session.user.id);
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `doctrack-export-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Data exported successfully');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to export data');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    const { data: { session }, error: refreshError } = await supabase.auth.refreshSession();
    const token = session?.access_token;

    if (!token || !session?.user?.id) {
      toast.error(refreshError?.message || 'Session expired. Please sign in again and retry.');
      return;
    }

    setIsDeleting(true);
    setShowDeleteConfirm(false);
    try {
      // 1. Pre-fetch token to avoid RLS/refresh issues after profile is deleted
      const userId = session.user.id;

      // 2. Delete database data
      await userDataService.deleteAllUserData(userId);

      // 3. Delete auth user via Edge Function using the captured token
      await userDataService.deleteAuthUser(token);

      logout();
      navigate('/login', { replace: true });
      toast.success('Account and all data have been deleted');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete account');
    } finally {
      setIsDeleting(false);
    }
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
            <Select
              value={settings.language}
              onValueChange={(v: string) => setSettings({ ...settings, language: v })}
            >
              <SelectTrigger className="w-full" style={inputStyle}>
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent style={{ backgroundColor: 'var(--popover)', color: 'var(--popover-foreground)' }}>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Spanish</SelectItem>
                <SelectItem value="fr">French</SelectItem>
                <SelectItem value="de">German</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={textStyle}>Timezone</label>
            <Select
              value={settings.timezone}
              onValueChange={(v: string) => setSettings({ ...settings, timezone: v })}
            >
              <SelectTrigger className="w-full" style={inputStyle}>
                <SelectValue placeholder="Select timezone" />
              </SelectTrigger>
              <SelectContent style={{ backgroundColor: 'var(--popover)', color: 'var(--popover-foreground)' }}>
                <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={textStyle}>Default View</label>
            <Select
              value={settings.defaultView}
              onValueChange={(v: string) => setSettings({ ...settings, defaultView: v })}
            >
              <SelectTrigger className="w-full" style={inputStyle}>
                <SelectValue placeholder="Select view" />
              </SelectTrigger>
              <SelectContent style={{ backgroundColor: 'var(--popover)', color: 'var(--popover-foreground)' }}>
                <SelectItem value="grid">Grid View</SelectItem>
                <SelectItem value="list">List View</SelectItem>
                <SelectItem value="compact">Compact View</SelectItem>
              </SelectContent>
            </Select>
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
              className={`flex-1 p-4 border-2 rounded-lg transition-all ${theme === 'light'
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
              className={`flex-1 p-4 border-2 rounded-lg transition-all ${theme === 'dark'
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
              className={`flex-1 p-4 border-2 rounded-lg transition-all ${theme === 'system'
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
            type="button"
            onClick={handleExportData}
            disabled={isExporting}
            className="w-full flex items-center justify-between p-4 border rounded-lg transition-colors hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ borderColor: 'var(--border)' }}
            onMouseEnter={(e) => {
              if (!isExporting) e.currentTarget.style.backgroundColor = 'var(--accent)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '';
            }}
          >
            <div className="flex items-center gap-3">
              {isExporting ? <Loader2 className="size-5 animate-spin" style={mutedStyle} /> : <Download className="size-5" style={mutedStyle} />}
              <div className="text-left">
                <p className="font-medium" style={textStyle}>Export Data</p>
                <p className="text-sm" style={mutedStyle}>Download all your documents, activities, and data as JSON</p>
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            disabled={isDeleting}
            className="w-full flex items-center justify-between p-4 border border-red-300 dark:border-red-800 rounded-lg hover:bg-red-500/10 transition-colors text-red-600 dark:text-red-400 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-center gap-3">
              {isDeleting ? <Loader2 className="size-5 animate-spin" /> : <Trash2 className="size-5" />}
              <div className="text-left">
                <p className="font-medium">Delete Account</p>
                <p className="text-sm opacity-90">Permanently delete your account and all data</p>
              </div>
            </div>
          </button>
        </div>

        <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete account?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete all your data including documents, activities, event categories, and notifications. This action cannot be undone. You will be signed out.
                <br />
                <br />
                Enter "DELETE MY ACCOUNT" to confirm:
                <div className="mt-2 w-full flex items-center justify-center">
                  <Input
                    type="text"
                    value={deleteConfirm}
                    onChange={(e) => setDeleteConfirm(e.target.value)}
                    placeholder="DELETE MY ACCOUNT"
                  />
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
              <button
                type="button"
                disabled={deleteConfirm !== 'DELETE MY ACCOUNT'}
                onClick={(e) => {
                  e.preventDefault();
                  handleDeleteAccount();
                }}
                className="inline-flex items-center justify-center rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ color: 'var(--white)' }}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" style={mutedStyle} />
                    Deleting...
                  </>
                ) : (
                  <>
                    Delete account
                  </>
                )}
              </button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
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
