import {
  FiUsers,
  FiDatabase,
  FiHardDrive,
  FiCode,
  FiShield,
  FiActivity,
  FiZap,
  FiGlobe,
} from "react-icons/fi";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function FeaturesSection() {
  const features = [
    {
      icon: <FiUsers className="h-10 w-10" />,
      title: "Authentication",
      description: "Secure user management with social logins, JWT, and multi-factor authentication.",
    },
    {
      icon: <FiDatabase className="h-10 w-10" />,
      title: "Database",
      description: "Powerful NoSQL and SQL databases with real-time capabilities and automatic scaling.",
    },
    {
      icon: <FiHardDrive className="h-10 w-10" />,
      title: "Storage",
      description: "Securely store, manage and serve files with built-in CDN and access controls.",
    },
    {
      icon: <FiCode className="h-10 w-10" />,
      title: "Functions",
      description: "Deploy serverless functions that automatically scale with your application demands.",
    },
    {
      icon: <FiShield className="h-10 w-10" />,
      title: "Security",
      description: "Enterprise-grade security with encryption at rest and in transit, plus advanced access control.",
    },
    {
      icon: <FiActivity className="h-10 w-10" />,
      title: "Analytics",
      description: "Track user behavior, monitor performance, and gain insights into your application.",
    },
    {
      icon: <FiZap className="h-10 w-10" />,
      title: "Real-time",
      description: "Build real-time applications with WebSockets and publish/subscribe models.",
    },
    {
      icon: <FiGlobe className="h-10 w-10" />,
      title: "Global Edge Network",
      description: "Distribute your application globally with ultra-low latency access from anywhere.",
    },
  ];

  return (
    <section className="bg-background py-20 md:py-24 lg:py-28">
      <div className="container">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Comprehensive Backend Services
          </h2>
          <p className="text-xl text-muted-foreground">
            Everything you need to build modern, secure applications at any scale.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {features.map((feature, index) => (
            <Card key={index} className="border-2 bg-background transition-all duration-300 hover:border-blue-500/20 hover:shadow-lg hover:shadow-blue-500/5">
              <CardHeader>
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                  {feature.icon}
                </div>
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
