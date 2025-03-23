'use client';

import React, { useState, useEffect, memo, useRef } from 'react';
import { ThemeProvider } from './theme-provider';
import { NavigationProvider } from './navigation-context';
import { NavigationProgress } from './navigation-progress';
import { AuthProvider } from './auth-context';

// Memoize Providers component to prevent re-renders
export const Providers = memo(function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  // Use a ref to track log output so we don't spam the console during navigations
  const hasLoggedRef = useRef(false);
  const hasRenderedRef = useRef(false);

  // This effect ensures hydration is complete before rendering
  // to prevent hydration mismatch errors with authentication
  useEffect(() => {
    // Mark as mounted on first render
    setMounted(true);

    // Only log on first mount
    if (!hasLoggedRef.current) {
      console.log('Providers: Component mounted, hydration complete');
      hasLoggedRef.current = true;
    }

    return () => {
      // Don't reset hasLoggedRef to preserve the logged state
      // But DO reset hasRenderedRef to track new render cycles
      hasRenderedRef.current = false;
    };
  }, []);

  // Ensure consistent rendering between server and client
  // by waiting until after hydration is complete
  if (!mounted) {
    // Return a minimal skeleton until client-side hydration is complete
    return <div className="min-h-screen bg-background" />;
  }

  // Only log once per render cycle
  if (!hasRenderedRef.current) {
    hasRenderedRef.current = true;
  }

  return (
    <AuthProvider>
      <NavigationProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <NavigationProgress />
          {children}
        </ThemeProvider>
      </NavigationProvider>
    </AuthProvider>
  );
});
