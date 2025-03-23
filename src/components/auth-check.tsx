'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useAuth } from './auth-context';
import { useNavigation } from './navigation-context';

/**
 * This component handles client-side authentication checking.
 * It ensures consistent rendering during initial hydration to prevent
 * hydration mismatches, then performs auth checks after mounting.
 */
export function AuthCheck({ children }: { children: React.ReactNode }) {
  const { status, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isNavigating, startNavigation, completeNavigation } = useNavigation();
  const [hasMounted, setHasMounted] = useState(false);

  // Track navigation status to avoid redundant redirects
  const hasRedirectedRef = useRef(false);
  // Track last pathname for navigation detection
  const lastPathnameRef = useRef<string | null>(null);

  // Enhanced client-side navigation helper
  const navigateClientSide = (path: string) => {
    console.log(`AuthCheck: Client-side navigation to: ${path}`);
    startNavigation();
    hasRedirectedRef.current = true;

    // Use replace to avoid adding to history stack
    // This gives a true SPA experience with no page reloads
    router.replace(path, {
      scroll: false // Prevents scroll reset
    });
  };

  // Only run auth checks AFTER hydration is complete
  useEffect(() => {
    // First mark component as mounted to ensure hydration is complete
    setHasMounted(true);
    lastPathnameRef.current = pathname;

    // Cleanup function to reset navigation tracking on unmount
    return () => {
      hasRedirectedRef.current = false;
    };
  }, []);

  // Handle authentication logic separately after mounting
  useEffect(() => {
    if (!hasMounted) return;

    // Reset redirect flag when pathname changes
    if (pathname !== lastPathnameRef.current) {
      hasRedirectedRef.current = false;
      lastPathnameRef.current = pathname;
    }

    // Don't process if we've already redirected to avoid loops
    if (hasRedirectedRef.current) {
      return;
    }

    // List of protected routes requiring authentication
    const protectedRoutes = [
      '/dashboard',
      '/account',
      '/settings',
      '/projects',
      '/admin',
    ];

    const isAuthPage = pathname?.startsWith('/login') ||
                      pathname?.startsWith('/register') ||
                      pathname?.startsWith('/forgot-password');

    const isProtectedPage = protectedRoutes.some(route => pathname?.startsWith(route));

    console.log(`AuthCheck: Checking auth for path: ${pathname}, isProtected: ${isProtectedPage}, isAuthPage: ${isAuthPage}, isAuthenticated: ${isAuthenticated}, status: ${status}`);

    // For protected pages, check auth status immediately
    if (isProtectedPage) {
      // If we're still loading, wait before redirect
      if (status === 'loading') {
        // Don't redirect, but also don't complete navigation
        return;
      }
      
      // If not authenticated, redirect to login immediately
      if (!isAuthenticated) {
        console.log('AuthCheck: Redirecting unauthenticated user from protected page to login');
        
        // Add the current path as a callback parameter
        const currentUrl = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');
        const encodedCallback = encodeURIComponent(currentUrl);
        const loginPath = `/login?callbackUrl=${encodedCallback}`;
        
        navigateClientSide(loginPath);
        return;
      }
    }

    // Redirect authenticated users away from auth pages
    if (isAuthPage && isAuthenticated && status !== 'loading') {
      console.log('AuthCheck: Redirecting authenticated user from auth page');
      
      // Check if there's a callback URL to redirect to
      const callbackUrl = searchParams?.get('callbackUrl');
      const redirectTarget = callbackUrl ? decodeURIComponent(callbackUrl) : '/dashboard';
      
      navigateClientSide(redirectTarget);
      return;
    }

    // If we've reached here, no redirect needed, complete any navigation
    if (status !== 'loading') {
      completeNavigation();
    }
  }, [status, isAuthenticated, pathname, hasMounted, searchParams, router, startNavigation, completeNavigation]);

  // Always render children to avoid hydration mismatches
  // Auth redirects happen after mounting via useEffect
  return <>{children}</>;
}
