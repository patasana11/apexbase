/**
 * Tenant Configuration
 * Handles multi-tenant setup with common tenant and workspace tenants
 */

import { setGsbToken, setGsbTenantCode } from './gsb-config';

// Constants
export const COMMON_TENANT = 'common';
export const DEV_TENANT = 'dev1';

// Tenant tokens for development mode
const DEV_TOKENS = {
  common: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiJiZjE1MjRiNy04MjBmLTQ2NGYtOWYzNC02ZWQ2Y2Q5NjVlNjEiLCJ0YyI6ImNvbW1vbiIsImlzcyI6IkBnc2IifQ.7k1Kj-6RGF09xwXKrJMFdC32_4B--cDkQGKI-7_6yNM",
  dev1: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiJiZjE1MjRiNy04MjBmLTQ2NGYtOWYzNC02ZWQ2Y2Q5NjVlNjEiLCJ0YyI6ImRldjEiLCJpIjoiOThCNUU0OUQiLCJleHAiOjE3NDMwMDcwMzQsImlzcyI6IkBnc2IifQ.0WImy6Y1XmC0RwJPG-Y3teTlAA4wL17rgDYARyySciQ"
};

// Storage keys
const STORAGE_KEYS = {
  tokenPrefix: 'gsb_token_',
  currentTenant: 'current_tenant'
};

/**
 * Parse tenant code from hostname
 * @param hostname The hostname to extract tenant from
 * @returns Tenant code or null if using main domain
 */
export function getTenantFromHostname(hostname: string): string | null {
  // In production, check for subdomain
  const parts = hostname.split('.');

  // If we have a subdomain (like tenant1.apexbase.com)
  if (parts.length > 2 && parts[0] !== 'www' && parts[0] !== 'app') {
    return parts[0];
  }

  // Otherwise it's the main domain (common tenant)
  return null;
}

/**
 * Set up tenant based on the current environment
 * @param hostname Current hostname
 * @param isDevMode Whether we're in development mode
 * @returns The current tenant code
 */
export function setupTenant(hostname: string, isDevMode: boolean = process.env.NODE_ENV === 'development'): string {
  const tenantFromHostname = getTenantFromHostname(hostname);
  let currentTenant = tenantFromHostname || COMMON_TENANT;

  // Store the current tenant
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.currentTenant, currentTenant);
  }

  // In development mode, set up tokens automatically
  if (isDevMode) {
    const token = DEV_TOKENS[currentTenant] || DEV_TOKENS[DEV_TENANT];
    setGsbToken(token);
    setGsbTenantCode(currentTenant);
    console.log(`[DEV] Set up tenant: ${currentTenant}`);
  }

  return currentTenant;
}

/**
 * Check if we should initialize a specific tenant
 * @param desiredTenant The desired tenant to check
 * @returns True if we should initialize the desired tenant
 */
export function shouldInitTenant(desiredTenant: string): boolean {
  if (typeof window === 'undefined') return false;

  const currentTenant = localStorage.getItem(STORAGE_KEYS.currentTenant) || COMMON_TENANT;
  return currentTenant === desiredTenant;
}

/**
 * Get the workspace URL for a tenant
 * @param tenant The tenant code
 * @returns Full URL to the tenant workspace
 */
export function getWorkspaceUrl(tenant: string): string {
  const baseUrl = typeof window !== 'undefined'
    ? window.location.origin.split('.').slice(-2).join('.')
    : 'apexbase.com';

  return `https://${tenant}.${baseUrl}/dashboard`;
}

/**
 * Save a tenant token
 * @param tenant Tenant code
 * @param token JWT token
 */
export function saveTenantToken(tenant: string, token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(`${STORAGE_KEYS.tokenPrefix}${tenant}`, token);
}

/**
 * Get a saved tenant token
 * @param tenant Tenant code
 * @returns The JWT token or null if not found
 */
export function getTenantToken(tenant: string): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(`${STORAGE_KEYS.tokenPrefix}${tenant}`);
}

/**
 * Switch to a different tenant
 * @param tenant The tenant code to switch to
 * @param token Optional JWT token (if not provided, will try to get from storage)
 * @returns True if successful
 */
export function switchTenant(tenant: string, token?: string): boolean {
  if (typeof window === 'undefined') return false;

  // Use provided token or get from storage
  const tokenToUse = token || getTenantToken(tenant);
  if (!tokenToUse) return false;

  // Set token and tenant code
  setGsbToken(tokenToUse);
  setGsbTenantCode(tenant);
  localStorage.setItem(STORAGE_KEYS.currentTenant, tenant);

  return true;
}

/**
 * Get the current tenant
 * @returns Current tenant code
 */
export function getCurrentTenant(): string {
  if (typeof window === 'undefined') return COMMON_TENANT;
  return localStorage.getItem(STORAGE_KEYS.currentTenant) || COMMON_TENANT;
}

/**
 * Parse tenant from JWT token
 * @param token JWT token
 * @returns Tenant code or null if can't parse
 */
export function getTenantFromToken(token: string): string | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.tc || null;
  } catch (e) {
    return null;
  }
}
