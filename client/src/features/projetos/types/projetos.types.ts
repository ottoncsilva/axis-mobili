import type { TipoServico, StatusFaturamento } from '@/types/global.types';

export interface AmbienteFormData {
  nome: string;
  observacoes?: string;
}

export interface ClienteFinalFormData {
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
}

export interface ProjetoFormData {
  clienteId: string;
  clienteNome: string;
  tipoServico: TipoServico;
  clienteFinal: ClienteFinalFormData;
  ambientes: AmbienteFormData[];
  valorVenda?: number;
  valorFabrica?: number;
  valorCombinado?: number;
  linkGoogleDrive?: string;
  observacoes?: string;
}

export interface ProjetosFiltros {
  busca: string;
  tipoServico: TipoServico | 'todos';
  statusFaturamento: StatusFaturamento | 'todos';
}
