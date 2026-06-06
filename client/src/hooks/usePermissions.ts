import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/features/auth/hooks/useAuth';
import type { PermissoesPerfil } from '@/types/global.types';

export function usePermissions() {
  const { usuario } = useAuth();
  const [permissoes, setPermissoes] = useState<PermissoesPerfil | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!usuario) {
      setPermissoes(null);
      setLoading(false);
      return;
    }

    const fetchPermissoes = async () => {
      try {
        const configDoc = await getDoc(doc(db, 'configuracoes', 'default', 'permissoes', 'config'));
        if (configDoc.exists()) {
          const data = configDoc.data() as Record<string, PermissoesPerfil>;
          setPermissoes(data[usuario.perfil] || null);
        }
      } catch (err) {
        console.error('Erro ao buscar permissões:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPermissoes();
  }, [usuario]);

  const canAccess = (modulo: string, acao: string = 'visualizar'): boolean => {
    if (!usuario) return false;

    // Admin has access to everything — check before permissoes guard
    if (usuario.perfil === 'admin') return true;

    if (!permissoes) return false;

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
