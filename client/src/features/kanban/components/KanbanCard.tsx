import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import type { Projeto } from '@/types/global.types';

function tsToDate(ts: any): Date {
  if (!ts) return new Date();
  if (ts instanceof Date) return ts;
  if (typeof ts.toDate === 'function') return ts.toDate();
  if (ts._seconds !== undefined) return new Date(ts._seconds * 1000);
  return new Date(ts);
}
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface KanbanCardProps {
  projeto: Projeto;
  etapaAtual: string;
  onSelect: (projeto: Projeto) => void;
  slaAlerta?: boolean;
}

export function KanbanCard({ projeto, etapaAtual, onSelect, slaAlerta }: KanbanCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: projeto.id,
    data: { projeto, etapaAtual },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  // Find current stage info
  const etapaInfo = projeto.etapas?.find((e) => e.nome === etapaAtual);
  const diasRestantes = etapaInfo?.sla || 0;

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onSelect(projeto)}
      className={`p-3 cursor-grab active:cursor-grabbing transition-all ${
        isDragging ? 'shadow-lg ring-2 ring-brand-400' : 'hover:shadow-md'
      } ${slaAlerta ? 'ring-2 ring-red-400 bg-red-50 dark:bg-red-900/10' : ''}`}
    >
      <div className="space-y-2">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm truncate">{projeto.clienteFinal.nome}</h4>
            <p className="text-xs text-muted-foreground truncate">{projeto.clienteNome}</p>
          </div>
          {slaAlerta && (
            <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
          )}
        </div>

        {/* Ambientes */}
        {projeto.ambientes && projeto.ambientes.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {projeto.ambientes.slice(0, 2).map((amb) => (
              <Badge key={amb.id} variant="outline" className="text-xs">
                {amb.nome}
              </Badge>
            ))}
            {projeto.ambientes.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{projeto.ambientes.length - 2}
              </Badge>
            )}
          </div>
        )}

        {/* Responsável */}
        {etapaInfo?.responsavel && (
          <div className="flex items-center gap-1 text-xs">
            <User className="w-3 h-3" />
            <span className="truncate">{etapaInfo.responsavel.nome}</span>
          </div>
        )}

        {/* SLA e Valor */}
        <div className="flex items-center justify-between text-xs">
          <span className={`font-semibold ${slaAlerta ? 'text-red-600' : 'text-muted-foreground'}`}>
            SLA: {diasRestantes}d
          </span>
          {projeto.valorCalculado && (
            <span className="text-brand-600 dark:text-brand-400 font-semibold">
              R$ {projeto.valorCalculado.toLocaleString('pt-BR')}
            </span>
          )}
        </div>

        {/* Data criação */}
        <p className="text-xs text-muted-foreground/70">
          {formatDistanceToNow(tsToDate(projeto.criadoEm), { locale: ptBR, addSuffix: true })}
        </p>
      </div>
    </Card>
  );
}
