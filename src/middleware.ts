import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * ApexBase Middleware
 *
 * This middleware handles both common and user-specific tokens based on URL path.
 */
export function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  console.log(`[Middleware] Processing request for path: ${path}`);

  // Determine which token to use based on the path
  const useCommonToken = shouldUseCommonToken(path);

  // Get appropriate token from cookies
  const tokenKey = useCommonToken ? 'gsb_common_token' : 'gsb_user_token';
  let token = req.cookies.get(tokenKey)?.value;

  // If user token is not available but needed, fall back to common token
  if (!useCommonToken && !token) {
    token = req.cookies.get('gsb_common_token')?.value;
  }

  if (token) {
    console.log(`[Middleware] Found GSB ${useCommonToken ? 'common' : 'user'} token for path: ${path}`);
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set('Authorization', `Bearer ${token}`);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  // For all other cases, just proceed without checking auth
  console.log(`[Middleware] No auth token for path: ${path}, proceeding anyway`);
  return NextResponse.next();
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
 * Helper function to check if a route is public (for logging/debugging)
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
