import "./globals.css";
import { Suspense } from "react";
import { Metadata } from 'next';
import { Inter } from 'next/font/google';
import TenantInitializer from "@/components/tenant-initializer";
import ClientBody from "./ClientBody";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/toaster"
import { Providers } from '@/components/providers';

// Font configuration
const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'ApexBase - Your Business Management Solution',
    template: '%s | ApexBase',
  },
  description: 'A comprehensive business management platform for modern enterprises',
  keywords: [
    'business management',
    'enterprise software',
    'project management',
    'team collaboration',
    'workflow automation',
  ],
  authors: [{ name: 'ApexBase Team' }],
  creator: 'ApexBase',
  publisher: 'ApexBase',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://apexbase.com',
    title: 'ApexBase - Your Business Management Solution',
    description: 'A comprehensive business management platform for modern enterprises',
    siteName: 'ApexBase',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ApexBase - Your Business Management Solution',
    description: 'A comprehensive business management platform for modern enterprises',
    creator: '@apexbase',
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className={cn('min-h-screen bg-background antialiased', inter.className)}>
        <Providers>
          <Suspense fallback={<div>Loading...</div>}>
            <TenantInitializer />
          </Suspense>
          <ClientBody>{children}</ClientBody>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
