'use client';

import { useEffect, useState, useRef, type ReactNode, memo } from 'react';

interface ClientWrapperProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * A wrapper component that ensures its children are only rendered on the client side.
 * This helps avoid SSR-related issues with components that use useLayoutEffect.
 *
 * Memoized to prevent re-renders during navigation.
 */
export const ClientWrapper = memo(function ClientWrapper({
  children,
  fallback = null
}: ClientWrapperProps) {
  const [isClient, setIsClient] = useState(false);
  const isMountedRef = useRef(false);

  useEffect(() => {
    if (!isMountedRef.current) {
      isMountedRef.current = true;
      setIsClient(true);
    }

    // No need to reset anything on cleanup
    return () => {};
  }, []);

  if (!isClient) {
    return fallback;
  }

  return <>{children}</>;
});
