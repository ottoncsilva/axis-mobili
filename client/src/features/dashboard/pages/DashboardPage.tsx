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

  const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-500 mt-1">Visão geral do sistema</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-semibold">TOTAL DE PROJETOS</p>
              <p className="text-2xl font-bold mt-1">{stats.totalProjetos}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-500" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-semibold">EM ANDAMENTO</p>
              <p className="text-2xl font-bold mt-1">{stats.emAndamento}</p>
            </div>
            <Clock className="w-8 h-8 text-amber-500" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-semibold">CONCLUÍDOS</p>
              <p className="text-2xl font-bold mt-1">{stats.concluidos}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-500" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-semibold">SLA EM RISCO</p>
              <p className="text-2xl font-bold mt-1 text-red-600">{stats.emRisco}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
        </Card>
      </div>

      {/* Faturamento */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-semibold">FATURAMENTO PENDENTE</p>
              <p className="text-2xl font-bold mt-1">
                R$ {stats.faturamentoPendente.toLocaleString('pt-BR')}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-green-500" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-semibold">TOTAL EM PROJETOS</p>
              <p className="text-2xl font-bold mt-1">
                R$ {stats.faturamentoTotal.toLocaleString('pt-BR')}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-blue-500" />
          </div>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Projetos por Tipo */}
        <Card className="p-4">
          <h3 className="font-semibold mb-4">Projetos por Tipo</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={projetosPorTipo}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
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
        <Card className="p-4">
          <h3 className="font-semibold mb-4">Distribuição por Etapa</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={projetosPorEtapa}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Projetos em Risco */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-5 h-5 text-red-500" />
          <h3 className="font-semibold">Projetos com SLA em Risco</h3>
        </div>

        {projetosRisco.length === 0 ? (
          <p className="text-gray-500 text-sm">Nenhum projeto em risco</p>
        ) : (
          <div className="space-y-3">
            {projetosRisco.map((projeto) => {
              const etapa = projeto.etapas?.find((e) => e.nome === projeto.etapaAtual);
              return (
                <div
                  key={projeto.id}
                  className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{projeto.clienteFinal.nome}</p>
                    <p className="text-xs text-gray-600">{projeto.clienteNome}</p>
                  </div>
                  <div className="text-right">
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
