import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar, SidebarDrawer } from './Sidebar';
import { Header } from './Header';
import { MobileNav } from './MobileNav';
import { cn } from '@/lib/utils';

export function MainLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar — fixed on left */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Mobile Sidebar Drawer — slides in from left on mobile */}
      <SidebarDrawer
        open={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
      />

      {/* Main Content area — shifts right on desktop to accommodate sidebar */}
      <div
        className={cn(
          'transition-[margin] duration-200 ease-in-out',
          sidebarCollapsed ? 'md:ml-16' : 'md:ml-64'
        )}
      >
        <Header onMenuClick={() => setMobileDrawerOpen(true)} />
        <main className="p-4 md:p-6 pb-20 md:pb-6 min-h-[calc(100vh-4rem)]">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav />
    </div>
  );
}
