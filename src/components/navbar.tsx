"use client";

import * as React from "react";
import Link from "next/link";
import { ClientNavigationLink } from "./client-navigation-link";
import {
  FiChevronDown,
  FiMenu,
  FiX
} from "react-icons/fi";
import { ThemeToggle } from "./theme-toggle";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";

export function Navbar() {
  const [isOpen, setIsOpen] = React.useState(false);

  // Handle client-side navigation transitions
  const handleNavigation = () => {
    // Comment out navigation tracking to prevent auth errors
  };

  const features = [
    {
      title: "Database Automation",
      description: "Automated schema and data management",
      href: "/features/database-automation",
    },
    {
      title: "Advanced Query System",
      description: "Powerful data mining and reporting tools",
      href: "/features/query-system",
    },
    {
      title: "Advanced Authorization",
      description: "Column-level security and access control",
      href: "/features/authorization",
    },
    {
      title: "Integration API",
      description: "Automatic API generation for your data",
      href: "/features/api",
    },
    {
      title: "Enterprise Security",
      description: "End-to-end encryption and audit logging",
      href: "/features/security",
    },
    {
      title: "Visual Workflows",
      description: "Automate complex business processes",
      href: "/features/workflows",
    },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="container flex items-center justify-between h-16 px-4 md:px-6">
        <div className="flex items-center gap-6 md:gap-8 lg:gap-10">
          <ClientNavigationLink href="/" className="flex items-center space-x-2" onClick={handleNavigation}>
            <div className="relative h-8 w-8 overflow-hidden rounded-full bg-gradient-to-br from-blue-500 to-indigo-600">
              <div className="absolute inset-1 rounded-full bg-background"></div>
              <div className="absolute inset-2 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600"></div>
            </div>
            <span className="font-bold">ApexBase</span>
          </ClientNavigationLink>
          <NavigationMenu className="hidden md:block">
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger>Features</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-2">
                    {features.map((feature) => (
                      <li key={feature.title} className="row-span-3">
                        <NavigationMenuLink asChild>
                          <ClientNavigationLink
                            href={feature.href}
                            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                            onClick={handleNavigation}
                          >
                            <div className="text-sm font-medium leading-none">{feature.title}</div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              {feature.description}
                            </p>
                          </ClientNavigationLink>
                        </NavigationMenuLink>
                      </li>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <ClientNavigationLink
                  href="/pricing"
                  className={cn("flex items-center transition-colors hover:text-foreground/80 text-foreground/60 h-10 px-4 py-2")}
                  onClick={handleNavigation}
                >
                  Pricing
                </ClientNavigationLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <ClientNavigationLink
                  href="/blog"
                  className={cn("flex items-center transition-colors hover:text-foreground/80 text-foreground/60 h-10 px-4 py-2")}
                  onClick={handleNavigation}
                >
                  Blog
                </ClientNavigationLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <ClientNavigationLink
                  href="/about"
                  className={cn("flex items-center transition-colors hover:text-foreground/80 text-foreground/60 h-10 px-4 py-2")}
                  onClick={handleNavigation}
                >
                  About
                </ClientNavigationLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <div className="hidden md:flex md:gap-2">
            <Button variant="ghost" disabled>
              Sign In (Coming Soon)
            </Button>
            <Button disabled>
              Get Started (Coming Soon)
            </Button>
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                aria-label="Toggle Menu"
              >
                <FiMenu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:w-80">
              <div className="flex flex-col gap-6 py-6">
                <ClientNavigationLink href="/" className="flex items-center space-x-2" onClick={handleNavigation}>
                  <div className="relative h-8 w-8 overflow-hidden rounded-full bg-gradient-to-br from-blue-500 to-indigo-600">
                    <div className="absolute inset-1 rounded-full bg-background"></div>
                    <div className="absolute inset-2 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600"></div>
                  </div>
                  <span className="font-bold">ApexBase</span>
                </ClientNavigationLink>
                <div className="flex flex-col space-y-4">
                  <div className="flex flex-col space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">Features</h3>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => setIsOpen(!isOpen)}
                      >
                        {isOpen ? (
                          <FiChevronDown className="h-4 w-4 transition-transform rotate-180" />
                        ) : (
                          <FiChevronDown className="h-4 w-4 transition-transform" />
                        )}
                      </Button>
                    </div>
                    {isOpen && (
                      <div className="grid gap-2 pl-1">
                        {features.map((feature) => (
                          <ClientNavigationLink
                            key={feature.title}
                            href={feature.href}
                            className="text-sm text-muted-foreground hover:text-foreground"
                            onClick={handleNavigation}
                          >
                            {feature.title}
                          </ClientNavigationLink>
                        ))}
                      </div>
                    )}
                  </div>
                  <ClientNavigationLink href="/pricing" className="text-sm font-medium" onClick={handleNavigation}>
                    Pricing
                  </ClientNavigationLink>
                  <ClientNavigationLink href="/blog" className="text-sm font-medium" onClick={handleNavigation}>
                    Blog
                  </ClientNavigationLink>
                  <ClientNavigationLink href="/about" className="text-sm font-medium" onClick={handleNavigation}>
                    About
                  </ClientNavigationLink>
                  <div className="flex flex-col gap-2 pt-4">
                    <Button variant="ghost" disabled>
                      Sign In (Coming Soon)
                    </Button>
                    <Button disabled>
                      Get Started (Coming Soon)
                    </Button>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
