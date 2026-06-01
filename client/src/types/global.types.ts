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
  responsabilidades?: string[]; // IDs de projetos que o usuário é responsável
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

export interface ConfigFaturamento {
  tipo: 'mensal' | 'por_projeto';
  percentualEntrada?: number; // Ex: 50 (para 50%)
  diaFaturamento?: number; // Dia do mês para faturamento mensal (1-31)
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
  faturamento: ConfigFaturamento;
  observacoes?: string;
  ativo: boolean;
  criadoEm: Timestamp;
  atualizadoEm: Timestamp;
}

// ===== CONFIGURAÇÕES DE ETAPAS =====
export interface EtapaConfig {
  id: string;
  nome: string;
  label: string;
  ordem: number;
  sla: number; // em dias úteis
  responsavelPadrao?: string; // UID do responsável padrão
}

export interface ConfigEtapas {
  projetoVenda: EtapaConfig[];
  projetoExecutivo: EtapaConfig[];
  medicao: EtapaConfig[];
}

// Modelos padrão (sugestão)
export const ETAPAS_PADRAO_VENDA: EtapaConfig[] = [
  { id: 'aguardando_inicio', nome: 'aguardando_inicio', label: 'Aguardando Início', ordem: 1, sla: 1 },
  { id: 'projetar_ambientes', nome: 'projetar_ambientes', label: 'Projetar Ambientes', ordem: 2, sla: 5 },
  { id: 'projetar_mobiliario', nome: 'projetar_mobiliario', label: 'Projetar Mobiliário', ordem: 3, sla: 5 },
  { id: 'aprovacao', nome: 'aprovacao', label: 'Aprovação', ordem: 4, sla: 3 },
  { id: 'renderizar', nome: 'renderizar', label: 'Renderizar', ordem: 5, sla: 3 },
  { id: 'montar_apresentacao', nome: 'montar_apresentacao', label: 'Montar Apresentação', ordem: 6, sla: 2 },
  { id: 'alteracao', nome: 'alteracao', label: 'Alteração', ordem: 7, sla: 5 },
  { id: 'concluido', nome: 'concluido', label: 'Concluído', ordem: 8, sla: 0 },
];

export const ETAPAS_PADRAO_EXECUTIVO: EtapaConfig[] = [
  { id: 'aguardando_inicio', nome: 'aguardando_inicio', label: 'Aguardando Início', ordem: 1, sla: 1 },
  { id: 'projetar_ambientes', nome: 'projetar_ambientes', label: 'Projetar Ambientes', ordem: 2, sla: 5 },
  { id: 'projetar_mobiliario', nome: 'projetar_mobiliario', label: 'Projetar Mobiliário', ordem: 3, sla: 5 },
  { id: 'aprovacao_1', nome: 'aprovacao_1', label: 'Aprovação', ordem: 4, sla: 3 },
  { id: 'detalhamento', nome: 'detalhamento', label: 'Detalhamento', ordem: 5, sla: 5 },
  { id: 'aprovacao_2', nome: 'aprovacao_2', label: 'Aprovação Final', ordem: 6, sla: 3 },
  { id: 'alteracao', nome: 'alteracao', label: 'Alteração', ordem: 7, sla: 5 },
  { id: 'concluido', nome: 'concluido', label: 'Concluído', ordem: 8, sla: 0 },
];

export const ETAPAS_PADRAO_MEDICAO: EtapaConfig[] = [
  { id: 'aguardando_medicao', nome: 'aguardando_medicao', label: 'Aguardando Medição', ordem: 1, sla: 3 },
  { id: 'medicao_agendada', nome: 'medicao_agendada', label: 'Medição Agendada', ordem: 2, sla: 5 },
  { id: 'medicao_realizada', nome: 'medicao_realizada', label: 'Medição Realizada', ordem: 3, sla: 2 },
  { id: 'consolidado_enviado', nome: 'consolidado_enviado', label: 'Consolidado e Enviado', ordem: 4, sla: 1 },
  { id: 'concluido', nome: 'concluido', label: 'Concluído', ordem: 5, sla: 0 },
];

// ===== PROJETOS =====
export type TipoServico = 'projeto_venda' | 'projeto_executivo' | 'medicao';
export type StatusFaturamento = 'em_andamento' | 'pronto_para_faturar' | 'faturado';

// Etapas do Kanban (mantém os antigos para compatibilidade)
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

export interface Etapa {
  id: string;
  nome: string;
  label: string;
  ordem: number;
  status: 'pendente' | 'em_progresso' | 'concluido';
  responsavel?: {
    uid: string;
    nome: string;
    email: string;
  };
  sla: number; // dias úteis
  dataInicio?: Timestamp;
  dataFim?: Timestamp;
  diasUtilizados?: number;
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
  etapas: Etapa[]; // Etapas dinâmicas com responsáveis
  etapaAtual: string;
  valorVenda?: number;
  valorFabrica?: number;
  valorCombinado?: number;
  valorCalculado?: number;
  linkGoogleDrive?: string;
  statusFaturamento: StatusFaturamento;
  faturaId?: string;
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
  tipo: 'mensal' | 'por_projeto';
  projetosIds: string[]; // IDs dos projetos inclusos
  periodoInicio: Timestamp;
  periodoFim: Timestamp;
  itens: FaturaItem[];
  subtotalProjetoVenda: number;
  subtotalProjetoExecutivo: number;
  subtotalMedicao: number;
  percentualEntrada?: number; // Ex: 50 (para 50%)
  valorEntrada?: number;
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

export interface ConfigEvolutionAPI {
  ativo: boolean;
  apiUrl: string;
  apiKey: string;
  instancia: string;
  telefonesAlerta: string[]; // Números pra receber alertas
}

export interface ConfigNotificacoes {
  alertaSLADias: number; // Dias antes de vencer para alertar
  notificarNovaAtribuicao: boolean;
  notificarEtapaConcluida: boolean;
  notificarSLAProximo: boolean;
  notificarSLAEstourado: boolean;
  notificarFaturaVencida: boolean;
  evolution: ConfigEvolutionAPI; // Integração com EvolutionAPI
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
  etapas: ConfigEtapas; // Configurações de etapas por tipo de projeto
  feriados: {
    sabadoDiaUtil: boolean;
    feriadosPadrao: Feriado[];
    feriadosCustom: Feriado[];
  };
  tema: 'claro' | 'escuro';
  notificacoes: ConfigNotificacoes;
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
