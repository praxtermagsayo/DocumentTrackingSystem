import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { useApp } from '../contexts/AppContext';
import {
  ArrowLeft,
  User,
  ShieldCheck,
  Mail,
  Phone,
  Camera,
  Save,
  Loader2,
} from 'lucide-react';
import { toast } from '../lib/toast';
import { supabase } from '../lib/supabase';
import { cardStyle, inputStyle } from '../styles/themeStyles';
import * as profileService from '../services/profile';

export function Account() {
  const navigate = useNavigate();
  const { user, currentUserId, refreshAvatar } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    mobileNumber: '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const textStyle = { color: 'var(--foreground)' };
  const mutedStyle = { color: 'var(--muted-foreground)' };

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        role: user.role || '',
        mobileNumber: '',
      });
    }
  }, [user]);

  useEffect(() => {
    if (!currentUserId) return;
    profileService.fetchProfile(currentUserId).then((profile) => {
      if (profile) {
        setFormData((prev) => ({
          ...prev,
          name: profile.display_name || prev.name,
          email: profile.email || prev.email,
          mobileNumber: profile.mobile_number || '',
        }));
        setAvatarUrl(profile.avatar_url);
      }
    });
  }, [currentUserId]);

  const handleSave = async () => {
    if (!currentUserId) return;
    setIsSaving(true);
    try {
      await profileService.updateProfile(currentUserId, {
        display_name: formData.name,
        email: formData.email,
        mobile_number: formData.mobileNumber || null,
      });
      // Update auth metadata for name
      await supabase.auth.updateUser({ data: { full_name: formData.name } });
      toast.success('Profile saved successfully');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setIsChangingPassword(true);
    try {
      await supabase.auth.updateUser({ password: passwordData.newPassword });
      toast.success('Password updated successfully');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to change password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUserId) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    setIsUploadingAvatar(true);
    try {
      const ext = file.name.split('.').pop() || 'jpg';
      const path = `${currentUserId}/avatar.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path);
      const publicUrl = `${urlData.publicUrl}?t=${Date.now()}`;

      await profileService.updateProfile(currentUserId, { avatar_url: publicUrl });
      setAvatarUrl(publicUrl);
      await refreshAvatar(); // propagate to sidebar & all UserAvatar instances
      toast.success('Profile picture updated');
    } catch (err) {
      const raw = err && typeof err === 'object' && 'message' in err
        ? (err as { message?: string }).message
        : err instanceof Error ? err.message : null;
      const msg = (raw && String(raw).trim()) || (err ? String(err) : '') || 'Unknown error';
      const isBucketMissing = /bucket|not found|does not exist|404|object not found/i.test(msg);
      const isRls = /row-level security|policy|rls|violates/i.test(msg);
      let help = msg;
      if (isBucketMissing) {
        help = 'Create "avatars" bucket: Supabase → Storage → New bucket → name: avatars, Public: ON';
      } else if (isRls) {
        help = 'RLS policy: Run fix-avatars-storage-policies.sql in Supabase SQL Editor';
      }
      toast.error(help);
    } finally {
      setIsUploadingAvatar(false);
      e.target.value = '';
    }
  };

  const handleRemoveAvatar = async () => {
    if (!currentUserId) return;
    setIsUploadingAvatar(true);
    try {
      await profileService.updateProfile(currentUserId, { avatar_url: null });
      setAvatarUrl(null);
      await refreshAvatar(); // propagate to sidebar & all UserAvatar instances
      toast.success('Profile picture removed');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to remove');
    } finally {
      setIsUploadingAvatar(false);
    }
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
        <h1 className="text-2xl font-semibold" style={textStyle}>Profile Settings</h1>
        <p className="mt-1" style={mutedStyle}>Manage your profile information</p>
      </div>

      {/* Profile Picture */}
      <div className="rounded-xl border p-6" style={cardStyle}>
        <h2 className="text-lg font-semibold mb-4" style={textStyle}>Profile Picture</h2>
        <div className="flex items-center gap-6">
          <div className="relative">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover"
              />
            ) : (
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-medium">
                {user?.initials}
              </div>
            )}
            <button
              type="button"
              disabled={isUploadingAvatar}
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50"
              aria-label="Change profile picture"
            >
              {isUploadingAvatar ? <Loader2 className="size-4 animate-spin" /> : <Camera className="size-4" />}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={handleAvatarUpload}
            />
          </div>
          <div>
            <p className="text-sm mb-2" style={mutedStyle}>
              Upload a new profile picture (JPG, PNG)
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingAvatar}
                className="px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 border border-blue-600 dark:border-blue-400 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                style={cardStyle}
              >
                Change Picture
              </button>
              <button
                type="button"
                onClick={handleRemoveAvatar}
                disabled={!avatarUrl || isUploadingAvatar}
                className="px-4 py-2 text-sm font-medium border rounded-lg transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ ...cardStyle, color: 'var(--muted-foreground)' }}
              >
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
              <div className="flex items-center gap-2">
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
              placeholder="Your full name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={textStyle}>
              <div className="flex items-center gap-2">
                <Mail className="size-4" style={mutedStyle} />
                Email
              </div>
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={inputStyle}
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={textStyle}>
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-4" style={mutedStyle} />
                Role
              </div>
            </label>
            <input
              type="text"
              value={formData.role}
              disabled
              className="w-full px-4 py-2 border rounded-lg opacity-80 cursor-not-allowed"
              style={{ ...inputStyle, backgroundColor: 'var(--muted)' }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={textStyle}>
              <div className="flex items-center gap-2">
                <Phone className="size-4" style={mutedStyle} />
                Mobile Number
              </div>
            </label>
            <input
              type="tel"
              value={formData.mobileNumber}
              onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={inputStyle}
              placeholder="+1 234 567 8900"
            />
          </div>
        </div>
      </div>

      {/* Change Password */}
      <div className="rounded-xl border p-6" style={cardStyle}>
        <h2 className="text-lg font-semibold mb-4" style={textStyle}>Change Password</h2>
        <div className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-medium mb-2" style={textStyle}>
              Current Password
            </label>
            <input
              type="password"
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
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
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
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
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
              placeholder="••••••••"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={inputStyle}
            />
          </div>
          <button
            type="button"
            onClick={handleChangePassword}
            disabled={isChangingPassword || !passwordData.newPassword || !passwordData.confirmPassword}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 border border-blue-600 dark:border-blue-400 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            style={cardStyle}
          >
            {isChangingPassword ? <Loader2 className="size-4 animate-spin" /> : null}
            Change Password
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
        >
          {isSaving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
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
