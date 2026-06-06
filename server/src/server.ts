import Fastify from 'fastify';
import cors from '@fastify/cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { configuracoesService } from './services/configuracoes.service.js';
import authService from './services/auth.service.js';
import { adminDb } from './config/firebase-admin.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const fastify = Fastify({
  logger: true,
});

async function start() {
  // Initialize default configurations
  try {
    await configuracoesService.inicializar();
    console.log('✅ Configurações inicializadas');
  } catch (err) {
    fastify.log.error({ err }, 'Erro ao inicializar configurações');
  }

  // Create default admin user
  try {
    await authService.criarAdminPadrao();
  } catch (err) {
    fastify.log.error({ err }, 'Erro ao criar admin padrão');
  }

  // CORS
  await fastify.register(cors, {
    origin: process.env.NODE_ENV === 'production'
      ? true // Allow same origin in production
      : ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
  });

  // Health check
  fastify.get('/api/health', async () => ({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  }));

  // Diagnostics: confirm admin user exists (never exposes password hash)
  fastify.get('/api/debug/admin', async (request, reply) => {
    try {
      const email = process.env.ADMIN_EMAIL;
      if (!email) return reply.send({ configured: false });
      const snap = await adminDb.collection('usuarios').where('email', '==', email).get();
      if (snap.empty) return reply.send({ configured: true, exists: false, email });
      const data = snap.docs[0].data();
      return reply.send({
        configured: true,
        exists: true,
        email: data.email,
        ativo: data.ativo,
        perfil: data.perfil,
        hasHash: !!data.senhaHash,
      });
    } catch (err: any) {
      return reply.status(500).send({ error: err.message });
    }
  });

  // API routes
  const { authRoutes, usuariosRoutes } = await import('./routes/auth.routes.js');
  await fastify.register(authRoutes, { prefix: '/api/auth' });
  await fastify.register(usuariosRoutes, { prefix: '/api' });
  const { clientesRoutes } = await import('./routes/clientes.routes.js');
  await fastify.register(clientesRoutes, { prefix: '/api' });
  const { projetosRoutes } = await import('./routes/projetos.routes.js');
  await fastify.register(projetosRoutes, { prefix: '/api' });
  const { configuracoesRoutes } = await import('./routes/configuracoes.routes.js');
  await fastify.register(configuracoesRoutes, { prefix: '/api' });

  // In production, serve the frontend build as static files
  if (process.env.NODE_ENV === 'production') {
    const staticPlugin = await import('@fastify/static');
    await fastify.register(staticPlugin.default, {
      root: path.join(__dirname, '../../client/dist'),
      prefix: '/',
    });

    // SPA fallback: serve index.html for any unmatched route
    fastify.setNotFoundHandler(async (request, reply) => {
      if (request.url.startsWith('/api')) {
        return reply.status(404).send({ error: 'Rota não encontrada' });
      }
      return reply.sendFile('index.html');
    });
  }

  const port = parseInt(process.env.PORT || '3000', 10);
  const host = process.env.HOST || '0.0.0.0';

  try {
    await fastify.listen({ port, host });
    console.log(`🚀 Servidor rodando em http://${host}:${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

start();
