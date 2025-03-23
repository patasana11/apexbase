'use client';

import { GsbEntityService } from '../entity/gsb-entity.service';
import {
  setGsbToken,
  setCommonGsbToken,
  setUserGsbToken,
  setGsbTenantCode,
  clearGsbAuth,
  GSB_CONFIG
} from '../../config/gsb-config';

// Local storage keys
const COMMON_TOKEN_STORAGE_KEY = 'gsb_common_token';
const USER_TOKEN_STORAGE_KEY = 'gsb_user_token';
const TENANT_STORAGE_KEY = 'gsb_tenant_code';
const USER_DATA_STORAGE_KEY = 'gsb_user_data';

// Singleton instance
let authServiceInstance: AuthService | null = null;

export interface LoginCredentials {
  email: string;
  password?: string;
  tenantCode: string;
  remember?: boolean;
  // Social auth tokens
  googleToken?: string;
  facebookToken?: string;
  appleToken?: string;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  tenantCode?: string;
  userTenantToken?: string;
  userData?: {
    userId: string;
    name: string;
    email: string;
    roles: string[];
    groups: string[];
    expireDate: string;
    title: string;
  };
  error?: string;
}

export class AuthService {
  private gsbService: GsbEntityService;
  private commonToken: string | null = null;
  private userToken: string | null = null;
  private tenantCode: string | null = null;

  private constructor() {
    this.gsbService = GsbEntityService.getInstance();
    this.initFromStorage();
    console.log('Auth initialized from localStorage');
  }

  public static getInstance(): AuthService {
    if (!authServiceInstance) {
      authServiceInstance = new AuthService();
    }
    return authServiceInstance;
  }

  /**
   * Initialize auth state from localStorage if available
   */
  public initFromStorage(): void {
    if (typeof window !== 'undefined') {
      try {
        const commonToken = localStorage.getItem(COMMON_TOKEN_STORAGE_KEY);
        const userToken = localStorage.getItem(USER_TOKEN_STORAGE_KEY);
        const tenantCode = localStorage.getItem(TENANT_STORAGE_KEY);

        if (commonToken) {
          this.commonToken = commonToken;
          setCommonGsbToken(commonToken);
          console.log('Common token initialized from localStorage');
        }

        if (userToken && tenantCode) {
          this.userToken = userToken;
          this.tenantCode = tenantCode;
          setUserGsbToken(userToken);
          setGsbTenantCode(tenantCode);
          console.log('User token and tenant initialized from localStorage');
        } 
      } catch (error) {
        console.error('Error initializing from localStorage:', error);
      }
    }
  }


  /**
   * Save authentication data to localStorage
   * For SPA client-side navigation, we need to ensure data is always in memory and localStorage
   */
  private saveToStorage(
    commonToken: string,
    userToken: string | null,
    tenantCode: string,
    userData: any,
    remember: boolean
  ): void {
    // Always update memory state regardless of remember flag
    this.commonToken = commonToken;
    this.userToken = userToken;
    this.tenantCode = tenantCode;

    // Set in global config
    setCommonGsbToken(commonToken);
    if (userToken) {
      setUserGsbToken(userToken);
    }
    setGsbTenantCode(tenantCode);

    if (typeof window !== 'undefined') {
      try {
        // For SPA experience, always save to sessionStorage
        sessionStorage.setItem(COMMON_TOKEN_STORAGE_KEY, commonToken);
        if (userToken) {
          sessionStorage.setItem(USER_TOKEN_STORAGE_KEY, userToken);
        }
        sessionStorage.setItem(TENANT_STORAGE_KEY, tenantCode);
        sessionStorage.setItem(USER_DATA_STORAGE_KEY, JSON.stringify(userData));

        // If remember is true, also save to localStorage for persistence across sessions
        if (remember) {
          localStorage.setItem(COMMON_TOKEN_STORAGE_KEY, commonToken);
          if (userToken) {
            localStorage.setItem(USER_TOKEN_STORAGE_KEY, userToken);
          }
          localStorage.setItem(TENANT_STORAGE_KEY, tenantCode);
          localStorage.setItem(USER_DATA_STORAGE_KEY, JSON.stringify(userData));
        }
        
        // Set cookies for middleware to use
        // Calculate expiry (30 days for remember, session otherwise)
        const expiry = remember ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : undefined;
        
        // Set common token cookie
        document.cookie = `${COMMON_TOKEN_STORAGE_KEY}=${commonToken}; path=/; ${expiry ? `expires=${expiry.toUTCString()};` : ''} SameSite=Lax`;
        
        // Set user token cookie if available
        if (userToken) {
          document.cookie = `${USER_TOKEN_STORAGE_KEY}=${userToken}; path=/; ${expiry ? `expires=${expiry.toUTCString()};` : ''} SameSite=Lax`;
        }
        
        // Save token expiry data for validation
        if (userData && userData.expireDate) {
          document.cookie = `gsb_token_expiry=${userData.expireDate}; path=/; ${expiry ? `expires=${expiry.toUTCString()};` : ''} SameSite=Lax`;
        }
      } catch (error) {
        console.error('Error saving auth data to storage:', error);
      }
    }
  }

  /**
   * Clear authentication data from storage
   */
  private clearStorage(): void {
    if (typeof window !== 'undefined') {
      try {
        // Clear from both localStorage and sessionStorage
        localStorage.removeItem(COMMON_TOKEN_STORAGE_KEY);
        localStorage.removeItem(USER_TOKEN_STORAGE_KEY);
        localStorage.removeItem(TENANT_STORAGE_KEY);
        localStorage.removeItem(USER_DATA_STORAGE_KEY);

        sessionStorage.removeItem(COMMON_TOKEN_STORAGE_KEY);
        sessionStorage.removeItem(USER_TOKEN_STORAGE_KEY);
        sessionStorage.removeItem(TENANT_STORAGE_KEY);
        sessionStorage.removeItem(USER_DATA_STORAGE_KEY);
        
        // Clear cookies
        document.cookie = `${COMMON_TOKEN_STORAGE_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
        document.cookie = `${USER_TOKEN_STORAGE_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
        document.cookie = `gsb_token_expiry=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
      } catch (error) {
        console.error('Error clearing storage:', error);
      }
    }
  }

  /**
   * Check if user is authenticated
   * @returns True if authenticated
   */
  isAuthenticated(): boolean {
    // For development mode, always return true if SKIP_GSB_AUTH is true
    if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_SKIP_GSB_AUTH === 'true') {
      return true;
    }
    
    // Get the token and check if it exists
    const token = this.getToken();
    if (!token) {
      return false;
    }
    
    // Check token expiry
    try {
      // Get user data to check expiry
      const userData = this.getCurrentUser();
      if (!userData || !userData.expireDate) {
        return false;
      }
      
      // Check if token is expired
      const expiryDate = new Date(userData.expireDate);
      const now = new Date();
      
      return expiryDate > now;
    } catch (error) {
      console.error('Error checking token expiry:', error);
      return false;
    }
  }

  /**
   * Authenticate a user with GSB
   * @param credentials User credentials
   * @returns Authentication response
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    // Handle development mode with skip auth

    // Normal authentication process
    try {
      const { email, password, tenantCode, remember = true, googleToken, facebookToken, appleToken } = credentials;

      const request: any = {
        email,
        remember,
        includeUserInfo: true,
        variation: {
          tenantCode : process.env.NEXT_PUBLIC_GSB_COMMON_TENANT || 'common'
        }
      };

      // Add appropriate authentication method
      if (googleToken) {
        request.googleToken = googleToken;
      } else if (facebookToken) {
        request.facebookToken = facebookToken;
      } else if (appleToken) {
        request.appleToken = appleToken;
      } else if (password) {
        request.password = password;
      } else {
        return {
          success: false,
          error: 'Authentication failed: No authentication method provided'
        };
      }

      const response = await this.gsbService.getToken(request);

      if (response?.auth?.token) {
        // Store common token
        const commonToken = response.auth.token;
        this.commonToken = commonToken;
        this.tenantCode = tenantCode;

        // Set in global config
        setCommonGsbToken(commonToken);
        setGsbTenantCode(tenantCode);

        // Now check if we have a user tenant token
        let userToken = null;
        if (response.auth.userToken) {
          userToken = response.auth.userToken;
          this.userToken = userToken;
          setUserGsbToken(userToken);
        }

        // Save to localStorage if remember is true
        const userData = {
          userId: response.auth.userId,
          name: response.auth.name,
          email: response.auth.email,
          roles: response.auth.roles || [],
          groups: response.auth.groups || [],
          expireDate: response.auth.expireDate,
          title: response.auth.title
        };

        const userTenant = response.auth.userTenant;

        this.saveToStorage(commonToken, userToken, userTenant, userData, remember);

        return {
          success: true,
          token: commonToken,
          userTenantToken: userToken,
          tenantCode,
          userData
        };
      } else {
        return {
          success: false,
          error: 'Authentication failed: Invalid token response'
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Authentication failed'
      };
    }
  }

  /**
   * Log out the current user
   */
  logout(): void {
    this.commonToken = null;
    this.userToken = null;
    this.tenantCode = null;
    clearGsbAuth();
    this.clearStorage();
  }

  /**
   * Get user information from JWT token
   * @param token JWT token
   * @returns Decoded user information or null if invalid
   */
  getUserFromToken(token: string): any {
    // For development token, return fake user data
    if (token.startsWith('dev-token') || token.startsWith('dev-common-token') || token.startsWith('dev-user-token')) {
      return {
        userId: 'dev-user',
        name: 'Development User',
        email: 'admin@apexbase.dev',
        roles: ['admin', 'developer'],
        groups: ['all'],
      };
    }

    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  /**
   * Check if the current user has a specific role
   * @param role Role to check
   * @returns True if user has the role
   */
  hasRole(role: string): boolean {
    // In development mode with bypass, always return true for role checks
    if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_SKIP_GSB_AUTH === 'true') {
      return true;
    }

    if (!this.commonToken) {
      return false;
    }

    const userData = this.getUserFromToken(this.commonToken);
    if (!userData || !userData.roles) {
      return false;
    }
    return userData.roles.includes(role);
  }

  /**
   * Get the tenant code from the current token
   * @returns Tenant code or undefined
   */
  getCurrentTenantCode(): string | undefined {
    if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_SKIP_GSB_AUTH === 'true') {
      return process.env.NEXT_PUBLIC_DEFAULT_TENANT_CODE || 'apexbase';
    }

    if (this.tenantCode) {
      return this.tenantCode;
    }

    if (this.userToken) {
      return GSB_CONFIG.extractTenantCode(this.userToken);
    }

    return undefined;
  }

  /**
   * Get the current auth token based on path context
   * @param pathContext Optional path context to determine which token to use
   * @returns The appropriate auth token or null if not authenticated
   */
  getToken(pathContext?: string): string | null {
    // Check if we should use the common token based on the path
    const useCommonToken = this.shouldUseCommonToken(pathContext);

    // For development with skip auth, always return a dev token
    if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_SKIP_GSB_AUTH === 'true') {
      if (useCommonToken) {
        if (!this.commonToken) {
          const devToken = 'dev-common-token-' + Date.now();
          this.commonToken = devToken;
          setCommonGsbToken(devToken);
        }
        return this.commonToken;
      } else {
        if (!this.userToken) {
          const devToken = 'dev-user-token-' + Date.now();
          this.userToken = devToken;
          setUserGsbToken(devToken);
        }
        return this.userToken;
      }
    }

    // Regular token retrieval logic
    if (useCommonToken) {
      // If token not loaded yet, try to load from storage
      if (!this.commonToken && typeof window !== 'undefined') {
        // First check sessionStorage (for current session)
        const sessionToken = sessionStorage.getItem(COMMON_TOKEN_STORAGE_KEY);
        if (sessionToken) {
          console.log('Retrieved common token from sessionStorage for SPA navigation');
          this.commonToken = sessionToken;
          setCommonGsbToken(sessionToken);
          return this.commonToken;
        }

        // Then check localStorage (for remembered login)
        const localToken = localStorage.getItem(COMMON_TOKEN_STORAGE_KEY);
        if (localToken) {
          console.log('Retrieved common token from localStorage for remembered login');
          this.commonToken = localToken;
          setCommonGsbToken(localToken);

          // Also save to sessionStorage for better SPA support
          try {
            sessionStorage.setItem(COMMON_TOKEN_STORAGE_KEY, localToken);
          } catch (e) {
            console.error('Failed to save common token to sessionStorage:', e);
          }
        }
      }
      return this.commonToken;
    } else {
      // Try to get user tenant token
      if (!this.userToken && typeof window !== 'undefined') {
        // First check sessionStorage (for current session)
        const sessionToken = sessionStorage.getItem(USER_TOKEN_STORAGE_KEY);
        if (sessionToken) {
          console.log('Retrieved user token from sessionStorage for SPA navigation');
          this.userToken = sessionToken;
          setUserGsbToken(sessionToken);
          return this.userToken;
        }

        // Then check localStorage (for remembered login)
        const localToken = localStorage.getItem(USER_TOKEN_STORAGE_KEY);
        if (localToken) {
          console.log('Retrieved user token from localStorage for remembered login');
          this.userToken = localToken;
          setUserGsbToken(localToken);

          // Also save to sessionStorage for better SPA support
          try {
            sessionStorage.setItem(USER_TOKEN_STORAGE_KEY, localToken);
          } catch (e) {
            console.error('Failed to save user token to sessionStorage:', e);
          }
        }
      }

      // If no user token is available, fall back to common token
      return this.userToken || this.commonToken;
    }
  }

  /**
   * Determine if the common token should be used based on the path
   * @param path The current path
   * @returns True if common token should be used
   */
  private shouldUseCommonToken(path?: string): boolean {
    const COMMON_TOKEN_PATHS = [
      '/api/auth',
      '/login',
      '/register',
      '/forgot-password',
      '/registration',
      '/account'
    ];

    if (!path) {
      // Get the current path if running in browser
      if (typeof window !== 'undefined') {
        path = window.location.pathname;
      } else {
        // Default to not using common token if no path available
        return false;
      }
    }

    // Check if path starts with any of the common token paths
    return COMMON_TOKEN_PATHS.some(prefix => path?.startsWith(prefix));
  }

  /**
   * Get the current user data from storage
   * @returns User data or null
   */
  getCurrentUser(): any {
    // For development with skip auth, return fake user data
    if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_SKIP_GSB_AUTH === 'true') {
      return {
        userId: 'dev-user',
        name: 'Development User',
        email: 'admin@apexbase.dev',
        roles: ['admin', 'developer'],
        groups: ['all'],
        expireDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        title: 'Developer'
      };
    }

    if (typeof window === 'undefined') {
      return null;
    }

    try {
      // First check sessionStorage for current session
      let userData = sessionStorage.getItem(USER_DATA_STORAGE_KEY);

      // If not found in sessionStorage, check localStorage
      if (!userData) {
        userData = localStorage.getItem(USER_DATA_STORAGE_KEY);

        // If found in localStorage but not in sessionStorage,
        // also save to sessionStorage for better SPA support
        if (userData) {
          try {
            sessionStorage.setItem(USER_DATA_STORAGE_KEY, userData);
          } catch (e) {
            console.error('Failed to save user data to sessionStorage:', e);
          }
        }
      }

      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting user data from storage:', error);
      return null;
    }
  }
}
