import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useApp } from '../contexts/AppContext';
import { ArrowLeft, Bell, BellOff, Check, Loader2 } from 'lucide-react';
import { formatNotificationTime, getNotificationIconClass } from '../lib/format';

export function Notifications() {
  const navigate = useNavigate();
  const { notifications, refreshNotifications, markNotificationAsRead, markAllNotificationsAsRead, unreadCount } = useApp();

  // Refetch when opening the page so list and unread count stay in sync
  useEffect(() => {
    refreshNotifications();
  }, [refreshNotifications]);
  const [markingId, setMarkingId] = useState<string | null>(null);
  const [isMarkingAll, setIsMarkingAll] = useState(false);

  const cardStyle = { backgroundColor: 'var(--card)', borderColor: 'var(--border)' };
  const textStyle = { color: 'var(--foreground)' };
  const mutedStyle = { color: 'var(--muted-foreground)' };

  const handleMarkOne = async (notificationId: string, link?: string | null) => {
    if (markingId !== null) return;
    setMarkingId(notificationId);
    try {
      await markNotificationAsRead(notificationId);
      if (link) navigate(link, { state: { from: '/notifications' } });
    } finally {
      setMarkingId(null);
    }
  };

  const handleMarkAll = async () => {
    if (isMarkingAll) return;
    setIsMarkingAll(true);
    try {
      await markAllNotificationsAsRead();
    } finally {
      setIsMarkingAll(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-sm font-medium mb-2 hover:opacity-80 transition-opacity"
            style={mutedStyle}
          >
            <ArrowLeft className="size-4" />
            Back
          </button>
          <h1 className="text-2xl font-semibold" style={textStyle}>Notifications</h1>
          <p className="mt-1" style={mutedStyle}>
            {unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={handleMarkAll}
            disabled={isMarkingAll}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:opacity-80 rounded-lg transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isMarkingAll ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
            {isMarkingAll ? 'Marking...' : 'Mark all as read'}
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="rounded-xl border divide-y" style={{ ...cardStyle, borderColor: 'var(--border)' }}>
        {notifications.length === 0 ? (
          <div className="p-12 text-center">
            <BellOff className="mx-auto size-12" style={mutedStyle} />
            <h3 className="mt-4 text-lg font-medium" style={textStyle}>No notifications</h3>
            <p className="mt-2 text-sm" style={mutedStyle}>
              We'll notify you when something important happens
            </p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              role="button"
              tabIndex={0}
              className="p-4 transition-colors cursor-pointer hover:opacity-90 disabled:opacity-70 disabled:cursor-not-allowed"
              style={{
                backgroundColor: !notification.read ? 'var(--accent)' : 'var(--card)',
                borderColor: 'var(--border)',
              }}
              onClick={() => handleMarkOne(notification.id, notification.link)}
              onKeyDown={(e) => e.key === 'Enter' && handleMarkOne(notification.id, notification.link)}
              aria-busy={markingId === notification.id}
            >
              <div className="flex items-start gap-4">
                <div className={`p-2 rounded-lg shrink-0 ${getNotificationIconClass(notification.type)}`}>
                  {markingId === notification.id ? (
                    <Loader2 className="size-5 animate-spin" />
                  ) : (
                    <Bell className="size-5" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium" style={textStyle}>{notification.title}</h3>
                        {!notification.read && (
                          <span className="w-2 h-2 bg-blue-600 rounded-full" />
                        )}
                      </div>
                      <p className="mt-1 text-sm" style={mutedStyle}>{notification.message}</p>
                    </div>
                    <span className="text-xs whitespace-nowrap" style={mutedStyle}>
                      {formatNotificationTime(notification.timestamp)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
