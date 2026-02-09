import { useEffect } from 'react';
import { Link, useLocation } from 'react-router';
import { FileText, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { useLoginForm } from '../hooks/useLoginForm';

export function Login() {
  const location = useLocation();
  const { login, isAuthenticated } = useApp();
  const {
    email,
    setEmail,
    password,
    setPassword,
    error,
    isLoading,
    showPassword,
    setShowPassword,
    handleSubmit,
    navigate,
  } = useLoginForm(login, isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const successMessage = location.state?.message as string | undefined;

  const cardStyle = { backgroundColor: 'var(--card)', borderColor: 'var(--border)' };
  const textStyle = { color: 'var(--foreground)' };
  const mutedStyle = { color: 'var(--muted-foreground)' };
  const inputStyle = { backgroundColor: 'var(--input-background)', color: 'var(--foreground)', borderColor: 'var(--border)' };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: 'var(--background)' }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <FileText className="size-7 text-white" />
            </div>
            <h1 className="text-3xl font-bold" style={textStyle}>DocTrack</h1>
          </div>
          <p style={mutedStyle}>Document Tracking & Management System</p>
        </div>

        <div className="rounded-2xl shadow-xl border p-8" style={cardStyle}>
          <div className="mb-6">
            <h2 className="text-2xl font-semibold mb-2" style={textStyle}>Welcome back</h2>
            <p style={mutedStyle}>Sign in to continue to your account</p>
          </div>

          {successMessage && (
            <div className="mb-6 p-4 rounded-lg bg-green-500/20 border border-green-500/40">
              <p className="text-sm text-green-800 dark:text-green-300">{successMessage}</p>
            </div>
          )}
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-500/20 border border-red-500/40">
              <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2" style={textStyle}>
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-5" style={mutedStyle} />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex.m@doctrack.com"
                  className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  style={inputStyle}
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2" style={textStyle}>
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-5" style={mutedStyle} />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm" style={mutedStyle}>Remember me</span>
              </label>
              <button type="button" className="text-sm text-blue-600 dark:text-blue-400 hover:opacity-80 font-medium">
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm" style={mutedStyle}>
            Don&apos;t have an account?{' '}
            <Link to="/register" className="text-blue-600 dark:text-blue-400 hover:opacity-80 font-medium">
              Sign up for free
            </Link>
          </p>
        </div>

        <p className="mt-8 text-center text-xs" style={mutedStyle}>
          © 2026 DocTrack. All rights reserved.
        </p>
      </div>
    </div>
  );
}
