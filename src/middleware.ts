import { NextResponse } from 'next/server';
import { withAuth } from 'next-auth/middleware';

/**
 * ApexBase Middleware
 * 
 * This middleware handles authentication and authorization for the application.
 * The system uses GSB API exclusively as the backend, with NextAuth for authentication.
 * NextAuth JWT strategy is used for session management, without a database adapter.
 */
export default withAuth(
  function middleware(req) {
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
        // Public routes and auth routes - allow access without authentication
        if (req.nextUrl.pathname.startsWith('/api/auth') ||
            req.nextUrl.pathname === '/' ||
            req.nextUrl.pathname.startsWith('/pricing') ||
            req.nextUrl.pathname.startsWith('/terms') ||
            req.nextUrl.pathname.startsWith('/privacy') ||
            req.nextUrl.pathname.startsWith('/blog') ||
            req.nextUrl.pathname.startsWith('/contact') ||
            req.nextUrl.pathname.startsWith('/about') ||
            req.nextUrl.pathname.startsWith('/login') ||
            req.nextUrl.pathname.startsWith('/register') ||
            req.nextUrl.pathname.startsWith('/verify')) {
          return true;
        }
        
        // Protected routes - require authentication
        return !!token;
      },
    },
  }
);

// Configure protected routes and public routes
export const config = {
  matcher: [
    // Protected routes (SPA)
    '/dashboard/:path*',
    '/account/:path*',
    '/api/:path*',
    
    // Public routes (SSR)
    '/',
    '/pricing',
    '/terms',
    '/privacy',
    '/blog/:path*',
    '/contact',
    '/about',
  ],
}; 