import { useState, useEffect, useCallback } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { useProjetosMutation } from '../hooks/useProjetos';
import { useClientesSelect, useCliente } from '@/features/clientes/hooks/useClientes';
import type { ProjetoFormData } from '../types/projetos.types';
import type { Projeto } from '@/types/global.types';
import { AmbienteForm } from './AmbienteForm';
import { maskCEP, maskTelefone, unmaskNumber, formatMoeda } from '@/lib/masks';
import {
  X, Loader2, Plus, FolderOpen, User, LayoutGrid, DollarSign,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  open: boolean;
  onClose: () => void;
  projeto?: Projeto;
}

const TIPO_SERVICO_LABELS: Record<string, string> = {
  projeto_venda: 'Projeto para Venda',
  projeto_executivo: 'Projeto Executivo',
  medicao: 'Medição Técnica',
};

const ESTADOS_BR = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG',
  'PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO',
];

const defaultFormData: ProjetoFormData = {
  clienteId: '',
  clienteNome: '',
  tipoServico: 'projeto_venda',
  clienteFinal: {
    nome: '',
    telefone: '',
    email: '',
    endereco: { cep: '', logradouro: '', numero: '', complemento: '', bairro: '', cidade: '', estado: '' },
  },
  ambientes: [{ nome: '', observacoes: '' }],
  valorVenda: undefined,
  valorFabrica: undefined,
  valorCombinado: undefined,
  linkGoogleDrive: '',
  observacoes: '',
};

export function ProjetoFormModal({ open, onClose, projeto }: Props) {
  const [activeTab, setActiveTab] = useState('dados');
  const [buscandoCEP, setBuscandoCEP] = useState(false);
  const [erroCEP, setErroCEP] = useState('');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [showEndereco, setShowEndereco] = useState(false);

  const { criar, atualizar } = useProjetosMutation();
  const { data: clientesSelect, isLoading: loadingClientes } = useClientesSelect();
  const isEditing = !!projeto;

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProjetoFormData>({
    defaultValues: defaultFormData,
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'ambientes' });

  const selectedClienteId = watch('clienteId');
  const tipoServico = watch('tipoServico');
  const valorVenda = watch('valorVenda');
  const valorFabrica = watch('valorFabrica');

  // Buscar dados do cliente selecionado para mostrar precificação
  const { data: clienteSelecionado } = useCliente(selectedClienteId || '');

  // Pegar a config de precificação do cliente para o tipo de serviço selecionado
  const precificacaoAtiva = clienteSelecionado?.precificacao?.[
    tipoServico === 'projeto_venda' ? 'projetoVenda' :
    tipoServico === 'projeto_executivo' ? 'projetoExecutivo' :
    'medicao'
  ];

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      if (projeto) {
        reset({
          clienteId: projeto.clienteId,
          clienteNome: projeto.clienteNome,
          tipoServico: projeto.tipoServico,
          clienteFinal: {
            nome: projeto.clienteFinal.nome,
            telefone: projeto.clienteFinal.telefone || '',
            email: projeto.clienteFinal.email || '',
            endereco: projeto.clienteFinal.endereco ? {
              ...projeto.clienteFinal.endereco,
              cep: maskCEP(projeto.clienteFinal.endereco.cep || ''),
            } : { cep: '', logradouro: '', numero: '', complemento: '', bairro: '', cidade: '', estado: '' },
          },
          ambientes: projeto.ambientes.map((a) => ({
            nome: a.nome,
            observacoes: a.observacoes || '',
          })),
          valorVenda: projeto.valorVenda,
          valorFabrica: projeto.valorFabrica,
          valorCombinado: projeto.valorCombinado,
          linkGoogleDrive: projeto.linkGoogleDrive || '',
          observacoes: projeto.observacoes || '',
        });
        setShowEndereco(!!projeto.clienteFinal.endereco);
      } else {
        reset(defaultFormData);
        setShowEndereco(false);
      }
      setActiveTab('dados');
    }
  }, [open, projeto, reset]);

  // Auto-dismiss toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Atualizar clienteNome quando selecionar cliente
  useEffect(() => {
    if (selectedClienteId && clientesSelect) {
      const clienteFound = clientesSelect.find((c) => c.id === selectedClienteId);
      if (clienteFound) {
        setValue('clienteNome', clienteFound.nomeFantasia);
      }
    }
  }, [selectedClienteId, clientesSelect, setValue]);

  // Busca CEP via ViaCEP
  const buscarCEP = useCallback(async (cep: string) => {
    const nums = unmaskNumber(cep);
    if (nums.length !== 8) return;

    setBuscandoCEP(true);
    setErroCEP('');
    try {
      const response = await fetch(`https://viacep.com.br/ws/${nums}/json/`);
      const data = await response.json();
      if (data.erro) {
        setErroCEP('CEP não encontrado');
        return;
      }
      setValue('clienteFinal.endereco.logradouro', data.logradouro || '');
      setValue('clienteFinal.endereco.bairro', data.bairro || '');
      setValue('clienteFinal.endereco.cidade', data.localidade || '');
      setValue('clienteFinal.endereco.estado', data.uf || '');
    } catch {
      setErroCEP('Erro ao buscar CEP');
    } finally {
      setBuscandoCEP(false);
    }
  }, [setValue]);

  const onSubmit = async (data: ProjetoFormData) => {
    if (!data.clienteId) {
      setActiveTab('dados');
      setToast({ type: 'error', message: 'Selecione um cliente (loja).' });
      return;
    }

    if (!data.clienteFinal.nome.trim()) {
      setActiveTab('cliente');
      setToast({ type: 'error', message: 'Informe o nome do cliente final.' });
      return;
    }

    if (data.ambientes.length === 0) {
      setActiveTab('ambientes');
      setToast({ type: 'error', message: 'Adicione pelo menos um ambiente.' });
      return;
    }

    const hasEmptyAmbiente = data.ambientes.some((a) => !a.nome.trim());
    if (hasEmptyAmbiente) {
      setActiveTab('ambientes');
      setToast({ type: 'error', message: 'Todos os ambientes devem ter um nome.' });
      return;
    }

    // Limpar endereço se não estiver preenchido
    if (!showEndereco) {
      data.clienteFinal.endereco = undefined;
    }

    try {
      if (isEditing) {
        await atualizar.mutateAsync({ id: projeto!.id, data });
        setToast({ type: 'success', message: 'Projeto atualizado com sucesso!' });
      } else {
        await criar.mutateAsync(data);
        setToast({ type: 'success', message: 'Projeto cadastrado com sucesso!' });
      }
      setTimeout(() => onClose(), 500);
    } catch (err) {
      setToast({ type: 'error', message: 'Erro ao salvar. Tente novamente.' });
    }
  };

  if (!open) return null;

  const tabs = [
    { id: 'dados', label: 'Dados Gerais', icon: FolderOpen },
    { id: 'cliente', label: 'Cliente Final', icon: User },
    { id: 'ambientes', label: 'Ambientes', icon: LayoutGrid },
  ];

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />
      <div className="fixed inset-4 md:inset-y-8 md:left-1/2 md:-translate-x-1/2 md:max-w-3xl md:w-full z-50 flex items-start justify-center overflow-y-auto">
        <div className="bg-card border border-border rounded-xl shadow-2xl w-full animate-fade-in">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <h2 className="text-xl font-semibold text-foreground">
              {isEditing ? 'Editar Projeto' : 'Novo Projeto'}
            </h2>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-accent transition-all">
              <X className="h-5 w-5 text-muted-foreground" />
            </button>
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

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="p-6 max-h-[60vh] overflow-y-auto">

              {/* Aba Dados Gerais */}
              {activeTab === 'dados' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Cliente (Loja) */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Cliente (Loja) *</label>
                      <Controller
                        name="clienteId"
                        control={control}
                        rules={{ required: 'Selecione um cliente' }}
                        render={({ field }) => (
                          <select
                            {...field}
                            disabled={isEditing}
                            className="w-full h-10 px-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
                          >
                            <option value="">
                              {loadingClientes ? 'Carregando...' : 'Selecione um cliente'}
                            </option>
                            {clientesSelect?.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.nomeFantasia}
                              </option>
                            ))}
                          </select>
                        )}
                      />
                      {errors.clienteId && (
                        <p className="text-xs text-destructive">{errors.clienteId.message}</p>
                      )}
                    </div>

                    {/* Tipo de Serviço */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Tipo de Serviço *</label>
                      <Controller
                        name="tipoServico"
                        control={control}
                        render={({ field }) => (
                          <select
                            {...field}
                            disabled={isEditing}
                            className="w-full h-10 px-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
                          >
                            {Object.entries(TIPO_SERVICO_LABELS).map(([value, label]) => (
                              <option key={value} value={value}>
                                {label}
                              </option>
                            ))}
                          </select>
                        )}
                      />
                    </div>
                  </div>

                  {/* Precificação info */}
                  {precificacaoAtiva && (
                    <div className="p-3 rounded-lg bg-brand-50 dark:bg-brand-950/30 border border-brand-200 dark:border-brand-800/50">
                      <div className="flex items-center gap-2 text-sm">
                        <DollarSign className="h-4 w-4 text-brand-600" />
                        <span className="font-medium text-brand-700 dark:text-brand-400">
                          Precificação:
                        </span>
                        <span className="text-brand-600 dark:text-brand-300">
                          {precificacaoAtiva.tipo === 'percentual_venda' && `${precificacaoAtiva.valor}% sobre valor de venda`}
                          {precificacaoAtiva.tipo === 'percentual_fabrica' && `${precificacaoAtiva.valor}% sobre valor de fábrica`}
                          {precificacaoAtiva.tipo === 'valor_combinado' && 'Valor combinado por projeto'}
                          {precificacaoAtiva.tipo === 'valor_fixo_ambiente' && `${formatMoeda(precificacaoAtiva.valor)} por ambiente`}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Valores */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {(precificacaoAtiva?.tipo === 'percentual_venda' || !precificacaoAtiva) && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Valor de Venda (R$)</label>
                        <input
                          type="number"
                          step="0.01"
                          {...register('valorVenda', { valueAsNumber: true })}
                          placeholder="0,00"
                          className="w-full h-10 px-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                      </div>
                    )}
                    {(precificacaoAtiva?.tipo === 'percentual_fabrica' || !precificacaoAtiva) && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Valor de Fábrica (R$)</label>
                        <input
                          type="number"
                          step="0.01"
                          {...register('valorFabrica', { valueAsNumber: true })}
                          placeholder="0,00"
                          className="w-full h-10 px-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                      </div>
                    )}
                    {precificacaoAtiva?.tipo === 'valor_combinado' && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Valor Combinado (R$)</label>
                        <input
                          type="number"
                          step="0.01"
                          {...register('valorCombinado', { valueAsNumber: true })}
                          placeholder="0,00"
                          className="w-full h-10 px-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                      </div>
                    )}
                  </div>

                  {/* Link Google Drive */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Link Google Drive</label>
                    <input
                      {...register('linkGoogleDrive')}
                      placeholder="https://drive.google.com/..."
                      className="w-full h-10 px-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>

                  {/* Observações */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Observações</label>
                    <textarea
                      {...register('observacoes')}
                      rows={3}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                    />
                  </div>
                </div>
              )}

              {/* Aba Cliente Final */}
              {activeTab === 'cliente' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Nome do Cliente Final *</label>
                      <input
                        {...register('clienteFinal.nome', { required: 'Nome é obrigatório' })}
                        placeholder="Nome completo do cliente final"
                        className="w-full h-10 px-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                      {errors.clienteFinal?.nome && (
                        <p className="text-xs text-destructive">{errors.clienteFinal.nome.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Email</label>
                      <input
                        {...register('clienteFinal.email')}
                        type="email"
                        placeholder="email@exemplo.com"
                        className="w-full h-10 px-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Telefone</label>
                      <Controller
                        name="clienteFinal.telefone"
                        control={control}
                        render={({ field }) => (
                          <input
                            {...field}
                            onChange={(e) => field.onChange(maskTelefone(e.target.value))}
                            placeholder="(XX) XXXXX-XXXX"
                            className="w-full h-10 px-3 rounded-lg border border-border bg-background text-foreground font-mono placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                          />
                        )}
                      />
                    </div>
                  </div>

                  {/* Toggle endereço */}
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowEndereco(!showEndereco)}
                      className={cn(
                        'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                        showEndereco ? 'bg-brand-600' : 'bg-muted-foreground/30'
                      )}
                    >
                      <span
                        className={cn(
                          'inline-block h-4 w-4 rounded-full bg-white transition-transform',
                          showEndereco ? 'translate-x-6' : 'translate-x-1'
                        )}
                      />
                    </button>
                    <span className="text-sm text-foreground">Incluir endereço do cliente final</span>
                  </div>

                  {/* Endereço */}
                  {showEndereco && (
                    <div className="space-y-4 pt-2 animate-fade-in">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-foreground">CEP</label>
                          <div className="relative">
                            <Controller
                              name="clienteFinal.endereco.cep"
                              control={control}
                              render={({ field }) => (
                                <input
                                  {...field}
                                  onChange={(e) => {
                                    const masked = maskCEP(e.target.value);
                                    field.onChange(masked);
                                    if (unmaskNumber(masked).length === 8) {
                                      buscarCEP(masked);
                                    }
                                  }}
                                  placeholder="XXXXX-XXX"
                                  className="w-full h-10 px-3 rounded-lg border border-border bg-background text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-ring"
                                />
                              )}
                            />
                            {buscandoCEP && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-brand-500" />}
                          </div>
                          {erroCEP && <p className="text-xs text-destructive">{erroCEP}</p>}
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="md:col-span-3 space-y-2">
                          <label className="text-sm font-medium text-foreground">Logradouro</label>
                          <input
                            {...register('clienteFinal.endereco.logradouro')}
                            className="w-full h-10 px-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-foreground">Número</label>
                          <input
                            {...register('clienteFinal.endereco.numero')}
                            className="w-full h-10 px-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-foreground">Complemento</label>
                          <input
                            {...register('clienteFinal.endereco.complemento')}
                            className="w-full h-10 px-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-foreground">Bairro</label>
                          <input
                            {...register('clienteFinal.endereco.bairro')}
                            className="w-full h-10 px-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-foreground">Cidade</label>
                          <input
                            {...register('clienteFinal.endereco.cidade')}
                            className="w-full h-10 px-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-foreground">Estado</label>
                          <select
                            {...register('clienteFinal.endereco.estado')}
                            className="w-full h-10 px-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                          >
                            <option value="">Selecione</option>
                            {ESTADOS_BR.map((uf) => (
                              <option key={uf} value={uf}>{uf}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Aba Ambientes */}
              {activeTab === 'ambientes' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      Adicione os ambientes do projeto. Ex: Cozinha, Sala, Quarto...
                    </p>
                    <button
                      type="button"
                      onClick={() => append({ nome: '', observacoes: '' })}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm text-brand-600 hover:bg-brand-600/10 rounded-lg transition-all"
                    >
                      <Plus className="h-4 w-4" />
                      Ambiente
                    </button>
                  </div>
                  {fields.map((field, index) => (
                    <AmbienteForm
                      key={field.id}
                      index={index}
                      register={register}
                      errors={errors}
                      onRemove={() => remove(index)}
                      canRemove={fields.length > 1}
                    />
                  ))}

                  {precificacaoAtiva?.tipo === 'valor_fixo_ambiente' && fields.length > 0 && (
                    <div className="p-3 rounded-lg bg-muted/50 border border-border">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          {fields.length} ambiente{fields.length > 1 ? 's' : ''} × {formatMoeda(precificacaoAtiva.valor)}
                        </span>
                        <span className="font-semibold text-foreground">
                          = {formatMoeda(precificacaoAtiva.valor * fields.length)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-border">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-lg text-sm font-medium text-foreground bg-secondary hover:bg-secondary/80 transition-all"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-lg transition-all disabled:opacity-50 shadow-md shadow-brand-600/20"
              >
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {isEditing ? 'Salvar Alterações' : 'Cadastrar Projeto'}
              </button>
            </div>
          </form>

          {/* Toast */}
          {toast && (
            <div className={cn(
              'fixed bottom-6 right-6 z-[60] px-4 py-3 rounded-lg shadow-lg text-sm font-medium animate-fade-in',
              toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-destructive text-white'
            )}>
              {toast.message}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
