import { fetchAPI } from '@/lib/apiClient';
import type { Usuario, UsuarioFormData, CriarUsuarioResponse } from '../types/usuarios.types';

export const usuariosService = {
  async listar(filtros?: { busca?: string; perfil?: string; ativo?: boolean }) {
    return fetchAPI<Usuario[]>('/usuarios/admin/listar', {
      method: 'POST',
      body: JSON.stringify({ filtro: filtros }),
    });
  },

  async buscarPorId(id: string) {
    return fetchAPI<Usuario>(`/usuarios/${id}`);
  },

  async criar(data: UsuarioFormData) {
    return fetchAPI<CriarUsuarioResponse>('/usuarios', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async atualizar(id: string, data: Partial<UsuarioFormData>) {
    return fetchAPI<Usuario>(`/usuarios/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async toggleAtivo(id: string, ativo: boolean) {
    return fetchAPI<Usuario>(`/usuarios/${id}/toggle-ativo`, {
      method: 'PUT',
      body: JSON.stringify({ ativo }),
    });
  },

  async excluir(id: string) {
    return fetchAPI<{ mensagem: string }>(`/usuarios/${id}`, {
      method: 'DELETE',
    });
  },
};
