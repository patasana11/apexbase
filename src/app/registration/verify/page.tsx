'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

// Loading component for suspense fallback
function VerifyLoading() {
  return (
    <div className="mx-auto max-w-md px-4 py-12 sm:px-6 lg:px-8">
      <div className="rounded-lg bg-white p-8 shadow text-center">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
        <h2 className="mt-4 text-xl font-semibold">Loading verification...</h2>
      </div>
    </div>
  );
}

// Main verification component that uses searchParams
function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams?.get('email');
  const registrationId = searchParams?.get('registrationId');

  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (timeLeft > 0 && !success) {
      timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [timeLeft, success]);

  const handleResendCode = async () => {
    setError(null);
    setTimeLeft(60);
    // In a real app, this would call an API to resend the code
    // For now, we'll just simulate success
    alert('Verification code has been resent. Please check your email.');
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!verificationCode.trim()) {
      setError('Please enter the verification code');
      return;
    }

    setIsVerifying(true);
    setError(null);

    try {
      // Call the verification API
      const response = await fetch(`/api/registration?email=${encodeURIComponent(email || '')}&code=${verificationCode}`, {
        method: 'GET',
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Verification failed');
      }

      setSuccess(true);

      // Redirect to login page after a delay
      setTimeout(() => {
        router.push('/login?verified=true');
      }, 2000);
    } catch (error) {
      console.error('Verification error:', error);
      setError(error instanceof Error ? error.message : 'An error occurred during verification');
    } finally {
      setIsVerifying(false);
    }
  };

  if (!email) {
    return (
      <div className="mx-auto max-w-md px-4 py-12 text-center sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold">Verification Error</h2>
        <p className="mt-4 text-gray-600">
          Missing email address. Please return to the registration page and try again.
        </p>
        <div className="mt-6">
          <Link href="/registration" className="text-blue-600 hover:text-blue-800">
            Go back to registration
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12 sm:px-6 lg:px-8">
      <div className="rounded-lg bg-white p-8 shadow">
        {success ? (
          <div className="text-center">
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
            <h2 className="mt-4 text-2xl font-semibold">Email Verified!</h2>
            <p className="mt-2 text-gray-600">
              Your email has been successfully verified. Redirecting you to login...
            </p>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-bold">Verify Your Email</h2>
            <p className="mt-2 text-gray-600">
              We've sent a verification code to{' '}
              <span className="font-medium text-gray-900">{email}</span>. Please
              enter the code below to verify your email address.
            </p>

            {error && (
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
            )}

            <form onSubmit={handleVerify} className="mt-6">
              <label
                htmlFor="verificationCode"
                className="block text-sm font-medium text-gray-700"
              >
                Verification Code
              </label>
              <input
                type="text"
                id="verificationCode"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                placeholder="Enter code"
              />

              <button
                type="submit"
                disabled={isVerifying}
                className="mt-4 flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-300"
              >
                {isVerifying ? 'Verifying...' : 'Verify Email'}
              </button>
            </form>

            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                Didn't receive the code?{' '}
                {timeLeft > 0 ? (
                  <span className="text-gray-500">
                    Resend code in {timeLeft} seconds
                  </span>
                ) : (
                  <button
                    onClick={handleResendCode}
                    className="font-medium text-blue-600 hover:text-blue-500"
                  >
                    Resend code
                  </button>
                )}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Main page component with suspense boundary
export default function VerifyPage() {
  return (
    <Suspense fallback={<VerifyLoading />}>
      <VerifyContent />
    </Suspense>
  );
}
