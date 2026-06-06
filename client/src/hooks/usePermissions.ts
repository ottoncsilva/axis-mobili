import { useQuery } from '@tanstack/react-query';
import { fetchAPI } from '@/lib/apiClient';
import { useAuth } from '@/features/auth/hooks/useAuth';
import type { PermissoesPerfil, PerfilUsuario } from '@/types/global.types';

export function usePermissions() {
  const { usuario } = useAuth();

  const { data: allPermissoes, isLoading } = useQuery({
    queryKey: ['configuracoes', 'permissoes'],
    queryFn: () => fetchAPI<Record<PerfilUsuario, PermissoesPerfil>>('/configuracoes/permissoes'),
    enabled: !!usuario,
  });

  const permissoes = usuario && allPermissoes ? allPermissoes[usuario.perfil] : null;

  const canAccess = (modulo: string, acao: string = 'visualizar'): boolean => {
    if (!usuario) return false;

    // Admin always has full access
    if (usuario.perfil === 'admin') return true;

    if (!permissoes) return false;

    const moduloPermissoes = permissoes[modulo as keyof PermissoesPerfil];
    if (moduloPermissoes === undefined) return false;

    if (typeof moduloPermissoes === 'boolean') return moduloPermissoes;

    if (typeof moduloPermissoes === 'object') {
      return (moduloPermissoes as Record<string, boolean>)[acao] ?? false;
    }

    return false;
  };

  return { canAccess, loading: isLoading, permissoes };
}
