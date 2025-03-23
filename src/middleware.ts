import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// These should match the ones in auth.service.ts
const COMMON_TOKEN_STORAGE_KEY = 'gsb_common_token';
const USER_TOKEN_STORAGE_KEY = 'gsb_user_token';

/**
 * ApexBase Middleware
 *
 * This middleware handles both common and user-specific tokens based on URL path.
 * It also handles redirecting unauthorized users from protected routes to login.
 */
export function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  console.log(`[Middleware] Processing request for path: ${path}`);

  // Skip auth check for public routes
  if (isPublicRoute(path)) {
    return NextResponse.next();
  }

  // Determine which token to use based on the path
  const useCommonToken = shouldUseCommonToken(path);

  // Get appropriate token from cookies
  // Note: We still need to use cookies in middleware since it runs on the server
  // and doesn't have access to localStorage or the client-side AuthService
  const tokenKey = useCommonToken ? COMMON_TOKEN_STORAGE_KEY : USER_TOKEN_STORAGE_KEY;
  let token = req.cookies.get(tokenKey)?.value;

  // If user token is not available but needed, fall back to common token
  if (!useCommonToken && !token) {
    token = req.cookies.get(COMMON_TOKEN_STORAGE_KEY)?.value;
  }

  // Check if token is valid
  if (token) {
    // Validate token expiry
    if (isTokenExpired(token)) {
      console.log(`[Middleware] Token expired for path: ${path}, redirecting to login`);
      
      // Create the callback URL with the current path
      const url = new URL('/login', req.url);
      url.searchParams.set('callbackUrl', path);
      
      return NextResponse.redirect(url);
    }
    
    console.log(`[Middleware] Found valid GSB ${useCommonToken ? 'common' : 'user'} token for path: ${path}`);
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set('Authorization', `Bearer ${token}`);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  // Check if this is a protected route that requires authentication
  if (isProtectedRoute(path)) {
    console.log(`[Middleware] No auth token for protected path: ${path}, redirecting to login`);
    
    // Create the callback URL with the current path
    const url = new URL('/login', req.url);
    url.searchParams.set('callbackUrl', path);
    
    return NextResponse.redirect(url);
  }

  // For all other cases, just proceed without checking auth
  console.log(`[Middleware] No auth token for path: ${path}, proceeding anyway`);
  return NextResponse.next();
}

/**
 * Check if token is expired
 * @param token The JWT token to check
 * @returns True if the token is expired
 */
function isTokenExpired(token: string): boolean {
  try {
    // Decode JWT token to get expiry
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    
    const payload = JSON.parse(jsonPayload);
    
    // Check for exp claim
    if (payload.exp) {
      const expiryTime = payload.exp * 1000; // Convert to milliseconds
      const now = Date.now();
      return now >= expiryTime;
    }
    
    // If no exp claim, check for custom expireDate field
    if (payload.expireDate) {
      const expiryTime = new Date(payload.expireDate).getTime();
      const now = Date.now();
      return now >= expiryTime;
    }
    
    // If no expiry info found, consider not expired
    return false;
  } catch (error) {
    console.error('[Middleware] Error checking token expiry:', error);
    // If we can't decode the token, consider it expired for safety
    return true;
  }
}

/**
 * Check if common token should be used based on URL path
 * @param pathname The URL path
 * @returns True if common token should be used
 */
function shouldUseCommonToken(pathname: string): boolean {
  const commonPaths = [
    '/api/auth',
    '/login',
    '/register',
    '/forgot-password',
    '/registration',
    '/account'
  ];

  // Check if pathname starts with any of the common paths
  return commonPaths.some(path => pathname.startsWith(path));
}

/**
 * Helper function to check if a route requires authentication
 */
function isProtectedRoute(pathname: string): boolean {
  const protectedPaths = [
    '/dashboard',
    '/account',
    '/settings',
    '/projects',
    '/admin',
  ];

  // Check if pathname starts with any of the protected paths
  return protectedPaths.some(path => pathname.startsWith(path));
}

/**
 * Helper function to check if a route is public (no auth required)
 */
function isPublicRoute(pathname: string): boolean {
  const publicPaths = [
    '/api/auth',
    '/pricing',
    '/terms',
    '/privacy',
    '/blog',
    '/contact',
    '/about',
    '/login',
    '/register',
    '/forgot-password',
    '/verify',
    '/checkout',
    '/_next',
    '/favicon',
    '/registration',
    '/test-gsb',
    '/icon',
    '/globals.css',
  ];

  // Static assets and root path are always public
  if (pathname === '/' ||
      pathname.startsWith('/_next/') ||
      pathname.endsWith('.ico') ||
      pathname.endsWith('.png') ||
      pathname.endsWith('.svg') ||
      pathname.endsWith('.jpg') ||
      pathname.endsWith('.jpeg') ||
      pathname.endsWith('.webp') ||
      pathname.endsWith('.css') ||
      pathname.endsWith('.js')) {
    return true;
  }

  // Check if pathname starts with any of the public paths
  return publicPaths.some(path => pathname.startsWith(path));
}

// Specify which routes the middleware applies to
export const config = {
  matcher: [
    // Include all routes except static assets
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
