import { Link, Outlet, useLocation, useNavigate } from 'react-router';
import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  FileText,
  Inbox,
  Send,
  File,
  Archive,
  Search,
  HelpCircle,
  Bell,
  Plus,
  Settings,
  Circle,
  LogOut,
  User,
  Users,
  ChevronDown,
  X,
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    isAuthenticated,
    logout,
    user,
    teams,
    unreadCount,
    searchQuery,
    setSearchQuery,
  } = useApp();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const teamColors = ['text-orange-500', 'text-green-500', 'text-purple-500', 'text-blue-500', 'text-amber-500'];

  // Check authentication
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/documents', label: 'My Documents', icon: FileText },
    { path: '/inbox', label: 'Inbox', icon: Inbox },
    { path: '/sent', label: 'Sent', icon: Send },
    { path: '/drafts', label: 'Drafts', icon: File },
    { path: '/archived', label: 'Archived', icon: Archive },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex h-screen min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
      {/* Sidebar */}
      <aside
        className="w-64 flex flex-col border-r"
        style={{ backgroundColor: 'var(--sidebar)', borderColor: 'var(--sidebar-border)' }}
      >
        {/* Logo */}
        <div
          className="h-16 flex items-center px-6 border-b"
          style={{ borderColor: 'var(--sidebar-border)' }}
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <FileText className="size-5 text-white" />
            </div>
            <span className="font-semibold" style={{ color: 'var(--sidebar-foreground)' }}>
              DocTrack
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors"
                style={
                  active
                    ? { backgroundColor: 'var(--sidebar-accent)', color: 'var(--sidebar-primary)' }
                    : {
                        color: 'var(--sidebar-foreground)',
                      }
                }
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.backgroundColor = 'var(--sidebar-accent)';
                    e.currentTarget.style.color = 'var(--sidebar-accent-foreground)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.currentTarget.style.backgroundColor = '';
                    e.currentTarget.style.color = 'var(--sidebar-foreground)';
                  }
                }}
              >
                <Icon className="size-5" />
                {item.label}
              </Link>
            );
          })}

          {/* Teams Section */}
          <div className="pt-6">
            <p
              className="px-3 text-xs font-semibold uppercase tracking-wider mb-2"
              style={{ color: 'var(--muted-foreground)' }}
            >
              Teams
            </p>
            <div className="space-y-1">
              <Link
                to="/teams"
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors"
                style={
                  location.pathname === '/teams'
                    ? { backgroundColor: 'var(--sidebar-accent)', color: 'var(--sidebar-primary)' }
                    : { color: 'var(--sidebar-foreground)' }
                }
              >
                <Users className="size-4" />
                Manage teams
              </Link>
              {teams.map((team, i) => {
                const isTeamActive = location.pathname === `/teams/${team.id}`;
                return (
                  <Link
                    key={team.id}
                    to={`/teams/${team.id}`}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors"
                    style={
                      isTeamActive
                        ? { backgroundColor: 'var(--sidebar-accent)', color: 'var(--sidebar-primary)' }
                        : { color: 'var(--sidebar-foreground)' }
                    }
                    onMouseEnter={(e) => {
                      if (!isTeamActive) {
                        e.currentTarget.style.backgroundColor = 'var(--sidebar-accent)';
                        e.currentTarget.style.color = 'var(--sidebar-accent-foreground)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isTeamActive) {
                        e.currentTarget.style.backgroundColor = '';
                        e.currentTarget.style.color = 'var(--sidebar-foreground)';
                      }
                    }}
                  >
                    <Circle className={`size-2 fill-current ${teamColors[i % teamColors.length]}`} />
                    {team.name}
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>

        {/* Settings */}
        <div className="px-3 pb-3 border-t" style={{ borderColor: 'var(--sidebar-border)' }}>
          <button
            onClick={() => navigate('/settings')}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors hover:opacity-90"
            style={{ color: 'var(--sidebar-foreground)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--sidebar-accent)';
              e.currentTarget.style.color = 'var(--sidebar-accent-foreground)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '';
              e.currentTarget.style.color = 'var(--sidebar-foreground)';
            }}
          >
            <Settings className="size-5" />
            Settings
          </button>
        </div>

        {/* User Profile */}
        <div className="px-3 pb-4 relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors hover:opacity-90"
            style={{ color: 'var(--sidebar-foreground)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--sidebar-accent)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '';
            }}
          >
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
              {user?.initials}
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-medium truncate" style={{ color: 'var(--sidebar-foreground)' }}>
                {user?.name}
              </p>
              <p className="text-xs truncate" style={{ color: 'var(--muted-foreground)' }}>
                {user?.email}
              </p>
            </div>
            <ChevronDown className="size-4" style={{ color: 'var(--muted-foreground)' }} />
          </button>

          {/* User Menu Dropdown */}
          {showUserMenu && (
            <div
              className="absolute bottom-full left-3 right-3 mb-2 rounded-lg shadow-lg py-1"
              style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}
            >
              <button
                onClick={() => {
                  setShowUserMenu(false);
                  navigate('/account');
                }}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors hover:opacity-90"
                style={{ color: 'var(--foreground)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--accent)';
                  e.currentTarget.style.color = 'var(--accent-foreground)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '';
                  e.currentTarget.style.color = 'var(--foreground)';
                }}
              >
                <User className="size-4" />
                Account Settings
              </button>
              <button
                onClick={() => {
                  setShowUserMenu(false);
                  handleLogout();
                }}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-destructive hover:opacity-90"
              >
                <LogOut className="size-4" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header
          className="h-16 flex items-center justify-between px-8 border-b"
          style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
        >
          {/* Search */}
          <div className="flex-1 max-w-2xl">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 size-4 pointer-events-none"
                style={{ color: 'var(--muted-foreground)' }}
              />
              <input
                type="text"
                placeholder="Search by file name, ID, or status... (Enter for full search)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const path = searchQuery.trim()
                      ? `/documents?q=${encodeURIComponent(searchQuery.trim())}`
                      : '/documents';
                    navigate(path);
                  }
                }}
                className="w-full pl-10 pr-10 py-2 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                style={{
                  backgroundColor: 'var(--input-background)',
                  borderColor: 'var(--border)',
                  color: 'var(--foreground)',
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded hover:opacity-80 transition-opacity"
                  style={{ color: 'var(--muted-foreground)' }}
                  aria-label="Clear search"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 ml-6">
            <button
              onClick={() => navigate('/help')}
              className="p-2 rounded-lg transition-colors hover:opacity-80"
              style={{ color: 'var(--muted-foreground)' }}
            >
              <HelpCircle className="size-5" />
            </button>
            <button
              onClick={() => navigate('/notifications')}
              className="p-2 rounded-lg transition-colors hover:opacity-80 relative"
              style={{ color: 'var(--muted-foreground)' }}
            >
              <Bell className="size-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 min-w-[18px] h-[18px] bg-red-500 rounded-full flex items-center justify-center text-[10px] text-white font-medium px-1">
                  {unreadCount}
                </span>
              )}
            </button>
            <Link
              to="/upload"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              <Plus className="size-4" />
              Upload New
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main
          className="flex-1 overflow-auto p-8"
          style={{ backgroundColor: 'var(--background)' }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
