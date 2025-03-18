'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { RegistrationType } from '@/lib/gsb/services/registration.service';
import { usePaddleClient } from '@/lib/gsb/services/subscription/paddle-client.service';

// Define the subscription plans
const subscriptionPlans = [
  {
    id: 'free',
    type: RegistrationType.Free,
    title: 'Free Plan',
    description: 'For individuals just getting started',
    monthlyPriceId: 'free_monthly',
    yearlyPriceId: 'free_yearly',
    includedFeatures: [
      '1 user',
      '3 projects',
      '1GB storage',
      'Community support',
      'Basic analytics',
    ],
    recommended: false,
    buttonText: 'Start for free',
  },
  {
    id: 'basic',
    type: RegistrationType.Basic,
    title: 'Basic Plan',
    description: 'For small teams and professionals',
    monthlyPriceId: 'pri_basic_monthly', // Replace with your actual Paddle price ID
    yearlyPriceId: 'pri_basic_yearly', // Replace with your actual Paddle price ID
    includedFeatures: [
      'Up to 5 users',
      '10 projects',
      '10GB storage',
      'Email support',
      'Advanced analytics',
      'API access',
    ],
    recommended: false,
    buttonText: 'Start Basic plan',
  },
  {
    id: 'premium',
    type: RegistrationType.Premium,
    title: 'Premium Plan',
    description: 'For growing teams with advanced needs',
    monthlyPriceId: 'pri_premium_monthly', // Replace with your actual Paddle price ID
    yearlyPriceId: 'pri_premium_yearly', // Replace with your actual Paddle price ID
    includedFeatures: [
      'Unlimited users',
      'Unlimited projects',
      '100GB storage',
      'Priority support',
      'Premium analytics',
      'Advanced API access',
      'SSO and team management',
      'Custom integrations',
    ],
    recommended: true,
    buttonText: 'Start Premium plan',
  },
  {
    id: 'enterprise',
    type: RegistrationType.Enterprise,
    title: 'Enterprise Plan',
    description: 'For organizations requiring dedicated support',
    contactSales: true,
    includedFeatures: [
      'Unlimited users',
      'Unlimited projects',
      'Unlimited storage',
      'Dedicated support',
      'Custom SLAs',
      'Custom contract',
      'On-premises deployment option',
      'Advanced security features',
    ],
    recommended: false,
    buttonText: 'Contact sales',
  },
];

type PriceInfo = {
  amount: string;
  currency: string;
  formatted: string;
  recurringIntervals?: string[];
};

export default function PricingPlans() {
  const router = useRouter();
  const [isYearly, setIsYearly] = useState(false);
  const [pricingData, setPricingData] = useState<Record<string, PriceInfo>>({});
  const [isLoading, setIsLoading] = useState(true);
  const { isLoaded, getLocalizedPrice, openCheckout } = usePaddleClient();

  // Fetch prices from Paddle
  useEffect(() => {
    const fetchPrices = async () => {
      if (!isLoaded) {
        return;
      }

      try {
        setIsLoading(true);
        const prices: Record<string, PriceInfo> = {};

        // Fetch prices for each plan
        for (const plan of subscriptionPlans) {
          if (plan.type === RegistrationType.Free || plan.contactSales) {
            // Free plan or contact sales - no need to fetch prices
            prices[plan.id] = {
              amount: '0',
              currency: 'USD',
              formatted: plan.contactSales ? 'Custom pricing' : 'Free',
            };
            continue;
          }

          const priceId = isYearly ? plan.yearlyPriceId : plan.monthlyPriceId;
          const priceInfo = await getLocalizedPrice(priceId);

          if (priceInfo) {
            prices[plan.id] = {
              amount: priceInfo.unit_price?.amount || '0',
              currency: priceInfo.unit_price?.currency_code || 'USD',
              formatted: priceInfo.unit_price?.formatted || `$0`,
              recurringIntervals: priceInfo.recurring ? [priceInfo.recurring.interval] : undefined,
            };
          } else {
            // Fallback pricing if Paddle prices can't be loaded
            prices[plan.id] = {
              amount: plan.id === 'basic' ? '999' : '2999',
              currency: 'USD',
              formatted: plan.id === 'basic' ? '$9.99' : '$29.99',
              recurringIntervals: ['month'],
            };
          }
        }

        setPricingData(prices);
      } catch (error) {
        console.error('Error fetching prices:', error);
        // Set fallback prices
        const fallbackPrices: Record<string, PriceInfo> = {
          free: { amount: '0', currency: 'USD', formatted: 'Free' },
          basic: { amount: '999', currency: 'USD', formatted: '$9.99', recurringIntervals: ['month'] },
          premium: { amount: '2999', currency: 'USD', formatted: '$29.99', recurringIntervals: ['month'] },
          enterprise: { amount: '0', currency: 'USD', formatted: 'Custom pricing' },
        };
        setPricingData(fallbackPrices);
      } finally {
        setIsLoading(false);
      }
    };

    if (isLoaded) {
      fetchPrices();
    }
  }, [isLoaded, isYearly, getLocalizedPrice]);

  const handleSubscribe = async (plan: typeof subscriptionPlans[0]) => {
    if (plan.contactSales) {
      // Redirect to contact sales page
      router.push('/contact-sales');
      return;
    }

    if (plan.type === RegistrationType.Free) {
      // Redirect to registration page for free plan
      router.push(`/registration?plan=${plan.id}`);
      return;
    }

    // For paid plans, we need to open the Paddle checkout
    if (!isLoaded) {
      alert('Payment system is currently loading. Please try again in a moment.');
      return;
    }

    const priceId = isYearly ? plan.yearlyPriceId : plan.monthlyPriceId;

    try {
      // Open Paddle checkout
      await openCheckout({
        items: [
          {
            priceId,
            quantity: 1,
          },
        ],
        successUrl: `${window.location.origin}/checkout/success`,
        // Add any custom data you want to associate with this checkout
        customData: {
          planId: plan.id,
          planType: plan.type,
        },
      });
    } catch (error) {
      console.error('Error opening checkout:', error);
      alert('Failed to open checkout. Please try again later.');
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
      <div className="sm:align-center sm:flex sm:flex-col">
        <h1 className="text-5xl font-extrabold text-gray-900 sm:text-center">Pricing Plans</h1>
        <p className="mt-5 text-xl text-gray-500 sm:text-center">
          Start building for free, then add a plan to go live. Account plans unlock additional features.
        </p>
        <div className="relative mt-6 flex self-center rounded-lg bg-gray-100 p-0.5 sm:mt-8">
          <button
            type="button"
            onClick={() => setIsYearly(false)}
            className={`relative w-1/2 whitespace-nowrap rounded-md py-2 text-sm font-medium ${
              !isYearly
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-700 hover:bg-white/30'
            }`}
          >
            Monthly billing
          </button>
          <button
            type="button"
            onClick={() => setIsYearly(true)}
            className={`relative ml-0.5 w-1/2 whitespace-nowrap rounded-md py-2 text-sm font-medium ${
              isYearly
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-700 hover:bg-white/30'
            }`}
          >
            Yearly billing <span className="text-cyan-600">(save 20%)</span>
          </button>
        </div>
      </div>
      <div className="mt-12 space-y-4 sm:mt-16 sm:grid sm:grid-cols-2 sm:gap-6 sm:space-y-0 lg:grid-cols-4 lg:mx-auto lg:max-w-4xl xl:mx-0 xl:max-w-none">
        {subscriptionPlans.map((plan) => (
          <div
            key={plan.id}
            className={`flex flex-col rounded-lg ${
              plan.recommended
                ? 'border-2 border-cyan-500 shadow-md'
                : 'border border-gray-300'
            } shadow-sm divide-y divide-gray-200`}
          >
            {plan.recommended && (
              <div className="px-6 py-1 border-b bg-cyan-50 border-cyan-500">
                <span className="text-sm font-medium text-center block text-cyan-600">Recommended</span>
              </div>
            )}
            <div className="p-6">
              <h2 className="text-xl font-medium text-gray-900">{plan.title}</h2>
              <p className="mt-2 text-gray-500">{plan.description}</p>
              <div className="mt-4">
                {isLoading ? (
                  <div className="h-10 w-24 bg-gray-200 animate-pulse rounded"></div>
                ) : (
                  <>
                    <span className="text-4xl font-extrabold text-gray-900">{pricingData[plan.id]?.formatted}</span>
                    {pricingData[plan.id]?.recurringIntervals && (
                      <span className="text-base font-medium text-gray-500">
                        /{isYearly ? 'year' : 'month'}
                      </span>
                    )}
                  </>
                )}
              </div>
              <button
                onClick={() => handleSubscribe(plan)}
                className={`mt-6 block w-full rounded-md px-4 py-2 text-center text-sm font-medium ${
                  plan.recommended
                    ? 'bg-cyan-600 text-white hover:bg-cyan-700'
                    : 'bg-gray-800 text-white hover:bg-gray-900'
                }`}
              >
                {plan.buttonText}
              </button>
            </div>
            <div className="px-6 pt-6 pb-8">
              <h3 className="text-sm font-medium text-gray-900">What's included</h3>
              <ul role="list" className="mt-6 space-y-4">
                {plan.includedFeatures.map((feature) => (
                  <li key={feature} className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <p className="ml-3 text-sm text-gray-700">{feature}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
