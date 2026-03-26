import type { TipoPrecificacao, Contato } from '@/types/global.types';

export interface ContatoFormData {
  nome: string;
  cargo: string;
  email?: string;
  telefone: string;
  whatsapp?: string;
  principal: boolean;
}

export interface ClienteFormData {
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
  contatos: ContatoFormData[];
  precificacao: {
    projetoVenda: { tipo: TipoPrecificacao; valor: number };
    projetoExecutivo: { tipo: TipoPrecificacao; valor: number };
    medicao: { tipo: TipoPrecificacao; valor: number };
  };
  observacoes?: string;
}

export interface ClientesFiltros {
  busca: string;
  status: 'todos' | 'ativo' | 'inativo';
}
