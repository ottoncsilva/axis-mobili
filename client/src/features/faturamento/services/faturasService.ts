import { fetchAPI } from '@/lib/apiClient';
import type { Fatura } from '@/types/global.types';

export interface CriarFaturaData {
  clienteId: string;
  projetosIds: string[];
  tipo: 'mensal' | 'por_projeto';
  periodoInicio?: Date;
  periodoFim?: Date;
  percentualEntrada?: number;
  observacoes?: string;
}

export const faturasService = {
  async listar(filtros?: { clienteId?: string; status?: string }) {
    const params = new URLSearchParams();
    if (filtros?.clienteId) params.append('clienteId', filtros.clienteId);
    if (filtros?.status) params.append('status', filtros.status);

    const queryString = params.toString();
    const url = queryString ? `/faturas?${queryString}` : '/faturas';
    return fetchAPI<Fatura[]>(url);
  },

  async buscarPorId(id: string) {
    return fetchAPI<Fatura>(`/faturas/${id}`);
  },

  async criar(data: CriarFaturaData) {
    return fetchAPI<any>('/faturas', {
      method: 'POST',
      body: JSON.stringify({
        ...data,
        periodoInicio: data.periodoInicio?.toISOString(),
        periodoFim: data.periodoFim?.toISOString(),
      }),
    });
  },

  async atualizar(id: string, data: Partial<{ status: string; dataVencimento: Date; dataPagamento: Date; observacoes: string }>) {
    return fetchAPI<Fatura>(`/faturas/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        ...data,
        dataVencimento: data.dataVencimento?.toISOString(),
        dataPagamento: data.dataPagamento?.toISOString(),
      }),
    });
  },

  async emitir(id: string) {
    return fetchAPI<Fatura>(`/faturas/${id}/emitir`, { method: 'POST' });
  },

  async registrarPagamento(id: string, dataPagamento?: Date) {
    return fetchAPI<Fatura>(`/faturas/${id}/pagar`, {
      method: 'POST',
      body: JSON.stringify({ dataPagamento: dataPagamento?.toISOString() }),
    });
  },

  async cancelar(id: string) {
    return fetchAPI<Fatura>(`/faturas/${id}/cancelar`, { method: 'POST' });
  },

  async excluir(id: string) {
    return fetchAPI<{ mensagem: string }>(`/faturas/${id}`, { method: 'DELETE' });
  },
};
