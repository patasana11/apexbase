'use client';

import { GsbEntityService } from '../entity/gsb-entity.service';
import { setGsbToken, setGsbTenantCode, clearGsbAuth, GSB_CONFIG } from '../../config/gsb-config';

// Local storage keys
const TOKEN_STORAGE_KEY = 'gsb_auth_token';
const TENANT_STORAGE_KEY = 'gsb_tenant_code';
const USER_DATA_STORAGE_KEY = 'gsb_user_data';

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
  private token: string | null = null;
  private tenantCode: string | null = null;

  constructor() {
    this.gsbService = new GsbEntityService();
    this.initFromStorage();
  }

  /**
   * Initialize auth state from localStorage if available
   */
  private initFromStorage(): void {
    if (typeof window !== 'undefined') {
      try {
        const token = localStorage.getItem(TOKEN_STORAGE_KEY);
        const tenantCode = localStorage.getItem(TENANT_STORAGE_KEY);

        if (token && tenantCode) {
          this.token = token;
          this.tenantCode = tenantCode;
          setGsbToken(token);
          setGsbTenantCode(tenantCode);
          console.log('Auth initialized from localStorage');
        }
      } catch (error) {
        console.error('Error initializing from localStorage:', error);
      }
    }
  }

  /**
   * Save authentication data to localStorage
   * @param token JWT token
   * @param tenantCode Tenant code
   * @param userData User data
   * @param remember Whether to persist in localStorage
   */
  private saveToStorage(token: string, tenantCode: string, userData: any, remember: boolean): void {
    if (typeof window !== 'undefined' && remember) {
      try {
        localStorage.setItem(TOKEN_STORAGE_KEY, token);
        localStorage.setItem(TENANT_STORAGE_KEY, tenantCode);
        localStorage.setItem(USER_DATA_STORAGE_KEY, JSON.stringify(userData));
      } catch (error) {
        console.error('Error saving to localStorage:', error);
      }
    }
  }

  /**
   * Clear authentication data from localStorage
   */
  private clearStorage(): void {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        localStorage.removeItem(TENANT_STORAGE_KEY);
        localStorage.removeItem(USER_DATA_STORAGE_KEY);
      } catch (error) {
        console.error('Error clearing localStorage:', error);
      }
    }
  }

  /**
   * Check if user is authenticated
   * @returns True if authenticated
   */
  isAuthenticated(): boolean {
    return !!this.token;
  }

  /**
   * Authenticate a user with GSB
   * @param credentials User credentials
   * @returns Authentication response
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const { email, password, tenantCode, remember = true, googleToken, facebookToken, appleToken } = credentials;

      const request: any = {
        email,
        remember,
        includeUserInfo: true,
        variation: {
          tenantCode
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
        // Store authentication data
        this.token = response.auth.token;
        this.tenantCode = tenantCode;

        // Set in global config
        setGsbToken(response.auth.token);
        setGsbTenantCode(tenantCode);

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

        this.saveToStorage(response.auth.token, tenantCode, userData, remember);

        return {
          success: true,
          token: response.auth.token,
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
    this.token = null;
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
    if (!this.token) {
      return false;
    }

    const userData = this.getUserFromToken(this.token);
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
    if (!this.token) {
      return undefined;
    }
    return GSB_CONFIG.extractTenantCode(this.token);
  }

  /**
   * Get the current auth token
   * @returns The current auth token or null if not authenticated
   */
  getToken(): string | null {
    // If token not loaded yet, try to load from localStorage
    if (!this.token && typeof window !== 'undefined') {
      const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
      if (storedToken) {
        this.token = storedToken;
      }
    }
    return this.token;
  }

  /**
   * Get the current user data from localStorage
   * @returns User data or null
   */
  getCurrentUser(): any {
    if (typeof window === 'undefined') {
      return null;
    }

    try {
      const userData = localStorage.getItem(USER_DATA_STORAGE_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting user data from localStorage:', error);
      return null;
    }
  }
}
