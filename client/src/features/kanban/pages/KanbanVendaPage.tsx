import { useState } from 'react';
import type { Projeto } from '@/types/global.types';
import { useEtapas } from '@/hooks/useConfiguracoes';
import { useProjetos, useMoveProject, useAtribuirResponsavel, useSLAAlertas } from '../hooks/useKanban';
import { KanbanBoard } from '../components/KanbanBoard';
import { AtribuirResponsavelModal } from '../components/AtribuirResponsavelModal';
import { ProjetoFormModal } from '@/features/projetos/components/ProjetoFormModal';
import { Button } from '@/components/ui/button';
import { Plus, RefreshCw } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchAPI } from '@/lib/apiClient';

export function KanbanVendaPage() {
  const [projetoSelecionado, setProjetoSelecionado] = useState<Projeto | null>(null);
  const [etapaSelecionada, setEtapaSelecionada] = useState<any>(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [novoProjetoAberto, setNovoProjetoAberto] = useState(false);

  const { data: etapasConfig, isLoading: etapasLoading } = useEtapas();
  const { data: projetos, isLoading: projetosLoading, refetch: refetchProjetos } = useProjetos('projeto_venda');
  const moveProject = useMoveProject('projeto_venda');
  const atribuirResponsavel = useAtribuirResponsavel('projeto_venda');

  const { data: usuarios = [] } = useQuery({
    queryKey: ['usuarios'],
    queryFn: () => fetchAPI<any[]>('/usuarios'),
  });

  const slaAlertas = useSLAAlertas(projetos, 2);
  const etapas = etapasConfig?.projetoVenda || [];

  const handleProjetoSelect = (projeto: Projeto) => {
    setProjetoSelecionado(projeto);
  };

  const handleAtribuirClick = (projeto: Projeto, etapa: any) => {
    setProjetoSelecionado(projeto);
    setEtapaSelecionada(etapa);
    setModalAberto(true);
  };

  const handleAtribuir = async (etapaId: string, usuarioId: string, usuarioNome: string, usuarioEmail: string) => {
    if (!projetoSelecionado) return;
    await atribuirResponsavel.mutateAsync({
      projetoId: projetoSelecionado.id,
      etapaId,
      usuarioId,
      usuarioNome,
      usuarioEmail,
    });
  };

  if (etapasLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Carregando configurações...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Kanban - Projeto Venda</h1>
          <p className="text-muted-foreground">Arraste os projetos entre as etapas</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetchProjetos()}
            disabled={projetosLoading}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
          <Button size="sm" onClick={() => setNovoProjetoAberto(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Projeto
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-brand-50 dark:bg-brand-900/20 rounded-lg p-3 border border-brand-200 dark:border-brand-800/30">
          <p className="text-xs text-brand-600 dark:text-brand-400 font-semibold">Total de Projetos</p>
          <p className="text-2xl font-bold text-brand-900 dark:text-brand-100">{projetos?.length || 0}</p>
        </div>
        <div className="bg-red-50 dark:bg-red-900/10 rounded-lg p-3 border border-red-200 dark:border-red-900/30">
          <p className="text-xs text-red-600 dark:text-red-400 font-semibold">SLA em Risco</p>
          <p className="text-2xl font-bold text-red-900 dark:text-red-100">{slaAlertas.size}</p>
        </div>
        <div className="bg-brand-100 dark:bg-brand-900/30 rounded-lg p-3 border border-brand-200 dark:border-brand-800/40">
          <p className="text-xs text-brand-700 dark:text-brand-300 font-semibold">Concluído</p>
          <p className="text-2xl font-bold text-brand-900 dark:text-brand-100">
            {projetos?.filter((p) => p.etapaAtual === 'concluido').length || 0}
          </p>
        </div>
        <div className="bg-slate-50 dark:bg-slate-800/30 rounded-lg p-3 border border-slate-200 dark:border-slate-700/40">
          <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold">Fat. Pendente</p>
          <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
            R${' '}
            {(
              projetos
                ?.filter((p) => p.statusFaturamento === 'pronto_para_faturar')
                .reduce((acc, p) => acc + (p.valorCalculado || 0), 0) || 0
            ).toLocaleString('pt-BR')}
          </p>
        </div>
      </div>

      {/* Kanban Board */}
      <KanbanBoard
        etapas={etapas}
        projetos={projetos || []}
        onMoveProject={(projetoId, novaEtapa) =>
          moveProject.mutateAsync({ projetoId, novaEtapa }).then(() => undefined)
        }
        onProjetoSelect={handleProjetoSelect}
        isLoading={projetosLoading || moveProject.isPending}
        slaAlertas={slaAlertas}
      />

      {/* Atribuir Modal */}
      <AtribuirResponsavelModal
        open={modalAberto}
        onOpenChange={setModalAberto}
        projeto={projetoSelecionado}
        etapa={etapaSelecionada}
        usuarios={usuarios}
        onAtribuir={handleAtribuir}
        isLoading={atribuirResponsavel.isPending}
      />

      <ProjetoFormModal
        open={novoProjetoAberto}
        onClose={() => setNovoProjetoAberto(false)}
        defaultTipoServico="projeto_venda"
      />
    </div>
  );
}
