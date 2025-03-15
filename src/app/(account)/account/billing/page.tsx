"use client";

import { useState } from "react";
import {
  CreditCard,
  Download,
  Plus,
  Check,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

// Mock data for invoices
const invoices = [
  { id: 'INV-2023-001', date: 'March 1, 2024', amount: '$129.99', status: 'Paid' },
  { id: 'INV-2023-002', date: 'February 1, 2024', amount: '$99.99', status: 'Paid' },
  { id: 'INV-2023-003', date: 'January 1, 2024', amount: '$99.99', status: 'Paid' },
  { id: 'INV-2023-004', date: 'December 1, 2023', amount: '$99.99', status: 'Paid' },
  { id: 'INV-2023-005', date: 'November 1, 2023', amount: '$79.99', status: 'Paid' },
];

// Pricing plans
const plans = [
  {
    name: 'Starter',
    price: '$49.99',
    description: 'Perfect for small teams and startups',
    features: [
      '5 workspaces',
      '10 users per workspace',
      '20GB storage',
      'Basic support',
      '1M API calls per month',
    ],
    recommended: false
  },
  {
    name: 'Professional',
    price: '$129.99',
    description: 'For growing businesses',
    features: [
      '10 workspaces',
      'Unlimited users per workspace',
      '100GB storage',
      'Priority support',
      '10M API calls per month',
      'Custom domains',
      'Advanced analytics'
    ],
    recommended: true
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    description: 'For large organizations',
    features: [
      'Unlimited workspaces',
      'Unlimited users per workspace',
      'Unlimited storage',
      'Dedicated support',
      'Unlimited API calls',
      'Custom domains',
      'Advanced analytics',
      'SLA guarantee',
      'Custom integrations'
    ],
    recommended: false
  }
];

export default function BillingPage() {
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  const toggleItemExpanded = (id: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Billing & Plans</h1>
        <p className="text-muted-foreground mt-1">
          Manage your subscription, payment methods, and billing history
        </p>
      </div>

      <Tabs defaultValue="subscription">
        <TabsList>
          <TabsTrigger value="subscription">Subscription</TabsTrigger>
          <TabsTrigger value="payment-methods">Payment Methods</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="usage">Usage</TabsTrigger>
        </TabsList>

        {/* Subscription Tab */}
        <TabsContent value="subscription" className="space-y-6">
          {/* Current Plan */}
          <Card>
            <CardHeader>
              <CardTitle>Current Plan</CardTitle>
              <CardDescription>You are currently on the Professional plan</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="text-2xl font-bold">$129.99 <span className="text-sm font-normal text-muted-foreground">per month</span></div>
                  <p className="text-muted-foreground">Next billing date: April 1, 2024</p>
                </div>
                <Button>Change Plan</Button>
              </div>
              <Separator className="my-6" />
              <div className="space-y-2">
                <h3 className="font-medium">Plan includes:</h3>
                <ul className="space-y-1 text-sm">
                  <li className="flex items-center">
                    <Check className="h-4 w-4 mr-2 text-green-500" />
                    10 workspaces
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 mr-2 text-green-500" />
                    Unlimited users per workspace
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 mr-2 text-green-500" />
                    100GB storage
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 mr-2 text-green-500" />
                    10M API calls per month
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 mr-2 text-green-500" />
                    Priority support
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Available Plans */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Available Plans</h2>
            <div className="grid gap-4 md:grid-cols-3">
              {plans.map((plan) => (
                <Card key={plan.name} className={plan.recommended ? "border-primary" : ""}>
                  {plan.recommended && (
                    <div className="bg-primary text-primary-foreground text-center text-sm py-1">
                      Recommended
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle>{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold mb-2">{plan.price}</div>
                    <p className="text-sm text-muted-foreground mb-6">per month</p>
                    <ul className="space-y-2 text-sm mb-6">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <Check className="h-4 w-4 mr-2 text-green-500 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button
                      variant={plan.recommended ? "default" : "outline"}
                      className="w-full"
                    >
                      {plan.recommended ? "Current Plan" : `Switch to ${plan.name}`}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Payment Methods Tab */}
        <TabsContent value="payment-methods" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Payment Methods</CardTitle>
              <CardDescription>Manage your payment methods</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Credit card */}
              <div className="flex items-center justify-between p-4 border rounded-md">
                <div className="flex items-center">
                  <CreditCard className="h-10 w-10 mr-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium">•••• •••• •••• 4242</div>
                    <div className="text-sm text-muted-foreground">Expires 12/25</div>
                  </div>
                </div>
                <Badge>Default</Badge>
              </div>

              <Button className="w-full" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Payment Method
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Invoices Tab */}
        <TabsContent value="invoices" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Invoice History</CardTitle>
              <CardDescription>View and download your invoice history</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <div className="grid grid-cols-4 p-4 font-medium border-b">
                  <div>Invoice</div>
                  <div>Date</div>
                  <div>Amount</div>
                  <div className="text-right">Actions</div>
                </div>
                {invoices.map((invoice) => (
                  <div key={invoice.id} className="grid grid-cols-4 p-4 border-b last:border-0 items-center">
                    <div>{invoice.id}</div>
                    <div>{invoice.date}</div>
                    <div>{invoice.amount}</div>
                    <div className="text-right">
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center mt-4">
                <Button variant="outline" size="sm">
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <div className="text-sm text-muted-foreground">
                  Page 1 of 1
                </div>
                <Button variant="outline" size="sm">
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Usage Tab */}
        <TabsContent value="usage" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Usage Overview</CardTitle>
              <CardDescription>Track your current usage across all workspaces</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* API Usage */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">API Calls</h3>
                  <div className="text-sm">
                    <span className="font-medium">4.2M</span>
                    <span className="text-muted-foreground"> / 10M</span>
                  </div>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: '42%' }}></div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">42% of monthly allowance</p>
              </div>

              {/* Storage Usage */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">Storage</h3>
                  <div className="text-sm">
                    <span className="font-medium">72GB</span>
                    <span className="text-muted-foreground"> / 100GB</span>
                  </div>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: '72%' }}></div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">72% of total storage</p>
              </div>

              {/* Workspaces Usage */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">Workspaces</h3>
                  <div className="text-sm">
                    <span className="font-medium">3</span>
                    <span className="text-muted-foreground"> / 10</span>
                  </div>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: '30%' }}></div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">30% of workspace limit</p>
              </div>

              {/* Usage details by workspace */}
              <div className="pt-4">
                <h3 className="font-medium mb-3">Usage by Workspace</h3>
                <div className="space-y-2">
                  {['Development', 'Production', 'Testing'].map((workspace, index) => (
                    <div key={workspace} className="border rounded-md">
                      <button
                        className="w-full flex items-center justify-between p-3"
                        onClick={() => toggleItemExpanded(workspace)}
                      >
                        <span className="font-medium">{workspace}</span>
                        {expandedItems[workspace] ?
                          <ChevronUp className="h-4 w-4" /> :
                          <ChevronDown className="h-4 w-4" />
                        }
                      </button>

                      {expandedItems[workspace] && (
                        <div className="px-3 pb-3 space-y-3">
                          <div>
                            <div className="flex items-center justify-between mb-1 text-sm">
                              <span className="text-muted-foreground">API Calls</span>
                              <span>{[1.2, 2.5, 0.5][index]}M</span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                              <div className="h-full bg-blue-500 rounded-full"
                                style={{ width: [`${1.2/10*100}%`, `${2.5/10*100}%`, `${0.5/10*100}%`][index] }}></div>
                            </div>
                          </div>

                          <div>
                            <div className="flex items-center justify-between mb-1 text-sm">
                              <span className="text-muted-foreground">Storage</span>
                              <span>{[25, 42, 5][index]}GB</span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                              <div className="h-full bg-green-500 rounded-full"
                                style={{ width: [`${25/100*100}%`, `${42/100*100}%`, `${5/100*100}%`][index] }}></div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
