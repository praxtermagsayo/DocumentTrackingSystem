import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useApp } from '../contexts/AppContext';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Save,
  Camera,
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

export function Account() {
  const navigate = useNavigate();
  const { user } = useApp();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    joinDate: 'January 15, 2024',
  });

  const handleSave = () => {
    toast.success('Account settings saved successfully');
  };

  const cardStyle = { backgroundColor: 'var(--card)', borderColor: 'var(--border)' };
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
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm font-medium mb-2 hover:opacity-80 transition-opacity"
          style={mutedStyle}
        >
          <ArrowLeft className="size-4" />
          Back
        </button>
        <h1 className="text-2xl font-semibold" style={textStyle}>Account Settings</h1>
        <p className="mt-1" style={mutedStyle}>Manage your account information and preferences</p>
      </div>

      {/* Profile Picture */}
      <div className="rounded-xl border p-6" style={cardStyle}>
        <h2 className="text-lg font-semibold mb-4" style={textStyle}>Profile Picture</h2>
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-medium">
              {user?.initials}
            </div>
            <button type="button" className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors">
              <Camera className="size-4" />
            </button>
          </div>
          <div>
            <p className="text-sm mb-2" style={mutedStyle}>
              Upload a new profile picture or use your initials
            </p>
            <div className="flex gap-2">
              <button type="button" className="px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 border border-blue-600 dark:border-blue-400 rounded-lg hover:opacity-90 transition-opacity" style={cardStyle}>
                Upload Photo
              </button>
              <button type="button" className="px-4 py-2 text-sm font-medium border rounded-lg transition-opacity hover:opacity-90" style={{ ...cardStyle, ...mutedStyle }}>
                Remove
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Personal Information */}
      <div className="rounded-xl border p-6" style={cardStyle}>
        <h2 className="text-lg font-semibold mb-4" style={textStyle}>Personal Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={textStyle}>
              <div className="flex items-center gap-2 mb-2">
                <User className="size-4" style={mutedStyle} />
                Full Name
              </div>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={inputStyle}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={textStyle}>
              <div className="flex items-center gap-2 mb-2">
                <Mail className="size-4" style={mutedStyle} />
                Email Address
              </div>
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={inputStyle}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={textStyle}>
              <div className="flex items-center gap-2 mb-2">
                <Phone className="size-4" style={mutedStyle} />
                Phone Number
              </div>
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={inputStyle}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={textStyle}>
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="size-4" style={mutedStyle} />
                Location
              </div>
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={inputStyle}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={textStyle}>
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="size-4" style={mutedStyle} />
                Join Date
              </div>
            </label>
            <input
              type="text"
              value={formData.joinDate}
              disabled
              className="w-full px-4 py-2 border rounded-lg opacity-80"
              style={{ ...inputStyle, backgroundColor: 'var(--muted)' }}
            />
          </div>
        </div>
      </div>

      {/* Security */}
      <div className="rounded-xl border p-6" style={cardStyle}>
        <h2 className="text-lg font-semibold mb-4" style={textStyle}>Security</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={textStyle}>
              Current Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={inputStyle}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={textStyle}>
              New Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={inputStyle}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={textStyle}>
              Confirm New Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={inputStyle}
            />
          </div>
          <button type="button" className="px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 border border-blue-600 dark:border-blue-400 rounded-lg hover:opacity-90 transition-opacity" style={cardStyle}>
            Change Password
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleSave}
          className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          <Save className="size-4" />
          Save Changes
        </button>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="px-6 py-2 border rounded-lg transition-colors font-medium hover:opacity-90"
          style={{ ...cardStyle, color: 'var(--foreground)' }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
