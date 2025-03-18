import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { withAuth } from 'next-auth/middleware';

/**
 * ApexBase Middleware
 *
 * This middleware handles authentication and authorization for the application.
 * It's simplified to avoid server-side redirects and focus on client-side authentication.
 */
export default withAuth(
  function middleware(req) {
    const path = req.nextUrl.pathname;
    
    // Add GSB token to request headers if available
    const token = req.nextauth?.token;
    if (token?.gsbToken) {
      const requestHeaders = new Headers(req.headers);
      requestHeaders.set('Authorization', `Bearer ${token.gsbToken}`);

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname;

        // Special handling for root and public paths
        if (path === '/' || isPublicRoute(path)) {
          return true;
        }

        // Protected routes - require authentication
        return !!token;
      },
    },
    pages: {
      signIn: '/login',
    }
  }
);

/**
 * Helper function to check if a route is public
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
