import { useAuth } from '@/features/auth/hooks/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '@/app/ThemeProvider';
import { LogOut, User, Menu, Sun, Moon } from 'lucide-react';
import { useState } from 'react';
import { NotificationDropdown } from '@/features/notificacoes/components/NotificationDropdown';

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/clientes': 'Clientes',
  '/projetos': 'Projetos',
  '/kanban/venda': 'Kanban — Projetos para Venda',
  '/kanban/executivo': 'Kanban — Projetos Executivos',
  '/kanban/medicao': 'Kanban — Medição Técnica',
  '/faturamento': 'Faturamento',
  '/colaboradores': 'Colaboradores',
  '/relatorios': 'Relatórios',
  '/configuracoes': 'Configurações',
};

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { usuario: user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const currentPath = location.pathname;
  const pageTitle =
    PAGE_TITLES[currentPath] ||
    (currentPath.startsWith('/clientes/')
      ? 'Detalhes do Cliente'
      : currentPath.startsWith('/projetos/')
      ? 'Detalhes do Projeto'
      : currentPath.startsWith('/faturamento/')
      ? 'Detalhes da Fatura'
      : currentPath.startsWith('/configuracoes/empresa')
      ? 'Configurações — Empresa'
      : currentPath.startsWith('/configuracoes/etapas')
      ? 'Configurações — Etapas'
      : currentPath.startsWith('/configuracoes/permissoes')
      ? 'Configurações — Permissões'
      : currentPath.startsWith('/configuracoes/feriados')
      ? 'Configurações — Feriados'
      : currentPath.startsWith('/configuracoes/notificacoes')
      ? 'Configurações — Notificações'
      : 'Axis Mobili');

  const handleLogout = async () => {
    setShowUserMenu(false);
    await logout();
    navigate('/login');
  };

  return (
    <header className="h-16 bg-card/80 backdrop-blur-sm border-b border-border flex items-center justify-between px-4 sm:px-6 sticky top-0 z-20">
      {/* Left: hamburger (mobile) + page title */}
      <div className="flex items-center gap-3">
        {/* Hamburger — only on mobile */}
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
          aria-label="Abrir menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <h1 className="text-base sm:text-lg font-semibold text-foreground truncate">{pageTitle}</h1>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-1 sm:gap-2">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
          title={theme === 'escuro' ? 'Tema Claro' : 'Tema Escuro'}
          aria-label="Alternar tema"
        >
          {theme === 'escuro' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>

        {/* Notification Bell */}
        <NotificationDropdown />

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-accent transition-all"
            aria-label="Menu do usuário"
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-brand-600/15 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-semibold text-brand-600 dark:text-brand-400">
                {user?.nome?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
            <span className="text-sm font-medium text-foreground hidden sm:block max-w-[120px] truncate">
              {user?.nome}
            </span>
          </button>

          {showUserMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
              <div className="absolute right-0 top-full mt-2 w-52 bg-popover border border-border rounded-xl shadow-lg z-50 py-1 animate-fade-in">
                <div className="px-3 py-2.5 border-b border-border">
                  <p className="text-sm font-semibold text-foreground">{user?.nome}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                </div>
                <button
                  onClick={() => { setShowUserMenu(false); navigate('/alterar-senha'); }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
                >
                  <User className="h-4 w-4 flex-shrink-0" />
                  Meu Perfil
                </button>
                <div className="border-t border-border" />
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-destructive/80 hover:text-destructive hover:bg-destructive/10 transition-all"
                >
                  <LogOut className="h-4 w-4 flex-shrink-0" />
                  Sair
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
