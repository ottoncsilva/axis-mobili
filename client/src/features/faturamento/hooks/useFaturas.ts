import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { faturasService, type CriarFaturaData } from '../services/faturasService';

const QUERY_KEY = 'faturas';

export function useFaturas(filtros?: { clienteId?: string; status?: string }) {
  return useQuery({
    queryKey: [QUERY_KEY, filtros],
    queryFn: () => faturasService.listar(filtros),
    refetchInterval: 60_000,
  });
}

export function useFatura(id: string) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => faturasService.buscarPorId(id),
    enabled: !!id,
    refetchInterval: 60_000,
  });
}

export function useFaturasMutation() {
  const queryClient = useQueryClient();

  const criar = useMutation({
    mutationFn: (data: CriarFaturaData) => faturasService.criar(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });

  const atualizar = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<{ status: string; dataVencimento: Date; dataPagamento: Date; observacoes: string }>;
    }) => faturasService.atualizar(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });

  const emitir = useMutation({
    mutationFn: (id: string) => faturasService.emitir(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });

  const registrarPagamento = useMutation({
    mutationFn: ({ id, dataPagamento }: { id: string; dataPagamento?: Date }) =>
      faturasService.registrarPagamento(id, dataPagamento),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });

  const cancelar = useMutation({
    mutationFn: (id: string) => faturasService.cancelar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });

  const excluir = useMutation({
    mutationFn: (id: string) => faturasService.excluir(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });

  return { criar, atualizar, emitir, registrarPagamento, cancelar, excluir };
}
