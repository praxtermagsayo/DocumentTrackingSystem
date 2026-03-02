import { Link, Outlet, useLocation, useNavigate } from 'react-router';
import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  FileText,
  ClipboardList,
  Search,
  Archive,
  FileBarChart,
  BarChart3,
  Settings,
  Bell,
  Plus,
  LogOut,
  User,
  ChevronDown,
  Flag,
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
    { path: '/documents', label: 'Document Repository', icon: FileText },
    { path: '/my-tasks', label: 'My Tasks', icon: ClipboardList },
    { path: '/search', label: 'Search', icon: Search },
    { path: '/retention', label: 'Retention and Archive', icon: Archive },
    { path: '/audit', label: 'Audit Trail', icon: FileBarChart },
    { path: '/reports', label: 'Reports', icon: BarChart3 },
    { path: '/admin', label: 'Admin Settings', icon: Settings },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-gradient-to-b from-blue-600 to-blue-700 flex flex-col shadow-xl">
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-blue-500/30">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center">
              <Flag className="size-5 text-white" />
            </div>
            <span className="font-semibold text-white">Document Management</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all ${ 
                  active
                    ? 'bg-white/20 text-white font-medium backdrop-blur-sm shadow-lg'
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon className="size-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Version */}
        <div className="px-6 pb-4 text-center">
          <span className="text-xs text-white/60">v1.0.0</span>
        </div>

        {/* User Profile */}
        <div className="px-4 pb-4 border-t border-blue-500/30 pt-4 relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-pink-500 rounded-full flex items-center justify-center text-white text-sm font-medium ring-2 ring-white/20">
              {user?.initials}
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-medium text-white truncate">{user?.name}</p>
              <p className="text-xs text-white/60 truncate">{user?.email}</p>
            </div>
            <ChevronDown className="size-4 text-white/60" />
          </button>

          {/* User Menu Dropdown */}
          {showUserMenu && (
            <div className="absolute bottom-full left-4 right-4 mb-2 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-50">
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
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shadow-sm">
          {/* Page Title or Tabs */}
          <div className="flex items-center gap-6">
            <h1 className="text-lg font-semibold text-slate-700">
              {location.pathname === '/' ? 'Dashboard' : 
               location.pathname.includes('documents') ? 'Document Repository' :
               location.pathname.includes('my-tasks') ? 'My Tasks' :
               location.pathname.includes('search') ? 'Search' :
               location.pathname.includes('retention') ? 'Retention and Archive' :
               location.pathname.includes('audit') ? 'Audit Trail' :
               location.pathname.includes('reports') ? 'Reports' :
               location.pathname.includes('admin') ? 'Admin Settings' : 'DocTrack'}
            </h1>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <Search className="size-5" />
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
            <button
              onClick={() => navigate('/account')}
              className="w-9 h-9 bg-gradient-to-br from-orange-400 to-pink-500 rounded-full flex items-center justify-center text-white text-sm font-medium ring-2 ring-slate-200 hover:ring-slate-300 transition-all"
            >
              {user?.initials}
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-gray-50">
          <div className="p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}