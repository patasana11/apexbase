'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';

/**
 * This component handles client-side authentication checking.
 * It only redirects unauthenticated users away from protected pages,
 * and authenticated users away from auth pages.
 */
export function AuthCheck({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // If still loading the session, do nothing
    if (status === 'loading') return;

    const isAuthPage = pathname.startsWith('/login') || 
                       pathname.startsWith('/register') || 
                       pathname.startsWith('/forgot-password');
                       
    const isProtectedPage = pathname.startsWith('/dashboard') || 
                            pathname.startsWith('/account');

    // Redirect authenticated users away from auth pages
    if (isAuthPage && status === 'authenticated') {
      router.push('/dashboard');
    }
    
    // Redirect unauthenticated users away from protected pages
    if (isProtectedPage && status === 'unauthenticated') {
      router.push(`/login`);
    }
  }, [status, pathname, router]);

  // Always render children - any necessary redirects happen via useEffect
  return <>{children}</>;
} 