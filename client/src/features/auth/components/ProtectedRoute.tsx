import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';
import type { ReactNode } from 'react';
import { Loader2, ShieldAlert } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  modulo?: string;
  acao?: string;
}

export function ProtectedRoute({ children, modulo, acao = 'visualizar' }: ProtectedRouteProps) {
  const { isAuthenticated, loading } = useAuth();
  const { canAccess, loading: permLoading } = usePermissions();
  const location = useLocation();

  if (loading || permLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-brand-600">
            <span className="text-lg font-bold text-white">AM</span>
          </div>
          <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
          <p className="text-muted-foreground text-sm">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (modulo && !canAccess(modulo, acao)) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-20 gap-4">
        <ShieldAlert className="h-16 w-16 text-destructive/60" />
        <h1 className="text-2xl font-semibold text-foreground">Acesso Negado</h1>
        <p className="text-muted-foreground text-center max-w-md">
          Você não tem permissão para acessar esta página. Contate o administrador se acredita que isso é um erro.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
