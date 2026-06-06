import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usuariosService } from '../services/usuariosService';
import type { UsuarioFormData } from '../types/usuarios.types';

const QUERY_KEY = 'usuarios';

export function useUsuarios(filtros?: { busca?: string; perfil?: string; ativo?: boolean }) {
  return useQuery({
    queryKey: [QUERY_KEY, filtros],
    queryFn: () => usuariosService.listar(filtros),
    refetchInterval: 60_000,
  });
}

export function useUsuario(id: string) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => usuariosService.buscarPorId(id),
    enabled: !!id,
    refetchInterval: 60_000,
  });
}

export function useUsuariosMutation() {
  const queryClient = useQueryClient();

  const criar = useMutation({
    mutationFn: (data: UsuarioFormData) => usuariosService.criar(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });

  const atualizar = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<UsuarioFormData> }) =>
      usuariosService.atualizar(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });

  const toggleAtivo = useMutation({
    mutationFn: ({ id, ativo }: { id: string; ativo: boolean }) =>
      usuariosService.toggleAtivo(id, ativo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });

  const excluir = useMutation({
    mutationFn: (id: string) => usuariosService.excluir(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });

  return { criar, atualizar, toggleAtivo, excluir };
}
