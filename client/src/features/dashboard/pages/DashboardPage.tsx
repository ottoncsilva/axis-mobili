import { useProjetos } from '@/features/kanban/hooks/useKanban';
import { useEtapas } from '@/hooks/useConfiguracoes';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { AlertTriangle, TrendingUp, DollarSign, Clock } from 'lucide-react';

export function DashboardPage() {
  const { data: projetosVenda } = useProjetos('projeto_venda');
  const { data: projetosExecutivo } = useProjetos('projeto_executivo');
  const { data: projetosMedicao } = useProjetos('medicao');
  const { data: etapasConfig } = useEtapas();

  const allProjects = [...(projetosVenda || []), ...(projetosExecutivo || []), ...(projetosMedicao || [])];

  // Estatísticas
  const stats = {
    totalProjetos: allProjects.length,
    emAndamento: allProjects.filter((p) => p.etapaAtual !== 'concluido').length,
    concluidos: allProjects.filter((p) => p.etapaAtual === 'concluido').length,
    emRisco: allProjects.filter((p) => {
      const etapa = p.etapas?.find((e) => e.nome === p.etapaAtual);
      return etapa && etapa.sla > 0 && etapa.sla <= 2;
    }).length,
    faturamentoPendente: allProjects
      .filter((p) => p.statusFaturamento === 'pronto_para_faturar')
      .reduce((acc, p) => acc + (p.valorCalculado || 0), 0),
    faturamentoTotal: allProjects.reduce((acc, p) => acc + (p.valorCalculado || 0), 0),
  };

  // Dados para gráficos
  const projetosPorEtapa = allProjects.reduce(
    (acc: any, p) => {
      const etapa = p.etapaAtual;
      const existing = acc.find((e: any) => e.name === etapa);
      if (existing) {
        existing.value += 1;
      } else {
        acc.push({ name: etapa, value: 1 });
      }
      return acc;
    },
    []
  );

  const projetosPorTipo = [
    { name: 'Venda', value: projetosVenda?.length || 0 },
    { name: 'Executivo', value: projetosExecutivo?.length || 0 },
    { name: 'Medição', value: projetosMedicao?.length || 0 },
  ];

  // Projetos com SLA em risco
  const projetosRisco = allProjects
    .filter((p) => {
      const etapa = p.etapas?.find((e) => e.nome === p.etapaAtual);
      return etapa && etapa.sla > 0 && etapa.sla <= 2;
    })
    .slice(0, 5);

  const COLORS = ['#2563EB', '#1D4ED8', '#3B82F6', '#1E40AF', '#60A5FA', '#1E3A8A'];

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
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">Total de Projetos</p>
              <p className="text-2xl font-bold mt-1 text-foreground">{stats.totalProjetos}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-5 h-5 text-brand-600 dark:text-brand-400" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">Em Andamento</p>
              <p className="text-2xl font-bold mt-1 text-foreground">{stats.emAndamento}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5 text-brand-500 dark:text-brand-300" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">Concluídos</p>
              <p className="text-2xl font-bold mt-1 text-foreground">{stats.concluidos}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-5 h-5 text-brand-700 dark:text-brand-400" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">SLA em Risco</p>
              <p className="text-2xl font-bold mt-1 text-destructive">{stats.emRisco}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-red-500" />
            </div>
          </div>
        </Card>
      </div>

      {/* Faturamento */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">Faturamento Pendente</p>
              <p className="text-2xl font-bold mt-1 text-foreground">
                R$ {stats.faturamentoPendente.toLocaleString('pt-BR')}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center flex-shrink-0">
              <DollarSign className="w-5 h-5 text-brand-600 dark:text-brand-400" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">Total em Projetos</p>
              <p className="text-2xl font-bold mt-1 text-foreground">
                R$ {stats.faturamentoTotal.toLocaleString('pt-BR')}
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
        {/* Projetos por Tipo */}
        <Card className="p-4 sm:p-6">
          <h3 className="font-semibold mb-4 text-foreground">Projetos por Tipo</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={projetosPorTipo}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={90}
                fill="#2563EB"
                dataKey="value"
              >
                {projetosPorTipo.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Projetos por Etapa */}
        <Card className="p-4 sm:p-6">
          <h3 className="font-semibold mb-4 text-foreground">Distribuição por Etapa</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={projetosPorEtapa}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, color: 'hsl(var(--foreground))' }} />
              <Bar dataKey="value" fill="#2563EB" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Projetos em Risco */}
      <Card className="p-4 sm:p-6">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-5 h-5 text-red-500" />
          <h3 className="font-semibold text-foreground">Projetos com SLA em Risco</h3>
        </div>

        {projetosRisco.length === 0 ? (
          <p className="text-muted-foreground text-sm">Nenhum projeto em risco</p>
        ) : (
          <div className="space-y-3">
            {projetosRisco.map((projeto) => {
              const etapa = projeto.etapas?.find((e) => e.nome === projeto.etapaAtual);
              return (
                <div
                  key={projeto.id}
                  className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-lg"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-foreground truncate">{projeto.clienteFinal.nome}</p>
                    <p className="text-xs text-muted-foreground truncate">{projeto.clienteNome}</p>
                  </div>
                  <div className="ml-3 flex-shrink-0">
                    <Badge variant="destructive">SLA: {etapa?.sla || 0}d</Badge>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
