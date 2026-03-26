import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';
import { useTheme } from '@/app/ThemeProvider';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Building2,
  FolderKanban,
  Presentation,
  FileText,
  Ruler,
  Receipt,
  Users,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  path: string;
  icon: React.ElementType;
  modulo: string;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, modulo: 'dashboard' },
  { label: 'Clientes', path: '/clientes', icon: Building2, modulo: 'clientes' },
  { label: 'Projetos', path: '/projetos', icon: FolderKanban, modulo: 'projetos' },
  { label: 'Kanban Venda', path: '/kanban/venda', icon: Presentation, modulo: 'kanbanVenda' },
  { label: 'Kanban Executivo', path: '/kanban/executivo', icon: FileText, modulo: 'kanbanExecutivo' },
  { label: 'Kanban Medição', path: '/kanban/medicao', icon: Ruler, modulo: 'kanbanMedicao' },
  { label: 'Faturamento', path: '/faturamento', icon: Receipt, modulo: 'faturamento' },
  { label: 'Colaboradores', path: '/colaboradores', icon: Users, modulo: 'colaboradores' },
  { label: 'Relatórios', path: '/relatorios', icon: BarChart3, modulo: 'relatorios' },
  { label: 'Configurações', path: '/configuracoes', icon: Settings, modulo: 'configuracoes' },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { user, logout } = useAuth();
  const { canAccess } = usePermissions();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    await logout();
    navigate('/login');
  };

  const visibleItems = navItems.filter((item) => canAccess(item.modulo));

  return (
    <motion.aside
      animate={{ width: collapsed ? 64 : 256 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className="fixed left-0 top-0 h-screen bg-card border-r border-border flex flex-col z-30 hidden md:flex"
    >
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-border">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
            <span className="text-sm font-bold text-white">AM</span>
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="text-lg font-bold text-foreground whitespace-nowrap"
              >
                Axis Mobili
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {visibleItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group',
                isActive
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-600/20'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              )
            }
            title={collapsed ? item.label : undefined}
          >
            <item.icon className="h-5 w-5 flex-shrink-0" />
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="whitespace-nowrap overflow-hidden"
                >
                  {item.label}
                </motion.span>
              )}
            </AnimatePresence>
          </NavLink>
        ))}
      </nav>

      {/* Bottom section */}
      <div className="border-t border-border p-2 space-y-1">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
          title={collapsed ? (theme === 'escuro' ? 'Tema Claro' : 'Tema Escuro') : undefined}
        >
          {theme === 'escuro' ? <Sun className="h-5 w-5 flex-shrink-0" /> : <Moon className="h-5 w-5 flex-shrink-0" />}
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="whitespace-nowrap"
              >
                {theme === 'escuro' ? 'Tema Claro' : 'Tema Escuro'}
              </motion.span>
            )}
          </AnimatePresence>
        </button>

        {/* User info */}
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-600/20 flex items-center justify-center">
            <span className="text-xs font-semibold text-brand-500">
              {user?.nome?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 min-w-0"
              >
                <p className="text-sm font-medium text-foreground truncate">{user?.nome || 'Usuário'}</p>
                <p className="text-xs text-muted-foreground capitalize">{user?.perfil || ''}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-destructive/80 hover:text-destructive hover:bg-destructive/10 transition-all"
          title={collapsed ? 'Sair' : undefined}
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                Sair
              </motion.span>
            )}
          </AnimatePresence>
        </button>

        {/* Collapse button */}
        <button
          onClick={onToggle}
          className="flex items-center justify-center w-full py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>
    </motion.aside>
  );
}
