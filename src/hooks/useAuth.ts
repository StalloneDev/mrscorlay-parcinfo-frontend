import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import type { User } from '@shared/schema';
import { getApiUrl } from '../lib/config';

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
      const response = await fetch(getApiUrl('/api/auth/user'), {
        credentials: 'include'
      });
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    const response = await fetch(getApiUrl('/api/auth/register'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Registration failed');
    }

    const userData = await response.json();
    setUser(userData.user);
    setLocation('/');
  };

  const login = async (data: LoginData) => {
    const response = await fetch(getApiUrl('/api/auth/login'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }

    const userData = await response.json();
    setUser(userData.user);
    setLocation('/');
  };

  const logout = async () => {
    await fetch(getApiUrl('/api/auth/logout'), { 
      method: 'POST',
      credentials: 'include'
    });
    setUser(null);
    setLocation('/login');
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