import { useParams, useNavigate } from 'react-router-dom';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { useFatura, useFaturasMutation } from '../hooks/useFaturas';
import { FaturaPDFDocument } from '../components/FaturaPDF';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, FileText, CheckCheck, Ban, Send, Printer, Download } from 'lucide-react';
import { toast } from 'sonner';
import type { StatusFatura } from '@/types/global.types';

function tsToDate(ts: any): Date {
  if (!ts) return new Date();
  if (ts instanceof Date) return ts;
  if (typeof ts.toDate === 'function') return ts.toDate();
  if (ts._seconds !== undefined) return new Date(ts._seconds * 1000);
  return new Date(ts);
}

const STATUS_CONFIG: Record<StatusFatura, { label: string; variant: 'default' | 'outline' | 'destructive' | 'secondary'; className?: string }> = {
  rascunho: { label: 'Rascunho', variant: 'outline' },
  emitida: { label: 'Emitida', variant: 'default', className: 'bg-brand-600 hover:bg-brand-700 text-white border-0' },
  paga: { label: 'Paga', variant: 'outline', className: 'border-green-500 text-green-700 dark:text-green-400' },
  cancelada: { label: 'Cancelada', variant: 'outline', className: 'border-red-400 text-red-600 dark:text-red-400' },
  vencida: { label: 'Vencida', variant: 'destructive' },
};

const TIPO_LABEL: Record<string, string> = {
  projeto_venda: 'Projeto Venda',
  projeto_executivo: 'Projeto Executivo',
  medicao: 'Medição',
};

export function FaturaDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: fatura, isLoading } = useFatura(id!);
  const { emitir, registrarPagamento, cancelar } = useFaturasMutation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!fatura) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <FileText className="w-12 h-12 text-muted-foreground" />
        <p className="text-foreground font-medium">Fatura não encontrada</p>
        <button onClick={() => navigate('/faturamento')} className="text-sm text-brand-600 hover:underline">
          Voltar ao faturamento
        </button>
      </div>
    );
  }

  const statusCfg = STATUS_CONFIG[fatura.status];
  const dataEmissao = fatura.dataEmissao ? tsToDate(fatura.dataEmissao) : null;
  const dataVencimento = fatura.dataVencimento ? tsToDate(fatura.dataVencimento) : null;
  const dataPagamento = fatura.dataPagamento ? tsToDate(fatura.dataPagamento) : null;
  const criadaEm = tsToDate(fatura.criadoEm);

  const formatDate = (d: Date | null) =>
    d ? d.toLocaleDateString('pt-BR') : '—';

  const formatMoney = (v: number) =>
    v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const handleEmitir = async () => {
    try {
      await emitir.mutateAsync(fatura.id);
      toast.success('Fatura emitida com sucesso');
    } catch {
      toast.error('Erro ao emitir fatura');
    }
  };

  const handlePagar = async () => {
    try {
      await registrarPagamento.mutateAsync({ id: fatura.id });
      toast.success('Pagamento registrado');
    } catch {
      toast.error('Erro ao registrar pagamento');
    }
  };

  const handleCancelar = async () => {
    if (!confirm('Confirmar cancelamento desta fatura?')) return;
    try {
      await cancelar.mutateAsync(fatura.id);
      toast.success('Fatura cancelada');
      navigate('/faturamento');
    } catch {
      toast.error('Erro ao cancelar fatura');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/faturamento')}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-foreground">{fatura.numero}</h1>
              <Badge {...statusCfg} className={statusCfg.className}>
                {statusCfg.label}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">{fatura.clienteNome}</p>
          </div>
        </div>

        {/* Ações */}
        <div className="flex items-center gap-2 flex-wrap">
          {fatura.status === 'rascunho' && (
            <button
              onClick={handleEmitir}
              disabled={emitir.isPending}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium transition-all disabled:opacity-60"
            >
              <Send className="w-4 h-4" />
              Emitir
            </button>
          )}
          {fatura.status === 'emitida' && (
            <button
              onClick={handlePagar}
              disabled={registrarPagamento.isPending}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-medium transition-all disabled:opacity-60"
            >
              <CheckCheck className="w-4 h-4" />
              Marcar como Paga
            </button>
          )}
          {(fatura.status === 'rascunho' || fatura.status === 'emitida') && (
            <button
              onClick={handleCancelar}
              disabled={cancelar.isPending}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-muted-foreground hover:text-destructive hover:border-destructive text-sm font-medium transition-all disabled:opacity-60"
            >
              <Ban className="w-4 h-4" />
              Cancelar
            </button>
          )}
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-accent text-sm font-medium transition-all"
          >
            <Printer className="w-4 h-4" />
            Imprimir
          </button>
          <PDFDownloadLink
            document={<FaturaPDFDocument fatura={fatura} />}
            fileName={`${fatura.numero}.pdf`}
          >
            {({ loading }) => (
              <button
                disabled={loading}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-accent text-sm font-medium transition-all disabled:opacity-60"
              >
                <Download className="w-4 h-4" />
                {loading ? 'Gerando...' : 'Exportar PDF'}
              </button>
            )}
          </PDFDownloadLink>
        </div>
      </div>

      {/* Dados da fatura */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="p-4">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">Tipo</p>
          <p className="text-sm font-semibold text-foreground">
            {fatura.tipo === 'mensal' ? 'Mensal' : 'Por Projeto'}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">Emissão</p>
          <p className="text-sm font-semibold text-foreground">{formatDate(dataEmissao) || formatDate(criadaEm)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">Vencimento</p>
          <p className={`text-sm font-semibold ${dataVencimento && dataVencimento < new Date() && fatura.status === 'emitida' ? 'text-destructive' : 'text-foreground'}`}>
            {formatDate(dataVencimento)}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">Pagamento</p>
          <p className="text-sm font-semibold text-foreground">{formatDate(dataPagamento)}</p>
        </Card>
      </div>

      {/* Itens */}
      <Card className="overflow-hidden">
        <div className="px-4 sm:px-6 py-4 border-b border-border">
          <h2 className="font-semibold text-foreground">Projetos Incluídos</h2>
        </div>
        <div className="divide-y divide-border">
          {(fatura.itens || []).map((item, idx) => (
            <div key={idx} className="px-4 sm:px-6 py-4 flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground">{item.clienteFinalNome}</p>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  <span className="text-xs text-muted-foreground">
                    {TIPO_LABEL[item.tipoServico] || item.tipoServico}
                  </span>
                  {item.ambientes && item.ambientes.length > 0 && (
                    <>
                      <span className="text-xs text-muted-foreground">·</span>
                      <span className="text-xs text-muted-foreground">{item.ambientes.join(', ')}</span>
                    </>
                  )}
                </div>
                <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                  <span>Base: {formatMoney(item.valorVendaOuFabrica)}</span>
                  <span>·</span>
                  <span>
                    {item.tipoPrecificacao === 'percentual'
                      ? `${item.percentualOuValor}%`
                      : formatMoney(item.percentualOuValor)}
                  </span>
                </div>
              </div>
              <span className="text-sm font-semibold text-foreground flex-shrink-0">
                {formatMoney(item.valorCalculado)}
              </span>
            </div>
          ))}
          {(!fatura.itens || fatura.itens.length === 0) && (
            <div className="px-4 sm:px-6 py-6 text-center text-sm text-muted-foreground">
              Nenhum item nesta fatura
            </div>
          )}
        </div>
      </Card>

      {/* Resumo financeiro */}
      <Card className="p-4 sm:p-6">
        <h2 className="font-semibold text-foreground mb-4">Resumo Financeiro</h2>
        <div className="space-y-2">
          {fatura.subtotalProjetoVenda > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Projetos Venda</span>
              <span className="font-medium text-foreground">{formatMoney(fatura.subtotalProjetoVenda)}</span>
            </div>
          )}
          {fatura.subtotalProjetoExecutivo > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Projetos Executivos</span>
              <span className="font-medium text-foreground">{formatMoney(fatura.subtotalProjetoExecutivo)}</span>
            </div>
          )}
          {fatura.subtotalMedicao > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Medições</span>
              <span className="font-medium text-foreground">{formatMoney(fatura.subtotalMedicao)}</span>
            </div>
          )}
          {fatura.percentualEntrada != null && fatura.percentualEntrada > 0 && (
            <>
              <div className="border-t border-border pt-2 mt-2" />
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Entrada ({fatura.percentualEntrada}%)</span>
                <span className="font-medium text-foreground">{formatMoney(fatura.valorEntrada || 0)}</span>
              </div>
            </>
          )}
          <div className="border-t border-border pt-3 mt-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-foreground">Total</span>
              <span className="text-xl font-bold text-foreground">{formatMoney(fatura.valorTotal)}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Observações */}
      {fatura.observacoes && (
        <Card className="p-4 sm:p-6">
          <h2 className="font-semibold text-foreground mb-2">Observações</h2>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{fatura.observacoes}</p>
        </Card>
      )}
    </div>
  );
}
