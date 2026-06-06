import { Eye, MoreVertical, FileText } from 'lucide-react';
import type { Fatura } from '@/types/global.types';
import { formatMoeda } from '@/lib/masks';
import { cn } from '@/lib/utils';

interface Props {
  faturas: Fatura[];
  isLoading: boolean;
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  rascunho: { label: 'Rascunho', color: 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300' },
  emitida: { label: 'Emitida', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' },
  paga: { label: 'Paga', color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' },
  vencida: { label: 'Vencida', color: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' },
  cancelada: { label: 'Cancelada', color: 'bg-slate-100 dark:bg-slate-900/30 text-slate-700 dark:text-slate-300' },
};

export function FaturasListTable({ faturas, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8 text-muted-foreground">
        Carregando faturas...
      </div>
    );
  }

  if (faturas.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 rounded-lg border border-dashed border-border">
        <FileText className="h-8 w-8 text-muted-foreground mb-3" />
        <p className="text-muted-foreground font-medium">Nenhuma fatura encontrada</p>
        <p className="text-sm text-muted-foreground">Comece criando uma nova fatura</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            <th className="px-6 py-3 text-left font-semibold text-foreground">Número</th>
            <th className="px-6 py-3 text-left font-semibold text-foreground">Cliente</th>
            <th className="px-6 py-3 text-left font-semibold text-foreground">Projetos</th>
            <th className="px-6 py-3 text-left font-semibold text-foreground">Total</th>
            <th className="px-6 py-3 text-left font-semibold text-foreground">Status</th>
            <th className="px-6 py-3 text-left font-semibold text-foreground">Vencimento</th>
            <th className="px-6 py-3 text-right font-semibold text-foreground">Ações</th>
          </tr>
        </thead>
        <tbody>
          {faturas.map((fatura) => {
            const statusInfo = STATUS_LABELS[fatura.status] || STATUS_LABELS.rascunho;
            const vencimento = fatura.dataVencimento
              ? new Date(typeof fatura.dataVencimento === 'string' ? fatura.dataVencimento : fatura.dataVencimento).toLocaleDateString('pt-BR')
              : '—';

            return (
              <tr key={fatura.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                <td className="px-6 py-4 font-mono text-sm font-semibold text-foreground">{fatura.numero}</td>
                <td className="px-6 py-4 text-foreground">{fatura.clienteNome}</td>
                <td className="px-6 py-4 text-sm text-muted-foreground">{fatura.projetosIds.length} projeto(s)</td>
                <td className="px-6 py-4 font-semibold text-foreground">{formatMoeda(fatura.valorTotal || 0)}</td>
                <td className="px-6 py-4">
                  <span
                    className={cn(
                      'inline-block px-2.5 py-1 rounded-full text-xs font-medium',
                      statusInfo.color
                    )}
                  >
                    {statusInfo.label}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-muted-foreground">{vencimento}</td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button className="p-2 rounded-lg hover:bg-muted transition-colors text-brand-600 hover:text-brand-700">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
