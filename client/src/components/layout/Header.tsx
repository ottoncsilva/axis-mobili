import { useAuth } from '@/features/auth/hooks/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';
import { Bell, LogOut, User } from 'lucide-react';
import { useState } from 'react';

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

export function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const currentPath = location.pathname;
  const pageTitle = PAGE_TITLES[currentPath] ||
    (currentPath.startsWith('/clientes/') ? 'Detalhes do Cliente' :
    currentPath.startsWith('/projetos/') ? 'Detalhes do Projeto' :
    currentPath.startsWith('/faturamento/') ? 'Detalhes da Fatura' : 'Axis Mobili');

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="h-16 bg-card/80 backdrop-blur-sm border-b border-border flex items-center justify-between px-6 sticky top-0 z-20">
      {/* Page Title */}
      <h1 className="text-lg font-semibold text-foreground">{pageTitle}</h1>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* Notification Bell — placeholder for Part 7 */}
        <button
          className="relative p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
          title="Notificações"
        >
          <Bell className="h-5 w-5" />
          {/* Badge will be added in Part 7 */}
        </button>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-accent transition-all"
          >
            <div className="w-8 h-8 rounded-full bg-brand-600/20 flex items-center justify-center">
              <span className="text-xs font-semibold text-brand-500">
                {user?.nome?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
            <span className="text-sm font-medium text-foreground hidden sm:block">{user?.nome}</span>
          </button>

          {showUserMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
              <div className="absolute right-0 top-full mt-2 w-48 bg-popover border border-border rounded-lg shadow-lg z-50 py-1 animate-fade-in">
                <div className="px-3 py-2 border-b border-border">
                  <p className="text-sm font-medium text-foreground">{user?.nome}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
                <button
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
                >
                  <User className="h-4 w-4" />
                  Meu Perfil
                </button>
                <div className="border-t border-border" />
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-destructive/80 hover:text-destructive hover:bg-destructive/10 transition-all"
                >
                  <LogOut className="h-4 w-4" />
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
