import { useState, useCallback } from 'react';

export interface User {
  id: string;
  nome: string;
  email: string;
  cargo: string;
  avatar?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

const STORAGE_KEY = 'mandato_digital_auth';

function loadAuth(): AuthState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // ignore
  }
  return { user: null, isAuthenticated: false };
}

export function useAuth() {
  const [state, setState] = useState<AuthState>(loadAuth);

  const login = useCallback((email: string, _password: string) => {
    // Mock login - any credentials work for demo
    const user: User = {
      id: '1',
      nome: email.split('@')[0].replace('.', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      email,
      cargo: 'Administrador',
    };
    const newState = { user, isAuthenticated: true };
    setState(newState);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
  }, []);

  const register = useCallback((nome: string, email: string, _telefone: string, _password: string) => {
    const user: User = {
      id: '1',
      nome,
      email,
      cargo: 'Administrador',
    };
    const newState = { user, isAuthenticated: true };
    setState(newState);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
  }, []);

  const logout = useCallback(() => {
    setState({ user: null, isAuthenticated: false });
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return {
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    login,
    register,
    logout,
  };
}
