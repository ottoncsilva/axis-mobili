import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

function initializeFirebaseAdmin(): App {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  if (serviceAccountKey) {
    try {
      const serviceAccount = JSON.parse(
        Buffer.from(serviceAccountKey, 'base64').toString('utf-8')
      );
      return initializeApp({
        credential: cert(serviceAccount),
      });
    } catch (error) {
      console.error('Erro ao inicializar Firebase Admin com service account:', error);
      throw error;
    }
  }

  return initializeApp();
}

initializeFirebaseAdmin();

export const adminAuth = getAuth();
export const adminDb = getFirestore();
export const adminStorage = getStorage();
