'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { AppInitializerService } from '@/lib/services/app-initializer.service';

/**
 * TenantInitializer component
 *
 * This component handles app and tenant initialization on startup.
 * In development mode, it sets up the test token and tenant code.
 * In production, it sets up the tenant based on the hostname.
 */
export default function TenantInitializer() {
  const pathname = usePathname();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || initialized) return;

    try {
      // Initialize the app with the AppInitializerService
      const appInitializer = AppInitializerService.getInstance();
      appInitializer.initialize();
      
      console.log('App initialization completed');
      setInitialized(true);
    } catch (error) {
      console.error('Error during initialization:', error);
    }
  }, [pathname, initialized]);

  // This component doesn't render anything
  return null;
}
