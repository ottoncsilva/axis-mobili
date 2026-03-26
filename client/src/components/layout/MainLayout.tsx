import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MobileNav } from './MobileNav';

export function MainLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      {/* Main Content */}
      <div
        className="transition-all duration-200 md:ml-64"
        style={{ marginLeft: sidebarCollapsed ? '64px' : undefined }}
      >
        <Header />
        <main className="p-4 md:p-6 pb-20 md:pb-6 min-h-[calc(100vh-4rem)]">
          <Outlet />
        </main>
      </div>

      {/* Mobile Navigation */}
      <MobileNav />
    </div>
  );
}
