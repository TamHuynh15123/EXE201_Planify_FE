import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, AuthResponse } from '../services/authService';

interface AuthContextType {
  user: any;
  token: string | null;
  login: (data: any) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedToken = authService.getToken();
    const savedUser = authService.getUser();
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(savedUser);
    }
    setIsLoading(false);
  }, []);

  const login = async (data: any) => {
    const response = await authService.login(data);
    authService.saveAuthData(response);
    setUser({
      email: response.email,
      fullName: response.fullName,
      expiration: response.expiration,
    });
    setToken(response.token);
  };

  const register = async (data: any) => {
    const response = await authService.register(data);
    authService.saveAuthData(response);
    setUser({
      email: response.email,
      fullName: response.fullName,
      expiration: response.expiration,
    });
    setToken(response.token);
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
