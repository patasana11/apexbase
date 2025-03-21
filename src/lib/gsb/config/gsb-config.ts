/**
 * GSB Configuration
 */

// GSB Authentication
let _token: string | null = null;
let _tenantCode: string | null = null;

/**
 * Set the GSB token
 * @param token The GSB token
 */
export function setGsbToken(token: string): void {
  console.log('Setting GSB token', token ? token.substring(0, 10) + '...' : 'null');
  _token = token;
}

/**
 * Get the GSB token
 * @returns The GSB token
 */
export function getGsbToken(): string {
  if (!_token) {
    console.warn('GSB Token not set - using fallback for development');
    return process.env.NODE_ENV === 'development'
      ? 'dev-fallback-token'
      : throwError('GSB Token not set');
  }
  return _token;
}

/**
 * Set the GSB tenant code
 * @param tenantCode The GSB tenant code
 */
export function setGsbTenantCode(tenantCode: string): void {
  console.log('Setting GSB tenant code:', tenantCode);
  _tenantCode = tenantCode;
}

/**
 * Get the GSB tenant code
 * @returns The GSB tenant code
 */
export function getGsbTenantCode(): string {
  if (!_tenantCode) {
    console.warn('GSB Tenant Code not set - using default from env');
    return process.env.NEXT_PUBLIC_DEFAULT_TENANT_CODE || 'apexbase';
  }
  return _tenantCode;
}

/**
 * Clear GSB authentication
 */
export function clearGsbAuth(): void {
  _token = null;
  _tenantCode = null;
}

// Helper for error throwing
function throwError(message: string): never {
  throw new Error(message);
}

/**
 * GSB Environment Configuration
 */
export const GSB_CONFIG = {
  // API
  API_URL: process.env.NEXT_PUBLIC_GSB_API_URL || 'https://dev1.gsbapps.net',
  AUTH_URL: process.env.NEXT_PUBLIC_GSB_AUTH_URL || 'https://common.gsbapps.net',

  // Default tenant
  DEFAULT_TENANT: process.env.NEXT_PUBLIC_DEFAULT_TENANT_CODE || 'apexbase',

  // Function for extracting tenant code from token
  extractTenantCode: (token: string): string | undefined => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.tc || undefined;
    } catch {
      return undefined;
    }
  }
};
