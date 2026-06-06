import type { Projeto } from '@/types/global.types';
import type { ProjetoFormData, ProjetosFiltros } from '../types/projetos.types';
import { fetchAPI } from '@/lib/apiClient';

export const projetosService = {
  async listar(filtros?: ProjetosFiltros): Promise<Projeto[]> {
    const params = new URLSearchParams();
    if (filtros?.busca) params.set('busca', filtros.busca);
    if (filtros?.tipoServico && filtros.tipoServico !== 'todos') params.set('tipoServico', filtros.tipoServico);
    if (filtros?.statusFaturamento && filtros.statusFaturamento !== 'todos') params.set('statusFaturamento', filtros.statusFaturamento);
    const qs = params.toString();
    return fetchAPI<Projeto[]>(`/projetos${qs ? `?${qs}` : ''}`);
  },

  async buscarPorId(id: string): Promise<Projeto | null> {
    try {
      return await fetchAPI<Projeto>(`/projetos/${id}`);
    } catch {
      return null;
    }
  },

  async listarPorCliente(clienteId: string): Promise<Projeto[]> {
    return fetchAPI<Projeto[]>(`/projetos/cliente/${clienteId}`);
  },

  async criar(data: ProjetoFormData): Promise<string> {
    const result = await fetchAPI<{ id: string }>('/projetos', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return result.id;
  },

  async atualizar(id: string, data: Partial<ProjetoFormData>): Promise<void> {
    await fetchAPI(`/projetos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};
