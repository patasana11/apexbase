'use client';

import React, { createContext, useState, useContext, useEffect, useRef, ReactNode } from 'react';
import { AuthService } from '@/lib/gsb/services/auth/auth.service';

interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  tokenExpiry: string | null;
  user: {
    id?: string;
    email?: string;
    name?: string;
  } | null;
  status: 'loading' | 'authenticated' | 'unauthenticated';
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string, remember?: boolean) => Promise<boolean>;
  logout: () => Promise<void>;
  getToken: () => string | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  token: null,
  tokenExpiry: null,
  user: null,
  status: 'loading'
};

// Create a single instance of AuthService to use throughout the app
const authServiceInstance = AuthService.getInstance();

const AuthContext = createContext<AuthContextType>({
  ...initialState,
  login: async () => false,
  logout: async () => {},
  getToken: () => null
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>(initialState);
  const isInitializedRef = useRef(false);

  // Initialize auth state from storage - but only once!
  useEffect(() => {
    // Skip initialization if already done
    if (isInitializedRef.current) {
      return;
    }

    const initAuth = () => {
      try {
        console.log('Initializing auth state from storage');
        // Mark as initialized immediately to prevent duplicate calls
        isInitializedRef.current = true;

        // Check if we have a token in local storage or service
        const token = authServiceInstance.getToken();
        const userData = authServiceInstance.getCurrentUser();

        if (token && userData) {
          console.log('Found existing auth data');
          setAuthState({
            isAuthenticated: true,
            token,
            tokenExpiry: userData.expireDate || null,
            user: {
              id: userData.userId,
              email: userData.email,
              name: userData.name
            },
            status: 'authenticated'
          });
        } else {
          console.log('No auth data found');
          setAuthState({
            ...initialState,
            status: 'unauthenticated'
          });
        }
      } catch (error) {
        console.error('Error initializing auth state:', error);
        setAuthState({
          ...initialState,
          status: 'unauthenticated'
        });
      }
    };

    initAuth();
  }, []);

  // Login function using GSB auth service
  const login = async (email: string, password: string, remember = false): Promise<boolean> => {
    try {
      const tenantCode = process.env.NEXT_PUBLIC_DEFAULT_TENANT_CODE || 'dev1';

      const response = await authServiceInstance.login({
        email,
        password,
        tenantCode,
        remember
      });

      if (response.success && response.token) {
        console.log('Login successful');
        setAuthState({
          isAuthenticated: true,
          token: response.token,
          tokenExpiry: response.userData?.expireDate || null,
          user: {
            id: response.userData?.userId,
            email: response.userData?.email,
            name: response.userData?.name
          },
          status: 'authenticated'
        });
        return true;
      } else {
        console.error('Login failed:', response.error);
        setAuthState({
          ...initialState,
          status: 'unauthenticated'
        });
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      setAuthState({
        ...initialState,
        status: 'unauthenticated'
      });
      return false;
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    try {
      await authServiceInstance.logout();
      console.log('Logout successful');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setAuthState({
        ...initialState,
        status: 'unauthenticated'
      });
    }
  };

  // Get current token
  const getToken = (): string | null => {
    return authState.token || authServiceInstance.getToken();
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        logout,
        getToken
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
