import { GsbEntityService } from '../gsb/services/gsb-entity.service';
import { setGsbToken, setGsbTenantCode, clearGsbAuth, GSB_CONFIG } from '../config/gsb-config';

export interface LoginCredentials {
  email: string;
  password: string;
  tenantCode: string;
  remember?: boolean;
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

  constructor() {
    this.gsbService = new GsbEntityService();
  }

  /**
   * Authenticate a user with GSB
   * @param credentials User credentials
   * @returns Authentication response
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const { email, password, tenantCode, remember = true } = credentials;

      const request = {
        email,
        password,
        remember,
        includeUserInfo: true,
        variation: {
          tenantCode
        }
      };

      const response = await this.gsbService.getToken(request);

      if (response?.auth?.token) {
        // Store authentication data
        setGsbToken(response.auth.token);
        setGsbTenantCode(tenantCode);

        return {
          success: true,
          token: response.auth.token,
          tenantCode,
          userData: {
            userId: response.auth.userId,
            name: response.auth.name,
            email: response.auth.email,
            roles: response.auth.roles || [],
            groups: response.auth.groups || [],
            expireDate: response.auth.expireDate,
            title: response.auth.title
          }
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
    clearGsbAuth();
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
   * @param token JWT token
   * @param role Role to check
   * @returns True if user has the role
   */
  hasRole(token: string, role: string): boolean {
    const userData = this.getUserFromToken(token);
    if (!userData || !userData.roles) {
      return false;
    }
    return userData.roles.includes(role);
  }

  /**
   * Get the tenant code from a token
   * @param token JWT token
   * @returns Tenant code or undefined
   */
  getTenantCodeFromToken(token: string): string | undefined {
    return GSB_CONFIG.extractTenantCode(token);
  }
}
