'use client';

import dynamic from 'next/dynamic';
import type { ComponentType } from 'react';

/**
 * Creates a dynamic component that is only loaded on the client side.
 * This helps avoid SSR-related issues with hooks like useLayoutEffect.
 */
export function createClientComponent<T>(component: ComponentType<T>) {
  return dynamic(() => Promise.resolve(component), {
    ssr: false
  });
} 