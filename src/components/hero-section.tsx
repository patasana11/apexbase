import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FiArrowRight, FiShield, FiDatabase, FiLock, FiServer, FiSearch } from "react-icons/fi";

export function HeroSection() {
  return (
    <div className="relative overflow-hidden bg-background py-20 md:py-24 lg:py-32">
      {/* Abstract Gradient Background Elements */}
      <div className="absolute -top-24 -left-20 h-[500px] w-[500px] rounded-full bg-blue-500/10 blur-3xl"></div>
      <div className="absolute -bottom-32 -right-20 h-[500px] w-[500px] rounded-full bg-indigo-500/10 blur-3xl"></div>

      <div className="container relative">
        <div className="flex flex-col items-center text-center">
          <Badge variant="outline" className="mb-6 px-3.5 py-1.5 text-sm">
            <span className="mr-1 inline-block h-2 w-2 animate-pulse rounded-full bg-blue-600"></span>
            Enterprise-Grade Backend as a Service
          </Badge>

          <h1 className="mb-6 text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            Advanced Data Control <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              With Unmatched Security
            </span>
          </h1>

          <p className="mb-8 max-w-2xl text-xl text-muted-foreground">
            Powerful backend infrastructure with advanced query capabilities, column-level authorization, and
            enterprise security. Access your data securely without complex backend coding.
          </p>

          <div className="mb-12 flex flex-col gap-4 sm:flex-row sm:gap-4">
            <Button size="lg">
              Start Building
              <FiArrowRight className="ml-1 h-4 w-4" />
              <span className="ml-2 text-xs opacity-70">(Coming Soon)</span>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/features/query-system" className="gap-1">
                Explore Advanced Queries
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {[
              { icon: <FiSearch className="h-4 w-4" />, text: "Advanced Query System" },
              { icon: <FiLock className="h-4 w-4" />, text: "Column-Level Authorization" },
              { icon: <FiShield className="h-4 w-4" />, text: "Enterprise Security" },
              { icon: <FiDatabase className="h-4 w-4" />, text: "Automated Database" },
            ].map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-center gap-1 text-sm font-medium text-muted-foreground"
              >
                {item.icon}
                <span>{item.text}</span>
              </div>
            ))}
          </div>

          {/* Floating Platform UI Elements */}
          <div className="mt-16 w-full max-w-5xl">
            <div className="relative rounded-xl border bg-card p-1 shadow-2xl dark:shadow-indigo-500/5">
              <div className="flex h-8 items-center space-x-1.5 rounded-t-md border-b bg-muted/50 px-4">
                <div className="h-2 w-2 rounded-full bg-rose-500"></div>
                <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
                <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                <div className="ml-2 h-4 w-48 rounded-sm bg-gradient-to-r from-blue-500 to-indigo-600"></div>
              </div>
              <div className="relative mt-2 rounded-md bg-background p-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-3 flex flex-col gap-2 md:col-span-1">
                    <div className="h-2.5 w-24 rounded-full bg-muted"></div>
                    <div className="h-12 rounded-md bg-muted/80"></div>
                    <div className="h-12 rounded-md bg-muted/80"></div>
                    <div className="h-12 rounded-md bg-muted/80"></div>
                    <div className="h-12 rounded-md bg-muted/80"></div>
                  </div>
                  <div className="col-span-3 rounded-md bg-card md:col-span-2">
                    <div className="mb-4 flex items-center justify-between border-b p-3">
                      <div className="h-2.5 w-32 rounded-full bg-muted"></div>
                      <div className="h-5 w-16 rounded-full bg-blue-500/10"></div>
                    </div>
                    <div className="p-3">
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between rounded-md bg-accent/50 p-3">
                          <div className="h-2.5 w-24 rounded-full bg-muted"></div>
                          <div className="h-2.5 w-12 rounded-full bg-muted"></div>
                        </div>
                        <div className="flex items-center justify-between rounded-md bg-background p-3">
                          <div className="h-2.5 w-24 rounded-full bg-muted"></div>
                          <div className="h-2.5 w-12 rounded-full bg-muted"></div>
                        </div>
                        <div className="flex items-center justify-between rounded-md bg-background p-3">
                          <div className="h-2.5 w-24 rounded-full bg-muted"></div>
                          <div className="h-2.5 w-12 rounded-full bg-muted"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
