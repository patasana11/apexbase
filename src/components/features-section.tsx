import {
  FiUsers,
  FiDatabase,
  FiHardDrive,
  FiCode,
  FiShield,
  FiActivity,
  FiZap,
  FiServer,
  FiGitMerge,
  FiLayers,
  FiSliders,
  FiLink,
  FiLock,
  FiSearch
} from "react-icons/fi";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export function FeaturesSection() {
  const features = [
    {
      icon: <FiDatabase className="h-10 w-10" />,
      title: "Database Automation",
      description: "Automatic schema management, custom ORM system, and robust backup solutions without writing SQL queries.",
      href: "/features/database-automation"
    },
    {
      icon: <FiLock className="h-10 w-10" />,
      title: "Advanced Authorization",
      description: "Fine-grained access control at the table and column level with role-based permissions and dynamic security rules.",
      href: "/features/authorization"
    },
    {
      icon: <FiSearch className="h-10 w-10" />,
      title: "Advanced Query System",
      description: "Powerful query capabilities with data mining, reporting, calculated fields, and complex calculations - all with built-in security.",
      href: "/features/query-system"
    },
    {
      icon: <FiGitMerge className="h-10 w-10" />,
      title: "Visual Workflows",
      description: "Create complex business processes with our drag-and-drop workflow designer and automatic task management.",
      href: "/features/workflows"
    },
    {
      icon: <FiLink className="h-10 w-10" />,
      title: "Integration API",
      description: "Automatic API generation for all your data tables with secure endpoint management.",
      href: "/features/api"
    },
    {
      icon: <FiShield className="h-10 w-10" />,
      title: "Enterprise Security",
      description: "End-to-end encryption, detailed audit logging, and comprehensive security mechanisms.",
      href: "/features/security"
    },
    {
      icon: <FiCode className="h-10 w-10" />,
      title: "Serverless Functions",
      description: "Write and deploy TypeScript-based functions that automatically scale with your application demands.",
      href: "/features/functions"
    },
    {
      icon: <FiSliders className="h-10 w-10" />,
      title: "Unlimited Extendibility",
      description: "Customize your backend with plugins, custom code, and third-party integrations for unlimited possibilities.",
      href: "/features/extendibility"
    },
  ];

  return (
    <section className="bg-background py-20 md:py-24 lg:py-28">
      <div className="container">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Enterprise-Grade Backend Services
          </h2>
          <p className="text-xl text-muted-foreground">
            Advanced data management and security tools for building sophisticated applications without backend complexity.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {features.map((feature, index) => (
            <Link key={index} href={feature.href} className="no-underline">
              <Card className="border-2 bg-background h-full transition-all duration-300 hover:border-blue-500/20 hover:shadow-lg hover:shadow-blue-500/5">
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
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
