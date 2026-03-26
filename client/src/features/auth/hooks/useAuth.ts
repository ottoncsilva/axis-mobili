import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { authService } from '../services/authService';
import type { Usuario } from '@/types/global.types';

interface AuthContextType {
  user: Usuario | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const usuario = await authService.getUsuarioFromFirestore(firebaseUser.uid);
          if (usuario && usuario.ativo) {
            setUser(usuario);
          } else {
            setUser(null);
            if (usuario && !usuario.ativo) {
              await authService.logout();
            }
          }
        } catch {
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    setError(null);
    setLoading(true);
    try {
      const usuario = await authService.login(email, password);
      setUser(usuario);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao fazer login';
      // Map Firebase error codes to user-friendly Portuguese messages
      if (message.includes('auth/invalid-credential') || message.includes('auth/wrong-password') || message.includes('auth/user-not-found')) {
        setError('Email ou senha incorretos.');
      } else if (message.includes('auth/too-many-requests')) {
        setError('Muitas tentativas. Tente novamente mais tarde.');
      } else if (message.includes('auth/network-request-failed')) {
        setError('Erro de conexão. Verifique sua internet.');
      } else {
        setError(message);
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        isAuthenticated: !!user,
        login,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}
