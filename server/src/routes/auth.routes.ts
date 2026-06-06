import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import authService from '../services/auth.service.js';
import usuariosService from '../services/usuarios.service.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { permissionMiddleware } from '../middleware/permissionMiddleware.js';
import { adminDb } from '../config/firebase-admin.js';

export async function usuariosRoutes(app: FastifyInstance) {
  // GET /usuarios — list all users (only active for dropdowns, all for admin)
  app.get('/usuarios', { onRequest: authMiddleware }, async (request: FastifyRequest, reply: FastifyReply) => {
    const userPerfil = (request as any).userPerfil;
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

  // GET /usuarios/:id — get user by ID
  app.get<{ Params: { id: string } }>('/usuarios/:id', { onRequest: [authMiddleware, permissionMiddleware] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const userPermissoes = (request as any).userPermissoes;
    if (!userPermissoes?.colaboradores?.visualizar) {
      return reply.status(403).send({ erro: 'Acesso negado' });
    }
    const usuario = await usuariosService.buscarPorId(request.params.id);
    if (!usuario) {
      return reply.status(404).send({ erro: 'Usuário não encontrado' });
    }
    return reply.send(usuario);
  });

  // POST /usuarios/admin/listar — list all users (admin only, includes inactive)
  app.post<{ Body: { filtro?: { busca?: string; perfil?: string; ativo?: boolean } } }>('/usuarios/admin/listar', { onRequest: [authMiddleware, permissionMiddleware] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const userPermissoes = (request as any).userPermissoes;
    if (!userPermissoes?.colaboradores?.visualizar) {
      return reply.status(403).send({ erro: 'Acesso negado' });
    }

    let snapshot = await adminDb.collection('usuarios').orderBy('nome').get();
    let usuarios = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      senhaHash: undefined,
    }));

    const { filtro } = request.body || {};
    if (filtro?.busca) {
      const busca = filtro.busca.toLowerCase();
      usuarios = usuarios.filter((u: any) =>
        u.nome?.toLowerCase().includes(busca) ||
        u.email?.toLowerCase().includes(busca)
      );
    }
    if (filtro?.perfil) {
      usuarios = usuarios.filter((u: any) => u.perfil === filtro.perfil);
    }
    if (filtro?.ativo !== undefined) {
      usuarios = usuarios.filter((u: any) => u.ativo === filtro.ativo);
    }

    return reply.send(usuarios);
  });

  // POST /usuarios — create new user
  app.post<{ Body: { email: string; nome: string; perfil: string; telefone?: string } }>('/usuarios', { onRequest: [authMiddleware, permissionMiddleware] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const userPermissoes = (request as any).userPermissoes;
    if (!userPermissoes?.colaboradores?.criar) {
      return reply.status(403).send({ erro: 'Acesso negado' });
    }

    try {
      const { email, nome, perfil, telefone } = request.body;
      const usuario = await usuariosService.criar({ email, nome, perfil, telefone });
      return reply.status(201).send(usuario);
    } catch (error: any) {
      return reply.status(400).send({ erro: error.message });
    }
  });

  // PUT /usuarios/:id — update user
  app.put<{ Params: { id: string }; Body: { nome?: string; perfil?: string; telefone?: string; ativo?: boolean } }>('/usuarios/:id', { onRequest: [authMiddleware, permissionMiddleware] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const userPermissoes = (request as any).userPermissoes;
    if (!userPermissoes?.colaboradores?.editar) {
      return reply.status(403).send({ erro: 'Acesso negado' });
    }

    try {
      const { id } = request.params;
      await usuariosService.atualizar(id, request.body);
      const usuario = await usuariosService.buscarPorId(id);
      return reply.send(usuario);
    } catch (error: any) {
      return reply.status(400).send({ erro: error.message });
    }
  });

  // DELETE /usuarios/:id — delete user
  app.delete<{ Params: { id: string } }>('/usuarios/:id', { onRequest: [authMiddleware, permissionMiddleware] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const userPermissoes = (request as any).userPermissoes;
    if (!userPermissoes?.colaboradores?.excluir) {
      return reply.status(403).send({ erro: 'Acesso negado' });
    }

    try {
      const userId = (request as any).userId;
      if (request.params.id === userId) {
        return reply.status(400).send({ erro: 'Não é possível excluir a si mesmo' });
      }
      await usuariosService.excluir(request.params.id);
      return reply.send({ mensagem: 'Usuário excluído com sucesso' });
    } catch (error: any) {
      return reply.status(400).send({ erro: error.message });
    }
  });

  // PUT /usuarios/:id/toggle-ativo — toggle user active status
  app.put<{ Params: { id: string }; Body: { ativo: boolean } }>('/usuarios/:id/toggle-ativo', { onRequest: [authMiddleware, permissionMiddleware] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const userPermissoes = (request as any).userPermissoes;
    if (!userPermissoes?.colaboradores?.editar) {
      return reply.status(403).send({ erro: 'Acesso negado' });
    }

    try {
      const userId = (request as any).userId;
      if (request.params.id === userId && !request.body.ativo) {
        return reply.status(400).send({ erro: 'Não é possível desativar a si mesmo' });
      }
      await usuariosService.toggleAtivo(request.params.id, request.body.ativo);
      const usuario = await usuariosService.buscarPorId(request.params.id);
      return reply.send(usuario);
    } catch (error: any) {
      return reply.status(400).send({ erro: error.message });
    }
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
