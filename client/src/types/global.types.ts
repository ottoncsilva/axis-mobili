import { Timestamp } from 'firebase/firestore';

// ===== USUÁRIOS =====
export type PerfilUsuario = 'admin' | 'projetista' | 'medidor' | 'financeiro';

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  perfil: PerfilUsuario;
  ativo: boolean;
  telefone?: string;
  avatarUrl?: string;
  criadoEm: Timestamp;
  atualizadoEm: Timestamp;
}

// ===== CLIENTES (LOJAS) =====
export type TipoPrecificacao = 'percentual_venda' | 'percentual_fabrica' | 'valor_combinado' | 'valor_fixo_ambiente';

export interface Contato {
  id: string;
  nome: string;
  cargo: string;
  email?: string;
  telefone: string;
  whatsapp?: string;
  principal: boolean;
}

export interface PrecificacaoConfig {
  tipo: TipoPrecificacao;
  valor: number;
}

export interface Cliente {
  id: string;
  razaoSocial: string;
  nomeFantasia: string;
  cnpj: string;
  inscricaoEstadual?: string;
  inscricaoMunicipal?: string;
  endereco: {
    cep: string;
    logradouro: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cidade: string;
    estado: string;
  };
  contatos: Contato[];
  precificacao: {
    projetoVenda: PrecificacaoConfig;
    projetoExecutivo: PrecificacaoConfig;
    medicao: PrecificacaoConfig;
  };
  observacoes?: string;
  ativo: boolean;
  criadoEm: Timestamp;
  atualizadoEm: Timestamp;
}

// ===== PROJETOS =====
export type TipoServico = 'projeto_venda' | 'projeto_executivo' | 'medicao';
export type StatusFaturamento = 'em_andamento' | 'pronto_para_faturar' | 'faturado';

// Etapas do Kanban
export const ETAPAS_PROJETO_VENDA = [
  'aguardando_inicio',
  'projetar_ambientes',
  'projetar_mobiliario',
  'aprovacao',
  'renderizar',
  'montar_apresentacao',
  'alteracao',
  'concluido',
] as const;

export const ETAPAS_PROJETO_EXECUTIVO = [
  'aguardando_inicio',
  'projetar_ambientes',
  'projetar_mobiliario',
  'aprovacao_1',
  'detalhamento',
  'aprovacao_2',
  'alteracao',
  'concluido',
] as const;

export const ETAPAS_MEDICAO = [
  'aguardando_medicao',
  'medicao_agendada',
  'medicao_realizada',
  'consolidado_enviado',
  'concluido',
] as const;

// Labels em português para cada etapa
export const ETAPAS_LABELS: Record<string, string> = {
  aguardando_inicio: 'Aguardando Início',
  projetar_ambientes: 'Projetar Ambientes',
  projetar_mobiliario: 'Projetar Mobiliário',
  aprovacao: 'Aprovação',
  renderizar: 'Renderizar',
  montar_apresentacao: 'Montar Apresentação',
  alteracao: 'Alteração',
  concluido: 'Concluído',
  aprovacao_1: 'Aprovação',
  detalhamento: 'Detalhamento',
  aprovacao_2: 'Aprovação Final',
  aguardando_medicao: 'Aguardando Medição',
  medicao_agendada: 'Medição Agendada',
  medicao_realizada: 'Medição Realizada',
  consolidado_enviado: 'Consolidado e Enviado',
};

export interface Ambiente {
  id: string;
  nome: string;
  observacoes?: string;
  etapasConcluidas: Record<string, boolean>;
}

export interface HistoricoItem {
  id: string;
  data: Timestamp;
  etapaDe: string;
  etapaPara: string;
  usuarioId: string;
  usuarioNome: string;
  observacao?: string;
}

export interface Projeto {
  id: string;
  clienteId: string;
  clienteNome: string;
  tipoServico: TipoServico;
  clienteFinal: {
    nome: string;
    telefone?: string;
    email?: string;
    endereco?: {
      cep: string;
      logradouro: string;
      numero: string;
      complemento?: string;
      bairro: string;
      cidade: string;
      estado: string;
    };
  };
  ambientes: Ambiente[];
  etapaAtual: string;
  valorVenda?: number;
  valorFabrica?: number;
  valorCombinado?: number;
  valorCalculado?: number;
  linkGoogleDrive?: string;
  responsaveis: Record<string, string>;
  sla: {
    etapaInicio: Timestamp;
    prazoEtapa: number;
    diasUtilizados: number;
  };
  statusFaturamento: StatusFaturamento;
  faturaId?: string;
  etapaRetornoAlteracao?: string;
  historico: HistoricoItem[];
  observacoes?: string;
  criadoEm: Timestamp;
  atualizadoEm: Timestamp;
  concluidoEm?: Timestamp;
}

// ===== FATURAS =====
export type StatusFatura = 'rascunho' | 'emitida' | 'paga' | 'cancelada' | 'vencida';

export interface FaturaItem {
  projetoId: string;
  clienteFinalNome: string;
  tipoServico: TipoServico;
  ambientes: string[];
  valorVendaOuFabrica: number;
  tipoPrecificacao: string;
  percentualOuValor: number;
  valorCalculado: number;
  dataConclusao: Timestamp;
}

export interface Fatura {
  id: string;
  numero: string;
  clienteId: string;
  clienteNome: string;
  periodoInicio: Timestamp;
  periodoFim: Timestamp;
  itens: FaturaItem[];
  subtotalProjetoVenda: number;
  subtotalProjetoExecutivo: number;
  subtotalMedicao: number;
  valorTotal: number;
  status: StatusFatura;
  dataEmissao?: Timestamp;
  dataVencimento?: Timestamp;
  dataPagamento?: Timestamp;
  observacoes?: string;
  criadoEm: Timestamp;
  atualizadoEm: Timestamp;
}

// ===== CONFIGURAÇÕES =====
export interface Feriado {
  id: string;
  nome: string;
  data: string; // DD/MM
  recorrente: boolean;
  ano?: number;
  ativo: boolean;
}

export interface PermissoesModulo {
  visualizar: boolean;
  criar: boolean;
  editar: boolean;
  excluir: boolean;
}

export interface PermissoesPerfil {
  dashboard: boolean;
  clientes: PermissoesModulo;
  projetos: PermissoesModulo;
  kanbanVenda: { visualizar: boolean; operar: boolean };
  kanbanExecutivo: { visualizar: boolean; operar: boolean };
  kanbanMedicao: { visualizar: boolean; operar: boolean };
  faturamento: { visualizar: boolean; criar: boolean; editar: boolean };
  colaboradores: PermissoesModulo;
  relatorios: boolean;
  configuracoes: boolean;
}

export interface Configuracoes {
  empresa: {
    nome: string;
    cnpj?: string;
    endereco?: string;
    telefone?: string;
    email?: string;
    logoUrl?: string;
  };
  permissoes: Record<PerfilUsuario, PermissoesPerfil>;
  sla: {
    projetoVenda: Record<string, number>;
    projetoExecutivo: Record<string, number>;
    medicao: Record<string, number>;
  };
  feriados: {
    sabadoDiaUtil: boolean;
    feriadosPadrao: Feriado[];
    feriadosCustom: Feriado[];
  };
  tema: 'claro' | 'escuro';
  notificacoes: {
    alertaSLADias: number;
    notificarNovaAtribuicao: boolean;
    notificarEtapaConcluida: boolean;
    notificarSLAProximo: boolean;
    notificarSLAEstourado: boolean;
    notificarFaturaVencida: boolean;
  };
}

// ===== NOTIFICAÇÕES =====
export type TipoNotificacao = 'sla_proximo' | 'sla_estourado' | 'nova_atribuicao' | 'etapa_concluida' | 'fatura_vencida' | 'novo_projeto';

export interface Notificacao {
  id: string;
  usuarioId: string;
  tipo: TipoNotificacao;
  titulo: string;
  mensagem: string;
  lida: boolean;
  projetoId?: string;
  faturaId?: string;
  criadoEm: Timestamp;
}
