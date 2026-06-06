import bcrypt from 'bcryptjs';
import { adminDb, FieldValue } from '../config/firebase-admin.js';

export interface CriarUsuarioData {
  email: string;
  nome: string;
  perfil: 'admin' | 'projetista' | 'medidor' | 'financeiro';
  telefone?: string;
  ativo?: boolean;
}

export interface AtualizarUsuarioData {
  nome?: string;
  perfil?: string;
  telefone?: string;
  ativo?: boolean;
}

export class UsuariosService {
  async listar() {
    const snapshot = await adminDb
      .collection('usuarios')
      .orderBy('nome')
      .get();
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      senhaHash: undefined, // never expose password hash
    }));
  }

  async buscarPorId(usuarioId: string) {
    const doc = await adminDb.collection('usuarios').doc(usuarioId).get();
    if (!doc.exists) return null;
    const data = doc.data() as any;
    return {
      id: doc.id,
      ...data,
      senhaHash: undefined,
    };
  }

  async buscarPorEmail(email: string) {
    const snapshot = await adminDb
      .collection('usuarios')
      .where('email', '==', email)
      .get();
    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    const data = doc.data() as any;
    return {
      id: doc.id,
      ...data,
      senhaHash: undefined,
    };
  }

  async criar(data: CriarUsuarioData) {
    // Check if email already exists
    const existing = await this.buscarPorEmail(data.email);
    if (existing) {
      throw new Error('Email já está cadastrado');
    }

    // Generate temporary password: "Usuario123"
    const senhaTemp = 'Usuario123';
    const senhaHash = await bcrypt.hash(senhaTemp, 10);

    const now = new Date();
    const docRef = await adminDb.collection('usuarios').add({
      email: data.email,
      nome: data.nome,
      perfil: data.perfil,
      telefone: data.telefone || null,
      senhaHash,
      ativo: data.ativo !== false,
      criadoEm: now,
      atualizadoEm: now,
    });

    return {
      id: docRef.id,
      email: data.email,
      nome: data.nome,
      perfil: data.perfil,
      telefone: data.telefone || null,
      ativo: data.ativo !== false,
      senhaTemporaria: senhaTemp,
    };
  }

  async atualizar(usuarioId: string, data: AtualizarUsuarioData) {
    const usuario = await this.buscarPorId(usuarioId);
    if (!usuario) {
      throw new Error('Usuário não encontrado');
    }

    const updateData: Record<string, any> = {
      atualizadoEm: new Date(),
    };

    if (data.nome !== undefined) updateData.nome = data.nome;
    if (data.perfil !== undefined) updateData.perfil = data.perfil;
    if (data.telefone !== undefined) updateData.telefone = data.telefone || null;
    if (data.ativo !== undefined) updateData.ativo = data.ativo;

    await adminDb.collection('usuarios').doc(usuarioId).update(updateData);
  }

  async toggleAtivo(usuarioId: string, ativo: boolean) {
    const usuario = await this.buscarPorId(usuarioId);
    if (!usuario) {
      throw new Error('Usuário não encontrado');
    }

    await adminDb.collection('usuarios').doc(usuarioId).update({
      ativo,
      atualizadoEm: new Date(),
    });
  }

  async excluir(usuarioId: string) {
    const usuario = await this.buscarPorId(usuarioId);
    if (!usuario) {
      throw new Error('Usuário não encontrado');
    }

    await adminDb.collection('usuarios').doc(usuarioId).delete();
  }
}

export default new UsuariosService();
