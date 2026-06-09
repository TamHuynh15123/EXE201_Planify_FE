import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { authService, UserData, AuthResponseData, ApiResponse } from '../services/authService';
import { userService } from '../services/userService';

interface AuthContextType {
  user: UserData | null;
  accessToken: string | null;
  login: (data: any) => Promise<void>;
  register: (data: any) => Promise<void>;
  loginWithGoogle: (idToken: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(async () => {
    const refreshToken = authService.getRefreshToken();
    // We can't easily get current accessToken from state here if called from useEffect,
    // so we use the service to get it from localStorage if needed.
    const token = accessToken || authService.getAccessToken();
    if (token && refreshToken) {
      try {
        await authService.logout(token, refreshToken);
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
    authService.clearAuthData();
    setUser(null);
    setAccessToken(null);
  }, [accessToken]);

  const refreshProfile = useCallback(async () => {
    try {
      const response = await userService.getProfile();
      const profile = response.data;
      const currentUser = authService.getUser();
      if (currentUser) {
        const updatedUser = { 
          ...currentUser, 
          id: profile.id,
          fullName: profile.fullName, 
          email: profile.email 
        };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
    } catch (error: any) {
      if (error.message === 'Unauthorized') {
        logout();
      }
      console.error('Error refreshing profile:', error);
    }
  }, [logout]);

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = authService.getAccessToken();
      const savedUser = authService.getUser();
      
      if (savedToken && savedUser) {
        setAccessToken(savedToken);
        setUser(savedUser);
        // Sync with server profile
        await refreshProfile();
      }
      setIsLoading(false);
    };

    initAuth();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'accessToken' && !e.newValue) {
        setUser(null);
        setAccessToken(null);
      }
      if (e.key === 'accessToken' && e.newValue) {
        const newUser = authService.getUser();
        setUser(newUser);
        setAccessToken(e.newValue);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [refreshProfile]);

  const handleAuthSuccess = (response: ApiResponse<AuthResponseData>) => {
    const { data } = response;
    authService.saveAuthData(data);
    const savedUser = authService.getUser();
    setUser(savedUser);
    setAccessToken(data.accessToken);
    refreshProfile(); // Get latest data from server
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

  return (
    <AuthContext.Provider value={{ 
      user, 
      accessToken, 
      login, 
      register, 
      loginWithGoogle, 
      logout, 
      isLoading,
      refreshProfile 
    }}>
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
