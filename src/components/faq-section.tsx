import Link from "next/link";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";

export function FAQSection() {
  const faqs = [
    {
      question: "What is ApexBase?",
      answer:
        "ApexBase is a complete Backend-as-a-Service (BaaS) platform that provides all the backend infrastructure you need to build modern applications. It includes authentication, database, storage, serverless functions, and more, all in a unified platform.",
    },
    {
      question: "How secure is ApexBase?",
      answer:
        "ApexBase employs bank-level security measures including end-to-end encryption, regular security audits, SOC 2 compliance, and more. Our platform is designed with a security-first approach and undergoes regular penetration testing to ensure your data remains protected.",
    },
    {
      question: "Can I migrate from Firebase or Supabase?",
      answer:
        "Yes, we offer migration tools and guides to help you smoothly transition from Firebase, Supabase, or other BaaS platforms to ApexBase. Our migration assistants help automate much of the process while ensuring data integrity and security during the transfer.",
    },
    {
      question: "What kind of applications can I build with ApexBase?",
      answer:
        "ApexBase is versatile and can support virtually any type of application - from web and mobile apps to IoT systems, enterprise solutions, and more. Our platform is used by developers building everything from small personal projects to large-scale enterprise applications.",
    },
    {
      question: "Do you offer a free tier?",
      answer:
        "Yes, we offer a generous free tier that's perfect for personal projects, learning, and early-stage development. The free tier includes essential features with reasonable usage limits. As your application grows, you can seamlessly upgrade to our paid plans.",
    },
    {
      question: "How does pricing work?",
      answer:
        "Our pricing is transparent and predictable. We offer tiered plans (Free, Pro, Business, and Enterprise) with fixed monthly costs based on expected usage. Unlike some competitors, we don't charge unexpected overages - if you approach your limits, we'll notify you so you can upgrade if needed.",
    },
    {
      question: "What kind of support do you offer?",
      answer:
        "Support varies by plan. Free tier users have access to our community forums and documentation. Pro users receive email support with 24-hour response times. Business users get priority support with faster response times. Enterprise customers receive dedicated support with custom SLAs and a designated account manager.",
    },
    {
      question: "Can I self-host ApexBase?",
      answer:
        "Yes, enterprise customers have the option to self-host ApexBase in their own infrastructure or private cloud environment. This option provides maximum control and can help meet specific regulatory or compliance requirements. Contact our sales team for more information.",
    },
  ];

  return (
    <section className="bg-muted/30 py-20 md:py-24 lg:py-28">
      <div className="container">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-muted-foreground">
            Everything you need to know about ApexBase
          </p>
        </div>

        <div className="mx-auto max-w-4xl">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="rounded-lg border bg-background px-4"
              >
                <AccordionTrigger className="py-4 text-lg font-medium">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="pb-4 pt-1 text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        <div className="mt-16 text-center">
          <p className="mb-4 text-muted-foreground">
            Still have questions? We're here to help.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Button variant="outline" asChild>
              <Link href="/docs">Read the Documentation</Link>
            </Button>
            <Button asChild>
              <Link href="/contact">Contact Us</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
