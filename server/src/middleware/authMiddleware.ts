import type { FastifyRequest, FastifyReply } from 'fastify';
import { adminAuth, adminDb } from '../config/firebase-admin.js';

export interface AuthenticatedRequest extends FastifyRequest {
  userId?: string;
  userPerfil?: string;
  userName?: string;
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
    const decodedToken = await adminAuth.verifyIdToken(token);
    const uid = decodedToken.uid;

    // Fetch user data from Firestore
    const userDoc = await adminDb.collection('usuarios').doc(uid).get();
    if (!userDoc.exists) {
      return reply.status(401).send({
        error: 'Não autorizado',
        message: 'Usuário não encontrado no sistema.',
      });
    }

    const userData = userDoc.data()!;
    if (!userData.ativo) {
      return reply.status(403).send({
        error: 'Acesso negado',
        message: 'Sua conta está desativada.',
      });
    }

    // Inject user data into request
    (request as AuthenticatedRequest).userId = uid;
    (request as AuthenticatedRequest).userPerfil = userData.perfil;
    (request as AuthenticatedRequest).userName = userData.nome;
  } catch (error) {
    return reply.status(401).send({
      error: 'Não autorizado',
      message: 'Token inválido ou expirado.',
    });
  }
}
