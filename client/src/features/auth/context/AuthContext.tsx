import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

export interface Usuario {
  id: string;
  email: string;
  nome: string;
  perfil: 'admin' | 'projetista' | 'medidor' | 'financeiro';
}

export interface AuthContextType {
  usuario: Usuario | null;
  token: string | null;
  carregando: boolean;
  autenticado: boolean;
  login: (email: string, senha: string) => Promise<void>;
  logout: () => void;
  alterarSenha: (senhaAtual: string, novaSenha: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);

  // Load token from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('authToken');
    if (savedToken) {
      setToken(savedToken);
      verificarToken(savedToken);
    } else {
      setCarregando(false);
    }
  }, []);

  const verificarToken = useCallback(async (authToken: string) => {
    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (!response.ok) {
        localStorage.removeItem('authToken');
        setToken(null);
        setUsuario(null);
        return;
      }

      const data = await response.json();
      setUsuario({
        id: data.id,
        email: data.email,
        nome: data.email,
        perfil: data.perfil,
      });
    } catch (error) {
      console.error('Erro ao verificar token:', error);
      localStorage.removeItem('authToken');
      setToken(null);
      setUsuario(null);
    } finally {
      setCarregando(false);
    }
  }, []);

  const login = useCallback(async (email: string, senha: string) => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, senha }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.erro || 'Erro ao fazer login');
      }

      const data = await response.json();
      const { token: newToken, usuario: novoUsuario } = data;

      localStorage.setItem('authToken', newToken);
      setToken(newToken);
      setUsuario({
        id: novoUsuario.id,
        email: novoUsuario.email,
        nome: novoUsuario.nome,
        perfil: novoUsuario.perfil,
      });
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao fazer login');
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('authToken');
    setToken(null);
    setUsuario(null);
  }, []);

  const alterarSenha = useCallback(
    async (senhaAtual: string, novaSenha: string) => {
      if (!token) {
        throw new Error('Não autenticado');
      }

      const response = await fetch(`${API_URL}/auth/alterar-senha`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ senhaAtual, novaSenha }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.erro || 'Erro ao alterar senha');
      }
    },
    [token]
  );

  const value: AuthContextType = {
    usuario,
    token,
    carregando,
    autenticado: !!token && !!usuario,
    login,
    logout,
    alterarSenha,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext deve ser usado dentro de AuthProvider');
  }
  return context;
}
