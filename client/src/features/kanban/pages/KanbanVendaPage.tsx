import { useState } from 'react';
import type { Projeto } from '@/types/global.types';
import { useEtapas } from '@/hooks/useConfiguracoes';
import { useProjetos, useMoveProject, useAtribuirResponsavel, useSLAAlertas } from '../hooks/useKanban';
import { KanbanBoard } from '../components/KanbanBoard';
import { AtribuirResponsavelModal } from '../components/AtribuirResponsavelModal';
import { Button } from '@/components/ui/button';
import { Plus, RefreshCw } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

export function KanbanVendaPage() {
  const [projetoSelecionado, setProjetoSelecionado] = useState<Projeto | null>(null);
  const [etapaSelecionada, setEtapaSelecionada] = useState<any>(null);
  const [modalAberto, setModalAberto] = useState(false);

  const { data: etapasConfig, isLoading: etapasLoading } = useEtapas();
  const { data: projetos, isLoading: projetosLoading, refetch: refetchProjetos } = useProjetos('projeto_venda');
  const moveProject = useMoveProject('projeto_venda');
  const atribuirResponsavel = useAtribuirResponsavel('projeto_venda');

  // Get all users for assignment
  const { data: usuarios = [] } = useQuery({
    queryKey: ['usuarios'],
    queryFn: async () => {
      const snap = await getDocs(collection(db, 'usuarios'));
      return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as any));
    },
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
        <p className="text-gray-500">Carregando configurações...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Kanban - Projeto Venda</h1>
          <p className="text-gray-500">Arraste os projetos entre as etapas</p>
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
          <Button size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Novo Projeto
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
          <p className="text-xs text-blue-600 font-semibold">Total de Projetos</p>
          <p className="text-2xl font-bold text-blue-900">{projetos?.length || 0}</p>
        </div>
        <div className="bg-red-50 rounded-lg p-3 border border-red-200">
          <p className="text-xs text-red-600 font-semibold">SLA em Risco</p>
          <p className="text-2xl font-bold text-red-900">{slaAlertas.size}</p>
        </div>
        <div className="bg-green-50 rounded-lg p-3 border border-green-200">
          <p className="text-xs text-green-600 font-semibold">Concluído</p>
          <p className="text-2xl font-bold text-green-900">
            {projetos?.filter((p) => p.etapaAtual === 'concluido').length || 0}
          </p>
        </div>
        <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
          <p className="text-xs text-purple-600 font-semibold">Faturamento Pendente</p>
          <p className="text-2xl font-bold text-purple-900">
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
          moveProject.mutateAsync({ projetoId, novaEtapa })
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
    </div>
  );
}
