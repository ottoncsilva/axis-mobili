import type {
  ConfigEtapas,
  PermissoesPerfil,
  ConfigNotificacoes,
  PerfilUsuario,
  Feriado,
} from '@/types/global.types';
import { fetchAPI } from '@/lib/apiClient';

export type { ConfigEtapas, PermissoesPerfil, ConfigNotificacoes, PerfilUsuario };

export interface ConfigEmpresa {
  nome: string;
  cnpj?: string;
  endereco?: string;
  telefone?: string;
  email?: string;
  logoUrl?: string;
}

export interface ConfigFeriados {
  sabadoDiaUtil: boolean;
  feriadosPadrao: Feriado[];
  feriadosCustom: Feriado[];
}

export const configuracoesService = {
  async getEtapas(): Promise<ConfigEtapas> {
    return fetchAPI<ConfigEtapas>('/configuracoes/etapas');
  },

  async updateEtapas(etapas: ConfigEtapas): Promise<{ success: boolean }> {
    return fetchAPI('/configuracoes/etapas', { method: 'PUT', body: JSON.stringify(etapas) });
  },

  async getPermissoes(): Promise<Record<PerfilUsuario, PermissoesPerfil>> {
    return fetchAPI<Record<PerfilUsuario, PermissoesPerfil>>('/configuracoes/permissoes');
  },

  async updatePermissoes(permissoes: Record<PerfilUsuario, PermissoesPerfil>): Promise<{ success: boolean }> {
    return fetchAPI('/configuracoes/permissoes', { method: 'PUT', body: JSON.stringify(permissoes) });
  },

  async getNotificacoes(): Promise<ConfigNotificacoes> {
    return fetchAPI<ConfigNotificacoes>('/configuracoes/notificacoes');
  },

  async updateNotificacoes(notificacoes: ConfigNotificacoes): Promise<{ success: boolean }> {
    return fetchAPI('/configuracoes/notificacoes', { method: 'PUT', body: JSON.stringify(notificacoes) });
  },

  async getEmpresa(): Promise<ConfigEmpresa> {
    return fetchAPI<ConfigEmpresa>('/configuracoes/empresa');
  },

  async updateEmpresa(empresa: ConfigEmpresa): Promise<{ success: boolean }> {
    return fetchAPI('/configuracoes/empresa', { method: 'PUT', body: JSON.stringify(empresa) });
  },

  async getFeriados(): Promise<ConfigFeriados> {
    return fetchAPI<ConfigFeriados>('/configuracoes/feriados');
  },

  async updateFeriados(feriados: ConfigFeriados): Promise<{ success: boolean }> {
    return fetchAPI('/configuracoes/feriados', { method: 'PUT', body: JSON.stringify(feriados) });
  },

  async getConfiguracoes() {
    return fetchAPI<any>('/configuracoes');
  },
};
