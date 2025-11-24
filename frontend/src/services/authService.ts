import api from '@/lib/axios';

export interface User {
  _id: string;
  name: string;
  email: string;
}

export interface AuthResponse {
  _id: string;
  name: string;
  email: string;
  token: string;
}

export const authService = {
  register: async (name: string, email: string, password: string): Promise<AuthResponse> => {
    const response = await api.post('/api/auth/register', { name, email, password });
    return response.data;
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await api.post('/api/auth/login', { email, password });
    return response.data;
  },

  getMe: async (): Promise<User> => {
    const response = await api.get('/api/auth/me');
    return response.data;
  },
};
