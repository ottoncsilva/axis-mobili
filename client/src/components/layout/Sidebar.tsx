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
  X,
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
  /** On mobile, the sidebar is shown as a drawer; this callback closes it */
  onClose?: () => void;
  /** When true the sidebar is rendered as a mobile drawer (no hidden class, full width) */
  mobileOpen?: boolean;
}

export function Sidebar({ collapsed, onToggle, onClose, mobileOpen }: SidebarProps) {
  const { usuario: user, logout } = useAuth();
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

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-border flex-shrink-0">
        <div className="flex items-center gap-3 overflow-hidden flex-1">
          <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center shadow-sm">
            <span className="text-sm font-bold text-white">AM</span>
          </div>
          <AnimatePresence>
            {(!collapsed || mobileOpen) && (
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
        {/* Close button on mobile drawer */}
        {mobileOpen && onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-all flex-shrink-0"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-0.5 overflow-y-auto">
        {visibleItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={mobileOpen ? onClose : undefined}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                isActive
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              )
            }
            title={collapsed && !mobileOpen ? item.label : undefined}
          >
            <item.icon className="h-5 w-5 flex-shrink-0" />
            <AnimatePresence>
              {(!collapsed || mobileOpen) && (
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
      <div className="border-t border-border p-2 space-y-0.5 flex-shrink-0">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
          title={collapsed && !mobileOpen ? (theme === 'escuro' ? 'Tema Claro' : 'Tema Escuro') : undefined}
        >
          {theme === 'escuro' ? (
            <Sun className="h-5 w-5 flex-shrink-0" />
          ) : (
            <Moon className="h-5 w-5 flex-shrink-0" />
          )}
          <AnimatePresence>
            {(!collapsed || mobileOpen) && (
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
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-600/15 flex items-center justify-center">
            <span className="text-xs font-semibold text-brand-600 dark:text-brand-400">
              {user?.nome?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
          <AnimatePresence>
            {(!collapsed || mobileOpen) && (
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
          title={collapsed && !mobileOpen ? 'Sair' : undefined}
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          <AnimatePresence>
            {(!collapsed || mobileOpen) && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {loggingOut ? 'Saindo...' : 'Sair'}
              </motion.span>
            )}
          </AnimatePresence>
        </button>

        {/* Collapse toggle — desktop only */}
        {!mobileOpen && (
          <button
            onClick={onToggle}
            className="flex items-center justify-center w-full py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        )}
      </div>
    </div>
  );

  return (
    <motion.aside
      animate={{ width: collapsed ? 64 : 256 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className="fixed left-0 top-0 h-screen bg-card border-r border-border z-30 hidden md:flex flex-col overflow-hidden"
    >
      {sidebarContent}
    </motion.aside>
  );
}

/** Mobile drawer version of the sidebar */
export function SidebarDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { usuario: user, logout } = useAuth();
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
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={onClose}
          />
          {/* Drawer */}
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="fixed left-0 top-0 h-screen w-64 bg-card border-r border-border z-50 md:hidden flex flex-col overflow-hidden"
          >
            {/* Logo */}
            <div className="h-16 flex items-center px-4 border-b border-border flex-shrink-0">
              <div className="flex items-center gap-3 flex-1">
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center shadow-sm">
                  <span className="text-sm font-bold text-white">AM</span>
                </div>
                <span className="text-lg font-bold text-foreground whitespace-nowrap">Axis Mobili</span>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-all flex-shrink-0"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-4 px-2 space-y-0.5 overflow-y-auto">
              {visibleItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                      isActive
                        ? 'bg-brand-600 text-white shadow-sm'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                    )
                  }
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </nav>

            {/* Bottom */}
            <div className="border-t border-border p-2 space-y-0.5 flex-shrink-0">
              <button
                onClick={toggleTheme}
                className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
              >
                {theme === 'escuro' ? <Sun className="h-5 w-5 flex-shrink-0" /> : <Moon className="h-5 w-5 flex-shrink-0" />}
                <span>{theme === 'escuro' ? 'Tema Claro' : 'Tema Escuro'}</span>
              </button>

              <div className="flex items-center gap-3 px-3 py-2">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-600/15 flex items-center justify-center">
                  <span className="text-xs font-semibold text-brand-600 dark:text-brand-400">
                    {user?.nome?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{user?.nome || 'Usuário'}</p>
                  <p className="text-xs text-muted-foreground capitalize">{user?.perfil || ''}</p>
                </div>
              </div>

              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-destructive/80 hover:text-destructive hover:bg-destructive/10 transition-all"
              >
                <LogOut className="h-5 w-5 flex-shrink-0" />
                <span>{loggingOut ? 'Saindo...' : 'Sair'}</span>
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
