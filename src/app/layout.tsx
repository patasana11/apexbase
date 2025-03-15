import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ClientBody from "./ClientBody";
import TenantInitializer from "@/components/tenant-initializer";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "BackendPro | Enterprise-Grade Backend as a Service",
  description:
    "Secure, scalable backend infrastructure for modern applications. Authentication, database, storage, functions, and more in one unified platform.",
  authors: [
    {
      name: "BackendPro",
    },
  ],
  creator: "BackendPro",
  publisher: "BackendPro",
  keywords: [
    "backend as a service",
    "BaaS",
    "cloud backend",
    "serverless",
    "database",
    "authentication",
    "storage",
    "functions",
    "API",
    "enterprise security",
  ],
  openGraph: {
    title: "BackendPro | Enterprise-Grade Backend as a Service",
    description:
      "Secure, scalable backend infrastructure for modern applications. Authentication, database, storage, functions, and more in one unified platform.",
    url: "https://backendpro.com",
    siteName: "BackendPro",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BackendPro | Enterprise-Grade Backend as a Service",
    description:
      "Secure, scalable backend infrastructure for modern applications. Authentication, database, storage, functions, and more in one unified platform.",
    creator: "@backendpro",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.className}>
      <body className="antialiased">
        <TenantInitializer />
        <ClientBody>{children}</ClientBody>
      </body>
    </html>
  );
}
