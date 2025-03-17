"use client";

import * as React from "react";
import Link from "next/link";
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

  const features = [
    {
      title: "Authentication",
      description: "User management, social logins, JWT and more",
      href: "/features/authentication",
    },
    {
      title: "Database",
      description: "Powerful database with real-time capabilities",
      href: "/features/database",
    },
    {
      title: "Storage",
      description: "File storage, uploads, and CDN integration",
      href: "/features/storage",
    },
    {
      title: "Functions",
      description: "Serverless functions that scale automatically",
      href: "/features/functions",
    },
    {
      title: "Security",
      description: "Enterprise-grade security with encryption",
      href: "/features/security",
    },
    {
      title: "Analytics",
      description: "Real-time analytics and monitoring",
      href: "/features/analytics",
    },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6 md:gap-8 lg:gap-10">
          <Link href="/" className="flex items-center space-x-2">
            <div className="relative h-8 w-8 overflow-hidden rounded-full bg-gradient-to-br from-blue-500 to-indigo-600">
              <div className="absolute inset-1 rounded-full bg-background"></div>
              <div className="absolute inset-2 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600"></div>
            </div>
            <span className="hidden font-bold sm:inline-block">ApexBase</span>
          </Link>
          <nav className="hidden gap-6 md:flex">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger>Features</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                      {features.map((feature) => (
                        <li key={feature.title}>
                          <NavigationMenuLink asChild>
                            <Link
                              href={feature.href}
                              className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                            >
                              <div className="text-sm font-medium leading-none">
                                {feature.title}
                              </div>
                              <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                {feature.description}
                              </p>
                            </Link>
                          </NavigationMenuLink>
                        </li>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link href="/pricing" legacyBehavior passHref>
                    <NavigationMenuLink
                      className={cn(
                        "group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50"
                      )}
                    >
                      Pricing
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link href="/docs" legacyBehavior passHref>
                    <NavigationMenuLink
                      className={cn(
                        "group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50"
                      )}
                    >
                      Documentation
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden md:flex md:items-center md:gap-2">
            <ThemeToggle />
            <Button variant="ghost" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
            <Button asChild>
              <Link href="/registration">Get Started</Link>
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
                <Link href="/" className="flex items-center space-x-2">
                  <div className="relative h-8 w-8 overflow-hidden rounded-full bg-gradient-to-br from-blue-500 to-indigo-600">
                    <div className="absolute inset-1 rounded-full bg-background"></div>
                    <div className="absolute inset-2 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600"></div>
                  </div>
                  <span className="font-bold">ApexBase</span>
                </Link>
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
                          <Link
                            key={feature.title}
                            href={feature.href}
                            className="text-sm text-muted-foreground hover:text-foreground"
                          >
                            {feature.title}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                  <Link
                    href="/pricing"
                    className="text-base font-medium hover:text-foreground"
                  >
                    Pricing
                  </Link>
                  <Link
                    href="/docs"
                    className="text-base font-medium hover:text-foreground"
                  >
                    Documentation
                  </Link>
                </div>
                <div className="flex flex-col gap-3 pt-4">
                  <ThemeToggle />
                  <Button variant="outline" className="justify-start" asChild>
                    <Link href="/login">Sign In</Link>
                  </Button>
                  <Button className="justify-start" asChild>
                    <Link href="/registration">Get Started</Link>
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
