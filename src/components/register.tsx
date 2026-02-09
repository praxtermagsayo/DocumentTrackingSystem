import { Link } from 'react-router';
import { FileText, Mail, Lock, Eye, EyeOff, User, Building2, Phone } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { useRegisterForm } from '../hooks/useRegisterForm';

export function Register() {
  const { isAuthenticated } = useApp();
  const {
    formData,
    handleChange,
    error,
    isLoading,
    showPassword,
    setShowPassword,
    showConfirmPassword,
    setShowConfirmPassword,
    handleSubmit,
  } = useRegisterForm(isAuthenticated);

  const cardStyle = { backgroundColor: 'var(--card)', borderColor: 'var(--border)' };
  const textStyle = { color: 'var(--foreground)' };
  const mutedStyle = { color: 'var(--muted-foreground)' };
  const inputStyle = { backgroundColor: 'var(--input-background)', color: 'var(--foreground)', borderColor: 'var(--border)' };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: 'var(--background)' }}>
      <div className="w-full max-w-2xl">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <FileText className="size-7 text-white" />
            </div>
            <h1 className="text-3xl font-bold" style={textStyle}>DocTrack</h1>
          </div>
          <p style={mutedStyle}>Create your account to get started</p>
        </div>

        {/* Registration Card */}
        <div className="rounded-2xl shadow-xl border p-8" style={cardStyle}>
          <div className="mb-6">
            <h2 className="text-2xl font-semibold mb-2" style={textStyle}>Sign up</h2>
            <p style={mutedStyle}>Join DocTrack and start managing your documents</p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-500/20 border border-red-500/40">
              <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium mb-2" style={textStyle}>
                  First Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 size-5 pointer-events-none" style={mutedStyle} />
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="Alex"
                    className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    style={inputStyle}
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium mb-2" style={textStyle}>
                  Last Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 size-5 pointer-events-none" style={mutedStyle} />
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Morgan"
                    className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    style={inputStyle}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2" style={textStyle}>
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-5 pointer-events-none" style={mutedStyle} />
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="alex.m@doctrack.com"
                  className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  style={inputStyle}
                  required
                />
              </div>
            </div>

            {/* Password Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-2" style={textStyle}>
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-5 pointer-events-none" style={mutedStyle} />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    style={inputStyle}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 hover:opacity-80"
                    style={mutedStyle}
                  >
                    {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2" style={textStyle}>
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-5 pointer-events-none" style={mutedStyle} />
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    style={inputStyle}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 hover:opacity-80"
                    style={mutedStyle}
                  >
                    {showConfirmPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Phone & Organization */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium mb-2" style={textStyle}>
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-5 pointer-events-none" style={mutedStyle} />
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+1 (555) 123-4567"
                    className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    style={inputStyle}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="organization" className="block text-sm font-medium mb-2" style={textStyle}>
                  Organization
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 size-5 pointer-events-none" style={mutedStyle} />
                  <input
                    id="organization"
                    name="organization"
                    type="text"
                    value={formData.organization}
                    onChange={handleChange}
                    placeholder="Acme Corporation"
                    className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    style={inputStyle}
                  />
                </div>
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="terms"
                className="w-4 h-4 mt-1 text-blue-600 border-slate-300 rounded focus:ring-2 focus:ring-blue-500"
                required
              />
              <label htmlFor="terms" className="text-sm" style={mutedStyle}>
                I agree to the{' '}
                <button type="button" className="text-blue-600 dark:text-blue-400 hover:opacity-80 font-medium">
                  Terms of Service
                </button>{' '}
                and{' '}
                <button type="button" className="text-blue-600 dark:text-blue-400 hover:opacity-80 font-medium">
                  Privacy Policy
                </button>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          {/* Sign In Link */}
          <p className="mt-6 text-center text-sm" style={mutedStyle}>
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 dark:text-blue-400 hover:opacity-80 font-medium">
              Sign in
            </Link>
          </p>
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-xs" style={mutedStyle}>
          © 2026 DocTrack. All rights reserved.
        </p>
      </div>
    </div>
  );
}
