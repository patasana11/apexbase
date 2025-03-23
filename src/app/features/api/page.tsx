import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FiLink, FiCheck, FiArrowRight, FiShield, FiRefreshCw, FiCode, FiGlobe } from "react-icons/fi";

export default function ApiPage() {
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
                    Integration API
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Automatic API endpoint generation with comprehensive security and seamless integration capabilities for your applications.
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
                    <div className="h-64 w-64 rounded-full bg-blue-600/20"></div>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-48 w-48 rounded-full bg-blue-600/30 animate-pulse"></div>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <FiLink className="h-24 w-24 text-blue-600" />
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
                Automatic API Generation
              </h2>
              <p className="mx-auto mt-4 max-w-[700px] text-muted-foreground md:text-xl">
                Our system automatically creates and secures REST API endpoints for all your data tables without writing a single line of code.
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card className="bg-background">
                <CardHeader>
                  <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                    <FiCode className="h-5 w-5" />
                  </div>
                  <CardTitle>Zero-Code API Creation</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    APIs are automatically generated for every data table you create, instantly available for use in your applications.
                  </CardDescription>
                  <ul className="mt-4 space-y-2">
                    <li className="flex items-start gap-2">
                      <FiCheck className="mt-1 h-4 w-4 text-green-600" />
                      <span className="text-sm">Instant API availability</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <FiCheck className="mt-1 h-4 w-4 text-green-600" />
                      <span className="text-sm">RESTful endpoints for all operations</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <FiCheck className="mt-1 h-4 w-4 text-green-600" />
                      <span className="text-sm">Automatic schema documentation</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
              <Card className="bg-background">
                <CardHeader>
                  <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                    <FiShield className="h-5 w-5" />
                  </div>
                  <CardTitle>Secured By Default</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Every API endpoint automatically inherits your authorization rules, enforcing security at all levels.
                  </CardDescription>
                  <ul className="mt-4 space-y-2">
                    <li className="flex items-start gap-2">
                      <FiCheck className="mt-1 h-4 w-4 text-green-600" />
                      <span className="text-sm">Integrated authentication</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <FiCheck className="mt-1 h-4 w-4 text-green-600" />
                      <span className="text-sm">Authorization rule enforcement</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <FiCheck className="mt-1 h-4 w-4 text-green-600" />
                      <span className="text-sm">API key & token management</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
              <Card className="bg-background">
                <CardHeader>
                  <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                    <FiGlobe className="h-5 w-5" />
                  </div>
                  <CardTitle>Advanced Query Support</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Access the full power of our query system through simple API parameters, including filtering, sorting, and aggregation.
                  </CardDescription>
                  <ul className="mt-4 space-y-2">
                    <li className="flex items-start gap-2">
                      <FiCheck className="mt-1 h-4 w-4 text-green-600" />
                      <span className="text-sm">Complex filtering capabilities</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <FiCheck className="mt-1 h-4 w-4 text-green-600" />
                      <span className="text-sm">Data aggregation via API</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <FiCheck className="mt-1 h-4 w-4 text-green-600" />
                      <span className="text-sm">Calculated fields support</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* API showcase */}
        <section className="py-20">
          <div className="container px-4 md:px-6">
            <div className="mx-auto max-w-3xl">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">API In Action</h2>
              <p className="mt-4 text-muted-foreground">
                See how simple it is to interact with your data through our automatically generated RESTful API.
              </p>

              <div className="mt-12 space-y-8">
                {/* Request examples */}
                <div className="rounded-lg bg-zinc-950 p-6">
                  <h3 className="mb-4 text-lg font-medium text-white">Making API Requests</h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-blue-400">GET /api/v1/{`{table}`}</h4>
                      <pre className="mt-2 overflow-auto rounded-md bg-zinc-900 p-4">
                        <code className="text-sm text-white">
                          {`// Fetch customers with filtering, sorting, and pagination
GET /api/v1/customers?filter[status]=active&sort=-created_at&page=2&limit=20

// Response automatically filtered by authorization rules
{
  "data": [
    {
      "id": "cus_123",
      "name": "Acme Inc",
      "email": "contact@acme.com",
      "status": "active",
      "created_at": "2023-10-15T14:30:00Z"
    },
    // More records...
  ],
  "meta": {
    "total": 178,
    "page": 2,
    "limit": 20,
    "pages": 9
  }
}`}
                        </code>
                      </pre>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-green-400">POST /api/v1/{`{table}`}</h4>
                      <pre className="mt-2 overflow-auto rounded-md bg-zinc-900 p-4">
                        <code className="text-sm text-white">
                          {`// Create a new record with validation
POST /api/v1/orders
{
  "customer_id": "cus_123",
  "products": [
    { "id": "prod_456", "quantity": 2 },
    { "id": "prod_789", "quantity": 1 }
  ],
  "shipping_address": {
    "street": "123 Main St",
    "city": "San Francisco",
    "state": "CA",
    "zip": "94105"
  }
}

// Response includes the created record with generated values
{
  "data": {
    "id": "ord_987",
    "customer_id": "cus_123",
    "status": "pending",
    "total": 249.97,
    "created_at": "2023-10-20T09:15:22Z",
    // Other fields...
  }
}`}
                        </code>
                      </pre>
                    </div>
                  </div>
                </div>

                {/* Advanced query examples */}
                <div className="rounded-lg bg-zinc-950 p-6">
                  <h3 className="mb-4 text-lg font-medium text-white">Advanced Query Operations</h3>
                  <pre className="overflow-auto rounded-md bg-zinc-900 p-4">
                    <code className="text-sm text-white">
                      {`// Aggregation queries via API
GET /api/v1/sales/aggregate?
  group[]=product_category&
  group[]=month(sale_date)&
  calc[sum]=amount&
  calc[count]=id&
  calc[avg]=amount&
  having[sum(amount)][gt]=10000&
  sort[]=-sum(amount)

// Response includes aggregated data with automatic security
{
  "data": [
    {
      "product_category": "Electronics",
      "month_sale_date": "2023-10",
      "sum_amount": 45289.50,
      "count_id": 128,
      "avg_amount": 353.82
    },
    // More aggregated results...
  ],
  "meta": {
    "total": 12
  }
}`}
                    </code>
                  </pre>
                </div>

                {/* Webhooks and events */}
                <div className="rounded-lg bg-zinc-950 p-6">
                  <h3 className="mb-4 text-lg font-medium text-white">Webhooks & Real-time Events</h3>
                  <pre className="overflow-auto rounded-md bg-zinc-900 p-4">
                    <code className="text-sm text-white">
                      {`// Register a webhook endpoint
POST /api/v1/webhooks
{
  "url": "https://your-app.com/webhook-handler",
  "events": ["customer.created", "order.status_changed"],
  "secret": "whsec_your_webhook_signing_secret"
}

// Webhook payload sent to your endpoint
{
  "id": "evt_123456",
  "type": "order.status_changed",
  "created": "2023-10-21T15:45:30Z",
  "data": {
    "id": "ord_987",
    "old_status": "processing",
    "new_status": "shipped",
    "updated_at": "2023-10-21T15:45:28Z"
  }
}`}
                    </code>
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Authentication & security */}
        <section className="bg-muted/40 py-20">
          <div className="container px-4 md:px-6">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
                Robust API Security
              </h2>
              <p className="mx-auto mt-4 max-w-[700px] text-muted-foreground md:text-xl">
                Our API comes with comprehensive security features to protect your data while ensuring seamless access.
              </p>
            </div>

            <div className="mt-12 grid gap-8 md:grid-cols-2">
              <div className="rounded-lg bg-background p-6 shadow-sm">
                <h3 className="mb-4 text-xl font-bold">Authentication Options</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <FiCheck className="mt-1 h-5 w-5 flex-shrink-0 text-green-600" />
                    <div>
                      <p className="font-medium">API Keys</p>
                      <p className="text-sm text-muted-foreground">Simple key-based authentication for server-to-server integrations</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <FiCheck className="mt-1 h-5 w-5 flex-shrink-0 text-green-600" />
                    <div>
                      <p className="font-medium">JWT Tokens</p>
                      <p className="text-sm text-muted-foreground">Secure, short-lived tokens with user context for client applications</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <FiCheck className="mt-1 h-5 w-5 flex-shrink-0 text-green-600" />
                    <div>
                      <p className="font-medium">OAuth 2.0</p>
                      <p className="text-sm text-muted-foreground">Standard protocol support for third-party integrations</p>
                    </div>
                  </li>
                </ul>
              </div>

              <div className="rounded-lg bg-background p-6 shadow-sm">
                <h3 className="mb-4 text-xl font-bold">Security Features</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <FiCheck className="mt-1 h-5 w-5 flex-shrink-0 text-green-600" />
                    <div>
                      <p className="font-medium">Rate Limiting</p>
                      <p className="text-sm text-muted-foreground">Protect your API from abuse with configurable rate limits</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <FiCheck className="mt-1 h-5 w-5 flex-shrink-0 text-green-600" />
                    <div>
                      <p className="font-medium">Request Validation</p>
                      <p className="text-sm text-muted-foreground">Automatic schema validation to prevent malformed data</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <FiCheck className="mt-1 h-5 w-5 flex-shrink-0 text-green-600" />
                    <div>
                      <p className="font-medium">Audit Logging</p>
                      <p className="text-sm text-muted-foreground">Comprehensive logging of all API requests for security and compliance</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* CTA section */}
        <section className="bg-blue-600 py-16 text-white">
          <div className="container px-4 md:px-6">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
                Connect Your Applications
              </h2>
              <p className="mt-4 text-xl">
                Start building with our powerful, secure API - no backend coding required.
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
