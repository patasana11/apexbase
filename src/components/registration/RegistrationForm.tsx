'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { RegistrationType } from '@/lib/services/registration.service';
import { usePaddleClient } from '@/lib/services/paddle-client.service';

// Form schema
const registrationSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  surname: z.string().min(2, 'Surname is required'),
  email: z.string().email('Please enter a valid email'),
  phoneNumber: z.string().optional(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  agreeTerms: z.boolean().refine(val => val === true, {
    message: 'You must agree to the terms and conditions',
  }),
  subscriptionType: z.nativeEnum(RegistrationType),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export type RegistrationFormValues = z.infer<typeof registrationSchema>;

// Sample subscription plans
const subscriptionPlans = [
  {
    type: RegistrationType.Free,
    title: 'Free Tier',
    description: 'Basic access with limited features',
    price: '$0/month',
    features: [
      'Up to 3 projects',
      'Basic analytics',
      'Community support',
      '1 GB storage',
    ],
    priceId: 'free_plan',
  },
  {
    type: RegistrationType.Basic,
    title: 'Basic Plan',
    description: 'Perfect for individuals and small teams',
    price: '$9.99/month',
    features: [
      'Up to 10 projects',
      'Advanced analytics',
      'Email support',
      '10 GB storage',
      'Custom domains',
    ],
    priceId: 'pri_basic_monthly',
  },
  {
    type: RegistrationType.Premium,
    title: 'Premium Plan',
    description: 'For growing businesses with advanced needs',
    price: '$29.99/month',
    features: [
      'Unlimited projects',
      'Premium analytics',
      'Priority support',
      '100 GB storage',
      'Custom domains',
      'API access',
      'Team collaboration',
    ],
    priceId: 'pri_premium_monthly',
  },
];

export default function RegistrationForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<RegistrationType>(RegistrationType.Free);
  const { isLoaded, openCheckout } = usePaddleClient();

  const form = useForm<RegistrationFormValues>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      name: '',
      surname: '',
      email: '',
      phoneNumber: '',
      password: '',
      confirmPassword: '',
      agreeTerms: false,
      subscriptionType: RegistrationType.Free,
    },
  });

  const onSubmit = async (data: RegistrationFormValues) => {
    setIsSubmitting(true);

    try {
      // If this is a paid plan, open the Paddle checkout
      if (data.subscriptionType !== RegistrationType.Free) {
        if (!isLoaded) {
          throw new Error('Payment system is not ready yet. Please try again in a moment.');
        }

        const plan = subscriptionPlans.find(p => p.type === data.subscriptionType);
        if (!plan) {
          throw new Error('Selected plan not found');
        }

        // Prepare checkout settings
        const checkoutSettings = {
          items: [
            {
              priceId: plan.priceId,
              quantity: 1,
            },
          ],
          customer: {
            email: data.email,
          },
          customData: {
            registrationType: data.subscriptionType,
            name: data.name,
            surname: data.surname,
          },
          successUrl: `${window.location.origin}/registration/verify`,
        };

        // Open the checkout
        await openCheckout(checkoutSettings);

        // The user will be redirected to the success URL after the checkout is complete
        return;
      }

      // For free plans, directly submit the registration
      const response = await fetch('/api/registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to register');
      }

      const result = await response.json();

      // Redirect to verification page
      router.push(`/registration/verify?email=${encodeURIComponent(data.email)}`);
    } catch (error) {
      console.error('Registration error:', error);
      // Set error state here if needed
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-extrabold">Create Your Account</h1>
        <p className="mt-2 text-lg text-gray-600">
          Choose the plan that works best for you
        </p>
      </div>

      {/* Plan Selection */}
      <div className="mb-10 grid grid-cols-1 gap-6 md:grid-cols-3">
        {subscriptionPlans.map((plan) => (
          <div
            key={plan.type}
            className={`
              rounded-lg border-2 p-6 shadow-sm transition-all
              ${selectedPlan === plan.type ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200 hover:border-gray-300'}
            `}
            onClick={() => {
              setSelectedPlan(plan.type);
              form.setValue('subscriptionType', plan.type);
            }}
          >
            <h3 className="text-xl font-bold">{plan.title}</h3>
            <p className="text-2xl font-bold mt-2">{plan.price}</p>
            <p className="mt-2 text-sm text-gray-500">{plan.description}</p>
            <ul className="mt-4 space-y-2">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-center text-sm">
                  <svg className="mr-2 h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
            <button
              type="button"
              className={`
                mt-6 w-full rounded-md px-4 py-2 font-medium text-white
                ${selectedPlan === plan.type ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-600 hover:bg-gray-700'}
              `}
              onClick={() => {
                setSelectedPlan(plan.type);
                form.setValue('subscriptionType', plan.type);
              }}
            >
              {selectedPlan === plan.type ? 'Selected' : 'Select Plan'}
            </button>
          </div>
        ))}
      </div>

      {/* Registration Form */}
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              First Name
            </label>
            <input
              id="name"
              type="text"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              {...form.register('name')}
            />
            {form.formState.errors.name && (
              <p className="mt-1 text-sm text-red-600">{form.formState.errors.name.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="surname" className="block text-sm font-medium text-gray-700">
              Last Name
            </label>
            <input
              id="surname"
              type="text"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              {...form.register('surname')}
            />
            {form.formState.errors.surname && (
              <p className="mt-1 text-sm text-red-600">{form.formState.errors.surname.message}</p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            {...form.register('email')}
          />
          {form.formState.errors.email && (
            <p className="mt-1 text-sm text-red-600">{form.formState.errors.email.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
            Phone Number (Optional)
          </label>
          <input
            id="phoneNumber"
            type="tel"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            {...form.register('phoneNumber')}
          />
          {form.formState.errors.phoneNumber && (
            <p className="mt-1 text-sm text-red-600">{form.formState.errors.phoneNumber.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              {...form.register('password')}
            />
            {form.formState.errors.password && (
              <p className="mt-1 text-sm text-red-600">{form.formState.errors.password.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              {...form.register('confirmPassword')}
            />
            {form.formState.errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">{form.formState.errors.confirmPassword.message}</p>
            )}
          </div>
        </div>

        <div>
          <div className="flex items-center">
            <input
              id="agreeTerms"
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              {...form.register('agreeTerms')}
            />
            <label htmlFor="agreeTerms" className="ml-2 block text-sm text-gray-700">
              I agree to the{' '}
              <a href="/terms" className="text-blue-600 hover:text-blue-500">
                Terms and Conditions
              </a>{' '}
              and{' '}
              <a href="/privacy" className="text-blue-600 hover:text-blue-500">
                Privacy Policy
              </a>
            </label>
          </div>
          {form.formState.errors.agreeTerms && (
            <p className="mt-1 text-sm text-red-600">{form.formState.errors.agreeTerms.message}</p>
          )}
        </div>

        <div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-300"
          >
            {isSubmitting ? 'Creating Account...' : 'Create Account'}
          </button>
        </div>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Already have an account?{' '}
          <a href="/login" className="font-medium text-blue-600 hover:text-blue-500">
            Log in
          </a>
        </p>
      </div>
    </div>
  );
}
