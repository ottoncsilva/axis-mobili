import type { FastifyRequest, FastifyReply } from 'fastify';
import { adminDb } from '../config/firebase-admin.js';
import type { AuthenticatedRequest } from './authMiddleware.js';

interface PermissionOptions {
  modulo: string;
  acao: string;
}

export function permissionMiddleware(options: PermissionOptions) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const authRequest = request as AuthenticatedRequest;
    const perfil = authRequest.userPerfil;

    if (!perfil) {
      return reply.status(403).send({
        error: 'Acesso negado',
        message: 'Perfil do usuário não encontrado.',
      });
    }

    // Admin always has access
    if (perfil === 'admin') return;

    try {
      const configDoc = await adminDb.collection('configuracoes').doc('geral').get();
      if (!configDoc.exists) {
        return reply.status(500).send({
          error: 'Erro interno',
          message: 'Configurações do sistema não encontradas.',
        });
      }

      const config = configDoc.data()!;
      const permissoes = config.permissoes?.[perfil];

      if (!permissoes) {
        return reply.status(403).send({
          error: 'Acesso negado',
          message: 'Permissões não configuradas para seu perfil.',
        });
      }

      const moduloPermissoes = permissoes[options.modulo];

      if (moduloPermissoes === undefined) {
        return reply.status(403).send({
          error: 'Acesso negado',
          message: `Sem permissão para acessar ${options.modulo}.`,
        });
      }

      // Boolean permission (dashboard, relatorios, configuracoes)
      if (typeof moduloPermissoes === 'boolean') {
        if (!moduloPermissoes) {
          return reply.status(403).send({
            error: 'Acesso negado',
            message: `Sem permissão para acessar ${options.modulo}.`,
          });
        }
        return;
      }

      // Object permission
      if (typeof moduloPermissoes === 'object') {
        const hasPermission = moduloPermissoes[options.acao];
        if (!hasPermission) {
          return reply.status(403).send({
            error: 'Acesso negado',
            message: `Sem permissão para ${options.acao} em ${options.modulo}.`,
          });
        }
        return;
      }

      return reply.status(403).send({
        error: 'Acesso negado',
        message: 'Permissão não reconhecida.',
      });
    } catch (error) {
      return reply.status(500).send({
        error: 'Erro interno',
        message: 'Erro ao verificar permissões.',
      });
    }
  };
}
