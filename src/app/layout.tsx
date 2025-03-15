import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClientBody from "./ClientBody";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BackendPro | Enterprise-Grade Backend as a Service",
  description: "Secure, scalable backend infrastructure for modern applications. Authentication, database, storage, functions, and more in one unified platform.",
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
  authors: [{ name: "BackendPro" }],
  creator: "BackendPro",
  publisher: "BackendPro",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://backendpro.com",
    title: "BackendPro | Enterprise-Grade Backend as a Service",
    description: "Secure, scalable backend infrastructure for modern applications. Authentication, database, storage, functions, and more in one unified platform.",
    siteName: "BackendPro",
  },
  twitter: {
    card: "summary_large_image",
    title: "BackendPro | Enterprise-Grade Backend as a Service",
    description: "Secure, scalable backend infrastructure for modern applications. Authentication, database, storage, functions, and more in one unified platform.",
    creator: "@backendpro",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <ClientBody>
        {children}
      </ClientBody>
    </html>
  );
}
