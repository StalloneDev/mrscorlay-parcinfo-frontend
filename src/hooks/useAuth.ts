import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import type { User } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

interface LoginData {
  email: string;
  password: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [, setLocation] = useLocation();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      console.log('Checking auth...');
      const response = await apiRequest('GET', '/api/auth/user');
      const userData = await response.json();
      console.log('Auth check successful:', userData);
      setUser(userData);
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
      setLocation('/login');
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    try {
      console.log('Attempting registration...');
      const response = await apiRequest('POST', '/api/auth/register', data);
      const userData = await response.json();
      console.log('Registration successful:', userData);
      setUser(userData.user);
      setLocation('/');
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const login = async (data: LoginData) => {
    try {
      console.log('Attempting login...');
      const response = await apiRequest('POST', '/api/auth/login', data);
      const userData = await response.json();
      console.log('Login successful:', userData);
      setUser(userData.user);
      await checkAuth(); // Vérifier l'authentification après la connexion
      setLocation('/');
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      console.log('Attempting logout...');
      await apiRequest('POST', '/api/auth/logout');
      console.log('Logout successful');
      setUser(null);
      setLocation('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    register,
    login,
    logout,
  };
}