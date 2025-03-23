'use client';

import { forwardRef } from 'react';
import Link, { LinkProps } from 'next/link';
import { useRouter } from 'next/navigation';

interface ClientNavigationLinkProps extends LinkProps {
  children: React.ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

/**
 * A wrapper around Next.js Link component that ensures client-side navigation
 * by setting prefetch=true and preventing default behavior for local links.
 */
export const ClientNavigationLink = forwardRef<HTMLAnchorElement, ClientNavigationLinkProps>(
  ({ href, onClick, children, className, ...props }, ref) => {
    const router = useRouter();

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
      // If it's a local link (not external), handle it client-side
      if (typeof href === 'string' && !href.startsWith('http') && !href.startsWith('mailto:')) {
        e.preventDefault();

        // Log the navigation for debugging
        console.log('Client-side navigation to:', href);

        // Use router.push for programmatic navigation
        router.push(href);
      }

      // Also call the passed onClick handler if provided
      if (onClick) {
        onClick(e);
      }
    };

    return (
      <Link
        ref={ref}
        href={href}
        onClick={handleClick}
        className={className}
        prefetch={true}
        {...props}
      >
        {children}
      </Link>
    );
  }
);

ClientNavigationLink.displayName = 'ClientNavigationLink';
