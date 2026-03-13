import { useApp } from '../../contexts/AppContext';

interface UserAvatarProps {
    /** Optional override — only needed if showing someone else's avatar */
    avatarUrl?: string | null;
    initials?: string;
    size?: 'xs' | 'sm' | 'md' | 'lg';
    className?: string;
}

const sizeMap = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-24 h-24 text-2xl',
};

/**
 * Renders the user's profile picture if available, otherwise falls back to
 * the gradient-initials bubble. Uses the current user's avatarUrl from
 * AppContext by default — so it reacts globally when the avatar changes.
 */
export function UserAvatar({ avatarUrl: propAvatarUrl, initials: propInitials, size = 'sm', className = '' }: UserAvatarProps) {
    const { user } = useApp();
    const avatarUrl = propAvatarUrl !== undefined ? propAvatarUrl : user?.avatarUrl;
    const initials = propInitials !== undefined ? propInitials : user?.initials;
    const sizeClass = sizeMap[size];

    if (avatarUrl) {
        return (
            <img
                src={avatarUrl}
                alt={initials ?? 'User'}
                className={`${sizeClass} rounded-full object-cover flex-shrink-0 ${className}`}
            />
        );
    }

    return (
        <div
            className={`${sizeClass} bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium flex-shrink-0 ${className}`}
        >
            {initials ?? '?'}
        </div>
    );
}
