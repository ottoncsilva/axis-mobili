import type { FastifyInstance } from 'fastify';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { permissionMiddleware } from '../middleware/permissionMiddleware.js';
import { configuracoesService } from '../services/configuracoes.service.js';

export async function configuracoesRoutes(fastify: FastifyInstance) {
  // All routes require auth
  fastify.addHook('preHandler', authMiddleware);

  // GET /api/configuracoes — Get all configurations
  fastify.get('/configuracoes', {
    preHandler: permissionMiddleware({ modulo: 'configuracoes', acao: 'visualizar' }),
    handler: async (request, reply) => {
      const config = await configuracoesService.getConfiguracoes();
      return reply.send(config);
    },
  });

  // GET /api/configuracoes/etapas — Get stage configurations
  fastify.get('/configuracoes/etapas', {
    handler: async (request, reply) => {
      const etapas = await configuracoesService.getEtapas();
      return reply.send(etapas);
    },
  });

  // PUT /api/configuracoes/etapas — Update stage configurations
  fastify.put('/configuracoes/etapas', {
    preHandler: permissionMiddleware({ modulo: 'configuracoes', acao: 'editar' }),
    handler: async (request, reply) => {
      const data = request.body as any;
      await configuracoesService.updateEtapas(data);
      return reply.send({ success: true });
    },
  });

  // GET /api/configuracoes/permissoes — Get permission configurations
  fastify.get('/configuracoes/permissoes', {
    preHandler: permissionMiddleware({ modulo: 'configuracoes', acao: 'visualizar' }),
    handler: async (request, reply) => {
      const permissoes = await configuracoesService.getPermissoes();
      return reply.send(permissoes);
    },
  });

  // PUT /api/configuracoes/permissoes — Update permission configurations
  fastify.put('/configuracoes/permissoes', {
    preHandler: permissionMiddleware({ modulo: 'configuracoes', acao: 'editar' }),
    handler: async (request, reply) => {
      const data = request.body as any;
      await configuracoesService.updatePermissoes(data);
      return reply.send({ success: true });
    },
  });

  // GET /api/configuracoes/notificacoes — Get notification configurations
  fastify.get('/configuracoes/notificacoes', {
    preHandler: permissionMiddleware({ modulo: 'configuracoes', acao: 'visualizar' }),
    handler: async (request, reply) => {
      const notificacoes = await configuracoesService.getNotificacoes();
      return reply.send(notificacoes);
    },
  });

  // PUT /api/configuracoes/notificacoes — Update notification configurations
  fastify.put('/configuracoes/notificacoes', {
    preHandler: permissionMiddleware({ modulo: 'configuracoes', acao: 'editar' }),
    handler: async (request, reply) => {
      const data = request.body as any;
      await configuracoesService.updateNotificacoes(data);
      return reply.send({ success: true });
    },
  });
}
