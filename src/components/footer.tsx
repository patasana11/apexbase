import Link from "next/link";
import { FiGithub, FiTwitter, FiLinkedin, FiMail } from "react-icons/fi";

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container py-12 md:py-16 lg:py-20">
        <div className="grid gap-8 md:grid-cols-2 md:gap-16 lg:grid-cols-4">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="relative h-8 w-8 overflow-hidden rounded-full bg-gradient-to-br from-blue-500 to-indigo-600">
                <div className="absolute inset-1 rounded-full bg-background"></div>
                <div className="absolute inset-2 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600"></div>
              </div>
              <span className="font-bold">BackendPro</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Enterprise-grade Backend-as-a-Service platform for modern applications and services.
            </p>
            <div className="flex items-center space-x-3">
              <Link
                href="https://github.com"
                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                target="_blank"
                rel="noreferrer"
              >
                <FiGithub className="h-4 w-4" />
                <span className="sr-only">GitHub</span>
              </Link>
              <Link
                href="https://twitter.com"
                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                target="_blank"
                rel="noreferrer"
              >
                <FiTwitter className="h-4 w-4" />
                <span className="sr-only">Twitter</span>
              </Link>
              <Link
                href="https://linkedin.com"
                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                target="_blank"
                rel="noreferrer"
              >
                <FiLinkedin className="h-4 w-4" />
                <span className="sr-only">LinkedIn</span>
              </Link>
              <Link
                href="mailto:contact@backendpro.com"
                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                target="_blank"
                rel="noreferrer"
              >
                <FiMail className="h-4 w-4" />
                <span className="sr-only">Email</span>
              </Link>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Product</h3>
            <ul className="grid gap-3">
              {[
                { title: "Features", href: "/features" },
                { title: "Pricing", href: "/pricing" },
                { title: "Documentation", href: "/docs" },
                { title: "Changelog", href: "/changelog" },
                { title: "Roadmap", href: "/roadmap" },
              ].map((item) => (
                <li key={item.title}>
                  <Link
                    href={item.href}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Resources</h3>
            <ul className="grid gap-3">
              {[
                { title: "Blog", href: "/blog" },
                { title: "Getting Started", href: "/get-started" },
                { title: "Case Studies", href: "/case-studies" },
                { title: "Security", href: "/security" },
                { title: "Status", href: "/status" },
              ].map((item) => (
                <li key={item.title}>
                  <Link
                    href={item.href}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Company</h3>
            <ul className="grid gap-3">
              {[
                { title: "About", href: "/about" },
                { title: "Team", href: "/team" },
                { title: "Careers", href: "/careers" },
                { title: "Legal", href: "/legal" },
                { title: "Contact", href: "/contact" },
              ].map((item) => (
                <li key={item.title}>
                  <Link
                    href={item.href}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t pt-8">
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} BackendPro. All rights reserved.
            </p>
            <div className="flex gap-4">
              <Link
                href="/privacy"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Terms of Service
              </Link>
              <Link
                href="/cookies"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
