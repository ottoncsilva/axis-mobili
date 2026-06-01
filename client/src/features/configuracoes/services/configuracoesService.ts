import type {
  ConfigEtapas,
  PermissoesPerfil,
  ConfigNotificacoes,
  PerfilUsuario,
  Configuracoes,
} from '@/types/global.types';
import { auth } from '@/lib/firebase';

export type {
  ConfigEtapas,
  PermissoesPerfil,
  ConfigNotificacoes,
  PerfilUsuario,
};

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

async function getToken() {
  return await auth.currentUser?.getIdToken();
}

async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = await getToken();
  if (!token) {
    throw new Error('Não autenticado');
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erro na requisição');
  }

  return response.json();
}

export const configuracoesService = {
  async getConfiguracoes(): Promise<Configuracoes> {
    return fetchAPI<Configuracoes>('/configuracoes');
  },

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

  async updatePermissoes(
    permissoes: Record<PerfilUsuario, PermissoesPerfil>
  ): Promise<{ success: boolean }> {
    return fetchAPI('/configuracoes/permissoes', {
      method: 'PUT',
      body: JSON.stringify(permissoes),
    });
  },

  async getNotificacoes(): Promise<ConfigNotificacoes> {
    return fetchAPI<ConfigNotificacoes>('/configuracoes/notificacoes');
  },

  async updateNotificacoes(
    notificacoes: ConfigNotificacoes
  ): Promise<{ success: boolean }> {
    return fetchAPI('/configuracoes/notificacoes', {
      method: 'PUT',
      body: JSON.stringify(notificacoes),
    });
  },
};
