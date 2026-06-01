import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import type { Projeto, EtapaConfig } from '@/types/global.types';
import { KanbanColumn } from './KanbanColumn';
import { useState } from 'react';

interface KanbanBoardProps {
  etapas: EtapaConfig[];
  projetos: Projeto[];
  onMoveProject: (projetoId: string, novaEtapa: string) => Promise<void>;
  onProjetoSelect: (projeto: Projeto) => void;
  isLoading?: boolean;
  slaAlertas?: Set<string>;
}

export function KanbanBoard({
  etapas,
  projetos,
  onMoveProject,
  onProjetoSelect,
  isLoading = false,
  slaAlertas = new Set(),
}: KanbanBoardProps) {
  const [isMoving, setIsMoving] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const novaEtapa = over.id as string;
    const projetoId = active.data.current?.projeto?.id;

    if (!projetoId) return;

    setIsMoving(true);
    try {
      await onMoveProject(projetoId, novaEtapa);
    } catch (error) {
      console.error('Erro ao mover projeto:', error);
    } finally {
      setIsMoving(false);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {etapas.map((etapa) => (
          <KanbanColumn
            key={etapa.id}
            etapa={etapa}
            projetos={projetos}
            onProjetoSelect={onProjetoSelect}
            slaAlertas={slaAlertas}
          />
        ))}
      </div>
      {(isLoading || isMoving) && (
        <div className="fixed inset-0 bg-black/10 flex items-center justify-center">
          <div className="bg-white rounded-lg p-4">
            <p className="text-sm font-medium">Atualizando...</p>
          </div>
        </div>
      )}
    </DndContext>
  );
}
