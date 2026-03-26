import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCliente, useClientesMutation } from '../hooks/useClientes';
import { ClienteFormModal } from './ClienteFormModal';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { EmptyState } from '@/components/common/EmptyState';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCNPJ, formatTelefone, formatMoeda } from '@/lib/masks';
import { formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';
import type { TipoPrecificacao } from '@/types/global.types';
import {
  ArrowLeft, Pencil, ToggleLeft, ToggleRight,
  Building2, MapPin, MessageSquare, Phone, Mail,
  FolderKanban, Receipt, TrendingUp, ExternalLink,
} from 'lucide-react';

const TIPO_LABELS: Record<TipoPrecificacao, string> = {
  percentual_venda: '% do Preço de Venda',
  percentual_fabrica: '% do Preço de Fábrica',
  valor_combinado: 'Valor Combinado',
  valor_fixo_ambiente: 'Valor Fixo por Ambiente',
};

export function ClienteDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: cliente, isLoading } = useCliente(id!);
  const { toggleAtivo } = useClientesMutation();
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [confirmToggle, setConfirmToggle] = useState(false);
  const [activeTab, setActiveTab] = useState('info');

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    );
  }

  if (!cliente) {
    return (
      <EmptyState
        icon={Building2}
        title="Cliente não encontrado"
        description="O cliente que você procura não existe ou foi removido."
        actionLabel="Voltar à Lista"
        onAction={() => navigate('/clientes')}
      />
    );
  }

  const formatPrecificacao = (tipo: TipoPrecificacao, valor: number) => {
    if (tipo.startsWith('percentual')) return `${valor}% — ${TIPO_LABELS[tipo]}`;
    return `${formatMoeda(valor)} — ${TIPO_LABELS[tipo]}`;
  };

  const contatoPrincipal = cliente.contatos?.find((c) => c.principal);

  const tabs = [
    { id: 'info', label: 'Informações' },
    { id: 'contatos', label: 'Contatos' },
    { id: 'precificacao', label: 'Precificação' },
    { id: 'projetos', label: 'Projetos' },
    { id: 'faturas', label: 'Faturas' },
    { id: 'financeiro', label: 'Financeiro' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <button
          onClick={() => navigate('/clientes')}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-all mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Clientes
        </button>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-foreground">{cliente.nomeFantasia}</h2>
            <StatusBadge status={cliente.ativo ? 'ativo' : 'inativo'} />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setEditModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-foreground bg-secondary hover:bg-secondary/80 rounded-lg transition-all"
            >
              <Pencil className="h-4 w-4" />
              Editar
            </button>
            <button
              onClick={() => setConfirmToggle(true)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all',
                cliente.ativo
                  ? 'text-destructive bg-destructive/10 hover:bg-destructive/20'
                  : 'text-brand-600 bg-brand-600/10 hover:bg-brand-600/20'
              )}
            >
              {cliente.ativo ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
              {cliente.ativo ? 'Desativar' : 'Ativar'}
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'px-4 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap',
              activeTab === tab.id
                ? 'border-brand-500 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="animate-fade-in">
        {activeTab === 'info' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-lg border border-border bg-card">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-3 flex items-center gap-2">
                <Building2 className="h-4 w-4" /> Dados da Empresa
              </h3>
              <dl className="space-y-2">
                <div><dt className="text-xs text-muted-foreground">Razão Social</dt><dd className="text-sm text-foreground">{cliente.razaoSocial}</dd></div>
                <div><dt className="text-xs text-muted-foreground">CNPJ</dt><dd className="text-sm text-foreground font-mono">{formatCNPJ(cliente.cnpj)}</dd></div>
                {cliente.inscricaoEstadual && <div><dt className="text-xs text-muted-foreground">Inscrição Estadual</dt><dd className="text-sm text-foreground">{cliente.inscricaoEstadual}</dd></div>}
                {cliente.inscricaoMunicipal && <div><dt className="text-xs text-muted-foreground">Inscrição Municipal</dt><dd className="text-sm text-foreground">{cliente.inscricaoMunicipal}</dd></div>}
              </dl>
            </div>
            <div className="p-5 rounded-lg border border-border bg-card">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-3 flex items-center gap-2">
                <MapPin className="h-4 w-4" /> Endereço
              </h3>
              <p className="text-sm text-foreground">
                {cliente.endereco.logradouro}, {cliente.endereco.numero}
                {cliente.endereco.complemento && ` — ${cliente.endereco.complemento}`}
                <br />
                {cliente.endereco.bairro} — {cliente.endereco.cidade}/{cliente.endereco.estado}
                <br />
                <span className="text-muted-foreground font-mono text-xs">CEP: {cliente.endereco.cep}</span>
              </p>
            </div>
            {cliente.observacoes && (
              <div className="md:col-span-2 p-5 rounded-lg border border-border bg-card">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-3 flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" /> Observações
                </h3>
                <p className="text-sm text-foreground whitespace-pre-wrap">{cliente.observacoes}</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'contatos' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cliente.contatos?.map((contato, i) => (
              <div key={i} className={cn(
                'p-5 rounded-lg border bg-card',
                contato.principal ? 'border-brand-500/50 bg-brand-600/5' : 'border-border'
              )}>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-semibold text-foreground">{contato.nome}</p>
                    <p className="text-xs text-muted-foreground">{contato.cargo}</p>
                  </div>
                  {contato.principal && (
                    <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-brand-600/10 text-brand-600">Principal</span>
                  )}
                </div>
                <div className="space-y-2">
                  <a href={`tel:${contato.telefone}`} className="flex items-center gap-2 text-sm text-foreground hover:text-brand-500 transition-all">
                    <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                    {formatTelefone(contato.telefone)}
                  </a>
                  {contato.email && (
                    <a href={`mailto:${contato.email}`} className="flex items-center gap-2 text-sm text-foreground hover:text-brand-500 transition-all">
                      <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                      {contato.email}
                    </a>
                  )}
                  {contato.whatsapp && (
                    <a href={`https://wa.me/55${contato.whatsapp}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-foreground hover:text-brand-500 transition-all">
                      <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                      WhatsApp
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'precificacao' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(['projetoVenda', 'projetoExecutivo', 'medicao'] as const).map((tipo) => {
              const prec = cliente.precificacao?.[tipo];
              if (!prec) return null;
              const labels = { projetoVenda: 'Projeto Venda', projetoExecutivo: 'Projeto Executivo', medicao: 'Medição' };
              return (
                <div key={tipo} className="p-5 rounded-lg border border-border bg-card text-center">
                  <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">{labels[tipo]}</p>
                  <p className="text-lg font-bold text-foreground">{formatPrecificacao(prec.tipo, prec.valor)}</p>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'projetos' && (
          <EmptyState icon={FolderKanban} title="Nenhum projeto cadastrado" description="Os projetos desta loja aparecerão aqui." />
        )}

        {activeTab === 'faturas' && (
          <EmptyState icon={Receipt} title="Nenhuma fatura gerada" description="As faturas desta loja aparecerão aqui." />
        )}

        {activeTab === 'financeiro' && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Faturado', valor: 'R$ 0,00', color: 'text-foreground' },
              { label: 'Total Pago', valor: 'R$ 0,00', color: 'text-green-500' },
              { label: 'Total Pendente', valor: 'R$ 0,00', color: 'text-yellow-500' },
              { label: 'Total Vencido', valor: 'R$ 0,00', color: 'text-red-500' },
            ].map((item) => (
              <div key={item.label} className="p-4 rounded-lg border border-border bg-card text-center">
                <p className="text-xs text-muted-foreground mb-1">{item.label}</p>
                <p className={cn('text-lg font-bold', item.color)}>{item.valor}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <ClienteFormModal open={editModalOpen} onClose={() => setEditModalOpen(false)} cliente={cliente} />

      {/* Confirm Toggle */}
      <ConfirmDialog
        open={confirmToggle}
        title={cliente.ativo ? 'Desativar Cliente' : 'Ativar Cliente'}
        description={
          cliente.ativo
            ? `Deseja desativar "${cliente.nomeFantasia}"?`
            : `Deseja reativar "${cliente.nomeFantasia}"?`
        }
        variant={cliente.ativo ? 'destructive' : 'default'}
        onConfirm={async () => {
          await toggleAtivo.mutateAsync({ id: cliente.id, ativo: !cliente.ativo });
          setConfirmToggle(false);
        }}
        onCancel={() => setConfirmToggle(false)}
      />
    </div>
  );
}
