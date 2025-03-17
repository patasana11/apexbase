import Link from 'next/link';

export default function PricingPage() {
  const pricingTiers = [
    {
      name: 'Free',
      id: 'free',
      price: '$0',
      description: 'Perfect for individuals starting out',
      features: [
        '3 projects',
        '1GB storage',
        'Community support',
        'Basic analytics',
      ],
      cta: 'Get Started',
      href: '/registration?plan=free',
      highlight: false,
    },
    {
      name: 'Basic',
      id: 'basic',
      price: '$9.99',
      period: '/month',
      description: 'For professionals and small teams',
      features: [
        'Unlimited projects',
        '10GB storage',
        'Priority support',
        'Advanced analytics',
        'API access',
      ],
      cta: 'Start Free Trial',
      href: '/registration?plan=basic',
      highlight: true,
    },
    {
      name: 'Premium',
      id: 'premium',
      price: '$29.99',
      period: '/month',
      description: 'For growing teams with advanced needs',
      features: [
        'Unlimited projects',
        '100GB storage',
        'Dedicated support',
        'Custom analytics',
        'Advanced API access',
        'Team management',
      ],
      cta: 'Start Free Trial',
      href: '/registration?plan=premium',
      highlight: false,
    },
    {
      name: 'Enterprise',
      id: 'enterprise',
      price: 'Custom',
      description: 'For large organizations with specific needs',
      features: [
        'Unlimited everything',
        'Dedicated support team',
        'Custom implementation',
        'SLA guarantees',
        'On-premises option',
      ],
      cta: 'Contact Sales',
      href: '/contact-sales',
      highlight: false,
    },
  ];

  return (
    <div className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl sm:text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Simple, transparent pricing
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Choose the plan that's right for you. All plans include a 14-day free trial.
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-lg grid-cols-1 items-center gap-y-6 sm:mt-20 sm:gap-y-0 lg:max-w-4xl lg:grid-cols-2 lg:gap-x-8 xl:max-w-none xl:grid-cols-4 xl:gap-x-8">
          {pricingTiers.map((tier) => (
            <div
              key={tier.id}
              className={`
                rounded-3xl p-8 ring-1 sm:p-10
                ${tier.highlight
                  ? 'bg-blue-600 text-white ring-blue-600'
                  : 'bg-white text-gray-900 ring-gray-200 hover:ring-gray-300'
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
                    tier.highlight ? "text-blue-200" : "text-gray-500"
                  }>
                    {tier.period}
                  </span>
                )}
              </p>
              <p className={`mt-6 text-sm leading-6 ${tier.highlight ? 'text-blue-100' : 'text-gray-600'}`}>
                {tier.description}
              </p>
              <ul
                className={`mt-8 space-y-3 text-sm leading-6 ${tier.highlight ? 'text-blue-100' : 'text-gray-600'}`}
              >
                {tier.features.map((feature) => (
                  <li key={feature} className="flex gap-x-3">
                    <svg
                      className={`h-6 w-5 flex-none ${tier.highlight ? 'text-blue-200' : 'text-blue-500'}`}
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
              <Link
                href={tier.href}
                className={`
                  mt-8 block rounded-md px-3 py-2 text-center text-sm font-semibold leading-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2
                  ${
                    tier.highlight
                      ? 'bg-white text-blue-600 hover:bg-blue-50 focus-visible:outline-white'
                      : 'bg-blue-600 text-white hover:bg-blue-500 focus-visible:outline-blue-600'
                  }
                `}
              >
                {tier.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
