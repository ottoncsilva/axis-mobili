import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const STATUS_STYLES: Record<string, string> = {
  ativo: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  inativo: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  no_prazo: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  atencao: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  atrasado: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  em_andamento: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  pronto_para_faturar: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  faturado: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  rascunho: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  emitida: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  paga: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  cancelada: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  vencida: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  projeto_venda: 'bg-brand-100 text-brand-800 dark:bg-brand-900/30 dark:text-brand-400',
  projeto_executivo: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  medicao: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
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
