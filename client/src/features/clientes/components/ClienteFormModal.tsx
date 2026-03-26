import { useState, useEffect, useCallback } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { useClientesMutation } from '../hooks/useClientes';
import type { ClienteFormData, ContatoFormData } from '../types/clientes.types';
import type { Cliente } from '@/types/global.types';
import { ContatoForm } from './ContatoForm';
import { PrecificacaoForm } from './PrecificacaoForm';
import { maskCNPJ, maskCEP, validarCNPJ, unmaskNumber } from '@/lib/masks';
import { X, Loader2, Plus, Building2, MapPin, Users, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  open: boolean;
  onClose: () => void;
  cliente?: Cliente;
}

const ESTADOS_BR = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG',
  'PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO',
];

const defaultFormData: ClienteFormData = {
  razaoSocial: '',
  nomeFantasia: '',
  cnpj: '',
  inscricaoEstadual: '',
  inscricaoMunicipal: '',
  endereco: { cep: '', logradouro: '', numero: '', complemento: '', bairro: '', cidade: '', estado: '' },
  contatos: [{ nome: '', cargo: '', email: '', telefone: '', whatsapp: '', principal: true }],
  precificacao: {
    projetoVenda: { tipo: 'percentual_venda', valor: 1.5 },
    projetoExecutivo: { tipo: 'percentual_venda', valor: 3 },
    medicao: { tipo: 'valor_fixo_ambiente', valor: 350 },
  },
  observacoes: '',
};

export function ClienteFormModal({ open, onClose, cliente }: Props) {
  const [activeTab, setActiveTab] = useState('empresa');
  const [buscandoCEP, setBuscandoCEP] = useState(false);
  const [erroCEP, setErroCEP] = useState('');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const { criar, atualizar } = useClientesMutation();
  const isEditing = !!cliente;

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ClienteFormData>({
    defaultValues: defaultFormData,
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'contatos' });

  // Reset form when cliente changes
  useEffect(() => {
    if (open) {
      if (cliente) {
        reset({
          razaoSocial: cliente.razaoSocial,
          nomeFantasia: cliente.nomeFantasia,
          cnpj: maskCNPJ(cliente.cnpj),
          inscricaoEstadual: cliente.inscricaoEstadual || '',
          inscricaoMunicipal: cliente.inscricaoMunicipal || '',
          endereco: {
            ...cliente.endereco,
            cep: maskCEP(cliente.endereco.cep),
          },
          contatos: cliente.contatos.map((c) => ({
            nome: c.nome,
            cargo: c.cargo,
            email: c.email || '',
            telefone: c.telefone,
            whatsapp: c.whatsapp || '',
            principal: c.principal,
          })),
          precificacao: cliente.precificacao,
          observacoes: cliente.observacoes || '',
        });
      } else {
        reset(defaultFormData);
      }
      setActiveTab('empresa');
    }
  }, [open, cliente, reset]);

  // Auto-dismiss toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

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
      setValue('endereco.logradouro', data.logradouro || '');
      setValue('endereco.bairro', data.bairro || '');
      setValue('endereco.cidade', data.localidade || '');
      setValue('endereco.estado', data.uf || '');
    } catch {
      setErroCEP('Erro ao buscar CEP');
    } finally {
      setBuscandoCEP(false);
    }
  }, [setValue]);

  const onSubmit = async (data: ClienteFormData) => {
    // Validate CNPJ
    if (!validarCNPJ(data.cnpj)) {
      setActiveTab('empresa');
      setToast({ type: 'error', message: 'CNPJ inválido. Verifique os dígitos.' });
      return;
    }

    // Validate contatos
    if (data.contatos.length === 0) {
      setActiveTab('contatos');
      setToast({ type: 'error', message: 'Adicione pelo menos um contato.' });
      return;
    }
    const principais = data.contatos.filter((c) => c.principal);
    if (principais.length !== 1) {
      setActiveTab('contatos');
      setToast({ type: 'error', message: 'Marque exatamente um contato como principal.' });
      return;
    }

    try {
      if (isEditing) {
        await atualizar.mutateAsync({ id: cliente!.id, data });
        setToast({ type: 'success', message: 'Cliente atualizado com sucesso!' });
      } else {
        await criar.mutateAsync(data);
        setToast({ type: 'success', message: 'Cliente cadastrado com sucesso!' });
      }
      setTimeout(() => onClose(), 500);
    } catch (err) {
      setToast({ type: 'error', message: 'Erro ao salvar. Tente novamente.' });
    }
  };

  if (!open) return null;

  const tabs = [
    { id: 'empresa', label: 'Empresa', icon: Building2 },
    { id: 'endereco', label: 'Endereço', icon: MapPin },
    { id: 'contatos', label: 'Contatos', icon: Users },
    { id: 'precificacao', label: 'Precificação', icon: DollarSign },
  ];

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />
      <div className="fixed inset-4 md:inset-y-8 md:left-1/2 md:-translate-x-1/2 md:max-w-3xl md:w-full z-50 flex items-start justify-center overflow-y-auto">
        <div className="bg-card border border-border rounded-xl shadow-2xl w-full animate-fade-in">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <h2 className="text-xl font-semibold text-foreground">
              {isEditing ? 'Editar Cliente' : 'Novo Cliente'}
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

              {/* Aba Empresa */}
              {activeTab === 'empresa' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Razão Social *</label>
                      <input
                        {...register('razaoSocial', { required: 'Obrigatório', minLength: { value: 3, message: 'Mínimo 3 caracteres' } })}
                        className="w-full h-10 px-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                      {errors.razaoSocial && <p className="text-xs text-destructive">{errors.razaoSocial.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Nome Fantasia *</label>
                      <input
                        {...register('nomeFantasia', { required: 'Obrigatório', minLength: { value: 3, message: 'Mínimo 3 caracteres' } })}
                        className="w-full h-10 px-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                      {errors.nomeFantasia && <p className="text-xs text-destructive">{errors.nomeFantasia.message}</p>}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">CNPJ *</label>
                      <Controller
                        name="cnpj"
                        control={control}
                        rules={{ required: 'Obrigatório' }}
                        render={({ field }) => (
                          <input
                            {...field}
                            onChange={(e) => field.onChange(maskCNPJ(e.target.value))}
                            placeholder="XX.XXX.XXX/XXXX-XX"
                            className="w-full h-10 px-3 rounded-lg border border-border bg-background text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-ring"
                          />
                        )}
                      />
                      {errors.cnpj && <p className="text-xs text-destructive">{errors.cnpj.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Inscrição Estadual</label>
                      <input
                        {...register('inscricaoEstadual')}
                        className="w-full h-10 px-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Inscrição Municipal</label>
                      <input
                        {...register('inscricaoMunicipal')}
                        className="w-full h-10 px-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                  </div>
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

              {/* Aba Endereço */}
              {activeTab === 'endereco' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">CEP *</label>
                      <div className="relative">
                        <Controller
                          name="endereco.cep"
                          control={control}
                          rules={{ required: 'Obrigatório' }}
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
                      {errors.endereco?.cep && <p className="text-xs text-destructive">{errors.endereco.cep.message}</p>}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-3 space-y-2">
                      <label className="text-sm font-medium text-foreground">Logradouro *</label>
                      <input
                        {...register('endereco.logradouro', { required: 'Obrigatório' })}
                        className="w-full h-10 px-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Número *</label>
                      <input
                        {...register('endereco.numero', { required: 'Obrigatório' })}
                        className="w-full h-10 px-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Complemento</label>
                      <input
                        {...register('endereco.complemento')}
                        className="w-full h-10 px-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Bairro *</label>
                      <input
                        {...register('endereco.bairro', { required: 'Obrigatório' })}
                        className="w-full h-10 px-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Cidade *</label>
                      <input
                        {...register('endereco.cidade', { required: 'Obrigatório' })}
                        className="w-full h-10 px-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Estado *</label>
                      <select
                        {...register('endereco.estado', { required: 'Obrigatório' })}
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

              {/* Aba Contatos */}
              {activeTab === 'contatos' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">Adicione os contatos da loja. Pelo menos 1 contato é obrigatório.</p>
                    <button
                      type="button"
                      onClick={() => append({ nome: '', cargo: '', email: '', telefone: '', whatsapp: '', principal: false })}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm text-brand-600 hover:bg-brand-600/10 rounded-lg transition-all"
                    >
                      <Plus className="h-4 w-4" />
                      Contato
                    </button>
                  </div>
                  {fields.map((field, index) => (
                    <ContatoForm
                      key={field.id}
                      index={index}
                      control={control}
                      register={register}
                      errors={errors}
                      onRemove={() => remove(index)}
                      canRemove={fields.length > 1}
                    />
                  ))}
                </div>
              )}

              {/* Aba Precificação */}
              {activeTab === 'precificacao' && (
                <div className="space-y-6">
                  <PrecificacaoForm
                    tipoServico="projetoVenda"
                    label="Projeto para Venda"
                    description="Como cobrar por projetos de venda para esta loja"
                    control={control}
                    register={register}
                  />
                  <PrecificacaoForm
                    tipoServico="projetoExecutivo"
                    label="Projeto Executivo"
                    description="Como cobrar por projetos executivos para esta loja"
                    control={control}
                    register={register}
                  />
                  <PrecificacaoForm
                    tipoServico="medicao"
                    label="Medição Técnica"
                    description="Como cobrar por medições técnicas para esta loja"
                    control={control}
                    register={register}
                    tiposDisponiveis={['percentual_venda', 'percentual_fabrica', 'valor_fixo_ambiente']}
                  />
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
                {isEditing ? 'Salvar Alterações' : 'Cadastrar Cliente'}
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
