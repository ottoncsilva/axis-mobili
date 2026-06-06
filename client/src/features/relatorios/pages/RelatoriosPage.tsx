import { useState, useMemo } from 'react';
import { useProjetos } from '@/features/kanban/hooks/useKanban';
import { useFaturas } from '@/features/faturamento/hooks/useFaturas';
import { Card } from '@/components/ui/card';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import { formatMoeda } from '@/lib/masks';
import { cn } from '@/lib/utils';
import { TrendingUp, Users, Clock, DollarSign } from 'lucide-react';
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const COLORS = ['#2563EB', '#1D4ED8', '#3B82F6', '#1E40AF', '#60A5FA', '#93C5FD'];

type Aba = 'produtividade' | 'clientes' | 'sla' | 'financeiro';

function tsToDate(ts: any): Date {
  if (!ts) return new Date(0);
  if (ts instanceof Date) return ts;
  if (typeof ts.toDate === 'function') return ts.toDate();
  if (ts._seconds !== undefined) return new Date(ts._seconds * 1000);
  return new Date(ts);
}

export function RelatoriosPage() {
  const [aba, setAba] = useState<Aba>('produtividade');
  const [meses, setMeses] = useState(6);

  const { data: projetosVenda = [] } = useProjetos('projeto_venda');
  const { data: projetosExecutivo = [] } = useProjetos('projeto_executivo');
  const { data: projetosMedicao = [] } = useProjetos('medicao');
  const { data: faturas = [] } = useFaturas();

  const allProjetos = useMemo(
    () => [...projetosVenda, ...projetosExecutivo, ...projetosMedicao],
    [projetosVenda, projetosExecutivo, projetosMedicao]
  );

  // ─── Produtividade: criados e concluídos por mês ───
  const dadosProdutividade = useMemo(() => {
    const periodos = Array.from({ length: meses }, (_, i) => {
      const ref = subMonths(new Date(), meses - 1 - i);
      return {
        mes: format(ref, 'MMM/yy', { locale: ptBR }),
        inicio: startOfMonth(ref),
        fim: endOfMonth(ref),
        criados: 0,
        concluidos: 0,
      };
    });

    for (const p of allProjetos) {
      const criado = tsToDate(p.criadoEm);
      const concluido = p.concluidoEm ? tsToDate(p.concluidoEm) : null;

      for (const periodo of periodos) {
        if (isWithinInterval(criado, { start: periodo.inicio, end: periodo.fim })) {
          periodo.criados++;
        }
        if (concluido && isWithinInterval(concluido, { start: periodo.inicio, end: periodo.fim })) {
          periodo.concluidos++;
        }
      }
    }

    return periodos;
  }, [allProjetos, meses]);

  // ─── Clientes: ranking por projetos e valor ───
  const dadosClientes = useMemo(() => {
    const mapa: Record<string, { nome: string; projetos: number; valor: number; concluidos: number }> = {};

    for (const p of allProjetos) {
      if (!mapa[p.clienteId]) {
        mapa[p.clienteId] = { nome: p.clienteNome, projetos: 0, valor: 0, concluidos: 0 };
      }
      mapa[p.clienteId].projetos++;
      mapa[p.clienteId].valor += p.valorCalculado || 0;
      if (p.etapaAtual === 'concluido') {
        mapa[p.clienteId].concluidos++;
      }
    }

    return Object.values(mapa)
      .sort((a, b) => b.projetos - a.projetos)
      .slice(0, 10);
  }, [allProjetos]);

  // ─── SLA: compliance por tipo de serviço ───
  const dadosSLA = useMemo(() => {
    const tipos = [
      { key: 'projeto_venda', label: 'Venda', projetos: projetosVenda },
      { key: 'projeto_executivo', label: 'Executivo', projetos: projetosExecutivo },
      { key: 'medicao', label: 'Medição', projetos: projetosMedicao },
    ];

    return tipos.map(({ label, projetos }) => {
      const concluidos = projetos.filter((p) => p.etapaAtual === 'concluido');
      const emRisco = projetos.filter((p) => {
        const etapa = p.etapas?.find((e) => e.nome === p.etapaAtual);
        return etapa && etapa.sla > 0 && (etapa.diasUtilizados || 0) > etapa.sla;
      });

      return {
        label,
        total: projetos.length,
        concluidos: concluidos.length,
        emRisco: emRisco.length,
        noSLA: Math.max(0, concluidos.length - emRisco.length),
      };
    });
  }, [projetosVenda, projetosExecutivo, projetosMedicao]);

  // ─── Financeiro: faturamento por mês ───
  const dadosFinanceiro = useMemo(() => {
    const periodos = Array.from({ length: meses }, (_, i) => {
      const ref = subMonths(new Date(), meses - 1 - i);
      return {
        mes: format(ref, 'MMM/yy', { locale: ptBR }),
        inicio: startOfMonth(ref),
        fim: endOfMonth(ref),
        emitido: 0,
        pago: 0,
      };
    });

    for (const f of faturas as any[]) {
      const criado = tsToDate(f.criadoEm);
      const pagamento = f.dataPagamento ? tsToDate(f.dataPagamento) : null;

      for (const periodo of periodos) {
        if (f.status !== 'cancelada' && isWithinInterval(criado, { start: periodo.inicio, end: periodo.fim })) {
          periodo.emitido += f.valorTotal || 0;
        }
        if (pagamento && isWithinInterval(pagamento, { start: periodo.inicio, end: periodo.fim })) {
          periodo.pago += f.valorTotal || 0;
        }
      }
    }

    return periodos;
  }, [faturas, meses]);

  // KPIs resumo
  const totalValor = allProjetos.reduce((acc, p) => acc + (p.valorCalculado || 0), 0);
  const concluidos = allProjetos.filter((p) => p.etapaAtual === 'concluido').length;
  const totalFaturado = (faturas as any[]).filter((f) => f.status === 'paga').reduce((acc, f) => acc + (f.valorTotal || 0), 0);
  const mediaValorProjeto = allProjetos.length ? totalValor / allProjetos.length : 0;

  const abas: { key: Aba; label: string; icon: React.ElementType }[] = [
    { key: 'produtividade', label: 'Produtividade', icon: TrendingUp },
    { key: 'clientes', label: 'Clientes', icon: Users },
    { key: 'sla', label: 'SLA', icon: Clock },
    { key: 'financeiro', label: 'Financeiro', icon: DollarSign },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Relatórios</h1>
          <p className="text-muted-foreground">Análise de desempenho e resultados</p>
        </div>
        <select
          value={meses}
          onChange={(e) => setMeses(Number(e.target.value))}
          className="h-10 px-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm w-full sm:w-40"
        >
          <option value={3}>Últimos 3 meses</option>
          <option value={6}>Últimos 6 meses</option>
          <option value={12}>Últimos 12 meses</option>
        </select>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="p-4">
          <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">Total Projetos</p>
          <p className="text-3xl font-bold mt-1 text-foreground">{allProjetos.length}</p>
          <p className="text-xs text-muted-foreground mt-1">{concluidos} concluídos</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">Valor em Carteira</p>
          <p className="text-2xl font-bold mt-1 text-foreground">{formatMoeda(totalValor)}</p>
          <p className="text-xs text-muted-foreground mt-1">Média {formatMoeda(mediaValorProjeto)}/projeto</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">Faturado (pago)</p>
          <p className="text-2xl font-bold mt-1 text-foreground">{formatMoeda(totalFaturado)}</p>
          <p className="text-xs text-muted-foreground mt-1">{(faturas as any[]).filter((f) => f.status === 'paga').length} faturas pagas</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">Taxa de Conclusão</p>
          <p className="text-3xl font-bold mt-1 text-foreground">
            {allProjetos.length ? Math.round((concluidos / allProjetos.length) * 100) : 0}%
          </p>
          <p className="text-xs text-muted-foreground mt-1">{concluidos} de {allProjetos.length}</p>
        </Card>
      </div>

      {/* Abas */}
      <div className="flex gap-1 border-b border-border overflow-x-auto">
        {abas.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setAba(key)}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all whitespace-nowrap -mb-px',
              aba === key
                ? 'border-brand-500 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Aba Produtividade */}
      {aba === 'produtividade' && (
        <div className="space-y-4">
          <Card className="p-6">
            <h3 className="font-semibold mb-1 text-foreground">Projetos Criados vs Concluídos</h3>
            <p className="text-sm text-muted-foreground mb-4">Evolução ao longo do período selecionado</p>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dadosProdutividade}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="mes" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip
                  contentStyle={{
                    background: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 8,
                    color: 'hsl(var(--foreground))',
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="criados" name="Criados" stroke="#2563EB" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="concluidos" name="Concluídos" stroke="#16A34A" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="p-6">
              <h3 className="font-semibold mb-4 text-foreground">Distribuição por Tipo</h3>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Venda', value: projetosVenda.length },
                      { name: 'Executivo', value: projetosExecutivo.length },
                      { name: 'Medição', value: projetosMedicao.length },
                    ]}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {COLORS.slice(0, 3).map((color, i) => (
                      <Cell key={i} fill={color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4 text-foreground">Projetos Criados por Mês</h3>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={dadosProdutividade}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="mes" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }} />
                  <Bar dataKey="criados" name="Criados" fill="#2563EB" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="concluidos" name="Concluídos" fill="#16A34A" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>
        </div>
      )}

      {/* Aba Clientes */}
      {aba === 'clientes' && (
        <div className="space-y-4">
          <Card className="p-6">
            <h3 className="font-semibold mb-1 text-foreground">Top Clientes por Volume</h3>
            <p className="text-sm text-muted-foreground mb-4">Quantidade de projetos por cliente (top 10)</p>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dadosClientes} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis dataKey="nome" type="category" width={140} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }} />
                <Bar dataKey="projetos" name="Projetos" fill="#2563EB" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card className="overflow-hidden">
            <div className="p-4 border-b border-border">
              <h3 className="font-semibold text-foreground">Ranking de Clientes</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-4 py-3 text-left font-semibold text-foreground">#</th>
                    <th className="px-4 py-3 text-left font-semibold text-foreground">Cliente</th>
                    <th className="px-4 py-3 text-right font-semibold text-foreground">Projetos</th>
                    <th className="px-4 py-3 text-right font-semibold text-foreground">Concluídos</th>
                    <th className="px-4 py-3 text-right font-semibold text-foreground">Valor Total</th>
                  </tr>
                </thead>
                <tbody>
                  {dadosClientes.map((cliente, i) => (
                    <tr key={i} className="border-b border-border hover:bg-muted/50 transition-colors">
                      <td className="px-4 py-3 text-muted-foreground font-medium">{i + 1}</td>
                      <td className="px-4 py-3 font-medium text-foreground">{cliente.nome}</td>
                      <td className="px-4 py-3 text-right text-foreground">{cliente.projetos}</td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-green-600 dark:text-green-400 font-medium">{cliente.concluidos}</span>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-foreground">{formatMoeda(cliente.valor)}</td>
                    </tr>
                  ))}
                  {dadosClientes.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                        Nenhum projeto cadastrado
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* Aba SLA */}
      {aba === 'sla' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {dadosSLA.map((tipo) => {
              const rateOk = tipo.total ? Math.round(((tipo.total - tipo.emRisco) / tipo.total) * 100) : 100;
              return (
                <Card key={tipo.label} className="p-5">
                  <p className="text-sm font-semibold text-muted-foreground">{tipo.label}</p>
                  <p className="text-3xl font-bold mt-2 text-foreground">{rateOk}%</p>
                  <p className="text-xs text-muted-foreground mt-1">dentro do SLA</p>
                  <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Total</span>
                      <span className="font-medium text-foreground">{tipo.total}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Concluídos</span>
                      <span className="font-medium text-green-600">{tipo.concluidos}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Em risco</span>
                      <span className="font-medium text-red-500">{tipo.emRisco}</span>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          <Card className="p-6">
            <h3 className="font-semibold mb-4 text-foreground">Comparativo por Tipo de Serviço</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dadosSLA}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="label" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }} />
                <Legend />
                <Bar dataKey="concluidos" name="Concluídos" fill="#16A34A" radius={[4, 4, 0, 0]} stackId="a" />
                <Bar dataKey="emRisco" name="Em risco" fill="#DC2626" radius={[4, 4, 0, 0]} stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>
      )}

      {/* Aba Financeiro */}
      {aba === 'financeiro' && (
        <div className="space-y-4">
          <Card className="p-6">
            <h3 className="font-semibold mb-1 text-foreground">Faturamento por Período</h3>
            <p className="text-sm text-muted-foreground mb-4">Emitido vs efetivamente pago</p>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dadosFinanceiro}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="mes" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis
                  tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`}
                  tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                />
                <Tooltip
                  formatter={(v: number) => formatMoeda(v)}
                  contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }}
                />
                <Legend />
                <Bar dataKey="emitido" name="Emitido" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="pago" name="Pago" fill="#16A34A" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="p-6">
              <h3 className="font-semibold mb-4 text-foreground">Resumo de Faturas</h3>
              <div className="space-y-3">
                {[
                  { label: 'Rascunho', status: 'rascunho', color: 'bg-gray-400' },
                  { label: 'Emitida', status: 'emitida', color: 'bg-blue-500' },
                  { label: 'Paga', status: 'paga', color: 'bg-green-500' },
                  { label: 'Vencida', status: 'vencida', color: 'bg-red-500' },
                  { label: 'Cancelada', status: 'cancelada', color: 'bg-slate-400' },
                ].map(({ label, status, color }) => {
                  const count = (faturas as any[]).filter((f) => f.status === status).length;
                  const valor = (faturas as any[]).filter((f) => f.status === status).reduce((acc, f) => acc + (f.valorTotal || 0), 0);
                  return (
                    <div key={status} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={cn('w-2.5 h-2.5 rounded-full', color)} />
                        <span className="text-sm text-foreground">{label}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-semibold text-foreground">{count} fatura{count !== 1 ? 's' : ''}</span>
                        {valor > 0 && (
                          <span className="text-xs text-muted-foreground ml-2">({formatMoeda(valor)})</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4 text-foreground">Valor em Projetos por Tipo</h3>
              <div className="space-y-3">
                {[
                  { label: 'Projeto Venda', projetos: projetosVenda },
                  { label: 'Projeto Executivo', projetos: projetosExecutivo },
                  { label: 'Medição', projetos: projetosMedicao },
                ].map(({ label, projetos }) => {
                  const valor = projetos.reduce((acc, p) => acc + (p.valorCalculado || 0), 0);
                  const pct = totalValor ? (valor / totalValor) * 100 : 0;
                  return (
                    <div key={label}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-foreground">{label}</span>
                        <span className="font-semibold text-foreground">{formatMoeda(valor)}</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full bg-brand-600 rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{pct.toFixed(1)}% do total</p>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
