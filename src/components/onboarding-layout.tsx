import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ShieldHalf, Phone } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useApp } from '../contexts/AppContext';

export function OnboardingLayout() {
    const navigate = useNavigate();
    const { user, needsOnboarding } = useApp();
    const [phone, setPhone] = useState('');
    const [role, setRole] = useState('user');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // If they somehow land here but don't need onboarding, send them home.
    useEffect(() => {
        if (!needsOnboarding && user) {
            navigate('/', { replace: true });
        }
    }, [needsOnboarding, user, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const { error: updateError } = await supabase.auth.updateUser({
                data: {
                    role,
                    phone: phone || undefined,
                },
            });

            if (updateError) throw updateError;

            // Force reload to update app context state
            window.location.href = '/';
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to update profile. Please try again.';
            setError(message);
        } finally {
            setIsLoading(false);
        }
    };

    const textStyle = { color: 'var(--foreground)' };
    const mutedStyle = { color: 'var(--muted-foreground)' };
    const inputStyle = {
        backgroundColor: 'var(--input-background)',
        color: 'var(--foreground)',
        borderColor: 'var(--border)',
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
            <div className="max-w-md w-full p-8 rounded-2xl shadow-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 transition-all duration-300">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 mb-4">
                        <span className="text-2xl font-bold">{user?.initials || '👋'}</span>
                    </div>
                    <h2 className="text-2xl font-bold mb-2" style={textStyle}>
                        Welcome, {user?.name?.split(' ')[0] || 'User'}!
                    </h2>
                    <p style={mutedStyle}>
                        Since you signed in with Google, we just need a few more details to complete your profile.
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-4 rounded-lg bg-red-500/20 border border-red-500/40">
                        <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="phone" className="block text-sm font-medium mb-1" style={textStyle}>
                            Phone Number <span style={mutedStyle} className="font-normal">(Optional)</span>
                        </label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-5 pointer-events-none" style={mutedStyle} />
                            <input
                                id="phone"
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="+1 (555) 123-4567"
                                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                style={inputStyle}
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="role" className="block text-sm font-medium mb-1" style={textStyle}>
                            Role <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <ShieldHalf className="absolute left-3 top-1/2 -translate-y-1/2 size-5 pointer-events-none" style={mutedStyle} />
                            <select
                                id="role"
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                className="w-full pl-10 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                                style={{
                                    ...inputStyle,
                                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                                    backgroundSize: '1rem',
                                    backgroundRepeat: 'no-repeat',
                                    backgroundPosition: 'right 1rem center'
                                }}
                                required
                            >
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                        <p className="mt-2 text-xs" style={mutedStyle}>
                            Admins have permissions to create and manage categories.
                        </p>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors focus:ring-4 focus:ring-blue-500/50 disabled:opacity-50 flex justify-center items-center"
                    >
                        {isLoading ? (
                            <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            'Complete Profile'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
