import type {
  ConfigEtapas,
  PermissoesPerfil,
  ConfigNotificacoes,
  PerfilUsuario,
} from '@/types/global.types';
import { fetchAPI } from '@/lib/apiClient';

export type { ConfigEtapas, PermissoesPerfil, ConfigNotificacoes, PerfilUsuario };

export const configuracoesService = {
  async getEtapas(): Promise<ConfigEtapas> {
    return fetchAPI<ConfigEtapas>('/configuracoes/etapas');
  },

  async updateEtapas(etapas: ConfigEtapas): Promise<{ success: boolean }> {
    return fetchAPI('/configuracoes/etapas', {
      method: 'PUT',
      body: JSON.stringify(etapas),
    });
  },

  async getPermissoes(): Promise<Record<PerfilUsuario, PermissoesPerfil>> {
    return fetchAPI<Record<PerfilUsuario, PermissoesPerfil>>('/configuracoes/permissoes');
  },

  async updatePermissoes(permissoes: Record<PerfilUsuario, PermissoesPerfil>): Promise<{ success: boolean }> {
    return fetchAPI('/configuracoes/permissoes', {
      method: 'PUT',
      body: JSON.stringify(permissoes),
    });
  },

  async getNotificacoes(): Promise<ConfigNotificacoes> {
    return fetchAPI<ConfigNotificacoes>('/configuracoes/notificacoes');
  },

  async updateNotificacoes(notificacoes: ConfigNotificacoes): Promise<{ success: boolean }> {
    return fetchAPI('/configuracoes/notificacoes', {
      method: 'PUT',
      body: JSON.stringify(notificacoes),
    });
  },
};
