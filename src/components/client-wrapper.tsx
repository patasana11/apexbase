'use client';

import { useEffect, useState, type ReactNode } from 'react';

interface ClientWrapperProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * A wrapper component that ensures its children are only rendered on the client side.
 * This helps avoid SSR-related issues with components that use useLayoutEffect.
 */
export function ClientWrapper({ children, fallback = null }: ClientWrapperProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return fallback;
  }

  return <>{children}</>;
} 