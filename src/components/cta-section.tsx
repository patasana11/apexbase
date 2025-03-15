import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";
import { Button } from "@/components/ui/button";

export function CTASection() {
  return (
    <section className="relative overflow-hidden bg-blue-600 py-20 md:py-24 lg:py-28">
      {/* Abstract Background Elements */}
      <div className="absolute -top-24 -left-20 h-[500px] w-[500px] rounded-full bg-blue-500/50 blur-3xl"></div>
      <div className="absolute -bottom-32 -right-20 h-[500px] w-[500px] rounded-full bg-indigo-500/50 blur-3xl"></div>

      <div className="container relative">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-6 text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
            Ready to build your next great idea?
          </h2>
          <p className="mb-10 text-xl text-blue-100">
            Get started with ApexBase today and join thousands of developers building secure, scalable applications.
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              size="lg"
              className="bg-white text-blue-600 hover:bg-blue-50"
              asChild
            >
              <Link href="/register" className="gap-1">
                Start Building for Free
                <FiArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-blue-700"
              asChild
            >
              <Link href="/contact">Schedule a Demo</Link>
            </Button>
          </div>

          <p className="mt-8 text-blue-100">
            No credit card required. Free tier includes all core features.
          </p>
        </div>
      </div>
    </section>
  );
}
