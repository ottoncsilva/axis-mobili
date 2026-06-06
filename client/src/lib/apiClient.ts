const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem('authToken');
  if (!token) throw new Error('Não autenticado');

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.erro || error.error || 'Erro na requisição');
  }

  return response.json();
}
