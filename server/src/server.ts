import Fastify from 'fastify';
import cors from '@fastify/cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const fastify = Fastify({
  logger: true,
});

async function start() {
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

  // API routes
  const { clientesRoutes } = await import('./routes/clientes.routes.js');
  await fastify.register(clientesRoutes, { prefix: '/api' });
  const { projetosRoutes } = await import('./routes/projetos.routes.js');
  await fastify.register(projetosRoutes, { prefix: '/api' });

  // In production, serve the frontend build as static files
  if (process.env.NODE_ENV === 'production') {
    const staticPlugin = await import('@fastify/static');
    await fastify.register(staticPlugin.default, {
      root: path.join(__dirname, '../../client/dist'),
      prefix: '/',
      decorateReply: false,
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
