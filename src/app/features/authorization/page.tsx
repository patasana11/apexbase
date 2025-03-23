import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FiLock, FiCheck, FiArrowRight, FiShield, FiUsers, FiKey, FiList } from "react-icons/fi";

export default function AuthorizationPage() {
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
                    Advanced Authorization
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Implement granular security controls with our advanced authorization system that protects your data at every level.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button size="lg">
                    Get Started
                    <FiArrowRight className="ml-2 h-5 w-5" />
                    <span className="ml-2 text-xs opacity-70">(Coming Soon)</span>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <Link href="/features/query-system">Explore Query System</Link>
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="relative h-[350px] w-[350px] sm:h-[400px] sm:w-[400px] md:h-[450px] md:w-[450px]">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-64 w-64 rounded-full bg-green-600/20"></div>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-48 w-48 rounded-full bg-green-600/30 animate-pulse"></div>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <FiLock className="h-24 w-24 text-green-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Core capabilities */}
        <section className="bg-muted/40 py-20">
          <div className="container px-4 md:px-6">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Multi-Level Security Architecture
              </h2>
              <p className="mx-auto mt-4 max-w-[700px] text-muted-foreground md:text-xl">
                Our authorization system provides unmatched data protection with granular controls at every level.
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card className="bg-background">
                <CardHeader>
                  <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600">
                    <FiList className="h-5 w-5" />
                  </div>
                  <CardTitle>Table-Level Authorization</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Control access to entire tables based on user roles, ensuring that unauthorized users can't even see sensitive data tables.
                  </CardDescription>
                  <ul className="mt-4 space-y-2">
                    <li className="flex items-start gap-2">
                      <FiCheck className="mt-1 h-4 w-4 text-green-600" />
                      <span className="text-sm">Role-based table access</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <FiCheck className="mt-1 h-4 w-4 text-green-600" />
                      <span className="text-sm">Operation-specific permissions (read/write/delete)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <FiCheck className="mt-1 h-4 w-4 text-green-600" />
                      <span className="text-sm">Dynamic table access rules</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
              <Card className="bg-background">
                <CardHeader>
                  <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600">
                    <FiKey className="h-5 w-5" />
                  </div>
                  <CardTitle>Column-Level Security</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Our standout feature: control access to individual data fields with precision, hiding sensitive columns based on authorization rules.
                  </CardDescription>
                  <ul className="mt-4 space-y-2">
                    <li className="flex items-start gap-2">
                      <FiCheck className="mt-1 h-4 w-4 text-green-600" />
                      <span className="text-sm">Field-level visibility controls</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <FiCheck className="mt-1 h-4 w-4 text-green-600" />
                      <span className="text-sm">Data masking for sensitive information</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <FiCheck className="mt-1 h-4 w-4 text-green-600" />
                      <span className="text-sm">Context-aware field permissions</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
              <Card className="bg-background">
                <CardHeader>
                  <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600">
                    <FiUsers className="h-5 w-5" />
                  </div>
                  <CardTitle>Row-Level Policies</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Apply dynamic filters to ensure users only see the specific records they're authorized to access, automatically applied to every query.
                  </CardDescription>
                  <ul className="mt-4 space-y-2">
                    <li className="flex items-start gap-2">
                      <FiCheck className="mt-1 h-4 w-4 text-green-600" />
                      <span className="text-sm">User-specific data visibility</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <FiCheck className="mt-1 h-4 w-4 text-green-600" />
                      <span className="text-sm">Attribute-based access control</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <FiCheck className="mt-1 h-4 w-4 text-green-600" />
                      <span className="text-sm">Dynamic security policies</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Column-level security showcase */}
        <section className="py-20">
          <div className="container px-4 md:px-6">
            <div className="mx-auto max-w-3xl space-y-4">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Column-Level Security in Action</h2>
              <p className="text-muted-foreground">
                See how our advanced column-level security works to protect sensitive data while allowing authorized access.
              </p>

              <div className="mt-12 rounded-lg bg-zinc-950 p-6">
                <pre className="text-sm text-zinc-100 overflow-auto">
                  <code>{`// Defining column-level security
{
  "table": "employees",
  "columns": {
    "id": { "roles": ["*"] },  // Everyone can see ID
    "name": { "roles": ["*"] }, // Everyone can see name
    "email": {
      "roles": ["admin", "hr", "manager"],  // Only specific roles
      "conditions": [{"field": "department", "operator": "equals", "value": "@user.department"}]
    },
    "salary": {
      "roles": ["admin", "hr"],  // Highly restricted
      "operations": ["read"],   // Can't be updated directly
      "audit": true            // All access is logged
    },
    "performance": {
      "roles": ["admin", "hr", "manager"],
      "conditions": [{"field": "manager_id", "operator": "equals", "value": "@user.id"}]
    }
  }
}`}</code>
                </pre>

                <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="rounded-lg bg-zinc-900 p-4">
                    <h4 className="mb-2 text-lg font-semibold text-white">Admin User View</h4>
                    <div className="overflow-auto">
                      <table className="min-w-full divide-y divide-zinc-700">
                        <thead>
                          <tr>
                            <th className="px-2 py-2 text-left text-xs font-medium text-zinc-400">ID</th>
                            <th className="px-2 py-2 text-left text-xs font-medium text-zinc-400">Name</th>
                            <th className="px-2 py-2 text-left text-xs font-medium text-zinc-400">Email</th>
                            <th className="px-2 py-2 text-left text-xs font-medium text-zinc-400">Salary</th>
                            <th className="px-2 py-2 text-left text-xs font-medium text-zinc-400">Performance</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-700">
                          <tr>
                            <td className="px-2 py-2 text-xs text-white">001</td>
                            <td className="px-2 py-2 text-xs text-white">John Smith</td>
                            <td className="px-2 py-2 text-xs text-white">john@example.com</td>
                            <td className="px-2 py-2 text-xs text-white">$85,000</td>
                            <td className="px-2 py-2 text-xs text-white">Excellent</td>
                          </tr>
                          <tr>
                            <td className="px-2 py-2 text-xs text-white">002</td>
                            <td className="px-2 py-2 text-xs text-white">Sarah Johnson</td>
                            <td className="px-2 py-2 text-xs text-white">sarah@example.com</td>
                            <td className="px-2 py-2 text-xs text-white">$92,000</td>
                            <td className="px-2 py-2 text-xs text-white">Good</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="rounded-lg bg-zinc-900 p-4">
                    <h4 className="mb-2 text-lg font-semibold text-white">Regular User View</h4>
                    <div className="overflow-auto">
                      <table className="min-w-full divide-y divide-zinc-700">
                        <thead>
                          <tr>
                            <th className="px-2 py-2 text-left text-xs font-medium text-zinc-400">ID</th>
                            <th className="px-2 py-2 text-left text-xs font-medium text-zinc-400">Name</th>
                            <th className="px-2 py-2 text-left text-xs font-medium text-zinc-400">Email</th>
                            <th className="px-2 py-2 text-left text-xs font-medium text-zinc-400">Salary</th>
                            <th className="px-2 py-2 text-left text-xs font-medium text-zinc-400">Performance</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-700">
                          <tr>
                            <td className="px-2 py-2 text-xs text-white">001</td>
                            <td className="px-2 py-2 text-xs text-white">John Smith</td>
                            <td className="px-2 py-2 text-xs text-zinc-700">• • • • • • • • • • • • •</td>
                            <td className="px-2 py-2 text-xs text-zinc-700">• • • • • • • • •</td>
                            <td className="px-2 py-2 text-xs text-zinc-700">• • • • • • • • •</td>
                          </tr>
                          <tr>
                            <td className="px-2 py-2 text-xs text-white">002</td>
                            <td className="px-2 py-2 text-xs text-white">Sarah Johnson</td>
                            <td className="px-2 py-2 text-xs text-zinc-700">• • • • • • • • • • • • •</td>
                            <td className="px-2 py-2 text-xs text-zinc-700">• • • • • • • • •</td>
                            <td className="px-2 py-2 text-xs text-zinc-700">• • • • • • • • •</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <p className="mb-4 text-muted-foreground">
                  With our column-level security, different users automatically see different fields based on their authorization level - all from the same database tables and using the same queries.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Authorization rules builder */}
        <section className="bg-muted/40 py-20">
          <div className="container px-4 md:px-6">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
                Dynamic Authorization Rules
              </h2>
              <p className="mx-auto mt-4 max-w-[700px] text-muted-foreground md:text-xl">
                Create sophisticated security policies that adapt to your business needs without writing complex code.
              </p>
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <h3 className="text-xl font-bold">Role-Based Access Control</h3>
                <p className="text-muted-foreground">
                  Assign permissions based on user roles to easily manage access for different types of users.
                </p>
                <div className="rounded-lg bg-zinc-950 p-4">
                  <pre className="text-sm text-zinc-100 overflow-auto">
                    <code>{`// Define role-based access
{
  "roles": {
    "admin": {
      "tables": {
        "*": { "operations": ["*"] }  // Full access to all tables
      }
    },
    "manager": {
      "tables": {
        "employees": {
          "operations": ["read", "update"],
          "filters": [
            { "department": "@user.department" }
          ],
          "columns": {
            "salary": { "operations": ["read"] }
          }
        }
      }
    }
  }
}`}</code>
                  </pre>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-bold">Dynamic Security Policies</h3>
                <p className="text-muted-foreground">
                  Apply security rules that change based on data values, user attributes, and application context.
                </p>
                <div className="rounded-lg bg-zinc-950 p-4">
                  <pre className="text-sm text-zinc-100 overflow-auto">
                    <code>{`// Dynamic security policy example
{
  "table": "projects",
  "policies": [
    {
      "name": "Team members can view their projects",
      "effect": "allow",
      "operations": ["read"],
      "condition": {
        "members": {
          "contains": "@user.id"
        }
      }
    },
    {
      "name": "Project owners can edit",
      "effect": "allow",
      "operations": ["update", "delete"],
      "condition": {
        "owner_id": "@user.id"
      }
    }
  ]
}`}</code>
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA section */}
        <section className="bg-green-600 py-16 text-white">
          <div className="container px-4 md:px-6">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
                Secure Your Data With Confidence
              </h2>
              <p className="mt-4 text-xl">
                Implement enterprise-grade security with just a few lines of configuration. No security expertise needed.
              </p>
              <div className="mt-8">
                <Button size="lg" variant="secondary">
                  Start Securing Your Data
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
