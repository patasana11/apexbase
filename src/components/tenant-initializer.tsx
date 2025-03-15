'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { setupTenant } from '@/lib/config/tenant-config';

/**
 * TenantInitializer component
 *
 * This component handles tenant initialization on app startup.
 * It sets up the correct tenant based on the hostname and stores
 * the current tenant in localStorage.
 */
export default function TenantInitializer() {
  const pathname = usePathname();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || initialized) return;

    try {
      const hostname = window.location.hostname;
      const tenant = setupTenant(hostname);
      console.log(`Initialized tenant: ${tenant}`);
      setInitialized(true);
    } catch (error) {
      console.error('Error initializing tenant:', error);
    }
  }, [pathname, initialized]);

  // This component doesn't render anything
  return null;
}
