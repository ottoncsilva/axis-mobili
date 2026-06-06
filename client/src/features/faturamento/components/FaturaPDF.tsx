import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import type { Fatura } from '@/types/global.types';

function tsToDate(ts: any): Date {
  if (!ts) return new Date();
  if (ts instanceof Date) return ts;
  if (typeof ts.toDate === 'function') return ts.toDate();
  if (ts._seconds !== undefined) return new Date(ts._seconds * 1000);
  return new Date(ts);
}

function formatDate(ts: any): string {
  if (!ts) return '—';
  return tsToDate(ts).toLocaleDateString('pt-BR');
}

function formatMoney(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

const STATUS_LABEL: Record<string, string> = {
  rascunho: 'Rascunho',
  emitida: 'Emitida',
  paga: 'Paga',
  cancelada: 'Cancelada',
  vencida: 'Vencida',
};

const TIPO_LABEL: Record<string, string> = {
  projeto_venda: 'Projeto Venda',
  projeto_executivo: 'Projeto Executivo',
  medicao: 'Medição',
};

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#111827',
    padding: 40,
  },
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
    borderBottomWidth: 2,
    borderBottomColor: '#2563EB',
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: 'Helvetica-Bold',
    color: '#2563EB',
    letterSpacing: 2,
  },
  headerNumero: {
    fontSize: 14,
    fontFamily: 'Helvetica',
    color: '#374151',
    textAlign: 'right',
    marginTop: 4,
  },
  // Status badge
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  statusLabel: {
    fontSize: 9,
    color: '#6b7280',
    marginRight: 6,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  statusValue: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#2563EB',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  // Bloco cliente
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
  },
  clienteNome: {
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
    color: '#111827',
    marginBottom: 2,
  },
  clienteTipo: {
    fontSize: 10,
    color: '#6b7280',
  },
  // Datas em grid 3 colunas
  datesGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  dateCell: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 4,
    padding: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  dateCellLabel: {
    fontSize: 8,
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  dateCellValue: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#111827',
  },
  // Tabela de itens
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#2563EB',
    borderRadius: 4,
    paddingVertical: 6,
    paddingHorizontal: 8,
    marginBottom: 2,
  },
  tableHeaderCell: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 7,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  tableRowAlt: {
    backgroundColor: '#F9FAFB',
  },
  tableCell: {
    fontSize: 9,
    color: '#374151',
  },
  tableCellBold: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#111827',
  },
  // Colunas da tabela
  colCliente: { flex: 3 },
  colTipo: { flex: 2 },
  colBase: { flex: 2, textAlign: 'right' },
  colTaxa: { flex: 1.5, textAlign: 'right' },
  colValor: { flex: 2, textAlign: 'right' },
  // Resumo financeiro
  resumo: {
    marginTop: 16,
    borderTopWidth: 2,
    borderTopColor: '#E5E7EB',
    paddingTop: 12,
  },
  resumoTitle: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#111827',
    marginBottom: 8,
  },
  resumoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  resumoLabel: {
    fontSize: 10,
    color: '#6b7280',
  },
  resumoValue: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#374151',
  },
  resumoDivider: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    marginVertical: 8,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 4,
  },
  totalLabel: {
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
    color: '#111827',
  },
  totalValue: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    color: '#2563EB',
  },
  // Observações
  obsSection: {
    marginTop: 16,
    padding: 10,
    backgroundColor: '#FFFBEB',
    borderRadius: 4,
    borderLeftWidth: 3,
    borderLeftColor: '#F59E0B',
  },
  obsTitle: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#92400E',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  obsText: {
    fontSize: 9,
    color: '#78350F',
    lineHeight: 1.5,
  },
  // Footer
  footer: {
    position: 'absolute',
    bottom: 24,
    left: 40,
    right: 40,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerText: {
    fontSize: 8,
    color: '#9CA3AF',
  },
});

export function FaturaPDFDocument({ fatura }: { fatura: Fatura }) {
  const hasSubtotalVenda = (fatura.subtotalProjetoVenda || 0) > 0;
  const hasSubtotalExecutivo = (fatura.subtotalProjetoExecutivo || 0) > 0;
  const hasSubtotalMedicao = (fatura.subtotalMedicao || 0) > 0;
  const hasEntrada =
    fatura.percentualEntrada != null &&
    fatura.percentualEntrada > 0 &&
    (fatura.valorEntrada || 0) > 0;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Cabeçalho */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>FATURA</Text>
          <View>
            <Text style={styles.headerNumero}>{fatura.numero}</Text>
          </View>
        </View>

        {/* Status badge */}
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Status:</Text>
          <Text style={styles.statusValue}>
            {STATUS_LABEL[fatura.status] || fatura.status}
          </Text>
        </View>

        {/* Bloco do cliente */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cliente</Text>
          <Text style={styles.clienteNome}>{fatura.clienteNome}</Text>
          <Text style={styles.clienteTipo}>
            {fatura.tipo === 'mensal' ? 'Faturamento Mensal' : 'Faturamento Por Projeto'}
          </Text>
        </View>

        {/* Datas em grid 3 colunas */}
        <View style={styles.datesGrid}>
          <View style={styles.dateCell}>
            <Text style={styles.dateCellLabel}>Emissão</Text>
            <Text style={styles.dateCellValue}>
              {fatura.dataEmissao
                ? formatDate(fatura.dataEmissao)
                : formatDate(fatura.criadoEm)}
            </Text>
          </View>
          <View style={styles.dateCell}>
            <Text style={styles.dateCellLabel}>Vencimento</Text>
            <Text style={styles.dateCellValue}>{formatDate(fatura.dataVencimento)}</Text>
          </View>
          <View style={styles.dateCell}>
            <Text style={styles.dateCellLabel}>Pagamento</Text>
            <Text style={styles.dateCellValue}>{formatDate(fatura.dataPagamento)}</Text>
          </View>
        </View>

        {/* Tabela de itens */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Projetos Incluídos</Text>

          {/* Header da tabela */}
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, styles.colCliente]}>Cliente Final</Text>
            <Text style={[styles.tableHeaderCell, styles.colTipo]}>Tipo</Text>
            <Text style={[styles.tableHeaderCell, styles.colBase]}>Valor Base</Text>
            <Text style={[styles.tableHeaderCell, styles.colTaxa]}>Taxa</Text>
            <Text style={[styles.tableHeaderCell, styles.colValor]}>Calculado</Text>
          </View>

          {/* Linhas */}
          {(fatura.itens || []).map((item, idx) => (
            <View
              key={idx}
              style={[styles.tableRow, idx % 2 === 1 ? styles.tableRowAlt : {}]}
            >
              <Text style={[styles.tableCell, styles.colCliente]}>
                {item.clienteFinalNome}
              </Text>
              <Text style={[styles.tableCell, styles.colTipo]}>
                {TIPO_LABEL[item.tipoServico] || item.tipoServico}
              </Text>
              <Text style={[styles.tableCell, styles.colBase]}>
                {formatMoney(item.valorVendaOuFabrica)}
              </Text>
              <Text style={[styles.tableCell, styles.colTaxa]}>
                {item.tipoPrecificacao === 'percentual'
                  ? `${item.percentualOuValor}%`
                  : formatMoney(item.percentualOuValor)}
              </Text>
              <Text style={[styles.tableCellBold, styles.colValor]}>
                {formatMoney(item.valorCalculado)}
              </Text>
            </View>
          ))}

          {(!fatura.itens || fatura.itens.length === 0) && (
            <View style={[styles.tableRow]}>
              <Text style={[styles.tableCell, { color: '#9CA3AF' }]}>
                Nenhum item nesta fatura
              </Text>
            </View>
          )}
        </View>

        {/* Resumo financeiro */}
        <View style={styles.resumo}>
          <Text style={styles.resumoTitle}>Resumo Financeiro</Text>

          {hasSubtotalVenda && (
            <View style={styles.resumoRow}>
              <Text style={styles.resumoLabel}>Projetos Venda</Text>
              <Text style={styles.resumoValue}>
                {formatMoney(fatura.subtotalProjetoVenda)}
              </Text>
            </View>
          )}
          {hasSubtotalExecutivo && (
            <View style={styles.resumoRow}>
              <Text style={styles.resumoLabel}>Projetos Executivos</Text>
              <Text style={styles.resumoValue}>
                {formatMoney(fatura.subtotalProjetoExecutivo)}
              </Text>
            </View>
          )}
          {hasSubtotalMedicao && (
            <View style={styles.resumoRow}>
              <Text style={styles.resumoLabel}>Medições</Text>
              <Text style={styles.resumoValue}>
                {formatMoney(fatura.subtotalMedicao)}
              </Text>
            </View>
          )}

          {hasEntrada && (
            <>
              <View style={styles.resumoDivider} />
              <View style={styles.resumoRow}>
                <Text style={styles.resumoLabel}>
                  Entrada ({fatura.percentualEntrada}%)
                </Text>
                <Text style={styles.resumoValue}>
                  {formatMoney(fatura.valorEntrada || 0)}
                </Text>
              </View>
            </>
          )}

          <View style={styles.resumoDivider} />
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{formatMoney(fatura.valorTotal)}</Text>
          </View>
        </View>

        {/* Observações */}
        {fatura.observacoes ? (
          <View style={styles.obsSection}>
            <Text style={styles.obsTitle}>Observações</Text>
            <Text style={styles.obsText}>{fatura.observacoes}</Text>
          </View>
        ) : null}

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            Gerado em {new Date().toLocaleDateString('pt-BR')}
          </Text>
          <Text style={styles.footerText}>{fatura.numero}</Text>
        </View>
      </Page>
    </Document>
  );
}
