import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowDownLeft,
  Bell,
  Command,
  LogOut,
  Menu,
  Moon,
  Search,
  Sun,
  Check,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { notificationsApi } from '../services/api';

const destinations = [
  { label: 'Overview', path: '/dashboard', group: 'Workspace' },
  { label: 'Projects', path: '/projects', group: 'Workspace' },
  { label: 'Tasks', path: '/tasks', group: 'Workspace' },
  { label: 'Analytics', path: '/analytics', group: 'Workspace' },
  { label: 'Messages', path: '/messages', group: 'Workspace' },
  { label: 'Appointments', path: '/appointments', group: 'Workspace' },
  { label: 'Support tickets', path: '/tickets', group: 'Workspace' },
  { label: 'Profile', path: '/profile', group: 'Account' },
  { label: 'Settings', path: '/settings', group: 'Account' },
  { label: 'Help center', path: '/help', group: 'Account' },
  { label: 'User directory', path: '/admin', group: 'Administration', admin: true },
  { label: 'Audit trail', path: '/audit-logs', group: 'Administration', admin: true },
];

const pageTitles = {
  '/dashboard': 'Overview',
  '/projects': 'Projects',
  '/tasks': 'Tasks',
  '/analytics': 'Analytics',
  '/messages': 'Messages',
  '/appointments': 'Appointments',
  '/tickets': 'Support',
  '/admin': 'User directory',
  '/audit-logs': 'Audit trail',
  '/profile': 'Your profile',
  '/settings': 'Settings',
  '/help': 'Help center',
};
const TOPBAR_DATE_LABEL = new Intl.DateTimeFormat('en', { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date());

const Topbar = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const searchRef = useRef(null);
  const [query, setQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const dateLabel = TOPBAR_DATE_LABEL;
  const results = destinations.filter((destination) => (
    (!destination.admin || user?.role === 'ADMIN')
    && destination.label.toLowerCase().includes(query.trim().toLowerCase())
  )).slice(0, 5);

  useEffect(() => {
    const onShortcut = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        searchRef.current?.focus();
        setIsSearchOpen(true);
      }
      if (event.key === 'Escape') {
        setIsSearchOpen(false);
        setIsAccountOpen(false);
        searchRef.current?.blur();
      }
    };
    window.addEventListener('keydown', onShortcut);
    return () => window.removeEventListener('keydown', onShortcut);
  }, []);

  const fetchNotifications = useCallback(async () => {
    if (!user?.id) return;
    try {
      const { data } = await notificationsApi.unreadForUser(user.id);
      setNotifications(Array.isArray(data) ? data : []);
    } catch {
      // silently ignore
    }
  }, [user?.id]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const handleMarkAsRead = async (notificationId) => {
    if (!user?.id) return;
    try {
      await notificationsApi.markAsRead(notificationId, user.id);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch {
      // ignore
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const goTo = (path) => {
    setQuery('');
    setIsSearchOpen(false);
    navigate(path);
  };

  return (
    <header className="app-topbar">
      <div className="topbar-left">
        <button type="button" className="topbar-menu mobile-only" onClick={onMenuClick} aria-label="Open navigation">
          <Menu size={20} />
        </button>
        <div className="topbar-breadcrumb">
          <span>Workspace</span>
          <span className="breadcrumb-slash">/</span>
          <strong>{pageTitles[location.pathname] || 'Workspace'}</strong>
        </div>
      </div>

      <div className="topbar-right">
        <span className="topbar-date">{dateLabel}</span>
        <div className="topbar-search-wrap">
          <label className={`topbar-search${isSearchOpen ? ' is-focused' : ''}`}>
            <Search size={16} aria-hidden="true" />
            <input
              ref={searchRef}
              type="search"
              aria-label="Search workspace pages"
              placeholder="Jump to…"
              value={query}
              onFocus={() => setIsSearchOpen(true)}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && results[0]) goTo(results[0].path);
              }}
              onBlur={() => window.setTimeout(() => setIsSearchOpen(false), 140)}
            />
            <kbd><Command size={11} /> K</kbd>
          </label>
          {isSearchOpen && (
            <div className="search-popover">
              <p>{query ? 'Best matches' : 'Quick navigation'}</p>
              {results.length ? results.map((item) => (
                <button
                  type="button"
                  key={item.path}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => goTo(item.path)}
                >
                  <span>{item.label}</span>
                  <small>{item.group}</small>
                  <ArrowDownLeft size={14} />
                </button>
              )) : <span className="search-empty">No pages match “{query}”</span>}
            </div>
          )}
        </div>
        <button
          type="button"
          className="topbar-icon-button theme-toggle"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
        </button>
        <div className="relative">
          <button
            type="button"
            className="topbar-icon-button notification-link relative"
            onClick={() => {
              setIsNotificationsOpen(!isNotificationsOpen);
              setIsAccountOpen(false);
            }}
            aria-expanded={isNotificationsOpen}
            aria-label="Open notifications"
          >
            <Bell size={17} />
            {notifications.length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary-600 text-[10px] font-bold text-white shadow-sm">
                {notifications.length}
              </span>
            )}
          </button>

          {isNotificationsOpen && (
            <div className="account-popover absolute right-0 mt-2 w-80 rounded-2xl bg-white p-4 shadow-2xl border border-slate-200 dark:border-white/10 dark:bg-base-900 z-50">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/5 mb-2">
                <span className="font-bold text-sm text-slate-900 dark:text-white">Notifications</span>
                <span className="text-xs text-primary-600 dark:text-primary-400 font-semibold">{notifications.length} unread</span>
              </div>
              <div className="max-h-64 overflow-y-auto space-y-2">
                {notifications.length === 0 ? (
                  <p className="py-4 text-center text-xs text-slate-500">You're all caught up!</p>
                ) : (
                  notifications.map((n) => (
                    <div key={n.id} className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/5 flex items-start justify-between gap-2">
                      <div className="text-left min-w-0">
                        <strong className="block text-xs text-slate-900 dark:text-white truncate">{n.title}</strong>
                        <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2 mt-0.5">{n.message}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleMarkAsRead(n.id)}
                        className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-white/10 text-slate-400 hover:text-emerald-500 shrink-0 transition-colors"
                        title="Mark as read"
                      >
                        <Check size={14} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
        <div className="topbar-account-wrap">
          <button
            type="button"
            className="topbar-profile"
            onClick={() => setIsAccountOpen(!isAccountOpen)}
            aria-expanded={isAccountOpen}
            aria-label="Open account menu"
          >
            <span className="topbar-avatar">{user?.name?.trim()?.charAt(0)?.toUpperCase() || 'U'}</span>
            <span className="topbar-profile-name">{user?.name || 'Account'}</span>
          </button>
          {isAccountOpen && (
            <div className="account-popover">
              <Link to="/profile" onClick={() => setIsAccountOpen(false)}>Your profile</Link>
              <Link to="/settings" onClick={() => setIsAccountOpen(false)}>Account settings</Link>
              <button type="button" onClick={handleLogout}><LogOut size={15} /> Sign out</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Topbar;
