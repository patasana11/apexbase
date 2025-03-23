'use client';

import { useEffect, useState, ReactNode } from 'react';

interface ClientOnlyProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Component that only renders its children on the client, after hydration.
 * This helps prevent hydration mismatches when content depends on browser-only APIs.
 */
export default function ClientOnly({ children, fallback = null }: ClientOnlyProps) {
  const [hasMounted, setHasMounted] = useState(false);

  // Only show children after component has mounted on the client
  useEffect(() => {
    setHasMounted(true);
  }, []);

  // On the server, or during initial client render before useEffect fires,
  // render the fallback (or nothing)
  if (!hasMounted) {
    return fallback;
  }

  // After hydration, render the children
  return <>{children}</>;
}

// Also export as named export for flexibility
export { ClientOnly };
