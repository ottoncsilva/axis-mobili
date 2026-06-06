import { NavLink, Outlet } from 'react-router-dom';
import { Building2, GitBranch, Shield, Bell, CalendarDays } from 'lucide-react';
import { cn } from '@/lib/utils';

const subNav = [
  { path: '/configuracoes/empresa', label: 'Empresa', icon: Building2 },
  { path: '/configuracoes/etapas', label: 'Etapas', icon: GitBranch },
  { path: '/configuracoes/permissoes', label: 'Permissões', icon: Shield },
  { path: '/configuracoes/feriados', label: 'Feriados', icon: CalendarDays },
  { path: '/configuracoes/notificacoes', label: 'Notificações', icon: Bell },
];

export function ConfiguracoesLayout() {
  return (
    <div className="space-y-6">
      {/* Sub-navegação */}
      <div className="flex gap-1 border-b border-border overflow-x-auto pb-0">
        {subNav.map(({ path, label, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all whitespace-nowrap -mb-px',
                isActive
                  ? 'border-brand-500 text-brand-600 dark:text-brand-400'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              )
            }
          >
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}
      </div>

      {/* Conteúdo da sub-rota */}
      <Outlet />
    </div>
  );
}
