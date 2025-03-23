import Link from "next/link";
import { FiCheck } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function PricingSection() {
  const plans = [
    {
      name: "Developer",
      description: "Perfect for personal projects and prototypes",
      price: "$0",
      per: "month",
      popular: false,
      features: [
        "Authentication (up to 1,000 MAU)",
        "Database (5GB storage)",
        "1 workflow",
        "REST API access",
        "Basic security features",
        "Community support",
        "1 team member",
      ],
      cta: "Get Started",
      ctaLink: "/register",
    },
    {
      name: "Startup",
      description: "For growing applications with more demands",
      price: "$49",
      per: "month",
      popular: true,
      features: [
        "Authentication (up to 10,000 MAU)",
        "Database (20GB storage)",
        "10 workflows",
        "REST API with webhooks",
        "Advanced security",
        "Priority email support",
        "5 team members",
        "Backup and disaster recovery",
        "TypeScript function support",
      ],
      cta: "Start 14-day Trial",
      ctaLink: "/register",
    },
    {
      name: "Business",
      description: "For established businesses with complex needs",
      price: "$149",
      per: "month",
      popular: false,
      features: [
        "Authentication (up to 50,000 MAU)",
        "Database (100GB storage)",
        "Unlimited workflows",
        "Complete API suite",
        "Enterprise security",
        "Dedicated support",
        "Unlimited team members",
        "Advanced backup options",
        "Custom roles and permissions",
        "Workflow monitoring and analytics",
        "SLA guarantees",
      ],
      cta: "Start 14-day Trial",
      ctaLink: "/register",
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
        "Unlimited everything",
        "Custom API development",
        "Dedicated security consultation",
        "24/7 premium support",
        "Custom SLA",
        "On-premises deployment option",
        "Custom integrations",
        "Dedicated account manager",
        "Migration assistance",
      ],
      cta: "Contact Us",
      ctaLink: "/contact",
    },
  ];

  return (
    <section className="bg-background py-20 md:py-24 lg:py-28">
      <div className="container">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Flexible Pricing for Every Stage
          </h2>
          <p className="text-xl text-muted-foreground">
            Choose a plan that matches your needs. Scale as your application grows.
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
                  <Link href={plan.ctaLink}>
                    {plan.cta}
                    <span className="ml-2 text-xs opacity-70">(Coming Soon)</span>
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="mb-4 text-muted-foreground">
            Need a custom solution? Our team is ready to create a tailored package for your specific requirements.
          </p>
          <Button variant="outline" asChild>
            <Link href="/contact">
              Contact Sales
              <span className="ml-2 text-xs opacity-70">(Coming Soon)</span>
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
