import type { FastifyInstance } from 'fastify';
import { adminDb } from '../config/firebase-admin.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { permissionMiddleware } from '../middleware/permissionMiddleware.js';
import { FieldValue } from 'firebase-admin/firestore';

export async function clientesRoutes(fastify: FastifyInstance) {
  // All routes require auth
  fastify.addHook('preHandler', authMiddleware);

  // GET /api/clientes — List all clients
  fastify.get('/clientes', {
    preHandler: permissionMiddleware({ modulo: 'clientes', acao: 'visualizar' }),
    handler: async (request, reply) => {
      const { busca, status } = request.query as { busca?: string; status?: string };
      let query = adminDb.collection('clientes').orderBy('nomeFantasia');

      const snapshot = await query.get();
      let clientes = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      // Server-side filtering
      if (status && status !== 'todos') {
        const isAtivo = status === 'ativo';
        clientes = clientes.filter((c: any) => c.ativo === isAtivo);
      }

      if (busca) {
        const buscaLower = busca.toLowerCase();
        clientes = clientes.filter((c: any) =>
          c.nomeFantasia?.toLowerCase().includes(buscaLower) ||
          c.razaoSocial?.toLowerCase().includes(buscaLower) ||
          c.cnpj?.includes(busca.replace(/\D/g, '')) ||
          c.endereco?.cidade?.toLowerCase().includes(buscaLower)
        );
      }

      return reply.send(clientes);
    },
  });

  // GET /api/clientes/select — Simplified list for dropdowns
  fastify.get('/clientes/select', {
    preHandler: permissionMiddleware({ modulo: 'clientes', acao: 'visualizar' }),
    handler: async (request, reply) => {
      const snapshot = await adminDb.collection('clientes')
        .where('ativo', '==', true)
        .orderBy('nomeFantasia')
        .get();

      const clientes = snapshot.docs.map((doc) => ({
        id: doc.id,
        nomeFantasia: doc.data().nomeFantasia,
      }));

      return reply.send(clientes);
    },
  });

  // GET /api/clientes/:id — Get by ID
  fastify.get('/clientes/:id', {
    preHandler: permissionMiddleware({ modulo: 'clientes', acao: 'visualizar' }),
    handler: async (request, reply) => {
      const { id } = request.params as { id: string };
      const doc = await adminDb.collection('clientes').doc(id).get();

      if (!doc.exists) {
        return reply.status(404).send({ error: 'Cliente não encontrado' });
      }

      return reply.send({ id: doc.id, ...doc.data() });
    },
  });

  // POST /api/clientes — Create
  fastify.post('/clientes', {
    preHandler: permissionMiddleware({ modulo: 'clientes', acao: 'criar' }),
    handler: async (request, reply) => {
      const data = request.body as any;

      // Check unique CNPJ
      const cnpjClean = (data.cnpj || '').replace(/\D/g, '');
      if (cnpjClean) {
        const existing = await adminDb.collection('clientes')
          .where('cnpj', '==', cnpjClean)
          .get();
        if (!existing.empty) {
          return reply.status(400).send({ error: 'CNPJ já cadastrado' });
        }
      }

      const now = FieldValue.serverTimestamp();
      const docData = {
        ...data,
        cnpj: cnpjClean,
        ativo: true,
        criadoEm: now,
        atualizadoEm: now,
      };

      const docRef = await adminDb.collection('clientes').add(docData);
      return reply.status(201).send({ id: docRef.id });
    },
  });

  // PUT /api/clientes/:id — Update
  fastify.put('/clientes/:id', {
    preHandler: permissionMiddleware({ modulo: 'clientes', acao: 'editar' }),
    handler: async (request, reply) => {
      const { id } = request.params as { id: string };
      const data = request.body as any;

      const doc = await adminDb.collection('clientes').doc(id).get();
      if (!doc.exists) {
        return reply.status(404).send({ error: 'Cliente não encontrado' });
      }

      await adminDb.collection('clientes').doc(id).update({
        ...data,
        atualizadoEm: FieldValue.serverTimestamp(),
      });

      return reply.send({ success: true });
    },
  });

  // PATCH /api/clientes/:id/status — Toggle active
  fastify.patch('/clientes/:id/status', {
    preHandler: permissionMiddleware({ modulo: 'clientes', acao: 'editar' }),
    handler: async (request, reply) => {
      const { id } = request.params as { id: string };
      const { ativo } = request.body as { ativo: boolean };

      const doc = await adminDb.collection('clientes').doc(id).get();
      if (!doc.exists) {
        return reply.status(404).send({ error: 'Cliente não encontrado' });
      }

      await adminDb.collection('clientes').doc(id).update({
        ativo,
        atualizadoEm: FieldValue.serverTimestamp(),
      });

      return reply.send({ success: true });
    },
  });
}
