import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  type User,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import type { Usuario } from '@/types/global.types';

export const authService = {
  async login(email: string, password: string): Promise<Usuario> {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const usuario = await this.getUsuarioFromFirestore(userCredential.user.uid);
    if (!usuario) {
      throw new Error('Usuário não encontrado no sistema. Contate o administrador.');
    }
    if (!usuario.ativo) {
      await signOut(auth);
      throw new Error('Sua conta está desativada. Contate o administrador.');
    }
    return usuario;
  },

  async logout(): Promise<void> {
    await signOut(auth);
  },

  async getUsuarioFromFirestore(uid: string): Promise<Usuario | null> {
    const docRef = doc(db, 'usuarios', uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Usuario;
    }
    return null;
  },

  getCurrentFirebaseUser(): User | null {
    return auth.currentUser;
  },

  onAuthStateChanged(callback: (user: User | null) => void) {
    return firebaseOnAuthStateChanged(auth, callback);
  },
};
