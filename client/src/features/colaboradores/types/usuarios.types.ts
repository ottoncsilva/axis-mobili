export type PerfilUsuario = 'admin' | 'projetista' | 'medidor' | 'financeiro';

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  perfil: PerfilUsuario;
  telefone?: string;
  ativo: boolean;
  criadoEm?: Date;
  atualizadoEm?: Date;
}

export interface UsuarioFormData {
  nome: string;
  email: string;
  perfil: PerfilUsuario;
  telefone?: string;
}

export interface CriarUsuarioResponse extends Usuario {
  senhaTemporaria?: string;
}
