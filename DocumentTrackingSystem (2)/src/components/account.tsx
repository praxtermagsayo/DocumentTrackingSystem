import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useApp } from '../contexts/AppContext';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Building,
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
    department: 'Legal Department',
    location: 'San Francisco, CA',
    joinDate: 'January 15, 2024',
  });

  const handleSave = () => {
    // Save account settings
    toast.success('Account settings saved successfully');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 mb-2"
        >
          <ArrowLeft className="size-4" />
          Back
        </button>
        <h1 className="text-2xl font-semibold text-slate-900">Account Settings</h1>
        <p className="mt-1 text-slate-600">Manage your account information and preferences</p>
      </div>

      {/* Profile Picture */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Profile Picture</h2>
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-medium">
              {user?.initials}
            </div>
            <button className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors">
              <Camera className="size-4" />
            </button>
          </div>
          <div>
            <p className="text-sm text-slate-600 mb-2">
              Upload a new profile picture or use your initials
            </p>
            <div className="flex gap-2">
              <button className="px-4 py-2 text-sm font-medium text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
                Upload Photo
              </button>
              <button className="px-4 py-2 text-sm font-medium text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
                Remove
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Personal Information */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Personal Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              <div className="flex items-center gap-2 mb-2">
                <User className="size-4" />
                Full Name
              </div>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              <div className="flex items-center gap-2 mb-2">
                <Mail className="size-4" />
                Email Address
              </div>
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              <div className="flex items-center gap-2 mb-2">
                <Phone className="size-4" />
                Phone Number
              </div>
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              <div className="flex items-center gap-2 mb-2">
                <Building className="size-4" />
                Department
              </div>
            </label>
            <select
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option>Legal Department</option>
              <option>Finance Team</option>
              <option>HR & Admin</option>
              <option>Engineering</option>
              <option>Marketing</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="size-4" />
                Location
              </div>
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="size-4" />
                Join Date
              </div>
            </label>
            <input
              type="text"
              value={formData.joinDate}
              disabled
              className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-500"
            />
          </div>
        </div>
      </div>

      {/* Security */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Security</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Current Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              New Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Confirm New Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button className="px-4 py-2 text-sm font-medium text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
            Change Password
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
          className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
