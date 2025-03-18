'use client';

import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen md:grid md:grid-cols-2 lg:grid-cols-3">
      {/* Left side - Auth Form */}
      <div className="flex min-h-screen flex-col md:col-span-1 lg:col-span-1">
        <div className="flex h-14 items-center px-4 lg:h-[60px] lg:px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="relative h-8 w-8 overflow-hidden rounded-full bg-gradient-to-br from-blue-500 to-indigo-600">
              <div className="absolute inset-1 rounded-full bg-background"></div>
              <div className="absolute inset-2 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600"></div>
            </div>
            <span className="font-bold">ApexBase</span>
          </Link>
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </div>
        <div className="flex flex-1 flex-col items-center justify-center px-4 sm:px-6">
          <div className="mx-auto w-full max-w-sm space-y-6">
            {children}
          </div>
        </div>
        <div className="flex h-14 items-center justify-between border-t px-4 lg:h-[60px] lg:px-6">
          <div className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} ApexBase. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/privacy"
              className="text-sm text-muted-foreground hover:underline"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="text-sm text-muted-foreground hover:underline"
            >
              Terms
            </Link>
          </div>
        </div>
      </div>

      {/* Right side - Image/Branding */}
      <div className="hidden bg-muted md:col-span-1 md:block lg:col-span-2">
        <div className="relative flex h-full items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-800">
          {/* Abstract shapes */}
          <div className="absolute left-1/4 top-1/4 h-64 w-64 rounded-full bg-blue-500 opacity-20 blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/3 h-64 w-64 rounded-full bg-indigo-500 opacity-20 blur-3xl"></div>

          <div className="relative z-10 max-w-2xl p-6 text-center text-white">
            <div className="mb-6 inline-block rounded-xl bg-white/10 p-3 backdrop-blur-sm">
              <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-400 to-indigo-400"></div>
            </div>
            <h1 className="mb-4 text-3xl font-bold md:text-4xl lg:text-5xl">
              Enterprise-Grade Backend Infrastructure
            </h1>
            <p className="mb-8 text-lg text-blue-100">
              Everything you need to build modern applications in one secure, scalable platform.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              {[
                "Authentication",
                "Database",
                "Storage",
                "Functions",
                "Realtime",
                "Analytics",
              ].map((feature, index) => (
                <div
                  key={index}
                  className="rounded-full bg-white/10 px-4 py-2 text-sm backdrop-blur-sm"
                >
                  {feature}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
