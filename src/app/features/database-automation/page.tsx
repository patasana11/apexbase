import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FiDatabase, FiCheck, FiArrowRight, FiRefreshCw, FiShield, FiServer } from "react-icons/fi";

export default function DatabaseAutomationPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Hero section */}
        <section className="bg-background py-20">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_500px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                    Database Automation
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Eliminate manual database management with our powerful automation system that handles everything from schema creation to complex data operations.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button size="lg">
                    Get Started
                    <FiArrowRight className="ml-2 h-5 w-5" />
                    <span className="ml-2 text-xs opacity-70">(Coming Soon)</span>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <Link href="/features/query-system">Explore Advanced Queries</Link>
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="relative h-[350px] w-[350px] sm:h-[400px] sm:w-[400px] md:h-[450px] md:w-[450px]">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-64 w-64 rounded-full bg-blue-600/20"></div>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-48 w-48 rounded-full bg-blue-600/30 animate-pulse"></div>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <FiDatabase className="h-24 w-24 text-blue-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features section */}
        <section className="bg-muted/40 py-20">
          <div className="container px-4 md:px-6">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Comprehensive Database Management
              </h2>
              <p className="mx-auto mt-4 max-w-[700px] text-muted-foreground md:text-xl">
                Our database automation goes beyond traditional approaches, bringing powerful capabilities to your application.
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card className="bg-background">
                <CardHeader>
                  <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                    <FiDatabase className="h-5 w-5" />
                  </div>
                  <CardTitle>Custom ORM System</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Our custom Object-Relational Mapping (ORM) system is designed to provide unparalleled automation, allowing developers to interact with the database without writing SQL queries.
                  </CardDescription>
                  <ul className="mt-4 space-y-2">
                    <li className="flex items-start gap-2">
                      <FiCheck className="mt-1 h-4 w-4 text-green-600" />
                      <span className="text-sm">Automatic schema generation</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <FiCheck className="mt-1 h-4 w-4 text-green-600" />
                      <span className="text-sm">Dynamic data table management</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <FiCheck className="mt-1 h-4 w-4 text-green-600" />
                      <span className="text-sm">Simplified data operations</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
              <Card className="bg-background">
                <CardHeader>
                  <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                    <FiRefreshCw className="h-5 w-5" />
                  </div>
                  <CardTitle>Automatic Backups</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Never worry about data loss with our advanced automated backup and recovery system that ensures your database is always protected.
                  </CardDescription>
                  <ul className="mt-4 space-y-2">
                    <li className="flex items-start gap-2">
                      <FiCheck className="mt-1 h-4 w-4 text-green-600" />
                      <span className="text-sm">Scheduled automatic backups</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <FiCheck className="mt-1 h-4 w-4 text-green-600" />
                      <span className="text-sm">Point-in-time recovery options</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <FiCheck className="mt-1 h-4 w-4 text-green-600" />
                      <span className="text-sm">Seamless disaster recovery</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
              <Card className="bg-background">
                <CardHeader>
                  <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                    <FiShield className="h-5 w-5" />
                  </div>
                  <CardTitle>Integrated Security</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Our database layer is tightly integrated with our advanced authorization system, providing security at every level of your data.
                  </CardDescription>
                  <ul className="mt-4 space-y-2">
                    <li className="flex items-start gap-2">
                      <FiCheck className="mt-1 h-4 w-4 text-green-600" />
                      <span className="text-sm">Table-level access controls</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <FiCheck className="mt-1 h-4 w-4 text-green-600" />
                      <span className="text-sm">Column-level authorization</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <FiCheck className="mt-1 h-4 w-4 text-green-600" />
                      <span className="text-sm">Record-level security rules</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Technical details section */}
        <section className="py-20">
          <div className="container px-4 md:px-6">
            <div className="mx-auto max-w-3xl space-y-4">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Technical Deep Dive</h2>
              <p className="text-muted-foreground">
                Our database automation technology provides comprehensive solutions for complex data scenarios without requiring developers to write database code.
              </p>
              <div className="mt-8 space-y-8">
                <div className="space-y-4">
                  <h3 className="text-xl font-bold">Schema Management</h3>
                  <p className="text-muted-foreground">
                    Creating and updating database schemas is fully automated. Define your data structures through our interface, and we handle the rest - from creating tables to managing relationships and indexes.
                  </p>
                  <div className="rounded-lg bg-zinc-950 p-4">
                    <pre className="text-sm text-zinc-100 overflow-auto">
                      <code>{`// With traditional database management
CREATE TABLE customers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

// With ApexBase
// Just define your entity structure through the UI or API
// No SQL required!`}</code>
                    </pre>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-xl font-bold">Data Operations</h3>
                  <p className="text-muted-foreground">
                    Our ORM handles all CRUD operations with built-in security checks, optimized queries, and transaction management. Every operation is automatically logged and secured.
                  </p>
                  <div className="rounded-lg bg-zinc-950 p-4">
                    <pre className="text-sm text-zinc-100 overflow-auto">
                      <code>{`// Creating a record with security automatically applied
await db.customers.create({
  name: "Jane Smith",
  email: "jane@example.com"
});

// Query with automatic security filtering
const customers = await db.customers
  .filter({ role: "admin" })
  .orderBy("name")
  .limit(10)
  .select();
`}</code>
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA section */}
        <section className="bg-blue-600 py-16 text-white">
          <div className="container px-4 md:px-6">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
                Ready to stop worrying about database management?
              </h2>
              <p className="mt-4 text-xl">
                Let our database automation system handle the complexity while you focus on building amazing applications.
              </p>
              <div className="mt-8">
                <Button size="lg" variant="secondary">
                  Get Started Today
                  <FiArrowRight className="ml-2 h-5 w-5" />
                  <span className="ml-2 text-xs opacity-70">(Coming Soon)</span>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
