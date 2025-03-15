"use client";

import { useEffect } from "react";
import { ThemeProvider } from "next-themes";

export default function ClientBody({
  children,
}: {
  children: React.ReactNode;
}) {
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
      {children}
    </ThemeProvider>
  );
}
