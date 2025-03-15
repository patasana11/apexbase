"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { COMMON_TENANT, shouldInitTenant } from "@/lib/config/tenant-config";

// Icons
import {
  LayoutDashboard,
  CreditCard,
  Settings,
  Users,
  BarChart4,
  Layers,
  Lock,
  ChevronDown,
  Menu,
  X,
  LogOut,
  UserCircle
} from "lucide-react";

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Only initialize in the common tenant
  useEffect(() => {
    setIsClient(true);

    if (!shouldInitTenant(COMMON_TENANT)) {
      console.log("Not in common tenant, redirecting...");
      // Handle redirecting to common tenant if needed
    }
  }, []);

  // Define sidebar menu items
  const menuItems = [
    {
      title: "Dashboard",
      href: "/account",
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      title: "Billing",
      href: "/account/billing",
      icon: <CreditCard className="w-5 h-5" />,
    },
    {
      title: "Team",
      href: "/account/team",
      icon: <Users className="w-5 h-5" />,
    },
    {
      title: "Analytics",
      href: "/account/analytics",
      icon: <BarChart4 className="w-5 h-5" />,
    },
    {
      title: "Workspaces",
      href: "/account/workspaces",
      icon: <Layers className="w-5 h-5" />,
    },
    {
      title: "Security",
      href: "/account/security",
      icon: <Lock className="w-5 h-5" />,
    },
    {
      title: "Settings",
      href: "/account/settings",
      icon: <Settings className="w-5 h-5" />,
    },
  ];

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="h-full flex flex-col overflow-y-auto">
          {/* Logo and close button (mobile only) */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
            <Link href="/account" className="text-xl font-bold text-blue-600 dark:text-blue-500">
              BackendPro
            </Link>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Navigation links */}
          <nav className="flex-1 px-2 py-4 space-y-1">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  pathname === item.href
                    ? "bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-500"
                    : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                }`}
              >
                {item.icon}
                <span className="ml-3">{item.title}</span>
              </Link>
            ))}
          </nav>

          {/* User profile */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UserCircle className="w-10 h-10 text-gray-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-200">
                  John Doe
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  john@example.com
                </p>
              </div>
              <button className="ml-auto text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-col flex-1 lg:pl-64">
        {/* Top navigation */}
        <header className="sticky top-0 z-40 bg-white dark:bg-gray-800 shadow">
          <div className="flex items-center justify-between h-16 px-4 lg:px-6">
            {/* Mobile menu button */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <Menu className="w-6 h-6" />
              <span className="sr-only">Open sidebar</span>
            </button>

            {/* Right side buttons */}
            <div className="flex items-center ml-auto space-x-4">
              <button className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                <span className="inline-flex items-center px-4 py-2 border border-blue-600 rounded-md text-sm font-medium text-blue-600 bg-white hover:bg-blue-50 dark:bg-gray-800 dark:hover:bg-gray-700 dark:border-blue-500 dark:text-blue-500">
                  Open Workspace
                  <ChevronDown className="ml-2 w-4 h-4" />
                </span>
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6">
          {isClient ? children : <div className="w-full h-64 flex items-center justify-center">Loading...</div>}
        </main>
      </div>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}
