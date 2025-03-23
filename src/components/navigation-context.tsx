'use client';

import { createContext, useContext, useState, useCallback, useEffect, ReactNode, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';

interface NavigationContextType {
  isNavigating: boolean;
  startNavigation: () => void;
  completeNavigation: () => void;
  currentPathname: string;
  navigateTo: (path: string, options?: { scroll?: boolean }) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

/**
 * NavigationProvider
 *
 * This component provides global navigation state management to make
 * the Next.js App Router with RSC feel more like a traditional SPA.
 *
 * It tracks navigation state, prefetches routes, and provides a consistent
 * navigation experience across the app.
 */
export function NavigationProvider({ children }: { children: ReactNode }) {
  const [isNavigating, setIsNavigating] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const navigationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastNavigationTimeRef = useRef<number>(0);
  const previousPathnameRef = useRef<string | null>(null);

  // Track if the component has mounted
  useEffect(() => {
    setHasMounted(true);
    previousPathnameRef.current = pathname;

    // Clear any navigation timeout on unmount
    return () => {
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current);
      }
    };
  }, [pathname]);

  // Monitor pathname changes to detect when navigation completes
  useEffect(() => {
    if (!hasMounted) return;

    // If pathname changed and we were navigating, complete navigation
    if (previousPathnameRef.current !== pathname && isNavigating) {
      completeNavigation();
    }

    // Update previous pathname
    previousPathnameRef.current = pathname;
  }, [pathname, hasMounted, isNavigating]);

  // Start navigation indicator
  const startNavigation = useCallback(() => {
    // Throttle navigation starts to prevent rapid flickering
    const now = Date.now();
    if (now - lastNavigationTimeRef.current < 300) {
      return;
    }

    lastNavigationTimeRef.current = now;
    setIsNavigating(true);

    // Safety timeout to ensure navigation state doesn't get stuck
    if (navigationTimeoutRef.current) {
      clearTimeout(navigationTimeoutRef.current);
    }

    navigationTimeoutRef.current = setTimeout(() => {
      completeNavigation();
    }, 8000); // 8-second safety timeout
  }, []);

  // Complete navigation - called both automatically and manually
  const completeNavigation = useCallback(() => {
    setIsNavigating(false);

    // Clear timeout since navigation completed
    if (navigationTimeoutRef.current) {
      clearTimeout(navigationTimeoutRef.current);
      navigationTimeoutRef.current = null;
    }
  }, []);

  // Navigate to a path and correctly manage navigation state
  const navigateTo = useCallback((path: string, options = { scroll: false }) => {
    startNavigation();
    router.push(path, { scroll: options.scroll });
  }, [router, startNavigation]);

  // Listen for Next.js router events (not exposed directly but can be detected by window events)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Manual detection of navigation events using heuristics
    const detectNavigationStart = () => {
      // Only detect navigation start if we're not already navigating
      if (!isNavigating) {
        startNavigation();
      }
    };

    // Listen for potential navigation indicators
    window.addEventListener('mousedown', e => {
      // Check if the click is on a link
      const target = e.target as HTMLElement;
      const link = target.closest('a');
      if (link && link.href && !link.href.startsWith('javascript:') && !link.target) {
        // This is a potential navigation
        detectNavigationStart();
      }
    });

    // Also listen for popstate for back/forward navigation
    window.addEventListener('popstate', detectNavigationStart);

    return () => {
      window.removeEventListener('popstate', detectNavigationStart);
    };
  }, [isNavigating, startNavigation]);

  return (
    <NavigationContext.Provider
      value={{
        isNavigating,
        startNavigation,
        completeNavigation,
        currentPathname: pathname || '/',
        navigateTo
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);

  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }

  return context;
}
