import { useDroppable } from '@dnd-kit/core';
import type { Projeto, EtapaConfig } from '@/types/global.types';
import { KanbanCard } from './KanbanCard';
import { cn } from '@/lib/utils';

interface KanbanColumnProps {
  etapa: EtapaConfig;
  projetos: Projeto[];
  onProjetoSelect: (projeto: Projeto) => void;
  slaAlertas: Set<string>;
}

export function KanbanColumn({
  etapa,
  projetos,
  onProjetoSelect,
  slaAlertas,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: etapa.id,
  });

  const projetosEmEtapa = projetos.filter((p) => p.etapaAtual === etapa.nome);

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex flex-col gap-3 bg-gray-50 rounded-lg p-4 min-h-[500px] flex-1',
        'border-2 border-gray-200 transition-all',
        isOver && 'border-blue-400 bg-blue-50'
      )}
    >
      {/* Header */}
      <div className="sticky top-0 bg-gray-50 pb-2 border-b-2 border-gray-200">
        <h3 className="font-semibold text-sm text-gray-700">{etapa.label}</h3>
        <p className="text-xs text-gray-500">
          {projetosEmEtapa.length} projeto{projetosEmEtapa.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Cards */}
      <div className="flex flex-col gap-3">
        {projetosEmEtapa.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
            Nenhum projeto
          </div>
        ) : (
          projetosEmEtapa.map((projeto) => (
            <KanbanCard
              key={projeto.id}
              projeto={projeto}
              etapaAtual={etapa.nome}
              onSelect={onProjetoSelect}
              slaAlerta={slaAlertas.has(projeto.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
