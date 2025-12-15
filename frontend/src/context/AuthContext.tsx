import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../api';

interface AuthContextType {
  isAuthenticated: boolean;
  isStaff: boolean;
  login: (credentials: any) => Promise<any>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  register: (payload: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isStaff, setIsStaff] = useState(false);

  const checkAuth = async () => {
    try {
      const response = await api.get('/auth/check/');
      setIsAuthenticated(response.data.is_authenticated);
      setIsStaff(response.data.is_staff);
    } catch (error) {
      console.error('Auth check failed', error);
      setIsAuthenticated(false);
      setIsStaff(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (credentials: any) => {
    const resp = await api.post('/auth/login/', credentials);
    const data = resp.data || {};
    setIsAuthenticated(true);
    setIsStaff(!!data.is_staff);
    if (data.token) {
      localStorage.setItem('auth_token', data.token);
    }
    await checkAuth();
    return data;
  };

  const logout = async () => {
    await api.post('/auth/logout/');
    setIsAuthenticated(false);
    setIsStaff(false);
    localStorage.removeItem('auth_token');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isStaff, login, logout, checkAuth, register: async (payload:any) => { await api.post('/auth/register/', payload); } }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
