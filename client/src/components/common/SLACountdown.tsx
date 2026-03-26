import { useBusinessDays } from '@/hooks/useBusinessDays';
import { formatDate } from '@/lib/utils';
import { Clock, AlertTriangle, XCircle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SLACountdownProps {
  inicioEtapa: Date;
  prazoDiasUteis: number;
  compact?: boolean;
  className?: string;
}

export function SLACountdown({ inicioEtapa, prazoDiasUteis, compact = false, className }: SLACountdownProps) {
  const { calcularSLA, loading } = useBusinessDays();

  if (loading) {
    return <div className="animate-pulse h-6 w-24 rounded bg-muted" />;
  }

  const sla = calcularSLA(inicioEtapa, prazoDiasUteis);

  const statusConfig = {
    no_prazo: {
      icon: CheckCircle,
      label: 'No prazo',
      bgClass: 'bg-green-100 dark:bg-green-900/30',
      textClass: 'text-green-700 dark:text-green-400',
      barClass: 'bg-green-500',
    },
    atencao: {
      icon: Clock,
      label: 'Atenção',
      bgClass: 'bg-yellow-100 dark:bg-yellow-900/30',
      textClass: 'text-yellow-700 dark:text-yellow-400',
      barClass: 'bg-yellow-500',
    },
    atrasado: {
      icon: XCircle,
      label: 'Atrasado',
      bgClass: 'bg-red-100 dark:bg-red-900/30',
      textClass: 'text-red-700 dark:text-red-400',
      barClass: 'bg-red-500',
    },
  };

  const config = statusConfig[sla.status];
  const Icon = config.icon;

  // Compact mode — just badge
  if (compact) {
    return (
      <div className={cn('inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium', config.bgClass, config.textClass, className)}>
        <Icon className="h-3 w-3" />
        <span>
          {sla.diasUteisRestantes >= 0
            ? `${sla.diasUteisRestantes}d restante${sla.diasUteisRestantes !== 1 ? 's' : ''}`
            : `${Math.abs(sla.diasUteisRestantes)}d atrasado`}
        </span>
      </div>
    );
  }

  // Full mode — with progress bar
  return (
    <div className={cn('rounded-lg border p-3', config.bgClass, 'border-transparent', className)}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Icon className={cn('h-4 w-4', config.textClass)} />
          <span className={cn('text-sm font-medium', config.textClass)}>{config.label}</span>
        </div>
        <span className={cn('text-xs font-mono', config.textClass)}>
          {sla.diasUteisConsumidos}/{sla.diasUteisTotais} dias
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-2 rounded-full bg-white/50 dark:bg-black/20 overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-500', config.barClass)}
          style={{ width: `${Math.min(sla.percentualConsumido, 100)}%` }}
        />
      </div>

      <div className="flex items-center justify-between mt-1.5 text-xs">
        <span className={cn('opacity-70', config.textClass)}>
          Prazo: {formatDate(sla.dataLimite)}
        </span>
        <span className={cn('font-medium', config.textClass)}>
          {sla.diasUteisRestantes >= 0
            ? `${sla.diasUteisRestantes} dia${sla.diasUteisRestantes !== 1 ? 's' : ''} útei${sla.diasUteisRestantes !== 1 ? 's' : 'l'} restante${sla.diasUteisRestantes !== 1 ? 's' : ''}`
            : `${Math.abs(sla.diasUteisRestantes)} dia${Math.abs(sla.diasUteisRestantes) !== 1 ? 's' : ''} atrasado`}
        </span>
      </div>
    </div>
  );
}
