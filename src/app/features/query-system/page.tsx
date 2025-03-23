import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FiSearch, FiCheck, FiArrowRight, FiShield, FiBarChart2, FiFilter, FiLock } from "react-icons/fi";

export default function QuerySystemPage() {
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
                    Advanced Query System
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Power your application with sophisticated data access capabilities that combine powerful querying with robust security at every level.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button size="lg">
                    Get Started
                    <FiArrowRight className="ml-2 h-5 w-5" />
                    <span className="ml-2 text-xs opacity-70">(Coming Soon)</span>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <Link href="/features/authorization">Explore Authorization</Link>
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="relative h-[350px] w-[350px] sm:h-[400px] sm:w-[400px] md:h-[450px] md:w-[450px]">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-64 w-64 rounded-full bg-indigo-600/20"></div>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-48 w-48 rounded-full bg-indigo-600/30 animate-pulse"></div>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <FiSearch className="h-24 w-24 text-indigo-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Main features */}
        <section className="bg-muted/40 py-20">
          <div className="container px-4 md:px-6">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Powerful Query Capabilities
              </h2>
              <p className="mx-auto mt-4 max-w-[700px] text-muted-foreground md:text-xl">
                Our advanced query system eliminates the need for custom backend code for most data operations.
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card className="bg-background">
                <CardHeader>
                  <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                    <FiFilter className="h-5 w-5" />
                  </div>
                  <CardTitle>Complex Filtering</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Create sophisticated data filters with multi-level conditions, logical operators, and dynamic parameters.
                  </CardDescription>
                  <ul className="mt-4 space-y-2">
                    <li className="flex items-start gap-2">
                      <FiCheck className="mt-1 h-4 w-4 text-green-600" />
                      <span className="text-sm">AND/OR logical operations</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <FiCheck className="mt-1 h-4 w-4 text-green-600" />
                      <span className="text-sm">Nested condition groups</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <FiCheck className="mt-1 h-4 w-4 text-green-600" />
                      <span className="text-sm">Advanced comparison operators</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
              <Card className="bg-background">
                <CardHeader>
                  <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                    <FiBarChart2 className="h-5 w-5" />
                  </div>
                  <CardTitle>Data Mining & Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Extract valuable insights from your data with aggregation, statistical functions, and custom calculations.
                  </CardDescription>
                  <ul className="mt-4 space-y-2">
                    <li className="flex items-start gap-2">
                      <FiCheck className="mt-1 h-4 w-4 text-green-600" />
                      <span className="text-sm">Aggregation functions (SUM, AVG, COUNT)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <FiCheck className="mt-1 h-4 w-4 text-green-600" />
                      <span className="text-sm">Grouping and pivot operations</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <FiCheck className="mt-1 h-4 w-4 text-green-600" />
                      <span className="text-sm">Time-series data analysis</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
              <Card className="bg-background">
                <CardHeader>
                  <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                    <FiLock className="h-5 w-5" />
                  </div>
                  <CardTitle>Secure Data Access</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Every query is automatically secured with our advanced authorization system at table, column, and row levels.
                  </CardDescription>
                  <ul className="mt-4 space-y-2">
                    <li className="flex items-start gap-2">
                      <FiCheck className="mt-1 h-4 w-4 text-green-600" />
                      <span className="text-sm">Column-level security filters</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <FiCheck className="mt-1 h-4 w-4 text-green-600" />
                      <span className="text-sm">Row-level access policies</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <FiCheck className="mt-1 h-4 w-4 text-green-600" />
                      <span className="text-sm">Dynamic security based on user context</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Advanced features showcase */}
        <section className="py-20">
          <div className="container px-4 md:px-6">
            <div className="mx-auto max-w-3xl space-y-4">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Advanced Query Capabilities</h2>
              <p className="text-muted-foreground">
                Our query system goes far beyond basic CRUD operations, providing sophisticated data manipulation and analysis capabilities.
              </p>

              <div className="mt-12 space-y-12">
                <div className="grid gap-6 md:grid-cols-2 md:gap-12">
                  <div className="flex flex-col justify-center space-y-4">
                    <h3 className="text-2xl font-bold">Calculated Fields</h3>
                    <p className="text-muted-foreground">
                      Create virtual columns with complex calculations, formulas, and conditional logic that are automatically computed on query execution.
                    </p>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <FiCheck className="mt-1 h-4 w-4 text-green-600" />
                        <span>Mathematical expressions and functions</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <FiCheck className="mt-1 h-4 w-4 text-green-600" />
                        <span>Conditional calculations (IF/THEN/ELSE)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <FiCheck className="mt-1 h-4 w-4 text-green-600" />
                        <span>Reference other fields in calculations</span>
                      </li>
                    </ul>
                  </div>
                  <div className="rounded-lg bg-zinc-950 p-4">
                    <pre className="text-sm text-zinc-100 overflow-auto">
                      <code>{`// Define a calculated field
{
  "field": "totalValue",
  "formula": "quantity * unitPrice",
  "type": "number"
}

// Query with calculated fields
const results = await db.orders
  .select([
    "id",
    "customer.name",
    "orderDate",
    {
      "field": "discountedTotal",
      "formula": "totalValue * (1 - discountRate)"
    }
  ])
  .filter({ totalValue: { gt: 100 } })
  .orderBy("discountedTotal", "desc");`}</code>
                    </pre>
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2 md:gap-12">
                  <div className="rounded-lg bg-zinc-950 p-4 md:order-first">
                    <pre className="text-sm text-zinc-100 overflow-auto">
                      <code>{`// Complex analytical query with built-in security
const salesReport = await db.sales
  .aggregate({
    dimensions: [
      "product.category",
      { timeGroup: "saleDate", interval: "month" }
    ],
    measures: [
      { sum: "amount", as: "totalSales" },
      { count: "*", as: "transactions" },
      { formula: "sum(amount) / count(*)", as: "avgSale" }
    ],
    having: {
      "transactions": { gte: 5 }
    },
    orderBy: [
      { field: "totalSales", direction: "desc" }
    ]
  });

// Security is automatically applied - users only see
// data they are authorized to access`}</code>
                    </pre>
                  </div>
                  <div className="flex flex-col justify-center space-y-4 md:order-last">
                    <h3 className="text-2xl font-bold">Advanced Reporting</h3>
                    <p className="text-muted-foreground">
                      Build complex analytical reports with multi-dimensional grouping, aggregation, and filtering - all with automatic security.
                    </p>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <FiCheck className="mt-1 h-4 w-4 text-green-600" />
                        <span>Multi-level grouping and dimensions</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <FiCheck className="mt-1 h-4 w-4 text-green-600" />
                        <span>Dynamic calculated measures</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <FiCheck className="mt-1 h-4 w-4 text-green-600" />
                        <span>Automatic security filtering</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Security integration section */}
        <section className="bg-muted/40 py-20">
          <div className="container px-4 md:px-6">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
                Security-First Query Architecture
              </h2>
              <p className="mx-auto mt-4 max-w-[700px] text-muted-foreground md:text-xl">
                Our query system is built with security at its core, ensuring that users only access data they're authorized to see.
              </p>
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-3">
              <Card className="bg-background">
                <CardHeader>
                  <CardTitle>Table-Level Security</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Restrict access to entire tables based on user roles, groups, or custom authorization rules.
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-background">
                <CardHeader>
                  <CardTitle>Column-Level Security</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Control which fields users can query, with dynamic permissions that can change based on context.
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-background">
                <CardHeader>
                  <CardTitle>Row-Level Security</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Apply dynamic filtering to ensure users only see records they're authorized to access.
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="mt-8 rounded-lg bg-zinc-950 p-6 mx-auto max-w-3xl">
              <pre className="text-sm text-zinc-100 overflow-auto">
                <code>{`// Security is automatically applied at all levels
// No need to write security code - it's built into the query system

// This query will automatically:
// 1. Only access tables the user can see
// 2. Only return columns the user is authorized to view
// 3. Filter out any rows the user shouldn't see
// 4. Apply security to calculated fields and aggregations

const result = await db.employees
  .select([
    "id",
    "name",
    "department",
    "salary",  // Only returned if user has permission
    { avg: "team.salary", as: "teamAvgSalary" }
  ])
  .filter({
    department: "Engineering",
    "salary": { gte: 75000 }
  })
  .groupBy("department");

// The same query returns different results for different users
// based on their authorization level`}</code>
              </pre>
            </div>
          </div>
        </section>

        {/* CTA section */}
        <section className="bg-indigo-600 py-16 text-white">
          <div className="container px-4 md:px-6">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
                Unlock the Power of Your Data
              </h2>
              <p className="mt-4 text-xl">
                Access, analyze, and secure your data with our advanced query system - without writing complex backend code.
              </p>
              <div className="mt-8">
                <Button size="lg" variant="secondary">
                  Start Building Today
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
