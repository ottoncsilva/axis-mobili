import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clientesService } from '../services/clientesService';
import type { ClientesFiltros, ClienteFormData } from '../types/clientes.types';

const QUERY_KEY = 'clientes';

export function useClientes(filtros?: ClientesFiltros) {
  return useQuery({
    queryKey: [QUERY_KEY, filtros],
    queryFn: () => clientesService.listar(filtros),
  });
}

export function useCliente(id: string) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => clientesService.buscarPorId(id),
    enabled: !!id,
  });
}

export function useClientesMutation() {
  const queryClient = useQueryClient();

  const criar = useMutation({
    mutationFn: (data: ClienteFormData) => clientesService.criar(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });

  const atualizar = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ClienteFormData> }) =>
      clientesService.atualizar(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });

  const toggleAtivo = useMutation({
    mutationFn: ({ id, ativo }: { id: string; ativo: boolean }) =>
      clientesService.toggleAtivo(id, ativo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });

  return { criar, atualizar, toggleAtivo };
}

export function useClientesSelect() {
  return useQuery({
    queryKey: [QUERY_KEY, 'select'],
    queryFn: () => clientesService.listarParaSelect(),
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}
