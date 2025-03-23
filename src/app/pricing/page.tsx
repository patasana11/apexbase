import Link from 'next/link';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';

export default function PricingPage() {
  const pricingTiers = [
    {
      name: 'Developer',
      id: 'developer',
      price: '$0',
      description: 'Perfect for personal projects and prototypes',
      features: [
        'Authentication (up to 1,000 MAU)',
        'Database (5GB storage)',
        '1 workflow',
        'REST API access',
        'Basic security features',
        'Community support',
        '1 team member',
      ],
      cta: 'Get Started',
      href: '/registration?plan=developer',
      highlight: false,
    },
    {
      name: 'Startup',
      id: 'startup',
      price: '$49',
      period: '/month',
      description: 'For growing applications with more demands',
      features: [
        'Authentication (up to 10,000 MAU)',
        'Database (20GB storage)',
        '10 workflows',
        'REST API with webhooks',
        'Advanced security',
        'Priority email support',
        '5 team members',
        'Backup and disaster recovery',
        'TypeScript function support',
      ],
      cta: 'Start 14-day Trial',
      href: '/registration?plan=startup',
      highlight: true,
    },
    {
      name: 'Business',
      id: 'business',
      price: '$149',
      period: '/month',
      description: 'For established businesses with complex needs',
      features: [
        'Authentication (up to 50,000 MAU)',
        'Database (100GB storage)',
        'Unlimited workflows',
        'Complete API suite',
        'Enterprise security',
        'Dedicated support',
        'Unlimited team members',
        'Advanced backup options',
        'Custom roles and permissions',
        'Workflow monitoring and analytics',
        'SLA guarantees',
      ],
      cta: 'Start 14-day Trial',
      href: '/registration?plan=business',
      highlight: false,
    },
    {
      name: 'Enterprise',
      id: 'enterprise',
      price: 'Custom',
      description: 'Custom solutions for large organizations',
      features: [
        'Authentication (unlimited MAU)',
        'Custom database storage',
        'Unlimited everything',
        'Custom API development',
        'Dedicated security consultation',
        '24/7 premium support',
        'Custom SLA',
        'On-premises deployment option',
        'Custom integrations',
        'Dedicated account manager',
        'Migration assistance',
      ],
      cta: 'Contact Sales',
      href: '/contact',
      highlight: false,
    },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="bg-background py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl sm:text-center">
              <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Flexible Pricing for Every Stage
              </h1>
              <p className="mt-6 text-lg leading-8 text-muted-foreground">
                Choose a plan that matches your needs. Scale as your application grows.
              </p>
            </div>

            <div className="mx-auto mt-16 grid max-w-lg grid-cols-1 items-center gap-y-6 sm:mt-20 sm:gap-y-0 lg:max-w-4xl lg:grid-cols-2 xl:max-w-none xl:grid-cols-4 xl:gap-x-8">
              {pricingTiers.map((tier) => (
                <div
                  key={tier.id}
                  className={`
                    rounded-3xl p-8 ring-1 sm:p-10
                    ${tier.highlight
                      ? 'bg-blue-600 text-white ring-blue-600'
                      : 'bg-card text-foreground ring-border hover:ring-blue-300'
                    }
                  `}
                >
                  <h3 className="text-lg font-semibold leading-8">
                    {tier.name}
                  </h3>
                  <p className="mt-4 flex items-baseline gap-x-2">
                    <span className="text-4xl font-bold tracking-tight">
                      {tier.price}
                    </span>
                    {tier.period && (
                      <span className={
                        tier.highlight ? "text-blue-200" : "text-muted-foreground"
                      }>
                        {tier.period}
                      </span>
                    )}
                  </p>
                  <p className={`mt-6 text-sm leading-6 ${tier.highlight ? 'text-blue-100' : 'text-muted-foreground'}`}>
                    {tier.description}
                  </p>
                  <ul
                    className={`mt-8 space-y-3 text-sm leading-6 ${tier.highlight ? 'text-blue-100' : 'text-muted-foreground'}`}
                  >
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex gap-x-3">
                        <svg
                          className={`h-6 w-5 flex-none ${tier.highlight ? 'text-blue-200' : 'text-blue-600'}`}
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <button
                    className={`
                      mt-8 block rounded-md px-3 py-2 text-center text-sm font-semibold leading-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 w-full
                      ${
                        tier.highlight
                          ? 'bg-white text-blue-600 hover:bg-blue-50 focus-visible:outline-white'
                          : 'bg-blue-600 text-white hover:bg-blue-500 focus-visible:outline-blue-600'
                      }
                    `}
                  >
                    {tier.cta}
                    <span className="ml-2 text-xs opacity-70">(Coming Soon)</span>
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-16 text-center">
              <p className="text-muted-foreground">
                Need a custom solution? Our team is ready to create a tailored package for your specific requirements.
              </p>
              <button
                className="mt-4 inline-block rounded-md px-5 py-2.5 text-center text-sm font-semibold bg-background text-foreground ring-1 ring-inset ring-border hover:ring-blue-300"
              >
                Contact Sales
                <span className="ml-2 text-xs opacity-70">(Coming Soon)</span>
              </button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
