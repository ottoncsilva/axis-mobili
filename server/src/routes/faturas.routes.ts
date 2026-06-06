import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { permissionMiddleware } from '../middleware/permissionMiddleware.js';
import faturasService from '../services/faturas.service.js';

export async function faturasRoutes(app: FastifyInstance) {
  // All routes require auth
  app.addHook('preHandler', authMiddleware);

  // GET /api/faturas — List invoices
  app.get(
    '/faturas',
    {
      preHandler: permissionMiddleware({ modulo: 'faturamento', acao: 'visualizar' }),
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { clienteId, status } = request.query as any;
      const faturas = await faturasService.listar({ clienteId, status });
      return reply.send(faturas);
    }
  );

  // GET /api/faturas/:id — Get invoice by ID
  app.get<{ Params: { id: string } }>(
    '/faturas/:id',
    {
      preHandler: permissionMiddleware({ modulo: 'faturamento', acao: 'visualizar' }),
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const fatura = await faturasService.buscarPorId(request.params.id);
      if (!fatura) {
        return reply.status(404).send({ erro: 'Fatura não encontrada' });
      }
      return reply.send(fatura);
    }
  );

  // POST /api/faturas — Create invoice
  app.post<{ Body: any }>(
    '/faturas',
    {
      preHandler: permissionMiddleware({ modulo: 'faturamento', acao: 'criar' }),
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { clienteId, projetosIds, tipo, periodoInicio, periodoFim, percentualEntrada, observacoes } =
          request.body;

        const fatura = await faturasService.criar({
          clienteId,
          projetosIds,
          tipo,
          periodoInicio: periodoInicio ? new Date(periodoInicio) : undefined,
          periodoFim: periodoFim ? new Date(periodoFim) : undefined,
          percentualEntrada,
          observacoes,
        });

        return reply.status(201).send(fatura);
      } catch (error: any) {
        return reply.status(400).send({ erro: error.message });
      }
    }
  );

  // PUT /api/faturas/:id — Update invoice
  app.put<{ Params: { id: string }; Body: any }>(
    '/faturas/:id',
    {
      preHandler: permissionMiddleware({ modulo: 'faturamento', acao: 'editar' }),
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { status, dataVencimento, dataPagamento, observacoes } = request.body;
        await faturasService.atualizar(request.params.id, {
          status,
          dataVencimento: dataVencimento ? new Date(dataVencimento) : undefined,
          dataPagamento: dataPagamento ? new Date(dataPagamento) : undefined,
          observacoes,
        });

        const fatura = await faturasService.buscarPorId(request.params.id);
        return reply.send(fatura);
      } catch (error: any) {
        return reply.status(400).send({ erro: error.message });
      }
    }
  );

  // DELETE /api/faturas/:id — Delete invoice
  app.delete<{ Params: { id: string } }>(
    '/faturas/:id',
    {
      preHandler: permissionMiddleware({ modulo: 'faturamento', acao: 'editar' }),
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        await faturasService.excluir(request.params.id);
        return reply.send({ mensagem: 'Fatura excluída com sucesso' });
      } catch (error: any) {
        return reply.status(400).send({ erro: error.message });
      }
    }
  );

  // POST /api/faturas/:id/emitir — Emit invoice (change status to 'emitida')
  app.post<{ Params: { id: string } }>(
    '/faturas/:id/emitir',
    {
      preHandler: permissionMiddleware({ modulo: 'faturamento', acao: 'editar' }),
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        await faturasService.emitir(request.params.id);
        const fatura = await faturasService.buscarPorId(request.params.id);
        return reply.send(fatura);
      } catch (error: any) {
        return reply.status(400).send({ erro: error.message });
      }
    }
  );

  // POST /api/faturas/:id/pagar — Mark invoice as paid
  app.post<{ Params: { id: string }; Body: { dataPagamento?: string } }>(
    '/faturas/:id/pagar',
    {
      preHandler: permissionMiddleware({ modulo: 'faturamento', acao: 'editar' }),
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const dataPagamento = request.body?.dataPagamento ? new Date(request.body.dataPagamento) : new Date();
        await faturasService.registrarPagamento(request.params.id, dataPagamento);
        const fatura = await faturasService.buscarPorId(request.params.id);
        return reply.send(fatura);
      } catch (error: any) {
        return reply.status(400).send({ erro: error.message });
      }
    }
  );

  // POST /api/faturas/:id/cancelar — Cancel invoice
  app.post<{ Params: { id: string } }>(
    '/faturas/:id/cancelar',
    {
      preHandler: permissionMiddleware({ modulo: 'faturamento', acao: 'editar' }),
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        await faturasService.cancelar(request.params.id);
        const fatura = await faturasService.buscarPorId(request.params.id);
        return reply.send(fatura);
      } catch (error: any) {
        return reply.status(400).send({ erro: error.message });
      }
    }
  );
}
