import type { FastifyInstance } from 'fastify';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { permissionMiddleware } from '../middleware/permissionMiddleware.js';
import { projetosService } from '../services/projetos.service.js';

export async function projetosRoutes(fastify: FastifyInstance) {
  // All routes require auth
  fastify.addHook('preHandler', authMiddleware);

  // GET /api/projetos — List all projects
  fastify.get('/projetos', {
    preHandler: permissionMiddleware({ modulo: 'projetos', acao: 'visualizar' }),
    handler: async (request, reply) => {
      const { busca, tipoServico, statusFaturamento, clienteId } = request.query as {
        busca?: string;
        tipoServico?: string;
        statusFaturamento?: string;
        clienteId?: string;
      };

      const projetos = await projetosService.listar({ busca, tipoServico, statusFaturamento, clienteId });
      return reply.send(projetos);
    },
  });

  // GET /api/projetos/cliente/:clienteId — List projects by client
  fastify.get('/projetos/cliente/:clienteId', {
    preHandler: permissionMiddleware({ modulo: 'projetos', acao: 'visualizar' }),
    handler: async (request, reply) => {
      const { clienteId } = request.params as { clienteId: string };
      const projetos = await projetosService.listarPorCliente(clienteId);
      return reply.send(projetos);
    },
  });

  // GET /api/projetos/:id — Get by ID
  fastify.get('/projetos/:id', {
    preHandler: permissionMiddleware({ modulo: 'projetos', acao: 'visualizar' }),
    handler: async (request, reply) => {
      const { id } = request.params as { id: string };
      const projeto = await projetosService.buscarPorId(id);

      if (!projeto) {
        return reply.status(404).send({ error: 'Projeto não encontrado' });
      }

      return reply.send(projeto);
    },
  });

  // POST /api/projetos — Create
  fastify.post('/projetos', {
    preHandler: permissionMiddleware({ modulo: 'projetos', acao: 'criar' }),
    handler: async (request, reply) => {
      const data = request.body as any;

      if (!data.clienteId || !data.tipoServico || !data.clienteFinal?.nome) {
        return reply.status(400).send({ error: 'Campos obrigatórios não preenchidos' });
      }

      const id = await projetosService.criar(data);
      return reply.status(201).send({ id });
    },
  });

  // PUT /api/projetos/:id — Update
  fastify.put('/projetos/:id', {
    preHandler: permissionMiddleware({ modulo: 'projetos', acao: 'editar' }),
    handler: async (request, reply) => {
      const { id } = request.params as { id: string };
      const data = request.body as any;

      const existing = await projetosService.buscarPorId(id);
      if (!existing) {
        return reply.status(404).send({ error: 'Projeto não encontrado' });
      }

      await projetosService.atualizar(id, data);
      return reply.send({ success: true });
    },
  });
}
