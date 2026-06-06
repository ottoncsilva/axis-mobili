import { useProjetos } from '@/features/kanban/hooks/useKanban';
import { useFaturas } from '@/features/faturamento/hooks/useFaturas';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { AlertTriangle, TrendingUp, DollarSign, Clock, Receipt, CheckCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function tsToDate(ts: any): Date {
  if (!ts) return new Date();
  if (ts instanceof Date) return ts;
  if (typeof ts.toDate === 'function') return ts.toDate();
  if (ts._seconds !== undefined) return new Date(ts._seconds * 1000);
  return new Date(ts);
}

const TIPO_LABEL: Record<string, string> = {
  projeto_venda: 'Venda',
  projeto_executivo: 'Executivo',
  medicao: 'Medição',
};

export function DashboardPage() {
  const navigate = useNavigate();
  const { data: projetosVenda = [] } = useProjetos('projeto_venda');
  const { data: projetosExecutivo = [] } = useProjetos('projeto_executivo');
  const { data: projetosMedicao = [] } = useProjetos('medicao');
  const { data: faturas = [] } = useFaturas();

  const allProjects = [...projetosVenda, ...projetosExecutivo, ...projetosMedicao];

  // Projetos com SLA em risco ou estourado
  const projetosAlerta = allProjects
    .filter((p) => {
      if (p.etapaAtual === 'concluido') return false;
      const etapa = p.etapas?.find((e) => e.nome === p.etapaAtual);
      if (!etapa || etapa.sla === 0) return false;
      const dias = etapa.diasUtilizados || 0;
      return dias > etapa.sla || etapa.sla - dias <= 2;
    })
    .slice(0, 6);

  // Projetos prontos para faturar
  const prontosFaturar = allProjects
    .filter((p) => p.statusFaturamento === 'pronto_para_faturar')
    .slice(0, 6);

  // KPIs
  const stats = {
    totalProjetos: allProjects.length,
    emAndamento: allProjects.filter((p) => p.etapaAtual !== 'concluido').length,
    concluidos: allProjects.filter((p) => p.etapaAtual === 'concluido').length,
    emRisco: projetosAlerta.length,
    faturamentoPendente: allProjects
      .filter((p) => p.statusFaturamento === 'pronto_para_faturar')
      .reduce((acc, p) => acc + (p.valorCalculado || 0), 0),
    faturadoPago: (faturas as any[])
      .filter((f) => f.status === 'paga')
      .reduce((acc: number, f: any) => acc + (f.valorTotal || 0), 0),
  };

  // Dados para gráficos
  const projetosPorTipo = [
    { name: 'Venda', value: projetosVenda.length },
    { name: 'Executivo', value: projetosExecutivo.length },
    { name: 'Medição', value: projetosMedicao.length },
  ].filter((d) => d.value > 0);

  const projetosPorEtapa = allProjects.reduce((acc: any[], p) => {
    const etapa = p.etapaAtual;
    const existing = acc.find((e) => e.name === etapa);
    if (existing) existing.value += 1;
    else acc.push({ name: etapa, value: 1 });
    return acc;
  }, []);

  // Atividade recente — 5 projetos mais recentemente atualizados
  const atividadeRecente = [...allProjects]
    .sort((a, b) => tsToDate(b.atualizadoEm).getTime() - tsToDate(a.atualizadoEm).getTime())
    .slice(0, 5);

  const COLORS = ['#2563EB', '#1D4ED8', '#3B82F6'];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Visão geral do sistema</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">Total Projetos</p>
              <p className="text-2xl font-bold mt-1 text-foreground">{stats.totalProjetos}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{stats.emAndamento} em andamento</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-5 h-5 text-brand-600 dark:text-brand-400" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">Concluídos</p>
              <p className="text-2xl font-bold mt-1 text-foreground">{stats.concluidos}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {stats.totalProjetos > 0
                  ? `${Math.round((stats.concluidos / stats.totalProjetos) * 100)}% do total`
                  : '—'}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
              <CheckCheck className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">SLA em Risco</p>
              <p className={`text-2xl font-bold mt-1 ${stats.emRisco > 0 ? 'text-destructive' : 'text-foreground'}`}>
                {stats.emRisco}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">requerem atenção</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-red-500" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">Pendente Faturar</p>
              <p className="text-2xl font-bold mt-1 text-foreground">
                {prontosFaturar.length}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                R$ {stats.faturamentoPendente.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center flex-shrink-0">
              <Receipt className="w-5 h-5 text-brand-600 dark:text-brand-400" />
            </div>
          </div>
        </Card>
      </div>

      {/* Faturamento pago */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">Total Recebido (Pago)</p>
              <p className="text-2xl font-bold mt-1 text-green-600 dark:text-green-400">
                R$ {stats.faturadoPago.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
              <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">Carteira Total</p>
              <p className="text-2xl font-bold mt-1 text-foreground">
                R$ {allProjects.reduce((acc, p) => acc + (p.valorCalculado || 0), 0).toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center flex-shrink-0">
              <DollarSign className="w-5 h-5 text-brand-700 dark:text-brand-300" />
            </div>
          </div>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-4 sm:p-6">
          <h3 className="font-semibold mb-4 text-foreground">Projetos por Tipo</h3>
          {projetosPorTipo.every((d) => d.value === 0) ? (
            <p className="text-muted-foreground text-sm py-8 text-center">Nenhum projeto cadastrado</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={projetosPorTipo}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={90}
                  dataKey="value"
                >
                  {projetosPorTipo.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card className="p-4 sm:p-6">
          <h3 className="font-semibold mb-4 text-foreground">Distribuição por Etapa</h3>
          {projetosPorEtapa.length === 0 ? (
            <p className="text-muted-foreground text-sm py-8 text-center">Nenhum projeto cadastrado</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={projetosPorEtapa}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} allowDecimals={false} />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, color: 'hsl(var(--foreground))' }} />
                <Bar dataKey="value" fill="#2563EB" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      {/* Alertas + Prontos para faturar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* SLA em risco */}
        <Card className="p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <h3 className="font-semibold text-foreground">SLA em Risco / Estourado</h3>
          </div>
          {projetosAlerta.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center mb-2">
                <CheckCheck className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-sm font-medium text-foreground">Tudo em dia</p>
              <p className="text-xs text-muted-foreground mt-0.5">Nenhum SLA em risco</p>
            </div>
          ) : (
            <div className="space-y-2">
              {projetosAlerta.map((projeto) => {
                const etapa = projeto.etapas?.find((e) => e.nome === projeto.etapaAtual);
                const dias = etapa?.diasUtilizados || 0;
                const sla = etapa?.sla || 0;
                const estourado = dias > sla;
                return (
                  <div
                    key={projeto.id}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      estourado
                        ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900/30'
                        : 'bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-900/30'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-foreground truncate">{projeto.clienteFinal.nome}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {etapa?.label || projeto.etapaAtual} · {TIPO_LABEL[projeto.tipoServico] || projeto.tipoServico}
                      </p>
                    </div>
                    <div className="ml-3 flex-shrink-0">
                      <Badge variant={estourado ? 'destructive' : 'outline'} className={!estourado ? 'border-yellow-500 text-yellow-700 dark:text-yellow-400' : ''}>
                        {estourado ? `+${dias - sla}d atraso` : `${sla - dias}d restante${sla - dias !== 1 ? 's' : ''}`}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Prontos para faturar */}
        <Card className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Receipt className="w-5 h-5 text-brand-600" />
              <h3 className="font-semibold text-foreground">Prontos para Faturar</h3>
            </div>
            {prontosFaturar.length > 0 && (
              <button
                onClick={() => navigate('/faturamento')}
                className="text-xs text-brand-600 hover:text-brand-700 font-medium transition-colors"
              >
                Ver todos
              </button>
            )}
          </div>
          {prontosFaturar.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-2">
                <Receipt className="w-5 h-5 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground">Nenhum projeto pendente</p>
              <p className="text-xs text-muted-foreground mt-0.5">Projetos concluídos aparecerão aqui</p>
            </div>
          ) : (
            <div className="space-y-2">
              {prontosFaturar.map((projeto) => (
                <div
                  key={projeto.id}
                  className="flex items-center justify-between p-3 bg-brand-50 dark:bg-brand-900/10 border border-brand-200 dark:border-brand-900/30 rounded-lg"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-foreground truncate">{projeto.clienteFinal.nome}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {projeto.clienteNome} · {TIPO_LABEL[projeto.tipoServico] || projeto.tipoServico}
                    </p>
                  </div>
                  <div className="ml-3 flex-shrink-0">
                    <span className="text-sm font-semibold text-brand-700 dark:text-brand-300">
                      R$ {(projeto.valorCalculado || 0).toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Atividade recente */}
      <Card className="p-4 sm:p-6">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-muted-foreground" />
          <h3 className="font-semibold text-foreground">Atividade Recente</h3>
        </div>
        {atividadeRecente.length === 0 ? (
          <p className="text-muted-foreground text-sm">Nenhuma atividade</p>
        ) : (
          <div className="space-y-3">
            {atividadeRecente.map((projeto) => {
              const data = tsToDate(projeto.atualizadoEm);
              const diasAtras = Math.floor((Date.now() - data.getTime()) / (1000 * 60 * 60 * 24));
              const label =
                diasAtras === 0 ? 'hoje' : diasAtras === 1 ? 'ontem' : `${diasAtras}d atrás`;
              return (
                <div key={projeto.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{projeto.clienteFinal.nome}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {projeto.etapaAtual === 'concluido' ? 'Concluído' : `Etapa: ${projeto.etapaAtual}`} ·{' '}
                      {TIPO_LABEL[projeto.tipoServico] || projeto.tipoServico}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground ml-3 flex-shrink-0">{label}</span>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
