import { NavLink } from 'react-router-dom';
import { usePermissions } from '@/hooks/usePermissions';
import {
  LayoutDashboard,
  FolderKanban,
  Receipt,
  Menu,
  Presentation,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Sidebar } from './Sidebar';

const mainNavItems = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, modulo: 'dashboard' },
  { label: 'Projetos', path: '/projetos', icon: FolderKanban, modulo: 'projetos' },
  { label: 'Kanban', path: '/kanban/venda', icon: Presentation, modulo: 'kanbanVenda' },
  { label: 'Faturamento', path: '/faturamento', icon: Receipt, modulo: 'faturamento' },
];

export function MobileNav() {
  const { canAccess } = usePermissions();
  const [showMenu, setShowMenu] = useState(false);

  const visibleItems = mainNavItems.filter((item) => canAccess(item.modulo));

  return (
    <>
      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border flex items-center justify-around h-16 z-30 md:hidden safe-area-bottom">
        {visibleItems.slice(0, 4).map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center gap-1 px-3 py-2 text-xs transition-all',
                isActive ? 'text-brand-500' : 'text-muted-foreground'
              )
            }
          >
            <item.icon className="h-5 w-5" />
            <span>{item.label}</span>
          </NavLink>
        ))}
        <button
          onClick={() => setShowMenu(true)}
          className="flex flex-col items-center gap-1 px-3 py-2 text-xs text-muted-foreground"
        >
          <Menu className="h-5 w-5" />
          <span>Mais</span>
        </button>
      </nav>

      {/* Full Sidebar as drawer */}
      {showMenu && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setShowMenu(false)} />
          <div className="fixed left-0 top-0 bottom-0 z-50 md:hidden">
            <Sidebar collapsed={false} onToggle={() => setShowMenu(false)} />
          </div>
        </>
      )}
    </>
  );
}
