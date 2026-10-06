import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const AuthenticatedLayout = ({ children }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className={`app-frame${isSidebarCollapsed ? ' rail-collapsed' : ''}`}>
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />
      <div className="app-main">
        <Topbar onMenuClick={() => setIsMobileOpen(true)} />
        <main className="app-content">{children}</main>
        <footer className="app-footer">
          <span>SecurePro <span aria-hidden="true">·</span> Your workspace, in good hands.</span>
          <span><span className="footer-status-dot" /> Your workspace is ready</span>
        </footer>
      </div>
    </div>
  );
};

export default AuthenticatedLayout;
