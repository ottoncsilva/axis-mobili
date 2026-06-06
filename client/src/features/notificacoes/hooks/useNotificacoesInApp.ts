import { useMemo, useCallback } from 'react';
import { useProjetos } from '@/features/kanban/hooks/useKanban';
import { useFaturas } from '@/features/faturamento/hooks/useFaturas';
import { useLocalStorage } from '@/hooks/useLocalStorage';

export interface NotificacaoInApp {
  id: string;
  tipo: 'sla_risco' | 'sla_estourado' | 'pronto_faturar' | 'fatura_vencida';
  titulo: string;
  mensagem: string;
  link: string;
  criadaEm: Date;
}

function tsToDate(ts: any): Date {
  if (!ts) return new Date();
  if (ts instanceof Date) return ts;
  if (typeof ts.toDate === 'function') return ts.toDate();
  if (ts._seconds !== undefined) return new Date(ts._seconds * 1000);
  return new Date(ts);
}

export function useNotificacoesInApp() {
  const { data: projetosVenda = [] } = useProjetos('projeto_venda');
  const { data: projetosExecutivo = [] } = useProjetos('projeto_executivo');
  const { data: projetosMedicao = [] } = useProjetos('medicao');
  const { data: faturas = [] } = useFaturas();

  const [lidosIds, setLidosIds] = useLocalStorage<string[]>('notificacoes_lidas', []);

  const notificacoes = useMemo<NotificacaoInApp[]>(() => {
    const lista: NotificacaoInApp[] = [];
    const allProjetos = [...projetosVenda, ...projetosExecutivo, ...projetosMedicao];

    const tipoParaRota: Record<string, string> = {
      projeto_venda: '/kanban/venda',
      projeto_executivo: '/kanban/executivo',
      medicao: '/kanban/medicao',
    };

    for (const projeto of allProjetos) {
      if (projeto.etapaAtual === 'concluido') continue;

      const etapaAtual = projeto.etapas?.find((e) => e.nome === projeto.etapaAtual);
      if (!etapaAtual || etapaAtual.sla === 0) continue;

      const dias = etapaAtual.diasUtilizados || 0;
      const sla = etapaAtual.sla;
      const rota = tipoParaRota[projeto.tipoServico] || '/projetos';

      if (dias > sla) {
        lista.push({
          id: `sla_estourado_${projeto.id}`,
          tipo: 'sla_estourado',
          titulo: 'SLA estourado',
          mensagem: `${projeto.clienteFinal.nome} — etapa "${etapaAtual.label}" com ${dias - sla} dia(s) de atraso`,
          link: rota,
          criadaEm: tsToDate(projeto.atualizadoEm),
        });
      } else if (sla - dias <= 2) {
        lista.push({
          id: `sla_risco_${projeto.id}`,
          tipo: 'sla_risco',
          titulo: 'SLA próximo do limite',
          mensagem: `${projeto.clienteFinal.nome} — "${etapaAtual.label}" vence em ${sla - dias} dia(s)`,
          link: rota,
          criadaEm: tsToDate(projeto.atualizadoEm),
        });
      }

      if (projeto.statusFaturamento === 'pronto_para_faturar') {
        lista.push({
          id: `faturar_${projeto.id}`,
          tipo: 'pronto_faturar',
          titulo: 'Pronto para faturar',
          mensagem: `${projeto.clienteFinal.nome} (${projeto.clienteNome}) — projeto concluído aguarda faturamento`,
          link: '/faturamento',
          criadaEm: tsToDate(projeto.atualizadoEm),
        });
      }
    }

    for (const fatura of faturas as any[]) {
      if (fatura.status !== 'emitida') continue;
      if (!fatura.dataVencimento) continue;

      const vencimento = tsToDate(fatura.dataVencimento);
      const hoje = new Date();
      const diff = Math.ceil((vencimento.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));

      if (diff < 0) {
        lista.push({
          id: `fatura_vencida_${fatura.id}`,
          tipo: 'fatura_vencida',
          titulo: 'Fatura vencida',
          mensagem: `${fatura.numero} — ${fatura.clienteNome} venceu há ${Math.abs(diff)} dia(s)`,
          link: '/faturamento',
          criadaEm: tsToDate(fatura.atualizadoEm),
        });
      } else if (diff <= 3) {
        lista.push({
          id: `fatura_vence_${fatura.id}`,
          tipo: 'fatura_vencida',
          titulo: 'Fatura vence em breve',
          mensagem: `${fatura.numero} — ${fatura.clienteNome} vence em ${diff} dia(s)`,
          link: '/faturamento',
          criadaEm: tsToDate(fatura.atualizadoEm),
        });
      }
    }

    return lista.sort((a, b) => {
      const prioridade = { sla_estourado: 0, fatura_vencida: 1, sla_risco: 2, pronto_faturar: 3 };
      return (prioridade[a.tipo] ?? 4) - (prioridade[b.tipo] ?? 4);
    });
  }, [projetosVenda, projetosExecutivo, projetosMedicao, faturas]);

  const naoLidas = useMemo(
    () => notificacoes.filter((n) => !lidosIds.includes(n.id)),
    [notificacoes, lidosIds]
  );

  const marcarTodasLidas = useCallback(() => {
    setLidosIds(notificacoes.map((n) => n.id));
  }, [notificacoes, setLidosIds]);

  const marcarLida = useCallback(
    (id: string) => {
      setLidosIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
    },
    [setLidosIds]
  );

  return { notificacoes, naoLidas, marcarLida, marcarTodasLidas };
}
