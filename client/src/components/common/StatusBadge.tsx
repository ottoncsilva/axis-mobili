import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const STATUS_STYLES: Record<string, string> = {
  ativo: 'bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300',
  inativo: 'bg-muted text-muted-foreground',
  no_prazo: 'bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300',
  atencao: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  atrasado: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  em_andamento: 'bg-brand-50 text-brand-600 dark:bg-brand-900/20 dark:text-brand-400',
  pronto_para_faturar: 'bg-brand-200 text-brand-800 dark:bg-brand-800/30 dark:text-brand-200',
  faturado: 'bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300',
  rascunho: 'bg-muted text-muted-foreground',
  emitida: 'bg-brand-50 text-brand-600 dark:bg-brand-900/20 dark:text-brand-400',
  paga: 'bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300',
  cancelada: 'bg-muted text-muted-foreground',
  vencida: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  projeto_venda: 'bg-brand-100 text-brand-800 dark:bg-brand-900/30 dark:text-brand-400',
  projeto_executivo: 'bg-brand-50 text-brand-600 dark:bg-brand-800/20 dark:text-brand-300',
  medicao: 'bg-slate-100 text-slate-700 dark:bg-slate-800/30 dark:text-slate-400',
};

const STATUS_LABELS: Record<string, string> = {
  ativo: 'Ativo',
  inativo: 'Inativo',
  no_prazo: 'No Prazo',
  atencao: 'Atenção',
  atrasado: 'Atrasado',
  em_andamento: 'Em Andamento',
  pronto_para_faturar: 'Pronto p/ Faturar',
  faturado: 'Faturado',
  rascunho: 'Rascunho',
  emitida: 'Emitida',
  paga: 'Paga',
  cancelada: 'Cancelada',
  vencida: 'Vencida',
  projeto_venda: 'Projeto Venda',
  projeto_executivo: 'Projeto Executivo',
  medicao: 'Medição',
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const styles = STATUS_STYLES[status] || 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
  const label = STATUS_LABELS[status] || status;

  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', styles, className)}>
      {label}
    </span>
  );
}
