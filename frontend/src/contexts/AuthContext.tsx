import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { AuthContextType, LoginRequest, UserDetailsResponse } from '../types/auth';
import { authApi } from '../services/api';
import { getJWTFromCookie } from '../utils/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserDetailsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

  const checkAuthStatus = useCallback(async () => {
    if (hasCheckedAuth) return;

    setLoading(true);

    // First, check if JWT cookie exists
    const jwtToken = getJWTFromCookie();

    if (!jwtToken) {
      // No token, user is not authenticated
      setUser(null);
      setLoading(false);
      setHasCheckedAuth(true);
      return;
    }

    // Token exists, verify it with the server
    try {
      const userData = await authApi.getCurrentUser();
      setUser(userData);
    } catch (error: unknown) {
      // Token exists but is invalid/expired
      const isAxiosError = error && typeof error === 'object' && 'response' in error;
      if (isAxiosError) {
        const axiosError = error as { response?: { status?: number } };
        if (axiosError.response?.status !== 401 && axiosError.response?.status !== 403) {
          console.error('Auth check error:', error);
        }
      } else {
        console.error('Auth check error:', error);
      }
      setUser(null);
      // Clear invalid cookie by making logout call (this will clear the cookie)
      try {
        await authApi.logout();
      } catch {
        // Ignore logout errors
      }
    } finally {
      setLoading(false);
      setHasCheckedAuth(true);
    }
  }, [hasCheckedAuth]);

  // Check auth status on mount only
  useEffect(() => {
    void checkAuthStatus();
  }, [checkAuthStatus]);

  const login = async (credentials: LoginRequest) => {
    await authApi.login(credentials);
    // After successful login, fetch user details
    const userData = await authApi.getCurrentUser();
    setUser(userData);
    setHasCheckedAuth(true);
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setHasCheckedAuth(false); // Reset so we can check auth again later
    }
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    loading,
    isAuthenticated: !!user,
    checkAuthStatus // Expose this so components can call it when needed
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
