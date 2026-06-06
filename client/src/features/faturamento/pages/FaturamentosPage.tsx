import { useState } from 'react';
import { useFaturas, useFaturasMutation } from '../hooks/useFaturas';
import { FaturasListTable } from '../components/FaturasListTable';
import { Button } from '@/components/ui/button';
import { Plus, RefreshCw } from 'lucide-react';

export function FaturamentosPage() {
  const [filtroStatus, setFiltroStatus] = useState<string>('');
  const { data: faturas = [], isLoading, refetch } = useFaturas({
    status: filtroStatus || undefined,
  });

  const statusOpcoes = [
    { value: '', label: 'Todas' },
    { value: 'rascunho', label: 'Rascunho' },
    { value: 'emitida', label: 'Emitida' },
    { value: 'paga', label: 'Paga' },
    { value: 'vencida', label: 'Vencida' },
    { value: 'cancelada', label: 'Cancelada' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Faturamento</h1>
          <p className="text-muted-foreground">Gerencie faturas e acompanhe pagamentos</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isLoading}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
          <Button size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Nova Fatura
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-2">
        {statusOpcoes.map((opcao) => (
          <button
            key={opcao.value}
            onClick={() => setFiltroStatus(opcao.value)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              filtroStatus === opcao.value
                ? 'bg-brand-600 text-white'
                : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            {opcao.label}
          </button>
        ))}
      </div>

      {/* Tabela */}
      <FaturasListTable faturas={faturas} isLoading={isLoading} />
    </div>
  );
}
