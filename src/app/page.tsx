import { Navbar } from "@/components/navbar";
import { HeroSection } from "@/components/hero-section";
import { Footer } from "@/components/footer";
import { FeaturesSection } from "@/components/features-section";
import { TrustSection } from "@/components/trust-section";
import { PricingSection } from "@/components/pricing-section";
import { FAQSection } from "@/components/faq-section";
import { CTASection } from "@/components/cta-section";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <FeaturesSection />
        <TrustSection />
        <PricingSection />
        <FAQSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
