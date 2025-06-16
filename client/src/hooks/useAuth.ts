import { useMutation } from '@tanstack/react-query';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import type { IUserData } from '../types/user';

interface UserData {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'COMEDIAN' | 'ORGANIZER' | 'ADMIN';
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'COMEDIAN' | 'ORGANIZER';
}

interface LoginData {
  email: string;
  password: string;
}

export const useAuth = () => {
  const navigate = useNavigate();

  const register = useMutation({
    mutationFn: async (data: RegisterData) => {
      const response = await api.post('/auth/register', data);
      return response.data;
    },
  });

  const login = useMutation({
    mutationFn: async (data: LoginData) => {
      const response = await api.post('/auth/login', data);
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      return response.data;
    },
  });

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const getCurrentUser = (): IUserData | null => {
    const userString = localStorage.getItem('user');
    if (userString) {
      try {
        return JSON.parse(userString) as IUserData;
      } catch (e) {
        console.error("Erreur lors du parse de l'utilisateur depuis le localStorage", e);
        return null;
      }
    }
    return null;
  };

  return {
    register,
    login,
    logout,
    getCurrentUser,
    token: localStorage.getItem('token'),
    user: getCurrentUser(),
  };
}; 