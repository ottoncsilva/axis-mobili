import type { Projeto, TipoServico } from '@/types/global.types';
import { fetchAPI } from '@/lib/apiClient';

export const kanbanService = {
  async getProjetos(tipoServico: TipoServico): Promise<Projeto[]> {
    return fetchAPI<Projeto[]>(`/projetos?tipoServico=${tipoServico}`);
  },

  async getProjeto(id: string): Promise<Projeto> {
    return fetchAPI<Projeto>(`/projetos/${id}`);
  },

  async moveProject(projetoId: string, novaEtapa: string): Promise<{ success: boolean }> {
    const projeto = await this.getProjeto(projetoId);

    const etapasAtualizadas = (projeto.etapas || []).map((e) => {
      if (e.nome === novaEtapa) {
        return { ...e, status: 'em_progresso' as const, dataInicio: e.dataInicio || new Date() };
      }
      if (e.nome === projeto.etapaAtual) {
        return { ...e, status: 'concluido' as const, dataFim: new Date() };
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
    const projeto = await this.getProjeto(projetoId);

    const etapasAtualizadas = (projeto.etapas || []).map((e) => {
      if (e.id === etapaId) {
        return { ...e, responsavel: { uid: usuarioId, nome: usuarioNome, email: usuarioEmail } };
      }
      return e;
    });

    return fetchAPI(`/projetos/${projetoId}`, {
      method: 'PUT',
      body: JSON.stringify({ etapas: etapasAtualizadas }),
    });
  },
};
