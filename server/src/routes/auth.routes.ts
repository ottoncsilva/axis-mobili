import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import authService from '../services/auth.service.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { adminDb } from '../config/firebase-admin.js';

export async function usuariosRoutes(app: FastifyInstance) {
  app.get('/usuarios', { onRequest: authMiddleware }, async (_request: FastifyRequest, reply: FastifyReply) => {
    const snapshot = await adminDb.collection('usuarios')
      .where('ativo', '==', true)
      .orderBy('nome')
      .get();
    const usuarios = snapshot.docs.map((doc) => ({
      id: doc.id,
      nome: doc.data().nome,
      email: doc.data().email,
      perfil: doc.data().perfil,
    }));
    return reply.send(usuarios);
  });
}

export async function authRoutes(app: FastifyInstance) {
  app.post<{ Body: { email: string; senha: string } }>(
    '/login',
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { email, senha } = request.body as { email: string; senha: string };

        if (!email || !senha) {
          return reply.status(400).send({
            erro: 'Email e senha são obrigatórios',
          });
        }

        const result = await authService.login(email, senha);
        return reply.send(result);
      } catch (error: any) {
        return reply.status(401).send({
          erro: error.message,
        });
      }
    }
  );

  app.post<{ Body: { senhaAtual: string; novaSenha: string } }>(
    '/alterar-senha',
    { onRequest: authMiddleware },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const userId = (request as any).userId;
        const { senhaAtual, novaSenha } = request.body as { senhaAtual: string; novaSenha: string };

        if (!senhaAtual || !novaSenha) {
          return reply.status(400).send({
            erro: 'Senha atual e nova senha são obrigatórias',
          });
        }

        if (novaSenha.length < 6) {
          return reply.status(400).send({
            erro: 'Nova senha deve ter no mínimo 6 caracteres',
          });
        }

        const result = await authService.alterarSenha(userId, senhaAtual, novaSenha);
        return reply.send(result);
      } catch (error: any) {
        return reply.status(400).send({
          erro: error.message,
        });
      }
    }
  );

  app.post<{ Params: { usuarioId: string } }>(
    '/resetar-senha/:usuarioId',
    { onRequest: authMiddleware },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const userPerfil = (request as any).userPerfil;

        if (userPerfil !== 'admin') {
          return reply.status(403).send({
            erro: 'Apenas admins podem resetar senhas',
          });
        }

        const { usuarioId } = request.params as { usuarioId: string };
        const result = await authService.resetarSenha(usuarioId);
        return reply.send(result);
      } catch (error: any) {
        return reply.status(400).send({
          erro: error.message,
        });
      }
    }
  );

  app.get('/me', { onRequest: authMiddleware }, async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = (request as any).userId;
    const userEmail = (request as any).userEmail;
    const userPerfil = (request as any).userPerfil;

    return reply.send({
      id: userId,
      email: userEmail,
      perfil: userPerfil,
    });
  });

}
