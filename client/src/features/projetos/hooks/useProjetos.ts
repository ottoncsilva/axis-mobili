import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projetosService } from '../services/projetosService';
import type { ProjetosFiltros, ProjetoFormData } from '../types/projetos.types';

const QUERY_KEY = 'projetos';

export function useProjetos(filtros?: ProjetosFiltros) {
  return useQuery({
    queryKey: [QUERY_KEY, filtros],
    queryFn: () => projetosService.listar(filtros),
  });
}

export function useProjeto(id: string) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => projetosService.buscarPorId(id),
    enabled: !!id,
  });
}

export function useProjetosMutation() {
  const queryClient = useQueryClient();

  const criar = useMutation({
    mutationFn: (data: ProjetoFormData) => projetosService.criar(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });

  const atualizar = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ProjetoFormData> }) =>
      projetosService.atualizar(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });

  return { criar, atualizar };
}

export function useProjetosPorCliente(clienteId: string) {
  return useQuery({
    queryKey: [QUERY_KEY, 'cliente', clienteId],
    queryFn: () => projetosService.listarPorCliente(clienteId),
    enabled: !!clienteId,
  });
}
