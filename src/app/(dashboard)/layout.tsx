'use client';

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ClientWrapper } from "@/components/client-wrapper";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Activity, Database, FolderOpenIcon, Home, List, LogOut, Menu, Settings, User, Bot } from "lucide-react";
import { cn } from "@/lib/utils";
import { AuthCheck } from "@/components/auth-check";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/components/auth-context";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface NavItemProps {
  icon: React.ReactNode;
  title: string;
  href: string;
  active?: boolean;
  badge?: string;
  isCollapsed: boolean;
  isSubItem?: boolean;
}

function NavItem({
  icon,
  title,
  href,
  active,
  badge,
  isCollapsed,
  isSubItem = false,
}: NavItemProps) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      prefetch={true}
      className={cn(
        "flex items-center gap-x-2 rounded-lg px-3 py-2 text-sm transition-all",
        isActive
          ? "bg-accent text-accent-foreground"
          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
        isCollapsed && "justify-center",
        isSubItem && !isCollapsed && "pl-10"
      )}
    >
      {icon}
      {!isCollapsed && <span>{title}</span>}
      {!isCollapsed && badge && (
        <Badge variant="secondary" className="ml-auto">
          {badge}
        </Badge>
      )}
    </Link>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const router = useRouter();
  const prefetchedRoutesRef = useRef<boolean>(false);

  // Prefetch common routes for better navigation
  useEffect(() => {
    if (prefetchedRoutesRef.current) return;

    // Mark as prefetched to avoid duplicate prefetching
    prefetchedRoutesRef.current = true;

    // Routes to prefetch for smoother navigation
    const routes = [
      '/dashboard',
      '/dashboard/database',
      '/dashboard/storage',
      '/dashboard/functions',
      '/dashboard/workflow',
      '/dashboard/authentication',
      '/dashboard/ai-agent',
      '/dashboard/settings/general'
    ];

    // Prefetch each route
    routes.forEach(route => {
      router.prefetch(route);
    });
  }, [router]);

  return (
    <AuthCheck>
      <div className="flex min-h-screen flex-col">
        {/* Mobile sidebar overlay */}
        {isMobileOpen && (
          <div
            className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
            onClick={() => setIsMobileOpen(false)}
          />
        )}

        {/* Mobile sidebar */}
        <div
          className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r bg-card transition-transform duration-300 ease-in-out lg:hidden ${
            isMobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="border-b p-2">
            <div className="flex items-center justify-between">
              <Link
                href="/dashboard"
                prefetch={true}
                className="flex items-center gap-2 px-2 py-4"
              >
                <div className="relative h-8 w-8 overflow-hidden rounded-full bg-gradient-to-br from-blue-500 to-indigo-600">
                  <div className="absolute inset-1 rounded-full bg-background"></div>
                  <div className="absolute inset-2 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600"></div>
                </div>
                <span className="font-bold">ApexBase</span>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileOpen(false)}
                className="h-9 w-9"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </Button>
            </div>
          </div>
          <ScrollArea className="flex-1 overflow-auto">
            <div className="space-y-4 px-3 py-4">
              <div className="space-y-1">
                <NavItem
                  icon={<Home className="h-5 w-5" />}
                  title="Dashboard"
                  href="/dashboard"
                  isCollapsed={false}
                />
                <NavItem
                  icon={<Database className="h-5 w-5" />}
                  title="Database"
                  href="/dashboard/database"
                  isCollapsed={false}
                />
                <NavItem
                  icon={<FolderOpenIcon className="h-5 w-5" />}
                  title="Storage"
                  href="/dashboard/storage"
                  isCollapsed={false}
                />
                <NavItem
                  icon={<List className="h-5 w-5" />}
                  title="Functions"
                  href="/dashboard/functions"
                  isCollapsed={false}
                />
                <NavItem
                  icon={<Activity className="h-5 w-5" />}
                  title="Workflow"
                  href="/dashboard/workflow"
                  isCollapsed={false}
                />
                <NavItem
                  icon={<Bot className="h-5 w-5" />}
                  title="AI Agent"
                  href="/dashboard/ai-agent"
                  isCollapsed={false}
                  badge="New"
                />
                <NavItem
                  icon={<User className="h-5 w-5" />}
                  title="Authentication"
                  href="/dashboard/authentication"
                  isCollapsed={false}
                />
              </div>
              <Separator />
              <div className="space-y-1">
                <NavItem
                  icon={<Settings className="h-5 w-5" />}
                  title="Settings"
                  href="/dashboard/settings/general"
                  isCollapsed={false}
                />
              </div>
            </div>
          </ScrollArea>
        </div>

        {/* Desktop sidebar */}
        <div
          className={cn(
            "fixed inset-y-0 left-0 z-30 hidden border-r bg-card transition-all duration-300 ease-in-out lg:flex lg:flex-col",
            isCollapsed ? "lg:w-16" : "lg:w-64"
          )}
        >
          <div className="border-b p-2">
            <div className="flex h-14 items-center px-4">
              {/* Logo */}
              <Link href="/dashboard" prefetch={true} className="flex items-center gap-2">
                <div className="relative h-8 w-8 overflow-hidden rounded-full bg-gradient-to-br from-blue-500 to-indigo-600">
                  <div className="absolute inset-1 rounded-full bg-background"></div>
                  <div className="absolute inset-2 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600"></div>
                </div>
                {!isCollapsed && <span className="font-bold">ApexBase</span>}
              </Link>
              <div className="ml-auto">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsCollapsed(!isCollapsed)}
                  className="h-8 w-8"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4"
                  >
                    <path d="m15 18-6-6 6-6" />
                  </svg>
                  <span className="sr-only">Toggle sidebar</span>
                </Button>
              </div>
            </div>
          </div>
          <ScrollArea className="flex-1 overflow-auto">
            <div className="space-y-4 p-4">
              <div className="space-y-1">
                <NavItem
                  icon={<Home className="h-5 w-5" />}
                  title="Dashboard"
                  href="/dashboard"
                  isCollapsed={isCollapsed}
                />
                <NavItem
                  icon={<Database className="h-5 w-5" />}
                  title="Database"
                  href="/dashboard/database"
                  isCollapsed={isCollapsed}
                />
                <NavItem
                  icon={<FolderOpenIcon className="h-5 w-5" />}
                  title="Storage"
                  href="/dashboard/storage"
                  isCollapsed={isCollapsed}
                />
                <NavItem
                  icon={<List className="h-5 w-5" />}
                  title="Functions"
                  href="/dashboard/functions"
                  isCollapsed={isCollapsed}
                />
                <NavItem
                  icon={<Activity className="h-5 w-5" />}
                  title="Workflow"
                  href="/dashboard/workflow"
                  isCollapsed={isCollapsed}
                />
                <NavItem
                  icon={<Bot className="h-5 w-5" />}
                  title="AI Agent"
                  href="/dashboard/ai-agent"
                  isCollapsed={isCollapsed}
                  badge="New"
                />
                <NavItem
                  icon={<User className="h-5 w-5" />}
                  title="Authentication"
                  href="/dashboard/authentication"
                  isCollapsed={isCollapsed}
                />
              </div>
              <Separator />
              <div className="space-y-1">
                <NavItem
                  icon={<Settings className="h-5 w-5" />}
                  title="Settings"
                  href="/dashboard/settings/general"
                  isCollapsed={isCollapsed}
                />
              </div>
            </div>
          </ScrollArea>
        </div>

        {/* Main content */}
        <div
          className={cn(
            "flex flex-1 flex-col",
            isCollapsed ? "lg:pl-16" : "lg:pl-64"
          )}
        >
          {/* Top navigation */}
          <header className="sticky top-0 z-20 flex h-16 items-center border-b bg-card px-4 lg:px-6">
            <Button
              onClick={() => setIsMobileOpen(true)}
              variant="ghost"
              size="icon"
              className="h-8 w-8 lg:hidden"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
            <div className="ml-auto flex items-center gap-2">
              <ClientWrapper>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="relative h-9 w-9 rounded-full"
                    >
                      <Avatar className="h-9 w-9">
                        <AvatarImage src="/avatar.png" alt="User" />
                        <AvatarFallback>JD</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                      <DropdownMenuItem>
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </ClientWrapper>
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 p-4 lg:p-6">{children}</main>
        </div>
      </div>
    </AuthCheck>
  );
}
