'use client';

import { useEffect, useState, useRef } from 'react';
import { AppInitializerService } from '@/lib/gsb/services/app-initializer.service';

/**
 * TenantInitializer component
 *
 * This component handles app and tenant initialization on startup.
 * In development mode, it sets up the test token and tenant code.
 * In production, it sets up the tenant based on the hostname.
 */
export default function TenantInitializer() {
  const initializedRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined' || initializedRef.current) return;

    try {
      // Set the ref immediately to prevent double initialization
      initializedRef.current = true;

      // Initialize the app with the AppInitializerService
      const appInitializer = AppInitializerService.getInstance();
      appInitializer.initialize();

      console.log('App initialization completed');
    } catch (error) {
      console.error('Error during initialization:', error);
    }
  }, []);

  // This component doesn't render anything
  return null;
}
