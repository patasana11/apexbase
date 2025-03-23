/**
 * GSB Configuration
 */

// GSB Authentication
let _commonToken: string | null = null;
let _userToken: string | null = null;
let _commonTenantCode: string = 'common';
let _userTenantCode: string | null = null;

// Path prefixes for determining which token to use
const COMMON_TOKEN_PATHS = [
  '/api/auth',
  '/login',
  '/register',
  '/forgot-password',
  '/registration',
  '/account'
];

/**
 * Set the GSB token for the common tenant
 * @param token The GSB token for common tenant
 */
export function setCommonGsbToken(token: string): void {
  console.log('Setting Common GSB token', token ? token.substring(0, 10) + '...' : 'null');
  _commonToken = token;
}

/**
 * Set the GSB token for the user tenant
 * @param token The GSB token for user tenant
 */
export function setUserGsbToken(token: string): void {
  console.log('Setting User GSB token', token ? token.substring(0, 10) + '...' : 'null');
  _userToken = token;
}

/**
 * Set the GSB token (legacy function, sets both tokens)
 * @param token The GSB token
 * @param isCommonToken Whether this is a common tenant token
 */
export function setGsbToken(token: string, isCommonToken: boolean = false): void {
  console.log('Setting GSB token', token ? token.substring(0, 10) + '...' : 'null');
  if (isCommonToken) {
    _commonToken = token;
  } else {
    const tenantCode = extractTenantCodeFromToken(token);
    if (tenantCode === _commonTenantCode) {
      _commonToken = token;
    } else {
      _userToken = token;
      if (tenantCode) {
        _userTenantCode = tenantCode;
      }
    }
  }
}

/**
 * Get the GSB token based on the current path
 * @param path Optional path to determine which token to use
 * @returns The appropriate GSB token
 */
export function getGsbToken(path?: string): string {
  // Determine if we should use common token based on path
  const useCommonToken = shouldUseCommonToken(path);

  if (useCommonToken) {
    if (!_commonToken) {
      console.warn('Common GSB Token not set - using fallback for development');
      return process.env.NODE_ENV === 'development'
        ? 'dev-fallback-common-token'
        : throwError('Common GSB Token not set');
    }
    return _commonToken;
  } else {
    if (!_userToken) {
      // If no user token is available, fall back to common token
      if (_commonToken) {
        console.warn('User GSB Token not set - falling back to common token');
        return _commonToken;
      }
      console.warn('No GSB Token available - using fallback for development');
      return process.env.NODE_ENV === 'development'
        ? 'dev-fallback-user-token'
        : throwError('GSB Token not set');
    }
    return _userToken;
  }
}

/**
 * Set the GSB tenant code for user tenant
 * @param tenantCode The GSB tenant code
 */
export function setGsbTenantCode(tenantCode: string): void {
  console.log('Setting GSB tenant code:', tenantCode);
  if (tenantCode === _commonTenantCode) {
    // This is a common tenant code
    console.log('Setting common tenant code');
  } else {
    _userTenantCode = tenantCode;
  }
}

/**
 * Get the GSB tenant code based on the current path
 * @param path Optional path to determine which tenant code to use
 * @returns The appropriate GSB tenant code
 */
export function getGsbTenantCode(path?: string): string {
  // Determine if we should use common tenant based on path
  const useCommonTenant = shouldUseCommonToken(path);

  if (useCommonTenant) {
    return _commonTenantCode;
  } else {
    if (!_userTenantCode) {
      console.warn('User GSB Tenant Code not set - using default from env');
      return process.env.NEXT_PUBLIC_DEFAULT_TENANT_CODE || 'apexbase';
    }
    return _userTenantCode;
  }
}

/**
 * Clear GSB authentication
 */
export function clearGsbAuth(): void {
  _commonToken = null;
  _userToken = null;
  _userTenantCode = null;
}

/**
 * Determine if the common token should be used based on the path
 * @param path The current path
 * @returns True if common token should be used
 */
function shouldUseCommonToken(path?: string): boolean {
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
 * Extract tenant code from a JWT token
 * @param token The JWT token
 * @returns The tenant code or undefined
 */
function extractTenantCodeFromToken(token: string): string | undefined {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.tc || undefined;
  } catch {
    return undefined;
  }
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
  COMMON_TENANT: 'common',

  // Multi-tenant support
  ENABLE_MULTI_TENANT: process.env.NEXT_PUBLIC_ENABLE_MULTI_TENANT === 'true',

  // Function for extracting tenant code from token
  extractTenantCode: extractTenantCodeFromToken
};
