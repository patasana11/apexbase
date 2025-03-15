import Link from "next/link";
import { FiCheck } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function PricingSection() {
  const plans = [
    {
      name: "Free",
      description: "For hobbyists and personal projects",
      price: "$0",
      per: "month",
      popular: false,
      features: [
        "Authentication (up to 1,000 MAU)",
        "Database storage (1GB)",
        "File storage (1GB)",
        "Serverless functions (100K executions/mo)",
        "Community support",
        "Basic security features",
      ],
      cta: "Get Started",
      ctaLink: "/register",
    },
    {
      name: "Pro",
      description: "For startups and growing applications",
      price: "$29",
      per: "month",
      popular: true,
      features: [
        "Authentication (up to 10,000 MAU)",
        "Database storage (10GB)",
        "File storage (20GB)",
        "Serverless functions (1M executions/mo)",
        "Priority support",
        "Advanced security features",
        "Custom domains",
        "Team collaboration",
      ],
      cta: "Start 14-day Trial",
      ctaLink: "/register",
    },
    {
      name: "Business",
      description: "For scale-ups and larger organizations",
      price: "$99",
      per: "month",
      popular: false,
      features: [
        "Authentication (up to 50,000 MAU)",
        "Database storage (50GB)",
        "File storage (100GB)",
        "Serverless functions (10M executions/mo)",
        "Premium support",
        "Enterprise security features",
        "Custom domains & branding",
        "Team collaboration & roles",
        "Advanced analytics",
        "SLA guarantee",
      ],
      cta: "Contact Sales",
      ctaLink: "/contact",
    },
    {
      name: "Enterprise",
      description: "Custom solutions for large organizations",
      price: "Custom",
      per: "",
      popular: false,
      features: [
        "Authentication (unlimited MAU)",
        "Custom database storage",
        "Custom file storage",
        "Unlimited serverless functions",
        "Dedicated support",
        "Enterprise-grade security",
        "Custom domains & branding",
        "Advanced team roles & permissions",
        "Enterprise analytics & reporting",
        "Dedicated infrastructure",
        "Custom SLA guarantee",
        "On-premises deployment options",
      ],
      cta: "Contact Us",
      ctaLink: "/enterprise",
    },
  ];

  return (
    <section className="bg-background py-20 md:py-24 lg:py-28">
      <div className="container">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Transparent, Predictable Pricing
          </h2>
          <p className="text-xl text-muted-foreground">
            Start for free, upgrade as you grow. No hidden fees or surprises.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`flex flex-col border-2 ${
                plan.popular
                  ? "relative border-blue-600 shadow-lg shadow-blue-300/10"
                  : "border-border"
              }`}
            >
              {plan.popular && (
                <Badge
                  className="absolute -top-3 left-1/2 -translate-x-1/2 transform bg-blue-600 text-white"
                  variant="default"
                >
                  Most Popular
                </Badge>
              )}

              <CardHeader className="flex-1">
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>

              <CardContent className="flex-1">
                <div className="mb-6">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  {plan.per && (
                    <span className="text-muted-foreground">/{plan.per}</span>
                  )}
                </div>

                <ul className="mb-6 space-y-2">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <FiCheck className="h-4 w-4 text-blue-600" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter>
                <Button
                  className={`w-full ${
                    plan.popular
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : ""
                  }`}
                  variant={plan.popular ? "default" : "outline"}
                  asChild
                >
                  <Link href={plan.ctaLink}>{plan.cta}</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="mb-4 text-muted-foreground">
            Need a custom plan? Contact our sales team for a tailored solution.
          </p>
          <Button variant="outline" asChild>
            <Link href="/contact">Contact Sales</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
