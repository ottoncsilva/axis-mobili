import { useParams, useNavigate } from 'react-router-dom';
import { useProjeto } from '../hooks/useProjetos';
import { useState } from 'react';
import {
  ETAPAS_LABELS,
  ETAPAS_PROJETO_VENDA,
  ETAPAS_PROJETO_EXECUTIVO,
  ETAPAS_MEDICAO,
} from '@/types/global.types';
import type { TipoServico } from '@/types/global.types';
import { formatMoeda, formatTelefone } from '@/lib/masks';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ArrowLeft,
  FolderOpen,
  User,
  LayoutGrid,
  History,
  ExternalLink,
  MapPin,
  Mail,
  Phone,
  CheckCircle2,
  Circle,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const TIPO_LABELS: Record<TipoServico, string> = {
  projeto_venda: 'Projeto para Venda',
  projeto_executivo: 'Projeto Executivo',
  medicao: 'Medição Técnica',
};

const TIPO_COLORS: Record<TipoServico, string> = {
  projeto_venda: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  projeto_executivo: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  medicao: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
};

function getEtapasParaTipo(tipo: TipoServico) {
  switch (tipo) {
    case 'projeto_venda': return [...ETAPAS_PROJETO_VENDA];
    case 'projeto_executivo': return [...ETAPAS_PROJETO_EXECUTIVO];
    case 'medicao': return [...ETAPAS_MEDICAO];
  }
}

export function ProjetoDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: projeto, isLoading } = useProjeto(id || '');
  const [activeTab, setActiveTab] = useState('info');

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    );
  }

  if (!projeto) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <span className="text-6xl">🔍</span>
        <h1 className="text-2xl font-semibold text-foreground">Projeto não encontrado</h1>
        <button
          onClick={() => navigate('/projetos')}
          className="flex items-center gap-2 px-4 py-2 text-sm text-brand-600 hover:bg-brand-600/10 rounded-lg transition-all"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para Projetos
        </button>
      </div>
    );
  }

  const etapasTipo = getEtapasParaTipo(projeto.tipoServico);
  const etapaAtualIndex = etapasTipo.indexOf(projeto.etapaAtual);

  const tabs = [
    { id: 'info', label: 'Informações', icon: FolderOpen },
    { id: 'ambientes', label: 'Ambientes', icon: LayoutGrid },
    { id: 'historico', label: 'Histórico', icon: History },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <button
            onClick={() => navigate('/projetos')}
            className="p-2 rounded-lg hover:bg-accent transition-all mt-0.5"
          >
            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
          </button>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-2xl font-bold text-foreground">{projeto.clienteFinal.nome}</h2>
              <span className={cn('text-xs font-medium px-2.5 py-1 rounded-full', TIPO_COLORS[projeto.tipoServico])}>
                {TIPO_LABELS[projeto.tipoServico]}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              {projeto.clienteNome} • {projeto.ambientes.length} ambiente{projeto.ambientes.length > 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {projeto.linkGoogleDrive && (
            <a
              href={projeto.linkGoogleDrive}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground border border-border rounded-lg hover:bg-accent transition-all"
            >
              <ExternalLink className="h-4 w-4" />
              Google Drive
            </a>
          )}
        </div>
      </div>

      {/* Progress Steps */}
      <div className="p-4 rounded-lg border border-border bg-card">
        <div className="flex items-center gap-1 overflow-x-auto pb-1">
          {etapasTipo.map((etapa, index) => {
            const isCurrent = etapa === projeto.etapaAtual;
            const isCompleted = index < etapaAtualIndex;
            return (
              <div key={etapa} className="flex items-center">
                <div className="flex flex-col items-center min-w-[80px]">
                  <div className={cn(
                    'w-7 h-7 rounded-full flex items-center justify-center transition-all',
                    isCompleted && 'bg-brand-600 text-white',
                    isCurrent && 'bg-brand-600/20 border-2 border-brand-600 text-brand-600',
                    !isCompleted && !isCurrent && 'bg-muted text-muted-foreground'
                  )}>
                    {isCompleted ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <span className="text-xs font-medium">{index + 1}</span>
                    )}
                  </div>
                  <span className={cn(
                    'text-[10px] mt-1.5 text-center leading-tight',
                    isCurrent ? 'text-brand-600 font-semibold' : 'text-muted-foreground'
                  )}>
                    {ETAPAS_LABELS[etapa] || etapa}
                  </span>
                </div>
                {index < etapasTipo.length - 1 && (
                  <div className={cn(
                    'h-0.5 w-6 mx-1 mt-[-18px]',
                    index < etapaAtualIndex ? 'bg-brand-600' : 'bg-muted'
                  )} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap',
              activeTab === tab.id
                ? 'border-brand-500 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="animate-fade-in">
        {/* Informações */}
        {activeTab === 'info' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Dados do Projeto */}
            <div className="p-5 rounded-lg border border-border bg-card space-y-4">
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider flex items-center gap-2">
                <FolderOpen className="h-4 w-4 text-brand-500" />
                Dados do Projeto
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tipo de Serviço</span>
                  <span className="font-medium text-foreground">{TIPO_LABELS[projeto.tipoServico]}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Etapa Atual</span>
                  <span className="font-medium text-foreground">{ETAPAS_LABELS[projeto.etapaAtual]}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Ambientes</span>
                  <span className="font-medium text-foreground">{projeto.ambientes.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Faturamento</span>
                  <span className="font-medium text-foreground">
                    {projeto.statusFaturamento === 'em_andamento' ? 'Em Andamento' :
                     projeto.statusFaturamento === 'pronto_para_faturar' ? 'Pronto p/ Faturar' :
                     'Faturado'}
                  </span>
                </div>
                {projeto.observacoes && (
                  <div className="pt-2 border-t border-border">
                    <span className="text-xs text-muted-foreground">Observações</span>
                    <p className="text-sm text-foreground mt-1">{projeto.observacoes}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Cliente Final */}
            <div className="p-5 rounded-lg border border-border bg-card space-y-4">
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider flex items-center gap-2">
                <User className="h-4 w-4 text-brand-500" />
                Cliente Final
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Nome</span>
                  <span className="font-medium text-foreground">{projeto.clienteFinal.nome}</span>
                </div>
                {projeto.clienteFinal.email && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1"><Mail className="h-3.5 w-3.5" /> Email</span>
                    <a href={`mailto:${projeto.clienteFinal.email}`} className="font-medium text-brand-600 hover:underline">
                      {projeto.clienteFinal.email}
                    </a>
                  </div>
                )}
                {projeto.clienteFinal.telefone && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1"><Phone className="h-3.5 w-3.5" /> Telefone</span>
                    <span className="font-medium text-foreground font-mono">{formatTelefone(projeto.clienteFinal.telefone)}</span>
                  </div>
                )}
                {projeto.clienteFinal.endereco && (
                  <div className="pt-2 border-t border-border">
                    <span className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" /> Endereço</span>
                    <p className="text-sm text-foreground mt-1">
                      {projeto.clienteFinal.endereco.logradouro}, {projeto.clienteFinal.endereco.numero}
                      {projeto.clienteFinal.endereco.complemento && ` - ${projeto.clienteFinal.endereco.complemento}`}
                      <br />
                      {projeto.clienteFinal.endereco.bairro} — {projeto.clienteFinal.endereco.cidade}/{projeto.clienteFinal.endereco.estado}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Valores */}
            <div className="p-5 rounded-lg border border-border bg-card space-y-4 lg:col-span-2">
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider flex items-center gap-2">
                <span className="text-brand-500">R$</span>
                Valores
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {projeto.valorVenda != null && (
                  <div className="p-3 rounded-lg bg-muted/50 text-center">
                    <p className="text-xs text-muted-foreground mb-1">Valor de Venda</p>
                    <p className="text-lg font-semibold text-foreground font-mono">{formatMoeda(projeto.valorVenda)}</p>
                  </div>
                )}
                {projeto.valorFabrica != null && (
                  <div className="p-3 rounded-lg bg-muted/50 text-center">
                    <p className="text-xs text-muted-foreground mb-1">Valor de Fábrica</p>
                    <p className="text-lg font-semibold text-foreground font-mono">{formatMoeda(projeto.valorFabrica)}</p>
                  </div>
                )}
                {projeto.valorCombinado != null && (
                  <div className="p-3 rounded-lg bg-muted/50 text-center">
                    <p className="text-xs text-muted-foreground mb-1">Valor Combinado</p>
                    <p className="text-lg font-semibold text-foreground font-mono">{formatMoeda(projeto.valorCombinado)}</p>
                  </div>
                )}
                <div className="p-3 rounded-lg bg-brand-50 dark:bg-brand-950/30 border border-brand-200 dark:border-brand-800/50 text-center">
                  <p className="text-xs text-brand-600 dark:text-brand-400 mb-1">Valor Calculado</p>
                  <p className="text-lg font-bold text-brand-700 dark:text-brand-300 font-mono">
                    {projeto.valorCalculado ? formatMoeda(projeto.valorCalculado) : '—'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Ambientes */}
        {activeTab === 'ambientes' && (
          <div className="space-y-4">
            {projeto.ambientes.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                Nenhum ambiente cadastrado.
              </div>
            ) : (
              projeto.ambientes.map((ambiente) => (
                <div key={ambiente.id} className="p-4 rounded-lg border border-border bg-card">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-foreground">{ambiente.nome}</h4>
                    {ambiente.observacoes && (
                      <span className="text-xs text-muted-foreground">{ambiente.observacoes}</span>
                    )}
                  </div>
                  {/* Checkboxes de etapas concluídas */}
                  <div className="flex flex-wrap gap-2">
                    {etapasTipo.map((etapa) => {
                      const concluida = ambiente.etapasConcluidas?.[etapa] === true;
                      return (
                        <div
                          key={etapa}
                          className={cn(
                            'flex items-center gap-1.5 px-2 py-1 rounded-md text-xs transition-all',
                            concluida
                              ? 'bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400'
                              : 'bg-muted/50 text-muted-foreground'
                          )}
                        >
                          {concluida ? (
                            <CheckCircle2 className="h-3 w-3" />
                          ) : (
                            <Circle className="h-3 w-3" />
                          )}
                          {ETAPAS_LABELS[etapa] || etapa}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Histórico */}
        {activeTab === 'historico' && (
          <div className="space-y-4">
            {projeto.historico.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                <p className="text-muted-foreground">Nenhuma movimentação registrada ainda.</p>
                <p className="text-xs text-muted-foreground mt-1">
                  O histórico será preenchido conforme o projeto avança pelo Kanban.
                </p>
              </div>
            ) : (
              <div className="relative pl-6">
                <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-border" />
                {projeto.historico.map((item) => (
                  <div key={item.id} className="relative mb-4 pl-4">
                    <div className="absolute left-[-16px] top-1.5 w-3 h-3 rounded-full bg-brand-500 border-2 border-background" />
                    <div className="p-3 rounded-lg border border-border bg-card">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-foreground">
                          {ETAPAS_LABELS[item.etapaDe]} → {ETAPAS_LABELS[item.etapaPara]}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {item.data?.toDate?.()?.toLocaleDateString('pt-BR') || '—'}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">{item.usuarioNome}</p>
                      {item.observacao && (
                        <p className="text-sm text-foreground mt-2 pt-2 border-t border-border">{item.observacao}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
