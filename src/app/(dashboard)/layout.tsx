"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FiActivity,
  FiBarChart,
  FiChevronDown,
  FiCode,
  FiDatabase,
  FiHardDrive,
  FiLayers,
  FiMenu,
  FiSettings,
  FiShield,
  FiUsers,
  FiX,
  FiZap,
  FiBell,
  FiSearch,
  FiGrid,
  FiLogOut,
  FiPlusCircle,
  FiUser,
} from "react-icons/fi";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface NavItemProps {
  icon: React.ReactNode;
  title: string;
  href: string;
  active?: boolean;
  badge?: string;
  isCollapsed?: boolean;
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

interface NavGroupProps {
  title: string;
  children: React.ReactNode;
  isCollapsed?: boolean;
}

function NavGroup({ title, children, isCollapsed }: NavGroupProps) {
  return (
    <div className="py-2">
      {!isCollapsed && (
        <h3 className="mb-1 px-4 text-xs font-semibold text-muted-foreground">
          {title}
        </h3>
      )}
      <div className="space-y-1 px-1">{children}</div>
    </div>
  );
}

interface ExpandableNavGroupProps {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  isCollapsed?: boolean;
  defaultOpen?: boolean;
}

function ExpandableNavGroup({
  icon,
  title,
  children,
  isCollapsed,
  defaultOpen = false,
}: ExpandableNavGroupProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  if (isCollapsed) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            )}
          >
            {icon}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="right" align="start" className="w-56">
          <DropdownMenuLabel>{title}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {children}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <div className="px-1 py-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors",
          isOpen
            ? "bg-accent text-accent-foreground"
            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        )}
      >
        <div className="flex items-center gap-x-2">
          {icon}
          <span>{title}</span>
        </div>
        <FiChevronDown
          className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")}
        />
      </button>
      {isOpen && <div className="mt-1 space-y-1">{children}</div>}
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col">
      {/* Top navigation bar */}
      <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:px-6 lg:h-[60px]">
        <div className="flex flex-1 items-center gap-4 md:gap-8">
          {/* Mobile menu */}
          <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="md:hidden"
                aria-label="Open Menu"
              >
                <FiMenu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] sm:w-[340px]">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 px-2 py-4"
                onClick={() => setIsMobileOpen(false)}
              >
                <div className="relative h-8 w-8 overflow-hidden rounded-full bg-gradient-to-br from-blue-500 to-indigo-600">
                  <div className="absolute inset-1 rounded-full bg-background"></div>
                  <div className="absolute inset-2 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600"></div>
                </div>
                <span className="font-bold">ApexBase</span>
              </Link>
              <Separator className="mb-4" />
              <ScrollArea className="h-[calc(100vh-120px)]">
                <div className="mb-2 px-4">
                  <Button
                    variant="default"
                    className="w-full justify-start gap-2"
                  >
                    <FiPlusCircle className="h-4 w-4" />
                    <span>New Project</span>
                  </Button>
                </div>
                <NavGroup title="Overview">
                  <NavItem
                    href="/dashboard"
                    icon={<FiGrid className="h-4 w-4" />}
                    title="Dashboard"
                    active
                  />
                  <NavItem
                    href="/dashboard/analytics"
                    icon={<FiBarChart className="h-4 w-4" />}
                    title="Analytics"
                  />
                  <NavItem
                    href="/dashboard/activity"
                    icon={<FiActivity className="h-4 w-4" />}
                    title="Activity"
                    badge="New"
                  />
                </NavGroup>
                <NavGroup title="Services">
                  <NavItem
                    href="/dashboard/authentication"
                    icon={<FiUsers className="h-4 w-4" />}
                    title="Authentication"
                  />
                  <NavItem
                    href="/dashboard/database"
                    icon={<FiDatabase className="h-4 w-4" />}
                    title="Database"
                  />
                  <NavItem
                    href="/dashboard/storage"
                    icon={<FiHardDrive className="h-4 w-4" />}
                    title="Storage"
                  />
                  <NavItem
                    href="/dashboard/functions"
                    icon={<FiCode className="h-4 w-4" />}
                    title="Functions"
                  />
                  <NavItem
                    href="/dashboard/workflow"
                    icon={<FiLayers className="h-4 w-4" />}
                    title="Workflow"
                  />
                  <NavItem
                    href="/dashboard/realtime"
                    icon={<FiZap className="h-4 w-4" />}
                    title="Realtime"
                  />
                </NavGroup>
                <NavGroup title="Settings">
                  <NavItem
                    href="/dashboard/settings/general"
                    icon={<FiSettings className="h-4 w-4" />}
                    title="Settings"
                  />
                  <NavItem
                    href="/dashboard/settings/security"
                    icon={<FiShield className="h-4 w-4" />}
                    title="Security"
                  />
                  <NavItem
                    href="/dashboard/settings/team"
                    icon={<FiUsers className="h-4 w-4" />}
                    title="Team Members"
                  />
                </NavGroup>
              </ScrollArea>
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="relative h-8 w-8 overflow-hidden rounded-full bg-gradient-to-br from-blue-500 to-indigo-600">
              <div className="absolute inset-1 rounded-full bg-background"></div>
              <div className="absolute inset-2 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600"></div>
            </div>
            <span className="font-bold">ApexBase</span>
          </Link>

          {/* Desktop search */}
          <div className="relative hidden md:flex">
            <FiSearch className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="w-64 rounded-lg bg-background pl-8 md:w-80 lg:w-96"
            />
          </div>
        </div>

        {/* Right side icons */}
        <div className="flex items-center gap-2">
          {/* Mobile search button */}
          <Button
            variant="outline"
            size="icon"
            className="md:hidden"
            aria-label="Search"
          >
            <FiSearch className="h-4 w-4" />
          </Button>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="relative"
                aria-label="Notifications"
              >
                <FiBell className="h-4 w-4" />
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[10px] text-white">
                  3
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="max-h-96 overflow-auto">
                {[
                  "New sign-in from Chrome on Windows",
                  "Your storage usage is at 80%",
                  "Database backup completed successfully",
                ].map((notification, i) => (
                  <DropdownMenuItem key={i} className="py-3">
                    <div>
                      <p className="text-sm font-medium">{notification}</p>
                      <p className="text-xs text-muted-foreground">
                        {i === 0 ? "Just now" : `${i * 2 + 1}h ago`}
                      </p>
                    </div>
                  </DropdownMenuItem>
                ))}
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="justify-center">
                View all
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Theme toggle */}
          <ThemeToggle />

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-8 w-8 rounded-full"
                aria-label="User menu"
              >
                <Avatar>
                  <AvatarImage src="/avatar.png" alt="User" />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <FiUser className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <FiSettings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <FiLogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Main content area with sidebar */}
      <div className="flex flex-1">
        {/* Sidebar - desktop */}
        <aside
          className={cn(
            "group hidden border-r bg-background md:flex",
            isCollapsed ? "md:w-[70px]" : "md:w-[240px]"
          )}
        >
          <div className="flex w-full flex-col gap-4">
            <div
              className={cn(
                "flex h-14 items-center border-b px-4 lg:h-[60px]",
                isCollapsed && "justify-center px-2"
              )}
            >
              <Button
                variant="ghost"
                className="h-8 w-8"
                onClick={() => setIsCollapsed(!isCollapsed)}
                aria-label={isCollapsed ? "Expand" : "Collapse"}
              >
                {isCollapsed ? (
                  <FiChevronDown className="h-4 w-4 rotate-90" />
                ) : (
                  <FiChevronDown className="h-4 w-4 -rotate-90" />
                )}
              </Button>
              {!isCollapsed && (
                <div className="ml-4 text-sm font-medium">Main Navigation</div>
              )}
            </div>

            <div className="flex-1">
              <ScrollArea
                className={cn(
                  "h-[calc(100vh-60px)]",
                  isCollapsed ? "w-[70px]" : "w-[240px]"
                )}
              >
                <div className="px-2 py-4">
                  <div className="mb-4 px-2">
                    <Button
                      variant="default"
                      className={cn(
                        "w-full",
                        isCollapsed ? "justify-center px-0" : "justify-start"
                      )}
                    >
                      <FiPlusCircle className="h-4 w-4" />
                      {!isCollapsed && <span className="ml-2">New Project</span>}
                    </Button>
                  </div>

                  <NavGroup title="Overview" isCollapsed={isCollapsed}>
                    <NavItem
                      href="/dashboard"
                      icon={<FiGrid className="h-4 w-4" />}
                      title="Dashboard"
                      active
                      isCollapsed={isCollapsed}
                    />
                    <NavItem
                      href="/dashboard/analytics"
                      icon={<FiBarChart className="h-4 w-4" />}
                      title="Analytics"
                      isCollapsed={isCollapsed}
                    />
                    <NavItem
                      href="/dashboard/activity"
                      icon={<FiActivity className="h-4 w-4" />}
                      title="Activity"
                      badge="New"
                      isCollapsed={isCollapsed}
                    />
                  </NavGroup>

                  <NavGroup title="Services" isCollapsed={isCollapsed}>
                    <NavItem
                      href="/dashboard/authentication"
                      icon={<FiUsers className="h-4 w-4" />}
                      title="Authentication"
                      isCollapsed={isCollapsed}
                    />
                    <NavItem
                      href="/dashboard/database"
                      icon={<FiDatabase className="h-4 w-4" />}
                      title="Database"
                      isCollapsed={isCollapsed}
                    />
                    <NavItem
                      href="/dashboard/storage"
                      icon={<FiHardDrive className="h-4 w-4" />}
                      title="Storage"
                      isCollapsed={isCollapsed}
                    />
                    <NavItem
                      href="/dashboard/functions"
                      icon={<FiCode className="h-4 w-4" />}
                      title="Functions"
                      isCollapsed={isCollapsed}
                    />
                    <NavItem
                      href="/dashboard/workflow"
                      icon={<FiLayers className="h-4 w-4" />}
                      title="Workflow"
                      isCollapsed={isCollapsed}
                    />
                    <NavItem
                      href="/dashboard/realtime"
                      icon={<FiZap className="h-4 w-4" />}
                      title="Realtime"
                      isCollapsed={isCollapsed}
                    />
                  </NavGroup>

                  {isCollapsed ? (
                    <NavGroup title="Settings" isCollapsed={isCollapsed}>
                      <ExpandableNavGroup
                        icon={<FiSettings className="h-4 w-4" />}
                        title="Settings"
                        isCollapsed={isCollapsed}
                      >
                        <DropdownMenuItem asChild>
                          <Link href="/dashboard/settings/general">General</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/dashboard/settings/security">Security</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/dashboard/settings/team">Team Members</Link>
                        </DropdownMenuItem>
                      </ExpandableNavGroup>
                    </NavGroup>
                  ) : (
                    <ExpandableNavGroup
                      icon={<FiSettings className="h-4 w-4" />}
                      title="Settings"
                      defaultOpen
                    >
                      <NavItem
                        href="/dashboard/settings/general"
                        icon={<FiSettings className="h-4 w-4" />}
                        title="General"
                        isSubItem
                      />
                      <NavItem
                        href="/dashboard/settings/security"
                        icon={<FiShield className="h-4 w-4" />}
                        title="Security"
                        isSubItem
                      />
                      <NavItem
                        href="/dashboard/settings/team"
                        icon={<FiUsers className="h-4 w-4" />}
                        title="Team Members"
                        isSubItem
                      />
                    </ExpandableNavGroup>
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
