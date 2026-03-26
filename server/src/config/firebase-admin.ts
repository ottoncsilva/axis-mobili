import * as admin from 'firebase-admin';

function initializeFirebaseAdmin() {
  if (admin.apps.length > 0) {
    return admin.apps[0]!;
  }

  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  if (serviceAccountKey) {
    try {
      const serviceAccount = JSON.parse(
        Buffer.from(serviceAccountKey, 'base64').toString('utf-8')
      );
      return admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    } catch (error) {
      console.error('Erro ao inicializar Firebase Admin com service account:', error);
      throw error;
    }
  }

  // Fallback for local development with GOOGLE_APPLICATION_CREDENTIALS env var
  return admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
}

const app = initializeFirebaseAdmin();

export const adminAuth = admin.auth();
export const adminDb = admin.firestore();
export const adminStorage = admin.storage();

export default app;
