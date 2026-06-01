import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../config/firebase.js';

const JWT_SECRET = process.env.JWT_SECRET || 'axis-mobili-secret-key';
const TOKEN_EXPIRY = '7d';

export interface TokenPayload {
  userId: string;
  email: string;
  perfil: string;
}

export class AuthService {
  async login(email: string, senha: string) {
    const usuariosRef = db.collection('usuarios');
    const snapshot = await usuariosRef.where('email', '==', email).get();

    if (snapshot.empty) {
      throw new Error('Usuário não encontrado');
    }

    const usuarioDoc = snapshot.docs[0];
    const usuario = usuarioDoc.data() as any;

    if (!usuario.ativo) {
      throw new Error('Usuário inativo');
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senhaHash);

    if (!senhaValida) {
      throw new Error('Senha incorreta');
    }

    const token = jwt.sign(
      {
        userId: usuarioDoc.id,
        email: usuario.email,
        perfil: usuario.perfil,
      },
      JWT_SECRET,
      { expiresIn: TOKEN_EXPIRY }
    );

    return {
      token,
      usuario: {
        id: usuarioDoc.id,
        email: usuario.email,
        nome: usuario.nome,
        perfil: usuario.perfil,
      },
    };
  }

  async alterarSenha(userId: string, senhaAtual: string, novaSenha: string) {
    const usuarioDoc = await db.collection('usuarios').doc(userId).get();

    if (!usuarioDoc.exists) {
      throw new Error('Usuário não encontrado');
    }

    const usuario = usuarioDoc.data() as any;
    const senhaValida = await bcrypt.compare(senhaAtual, usuario.senhaHash);

    if (!senhaValida) {
      throw new Error('Senha atual incorreta');
    }

    const novoHash = await bcrypt.hash(novaSenha, 10);

    await db.collection('usuarios').doc(userId).update({
      senhaHash: novoHash,
      atualizadoEm: new Date(),
    });

    return { mensagem: 'Senha alterada com sucesso' };
  }

  async resetarSenha(userId: string) {
    const senhaAberta = 'usuario123';
    const novoHash = await bcrypt.hash(senhaAberta, 10);

    await db.collection('usuarios').doc(userId).update({
      senhaHash: novoHash,
      atualizadoEm: new Date(),
    });

    return { mensagem: `Senha resetada para: ${senhaAberta}` };
  }

  verifyToken(token: string): TokenPayload {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
      return decoded;
    } catch (error) {
      throw new Error('Token inválido ou expirado');
    }
  }

  async criarAdminPadrao() {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminSenha = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminSenha) {
      console.log('⚠️ ADMIN_EMAIL e ADMIN_PASSWORD não configurados');
      return;
    }

    const usuariosRef = db.collection('usuarios');
    const snapshot = await usuariosRef.where('email', '==', adminEmail).get();

    if (!snapshot.empty) {
      console.log('✅ Admin já existe');
      return;
    }

    const senhaHash = await bcrypt.hash(adminSenha, 10);
    const agora = new Date();

    await usuariosRef.add({
      email: adminEmail,
      nome: 'Administrador',
      perfil: 'admin',
      senhaHash,
      ativo: true,
      criadoEm: agora,
      atualizadoEm: agora,
    });

    console.log(`✅ Admin criado: ${adminEmail}`);
  }
}

export default new AuthService();
