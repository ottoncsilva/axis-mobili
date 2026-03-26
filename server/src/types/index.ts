// Server-side type definitions
// These mirror the client types for use in backend services

export type PerfilUsuario = 'admin' | 'projetista' | 'medidor' | 'financeiro';
export type TipoServico = 'projeto_venda' | 'projeto_executivo' | 'medicao';
export type StatusFaturamento = 'em_andamento' | 'pronto_para_faturar' | 'faturado';
export type StatusFatura = 'rascunho' | 'emitida' | 'paga' | 'cancelada' | 'vencida';
export type TipoPrecificacao = 'percentual_venda' | 'percentual_fabrica' | 'valor_combinado' | 'valor_fixo_ambiente';
export type TipoNotificacao = 'sla_proximo' | 'sla_estourado' | 'nova_atribuicao' | 'etapa_concluida' | 'fatura_vencida' | 'novo_projeto';

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  perfil: PerfilUsuario;
  ativo: boolean;
  telefone?: string;
  avatarUrl?: string;
}

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

export interface Feriado {
  id: string;
  nome: string;
  data: string;
  recorrente: boolean;
  ano?: number;
  ativo: boolean;
}

export interface ConfigFeriados {
  sabadoDiaUtil: boolean;
  feriadosPadrao: Feriado[];
  feriadosCustom: Feriado[];
}
