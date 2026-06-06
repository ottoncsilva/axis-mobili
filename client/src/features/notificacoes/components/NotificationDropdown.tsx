import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, AlertTriangle, Clock, Receipt, CheckCheck, X } from 'lucide-react';
import { useNotificacoesInApp, type NotificacaoInApp } from '../hooks/useNotificacoesInApp';
import { cn } from '@/lib/utils';

const TIPO_CONFIG = {
  sla_estourado: { icon: AlertTriangle, cor: 'text-red-500', bg: 'bg-red-50 dark:bg-red-950/30' },
  sla_risco: { icon: Clock, cor: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-950/30' },
  pronto_faturar: { icon: Receipt, cor: 'text-brand-600', bg: 'bg-brand-50 dark:bg-brand-950/30' },
  fatura_vencida: { icon: AlertTriangle, cor: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-950/30' },
};

function NotificacaoItem({
  notificacao,
  lida,
  onCLick,
}: {
  notificacao: NotificacaoInApp;
  lida: boolean;
  onCLick: () => void;
}) {
  const config = TIPO_CONFIG[notificacao.tipo];
  const Icon = config.icon;

  return (
    <button
      onClick={onCLick}
      className={cn(
        'w-full flex items-start gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-left border-b border-border last:border-0',
        lida && 'opacity-60'
      )}
    >
      <div className={cn('mt-0.5 p-1.5 rounded-lg flex-shrink-0', config.bg)}>
        <Icon className={cn('h-3.5 w-3.5', config.cor)} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className={cn('text-sm font-semibold text-foreground', lida && 'font-normal')}>{notificacao.titulo}</p>
          {!lida && <span className="w-1.5 h-1.5 rounded-full bg-brand-500 flex-shrink-0" />}
        </div>
        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{notificacao.mensagem}</p>
      </div>
    </button>
  );
}

export function NotificationDropdown() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { notificacoes, naoLidas, marcarLida, marcarTodasLidas } = useNotificacoesInApp();

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleNotificacaoClick = (notificacao: NotificacaoInApp) => {
    marcarLida(notificacao.id);
    setOpen(false);
    navigate(notificacao.link);
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
        aria-label="Notificações"
      >
        <Bell className="h-5 w-5" />
        {naoLidas.length > 0 && (
          <span className="absolute top-1 right-1 min-w-[16px] h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-0.5 leading-none">
            {naoLidas.length > 9 ? '9+' : naoLidas.length}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-popover border border-border rounded-xl shadow-lg z-50 overflow-hidden animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-foreground" />
                <span className="font-semibold text-sm text-foreground">Notificações</span>
                {naoLidas.length > 0 && (
                  <span className="px-1.5 py-0.5 bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 text-xs font-semibold rounded-full">
                    {naoLidas.length}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {naoLidas.length > 0 && (
                  <button
                    onClick={marcarTodasLidas}
                    className="flex items-center gap-1 px-2 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-all"
                    title="Marcar todas como lidas"
                  >
                    <CheckCheck className="h-3.5 w-3.5" />
                    Limpar
                  </button>
                )}
                <button
                  onClick={() => setOpen(false)}
                  className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Lista */}
            <div className="max-h-96 overflow-y-auto">
              {notificacoes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center px-4">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-3">
                    <Bell className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium text-foreground">Sem alertas</p>
                  <p className="text-xs text-muted-foreground mt-1">Tudo em dia por enquanto</p>
                </div>
              ) : (
                notificacoes.map((n) => (
                  <NotificacaoItem
                    key={n.id}
                    notificacao={n}
                    lida={!naoLidas.some((nl) => nl.id === n.id)}
                    onCLick={() => handleNotificacaoClick(n)}
                  />
                ))
              )}
            </div>

            {/* Footer */}
            {notificacoes.length > 0 && (
              <div className="px-4 py-2.5 border-t border-border bg-muted/30">
                <p className="text-xs text-muted-foreground text-center">
                  Alertas calculados a partir dos projetos e faturas ativos
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
