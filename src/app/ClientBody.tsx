"use client";

import React, { useEffect } from "react";
import { ThemeProvider } from "next-themes";
import { CookieConsent } from "@/components/cookie-consent";

interface ClientBodyProps {
  children: React.ReactNode;
}

export default function ClientBody({ children }: ClientBodyProps) {
  // Remove extension-added classes during hydration
  useEffect(() => {
    // This runs only on the client after hydration
    document.body.className = document.body.className.replace(/js-focus-visible/g, '');
  }, []);

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <>
        {children}
        <CookieConsent privacyPolicyUrl="/privacy" />
      </>
    </ThemeProvider>
  );
}
