import { useState, useMemo } from 'react';
import { useFaturas } from '../hooks/useFaturas';
import { FaturasListTable } from '../components/FaturasListTable';
import { Button } from '@/components/ui/button';
import { Plus, RefreshCw, Search } from 'lucide-react';
import type { Fatura } from '@/types/global.types';

type FiltroPeriodo = 'todos' | 'este_mes' | 'mes_passado' | 'ultimos_3_meses' | 'este_ano';
type Ordenacao = 'mais_recente' | 'mais_antigo' | 'maior_valor' | 'menor_valor';

function tsToDate(ts: any): Date {
  if (!ts) return new Date(0);
  if (ts instanceof Date) return ts;
  if (typeof ts.toDate === 'function') return ts.toDate();
  if (ts._seconds !== undefined) return new Date(ts._seconds * 1000);
  return new Date(ts);
}

function getFaturaDate(fatura: Fatura): Date {
  return tsToDate(fatura.dataEmissao ?? fatura.criadoEm);
}

function filtrarPorPeriodo(fatura: Fatura, periodo: FiltroPeriodo): boolean {
  if (periodo === 'todos') return true;
  const data = getFaturaDate(fatura);
  const agora = new Date();
  const anoAtual = agora.getFullYear();
  const mesAtual = agora.getMonth();

  if (periodo === 'este_mes') {
    return data.getFullYear() === anoAtual && data.getMonth() === mesAtual;
  }
  if (periodo === 'mes_passado') {
    const mesAnterior = mesAtual === 0 ? 11 : mesAtual - 1;
    const anoAnterior = mesAtual === 0 ? anoAtual - 1 : anoAtual;
    return data.getFullYear() === anoAnterior && data.getMonth() === mesAnterior;
  }
  if (periodo === 'ultimos_3_meses') {
    const tresMesesAtras = new Date(agora);
    tresMesesAtras.setMonth(tresMesesAtras.getMonth() - 3);
    return data >= tresMesesAtras;
  }
  if (periodo === 'este_ano') {
    return data.getFullYear() === anoAtual;
  }
  return true;
}

export function FaturamentosPage() {
  const [filtroStatus, setFiltroStatus] = useState<string>('');
  const [busca, setBusca] = useState('');
  const [filtroPeriodo, setFiltroPeriodo] = useState<FiltroPeriodo>('todos');
  const [ordenacao, setOrdenacao] = useState<Ordenacao>('mais_recente');

  const { data: faturas = [], isLoading, refetch } = useFaturas({
    status: filtroStatus || undefined,
  });

  const faturasFiltradas = useMemo(() => {
    let resultado = [...faturas];

    // Filtro de busca por número ou nome do cliente
    if (busca.trim()) {
      const termo = busca.trim().toLowerCase();
      resultado = resultado.filter(
        (f) =>
          f.numero.toLowerCase().includes(termo) ||
          f.clienteNome.toLowerCase().includes(termo)
      );
    }

    // Filtro de período
    resultado = resultado.filter((f) => filtrarPorPeriodo(f, filtroPeriodo));

    // Ordenação
    resultado.sort((a, b) => {
      if (ordenacao === 'mais_recente') {
        return getFaturaDate(b).getTime() - getFaturaDate(a).getTime();
      }
      if (ordenacao === 'mais_antigo') {
        return getFaturaDate(a).getTime() - getFaturaDate(b).getTime();
      }
      if (ordenacao === 'maior_valor') {
        return b.valorTotal - a.valorTotal;
      }
      if (ordenacao === 'menor_valor') {
        return a.valorTotal - b.valorTotal;
      }
      return 0;
    });

    return resultado;
  }, [faturas, busca, filtroPeriodo, ordenacao]);

  const statusOpcoes = [
    { value: '', label: 'Todas' },
    { value: 'rascunho', label: 'Rascunho' },
    { value: 'emitida', label: 'Emitida' },
    { value: 'paga', label: 'Paga' },
    { value: 'vencida', label: 'Vencida' },
    { value: 'cancelada', label: 'Cancelada' },
  ];

  const periodoOpcoes: { value: FiltroPeriodo; label: string }[] = [
    { value: 'todos', label: 'Todos os períodos' },
    { value: 'este_mes', label: 'Este mês' },
    { value: 'mes_passado', label: 'Mês passado' },
    { value: 'ultimos_3_meses', label: 'Últimos 3 meses' },
    { value: 'este_ano', label: 'Este ano' },
  ];

  const ordenacaoOpcoes: { value: Ordenacao; label: string }[] = [
    { value: 'mais_recente', label: 'Mais recente' },
    { value: 'mais_antigo', label: 'Mais antigo' },
    { value: 'maior_valor', label: 'Maior valor' },
    { value: 'menor_valor', label: 'Menor valor' },
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

      {/* Filtros de status */}
      <div className="flex gap-2 flex-wrap">
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

      {/* Filtros avançados */}
      <div className="flex flex-wrap gap-3 items-center">
        {/* Busca por texto */}
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por número ou cliente..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
          />
        </div>

        {/* Filtro de período */}
        <select
          value={filtroPeriodo}
          onChange={(e) => setFiltroPeriodo(e.target.value as FiltroPeriodo)}
          className="px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all cursor-pointer"
        >
          {periodoOpcoes.map((op) => (
            <option key={op.value} value={op.value}>
              {op.label}
            </option>
          ))}
        </select>

        {/* Ordenação */}
        <select
          value={ordenacao}
          onChange={(e) => setOrdenacao(e.target.value as Ordenacao)}
          className="px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all cursor-pointer"
        >
          {ordenacaoOpcoes.map((op) => (
            <option key={op.value} value={op.value}>
              {op.label}
            </option>
          ))}
        </select>

        {/* Contador de resultados */}
        {(busca || filtroPeriodo !== 'todos') && (
          <span className="text-xs text-muted-foreground">
            {faturasFiltradas.length} resultado{faturasFiltradas.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Tabela */}
      <FaturasListTable faturas={faturasFiltradas} isLoading={isLoading} />
    </div>
  );
}
