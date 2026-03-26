export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthState {
  user: import('@/types/global.types').Usuario | null;
  loading: boolean;
  error: string | null;
}
