import type { Cliente } from '@/types/global.types';
import type { ClienteFormData, ClientesFiltros } from '../types/clientes.types';
import { fetchAPI } from '@/lib/apiClient';
import { unmaskNumber } from '@/lib/masks';

export const clientesService = {
  async listar(filtros?: ClientesFiltros): Promise<Cliente[]> {
    const params = new URLSearchParams();
    if (filtros?.busca) params.set('busca', filtros.busca);
    if (filtros?.status && filtros.status !== 'todos') params.set('status', filtros.status);
    const qs = params.toString();
    return fetchAPI<Cliente[]>(`/clientes${qs ? `?${qs}` : ''}`);
  },

  async buscarPorId(id: string): Promise<Cliente | null> {
    try {
      return await fetchAPI<Cliente>(`/clientes/${id}`);
    } catch {
      return null;
    }
  },

  async criar(data: ClienteFormData): Promise<string> {
    const body = {
      ...data,
      cnpj: unmaskNumber(data.cnpj),
      endereco: { ...data.endereco, cep: unmaskNumber(data.endereco.cep) },
      contatos: data.contatos.map((c, i) => ({
        ...c,
        id: `contato_${Date.now()}_${i}`,
        telefone: unmaskNumber(c.telefone),
        whatsapp: c.whatsapp ? unmaskNumber(c.whatsapp) : undefined,
      })),
    };
    const result = await fetchAPI<{ id: string }>('/clientes', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    return result.id;
  },

  async atualizar(id: string, data: Partial<ClienteFormData>): Promise<void> {
    const body: Record<string, unknown> = { ...data };
    if (data.cnpj) body.cnpj = unmaskNumber(data.cnpj);
    if (data.endereco?.cep) body.endereco = { ...data.endereco, cep: unmaskNumber(data.endereco.cep) };
    if (data.contatos) {
      body.contatos = data.contatos.map((c, i) => ({
        ...c,
        id: `contato_${Date.now()}_${i}`,
        telefone: unmaskNumber(c.telefone),
        whatsapp: c.whatsapp ? unmaskNumber(c.whatsapp) : undefined,
      }));
    }
    await fetchAPI(`/clientes/${id}`, { method: 'PUT', body: JSON.stringify(body) });
  },

  async toggleAtivo(id: string, ativo: boolean): Promise<void> {
    await fetchAPI(`/clientes/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ ativo }),
    });
  },

  async listarParaSelect(): Promise<Array<{ id: string; nomeFantasia: string }>> {
    return fetchAPI<Array<{ id: string; nomeFantasia: string }>>('/clientes/select');
  },
};
