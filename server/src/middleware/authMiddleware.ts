import type { FastifyRequest, FastifyReply } from 'fastify';
import authService from '../services/auth.service.js';
import { adminDb } from '../config/firebase-admin.js';

export interface AuthenticatedRequest extends FastifyRequest {
  userId?: string;
  userPerfil?: string;
  userEmail?: string;
}

export async function authMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const authHeader = request.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return reply.status(401).send({
      error: 'Não autorizado',
      message: 'Token de autenticação não fornecido.',
    });
  }

  const token = authHeader.split('Bearer ')[1];

  try {
    const decoded = authService.verifyToken(token);

    // Verify user still exists and is active
    const userDoc = await adminDb.collection('usuarios').doc(decoded.userId).get();
    if (!userDoc.exists) {
      return reply.status(401).send({
        error: 'Não autorizado',
        message: 'Usuário não encontrado no sistema.',
      });
    }

    const userData = userDoc.data() as any;
    if (!userData.ativo) {
      return reply.status(403).send({
        error: 'Acesso negado',
        message: 'Sua conta está desativada.',
      });
    }

    // Inject user data into request
    (request as AuthenticatedRequest).userId = decoded.userId;
    (request as AuthenticatedRequest).userPerfil = decoded.perfil;
    (request as AuthenticatedRequest).userEmail = decoded.email;
  } catch (error) {
    return reply.status(401).send({
      error: 'Não autorizado',
      message: 'Token inválido ou expirado.',
    });
  }
}
