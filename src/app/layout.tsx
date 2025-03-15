import "./globals.css";
import { Suspense } from "react";
import type { Metadata } from "next";
import { Inter as FontSans } from "next/font/google";
import TenantInitializer from "@/components/tenant-initializer";
import ClientBody from "./ClientBody";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/toaster"

// Font configuration
const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: {
    default: "ApexBase - Enterprise-Grade Backend as a Service",
    template: "%s | ApexBase",
  },
  description:
    "ApexBase is an enterprise-grade Backend as a Service (BaaS) that provides scalable backend infrastructure for your applications.",
  keywords: [
    "baas",
    "backend as a service",
    "serverless",
    "api",
    "database",
    "storage",
    "authentication",
    "enterprise",
  ],
  authors: [
    {
      name: "ApexBase",
      url: "https://apexbase.com",
    },
  ],
  creator: "ApexBase",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://apexbase.com",
    title: "ApexBase - Enterprise-Grade Backend as a Service",
    description: "ApexBase is an enterprise-grade Backend as a Service (BaaS).",
    siteName: "ApexBase",
  },
  twitter: {
    card: "summary_large_image",
    title: "ApexBase - Enterprise-Grade Backend as a Service",
    description: "ApexBase is an enterprise-grade Backend as a Service (BaaS).",
    creator: "@apexbase",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable
        )}
      >
        <Suspense fallback={<div>Loading...</div>}>
          <TenantInitializer />
        </Suspense>
        <ClientBody>{children}</ClientBody>
        <Toaster />
      </body>
    </html>
  );
}
