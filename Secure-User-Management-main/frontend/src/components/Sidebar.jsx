import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import {
  Activity,
  CalendarDays,
  ChevronLeft,
  CircleHelp,
  FileClock,
  FolderKanban,
  LayoutDashboard,
  MessageSquareText,
  Settings2,
  ShieldCheck,
  UserRound,
  UsersRound,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const primaryLinks = [
  { name: 'Overview', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Projects', path: '/projects', icon: FolderKanban },
  { name: 'Analytics', path: '/analytics', icon: Activity },
  { name: 'Messages', path: '/messages', icon: MessageSquareText },
  { name: 'Appointments', path: '/appointments', icon: CalendarDays },
  { name: 'Support', path: '/tickets', icon: CircleHelp },
];

const Sidebar = ({ isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen }) => {
  const { user } = useAuth();
  const links = user?.role === 'ADMIN'
    ? [...primaryLinks, { name: 'User directory', path: '/admin', icon: UsersRound }, { name: 'Audit trail', path: '/audit-logs', icon: FileClock }]
    : primaryLinks;
  const footerLinks = [
    { name: 'Profile', path: '/profile', icon: UserRound },
    { name: 'Settings', path: '/settings', icon: Settings2 },
  ];

  const renderLink = ({ name, path, icon: Icon }) => (
    <NavLink
      key={path}
      to={path}
      end={path === '/dashboard' || path === '/admin'}
      onClick={() => setIsMobileOpen(false)}
      title={isCollapsed ? name : undefined}
      className={({ isActive }) => `rail-link${isActive ? ' is-active' : ''}`}
    >
      <Icon size={19} strokeWidth={1.8} aria-hidden="true" />
      <span>{name}</span>
      {path === '/dashboard' && <span className="rail-link-mark" aria-hidden="true" />}
    </NavLink>
  );

  return (
    <>
      <button
        type="button"
        className={`rail-backdrop${isMobileOpen ? ' is-visible' : ''}`}
        aria-label="Close navigation"
        onClick={() => setIsMobileOpen(false)}
      />
      <aside className={`app-rail${isCollapsed ? ' is-collapsed' : ''}${isMobileOpen ? ' is-mobile-open' : ''}`}>
        <div className="rail-brand-row">
          <Link className="rail-brand" to="/" aria-label="SecurePro home">
            <span className="brand-symbol"><ShieldCheck size={19} strokeWidth={2.2} /></span>
            <span className="brand-wordmark">secure<span>pro</span></span>
          </Link>
          <button
            type="button"
            className="rail-close mobile-only"
            aria-label="Close navigation"
            onClick={() => setIsMobileOpen(false)}
          >
            <X size={19} />
          </button>
          <button
            type="button"
            className="rail-collapse desktop-only"
            aria-label={isCollapsed ? 'Expand navigation' : 'Collapse navigation'}
            aria-expanded={!isCollapsed}
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            <ChevronLeft size={15} />
          </button>
        </div>

        <div className="rail-workspace">
          <span className="workspace-avatar">S</span>
          <span className="workspace-copy">
            <strong>My workspace</strong>
            <small>Personal space</small>
          </span>
        </div>

        <nav className="rail-nav" aria-label="Main navigation">
          <p className="rail-label">Workspace</p>
          {links.map(renderLink)}
        </nav>

        <div className="rail-footer">
          <p className="rail-label">Preferences</p>
          {footerLinks.map(renderLink)}
          <div className="rail-help-card">
            <span className="help-card-icon"><CircleHelp size={17} /></span>
            <strong>Need a hand?</strong>
            <span>Our team is a message away.</span>
            <NavLink to="/help" onClick={() => setIsMobileOpen(false)}>Visit help center <span aria-hidden="true">↗</span></NavLink>
          </div>
          <div className="rail-account">
            <span className="account-avatar">{user?.name?.trim()?.charAt(0)?.toUpperCase() || 'U'}</span>
            <span className="account-copy">
              <strong>{user?.name || 'Your account'}</strong>
              <small>{user?.role === 'ADMIN' ? 'Administrator' : 'Member'}</small>
            </span>
            <span className="account-presence" title="Signed in" />
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
