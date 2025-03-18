'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

// Loading component for suspense fallback
function CheckoutSuccessLoading() {
  return (
    <div className="mx-auto max-w-md px-4 py-12 sm:px-6 lg:px-8">
      <div className="rounded-lg bg-white p-6 shadow">
        <div className="text-center">
          <h2 className="text-2xl font-semibold">Processing payment...</h2>
          <div className="mt-6 flex justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main checkout success component that uses searchParams
function CheckoutSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const processCheckoutSuccess = async () => {
      try {
        // Get the checkout ID from the URL (supplied by Paddle)
        const checkoutId = searchParams?.get('checkout_id');

        if (!checkoutId) {
          throw new Error('Missing checkout ID');
        }

        // In a real implementation, call an API to:
        // 1. Verify the checkout with Paddle
        // 2. Complete the user registration
        // 3. Set up the subscription

        // For this mock implementation, we'll just simulate a delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Then redirect to the verification page or dashboard
        const email = searchParams?.get('customer_email') || 'user@example.com';
        router.push(`/registration/verify?email=${encodeURIComponent(email)}`);
      } catch (error) {
        console.error('Error processing checkout:', error);
        setError(error instanceof Error ? error.message : 'An error occurred while processing your payment');
        setIsProcessing(false);
      }
    };

    processCheckoutSuccess();
  }, [searchParams, router]);

  if (error) {
    return (
      <div className="mx-auto max-w-md px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-lg bg-white p-6 shadow">
          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Payment Error
            </h2>
            <div className="mt-4 rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            </div>
            <div className="mt-6 text-center">
              <Link href="/registration" className="text-blue-600 hover:text-blue-500">
                Return to registration
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12 sm:px-6 lg:px-8">
      <div className="rounded-lg bg-white p-6 shadow">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Payment Successful
          </h2>
          <div className="mt-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <svg
                className="h-6 w-6 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <p className="mt-4 text-center text-sm text-gray-600">
              Your payment was successful! Setting up your account...
            </p>
            <div className="mt-6 flex justify-center">
              <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-gray-900"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main page component with suspense boundary
export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<CheckoutSuccessLoading />}>
      <CheckoutSuccessContent />
    </Suspense>
  );
}
