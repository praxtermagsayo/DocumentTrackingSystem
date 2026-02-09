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
  ChevronDown,
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    isAuthenticated,
    logout,
    user,
    unreadCount,
    searchQuery,
    setSearchQuery,
  } = useApp();
  const [showUserMenu, setShowUserMenu] = useState(false);

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

  const teams = [
    { name: 'Legal Department', color: 'bg-orange-500', id: 'legal' },
    { name: 'Finance Team', color: 'bg-green-500', id: 'finance' },
    { name: 'HR & Admin', color: 'bg-purple-500', id: 'hr' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <FileText className="size-5 text-white" />
            </div>
            <span className="font-semibold text-slate-900">DocTrack</span>
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
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  active
                    ? 'bg-blue-50 text-blue-600 font-medium'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon className="size-5" />
                {item.label}
              </Link>
            );
          })}

          {/* Teams Section */}
          <div className="pt-6">
            <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Teams
            </p>
            <div className="space-y-1">
              {teams.map((team) => (
                <Link
                  key={team.name}
                  to={`/teams/${team.id}`}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                    location.pathname === `/teams/${team.id}`
                      ? 'bg-blue-50 text-blue-600 font-medium'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Circle className={`size-2 fill-current ${team.color}`} />
                  {team.name}
                </Link>
              ))}
            </div>
          </div>
        </nav>

        {/* Settings */}
        <div className="px-3 pb-3 border-t border-slate-200">
          <button
            onClick={() => navigate('/settings')}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors mt-3"
          >
            <Settings className="size-5" />
            Settings
          </button>
        </div>

        {/* User Profile */}
        <div className="px-3 pb-4 relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
              {user?.initials}
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-medium text-slate-900 truncate">{user?.name}</p>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>
            <ChevronDown className="size-4 text-slate-400" />
          </button>

          {/* User Menu Dropdown */}
          {showUserMenu && (
            <div className="absolute bottom-full left-3 right-3 mb-2 bg-white border border-slate-200 rounded-lg shadow-lg py-1">
              <button
                onClick={() => {
                  setShowUserMenu(false);
                  navigate('/account');
                }}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
              >
                <User className="size-4" />
                Account Settings
              </button>
              <button
                onClick={() => {
                  setShowUserMenu(false);
                  handleLogout();
                }}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
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
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8">
          {/* Search */}
          <div className="flex-1 max-w-2xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by file name, ID, or status..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 ml-6">
            <button
              onClick={() => navigate('/help')}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <HelpCircle className="size-5" />
            </button>
            <button
              onClick={() => navigate('/notifications')}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg relative transition-colors"
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
        <main className="flex-1 overflow-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
