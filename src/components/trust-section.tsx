import Image from "next/image";
import { FiShield, FiLock, FiCheckCircle } from "react-icons/fi";

export function TrustSection() {
  const logos = [
    { name: "Acme Inc", width: 120, height: 40 },
    { name: "Globex Corp", width: 120, height: 40 },
    { name: "Initech", width: 120, height: 40 },
    { name: "Massive Dynamic", width: 120, height: 40 },
    { name: "Oscorp", width: 120, height: 40 },
    { name: "Umbrella Corp", width: 120, height: 40 },
  ];

  const securityFeatures = [
    {
      icon: <FiShield className="h-6 w-6" />,
      title: "SOC 2 Compliant",
      description: "Certified to meet the highest standards of security and data protection.",
    },
    {
      icon: <FiLock className="h-6 w-6" />,
      title: "End-to-End Encryption",
      description: "All data encrypted at rest and in transit with bank-level security.",
    },
    {
      icon: <FiCheckCircle className="h-6 w-6" />,
      title: "GDPR & HIPAA Ready",
      description: "Built with compliance for global data protection regulations.",
    },
  ];

  return (
    <section className="border-y bg-muted/30 py-20 md:py-24 lg:py-28">
      <div className="container">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Trusted by Enterprise Teams
          </h2>
          <p className="text-xl text-muted-foreground">
            Secure enough for banks, government agencies, and healthcare organizations.
          </p>
        </div>

        {/* Logo Cloud */}
        <div className="mb-16">
          <div className="mx-auto max-w-5xl">
            <div className="grid grid-cols-2 place-items-center gap-8 sm:grid-cols-3 md:grid-cols-6">
              {logos.map((logo, index) => (
                <div
                  key={index}
                  className="flex h-16 w-full items-center justify-center"
                >
                  <div className="h-8 w-32 rounded-md bg-muted-foreground/10"></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Security Features */}
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-8 md:grid-cols-3">
            {securityFeatures.map((feature, index) => (
              <div key={index} className="flex flex-col items-center text-center">
                <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                  {feature.icon}
                </div>
                <h3 className="mb-2 text-xl font-semibold">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-16 flex flex-wrap items-center justify-center gap-8">
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="h-16 w-16 rounded-md bg-muted-foreground/10"></div>
            <span className="text-sm text-muted-foreground">HIPAA Compliant</span>
          </div>
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="h-16 w-16 rounded-md bg-muted-foreground/10"></div>
            <span className="text-sm text-muted-foreground">SOC 2 Type II</span>
          </div>
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="h-16 w-16 rounded-md bg-muted-foreground/10"></div>
            <span className="text-sm text-muted-foreground">GDPR Ready</span>
          </div>
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="h-16 w-16 rounded-md bg-muted-foreground/10"></div>
            <span className="text-sm text-muted-foreground">ISO 27001</span>
          </div>
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="h-16 w-16 rounded-md bg-muted-foreground/10"></div>
            <span className="text-sm text-muted-foreground">PCI DSS</span>
          </div>
        </div>
      </div>
    </section>
  );
}
