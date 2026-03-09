import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router';
import { FileText, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { useLoginForm } from '../hooks/useLoginForm';

export function Login({ embedded = false }: { embedded?: boolean }) {
  const location = useLocation();
  const { login, signInWithGoogle, isAuthenticated } = useApp();
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState('');
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
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const successMessage = location.state?.message as string | undefined;

  const cardStyle = {
    backgroundColor: 'var(--card, #ffffff)',
    borderColor: 'var(--border, rgba(0,0,0,0.12))',
    borderWidth: 1,
    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.08), 0 2px 4px -2px rgb(0 0 0 / 0.04)',
  };
  const textStyle = { color: 'var(--foreground, #0f172a)' };
  const mutedStyle = { color: 'var(--muted-foreground, #64748b)' };
  const inputStyle = {
    backgroundColor: 'var(--input-background, #f8fafc)',
    color: 'var(--foreground, #0f172a)',
    borderColor: 'var(--border, #e2e8f0)',
  };
  const pageBg = { backgroundColor: 'var(--background, #f8fafc)' };

  const cardContent = (
    <>
      {/* Headings removed as they are now in the AuthLayout overlay */}

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

      <button
        type="button"
        onClick={async () => {
          setGoogleLoading(true);
          setGoogleError('');
          try {
            await signInWithGoogle();
          } catch (err) {
            const msg = err instanceof Error ? err.message : 'Google sign-in failed';
            setGoogleError(
              /provider.*not enabled|provider.*disabled/i.test(msg)
                ? 'Google sign-in is not configured. Enable the Google provider in Supabase Dashboard → Authentication → Providers.'
                : msg
            );
          } finally {
            setGoogleLoading(false);
          }
        }}
        disabled={googleLoading}
        className="w-full flex items-center justify-center gap-3 py-3 px-4 border rounded-lg font-medium hover:opacity-90 active:scale-[0.98] active:opacity-80 transition-all duration-150 disabled:opacity-50 disabled:active:scale-100 disabled:cursor-not-allowed cursor-pointer select-none"
        style={{ ...inputStyle, borderWidth: 1 }}
      >
        <svg className="size-5 shrink-0" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
        {googleLoading ? 'Redirecting...' : 'Continue with Google'}
      </button>
      {googleError && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400">{googleError}</p>
      )}

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t" style={{ borderColor: 'var(--border)' }} />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4" style={{ backgroundColor: 'var(--card)', ...mutedStyle }}>or</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
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
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              className="w-full pl-10 pr-12 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
          <Link to={embedded ? '/login?view=forgot' : '/forgot-password'} className="text-sm text-blue-600 dark:text-blue-400 hover:opacity-80 font-medium">
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm" style={mutedStyle}>
        Don&apos;t have an account?{' '}
        <Link to={embedded ? '/login?view=register' : '/register'} className="text-blue-600 dark:text-blue-400 hover:opacity-80 font-medium">
          Sign up for free
        </Link>
      </p>
    </>
  );

  if (embedded) {
    return <div className="w-full">{cardContent}</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={pageBg}>
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
          {cardContent}
        </div>

        <p className="mt-8 text-center text-xs" style={mutedStyle}>
          © 2026 DocTrack. All rights reserved.
        </p>
      </div>
    </div>
  );
}
