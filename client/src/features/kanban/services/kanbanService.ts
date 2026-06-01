import type { Projeto, TipoServico } from '@/types/global.types';
import { auth } from '@/lib/firebase';

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

export const kanbanService = {
  async getProjetos(tipoServico: TipoServico): Promise<Projeto[]> {
    return fetchAPI<Projeto[]>(`/projetos?tipoServico=${tipoServico}`);
  },

  async getProjeto(id: string): Promise<Projeto> {
    return fetchAPI<Projeto>(`/projetos/${id}`);
  },

  async moveProject(projetoId: string, novaEtapa: string): Promise<{ success: boolean }> {
    // Buscar projeto atual
    const projeto = await this.getProjeto(projetoId);

    // Encontrar etapa atual e nova etapa
    const etapaAtual = projeto.etapas.find((e) => e.nome === projeto.etapaAtual);
    const novaEtapaObj = projeto.etapas.find((e) => e.nome === novaEtapa);

    if (!etapaAtual || !novaEtapaObj) {
      throw new Error('Etapa não encontrada');
    }

    // Atualizar etapas
    const etapasAtualizadas = projeto.etapas.map((e) => {
      if (e.nome === novaEtapa) {
        return {
          ...e,
          status: 'em_progresso' as const,
          dataInicio: e.dataInicio || new Date(),
        };
      }
      if (e.nome === projeto.etapaAtual) {
        return {
          ...e,
          status: 'concluido' as const,
          dataFim: new Date(),
        };
      }
      return e;
    });

    return fetchAPI(`/projetos/${projetoId}`, {
      method: 'PUT',
      body: JSON.stringify({
        etapas: etapasAtualizadas,
        etapaAtual: novaEtapa,
        statusFaturamento:
          novaEtapa === 'concluido' ? 'pronto_para_faturar' : projeto.statusFaturamento,
      }),
    });
  },

  async atribuirResponsavel(
    projetoId: string,
    etapaId: string,
    usuarioId: string,
    usuarioNome: string,
    usuarioEmail: string
  ): Promise<{ success: boolean }> {
    // Buscar projeto
    const projeto = await this.getProjeto(projetoId);

    // Atualizar etapa com responsável
    const etapasAtualizadas = projeto.etapas.map((e) => {
      if (e.id === etapaId) {
        return {
          ...e,
          responsavel: {
            uid: usuarioId,
            nome: usuarioNome,
            email: usuarioEmail,
          },
        };
      }
      return e;
    });

    return fetchAPI(`/projetos/${projetoId}`, {
      method: 'PUT',
      body: JSON.stringify({
        etapas: etapasAtualizadas,
      }),
    });
  },
};
