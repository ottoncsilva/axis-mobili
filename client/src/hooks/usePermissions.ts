import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/features/auth/hooks/useAuth';
import type { Configuracoes, PermissoesPerfil } from '@/types/global.types';

export function usePermissions() {
  const { user } = useAuth();
  const [permissoes, setPermissoes] = useState<PermissoesPerfil | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setPermissoes(null);
      setLoading(false);
      return;
    }

    const fetchPermissoes = async () => {
      try {
        const configDoc = await getDoc(doc(db, 'configuracoes', 'geral'));
        if (configDoc.exists()) {
          const config = configDoc.data() as Configuracoes;
          const perfilPermissoes = config.permissoes?.[user.perfil];
          setPermissoes(perfilPermissoes || null);
        }
      } catch (err) {
        console.error('Erro ao buscar permissões:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPermissoes();
  }, [user]);

  const canAccess = (modulo: string, acao: string = 'visualizar'): boolean => {
    if (!user || !permissoes) return false;

    // Admin has access to everything
    if (user.perfil === 'admin') return true;

    const moduloPermissoes = permissoes[modulo as keyof PermissoesPerfil];

    if (moduloPermissoes === undefined) return false;

    // Simple boolean permission (dashboard, relatorios, configuracoes)
    if (typeof moduloPermissoes === 'boolean') {
      return moduloPermissoes;
    }

    // Object permission (clientes, projetos, etc.)
    if (typeof moduloPermissoes === 'object') {
      return (moduloPermissoes as Record<string, boolean>)[acao] ?? false;
    }

    return false;
  };

  return { canAccess, loading, permissoes };
}
