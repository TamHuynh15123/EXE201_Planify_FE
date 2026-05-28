import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, UserData, AuthResponseData, ApiResponse } from '../services/authService';

interface AuthContextType {
  user: UserData | null;
  accessToken: string | null;
  login: (data: any) => Promise<void>;
  register: (data: any) => Promise<void>;
  loginWithGoogle: (idToken: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedToken = authService.getAccessToken();
    const savedUser = authService.getUser();
    if (savedToken && savedUser) {
      setAccessToken(savedToken);
      setUser(savedUser);
    }
    setIsLoading(false);
  }, []);

  const handleAuthSuccess = (response: ApiResponse<AuthResponseData>) => {
    const { data } = response;
    authService.saveAuthData(data);
    const savedUser = authService.getUser(); // Get the user with decoded role
    setUser(savedUser);
    setAccessToken(data.accessToken);
  };

  const login = async (data: any) => {
    const response = await authService.login(data);
    handleAuthSuccess(response);
  };

  const register = async (data: any) => {
    const response = await authService.register(data);
    handleAuthSuccess(response);
  };

  const loginWithGoogle = async (idToken: string) => {
    const response = await authService.googleLogin(idToken);
    handleAuthSuccess(response);
  };

  const logout = async () => {
    const refreshToken = authService.getRefreshToken();
    if (accessToken && refreshToken) {
      try {
        await authService.logout(accessToken, refreshToken);
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
    authService.clearAuthData();
    setUser(null);
    setAccessToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, accessToken, login, register, loginWithGoogle, logout, isLoading }}>
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
