import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../api';
import type { User, LoginCredentials, RegisterPayload } from '../types/auth';

interface AuthContextType {
  isAuthenticated: boolean;
  isStaff: boolean;
  user: User | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<any>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isStaff, setIsStaff] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const response = await api.get('/auth/check/');
      setIsAuthenticated(response.data.is_authenticated);
      setIsStaff(response.data.is_staff);
      if (response.data.is_authenticated) {
        setUser({
          username: response.data.username,
          email: response.data.email,
          is_staff: response.data.is_staff
        });
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check failed', error);
      setIsAuthenticated(false);
      setIsStaff(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    const resp = await api.post('/auth/login/', credentials);
    const data = resp.data || {};
    if (data.token) {
      localStorage.setItem('auth_token', data.token);
    }
    // After login, we must re-check auth to get full user details including username
    await checkAuth();
    return data;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout/');
    } catch (e) {
      console.warn('Logout failed', e);
    }
    setIsAuthenticated(false);
    setIsStaff(false);
    setUser(null);
    localStorage.removeItem('auth_token');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isStaff, user, loading, login, logout, checkAuth, register: async (payload: RegisterPayload) => { await api.post('/auth/register/', payload); } }}>
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
