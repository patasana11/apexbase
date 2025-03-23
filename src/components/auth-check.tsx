'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
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
    if (!hasMounted || status === 'loading') return;

    // Reset redirect flag when pathname changes
    if (pathname !== lastPathnameRef.current) {
      hasRedirectedRef.current = false;
      lastPathnameRef.current = pathname;
    }

    // Only check auth if we know the authentication status and haven't redirected yet
    if (hasRedirectedRef.current) {
      return;
    }

    const isAuthPage = pathname?.startsWith('/login') ||
                      pathname?.startsWith('/register') ||
                      pathname?.startsWith('/forgot-password');

    const isProtectedPage = pathname?.startsWith('/dashboard') ||
                          pathname?.startsWith('/account');

    // Redirect authenticated users away from auth pages
    if (isAuthPage && isAuthenticated) {
      console.log('AuthCheck: Redirecting authenticated user from auth page to dashboard');
      navigateClientSide('/dashboard');
    }
    // Redirect unauthenticated users away from protected pages
    else if (isProtectedPage && !isAuthenticated) {
      console.log('AuthCheck: Redirecting unauthenticated user from protected page to login');
      navigateClientSide('/login');
    }
    // No redirect needed, mark navigation as complete
    else {
      completeNavigation();
    }
  }, [status, isAuthenticated, pathname, hasMounted]);

  // Always render children to avoid hydration mismatches
  // Auth redirects happen after mounting via useEffect
  return <>{children}</>;
}
