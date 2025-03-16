'use client';

import RegistrationForm from '@/components/registration/RegistrationForm';
import SocialLoginButtons from '@/components/registration/SocialLoginButtons';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function RegistrationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isRedirected, setIsRedirected] = useState(false);

  // Check if this is a redirect from a social login
  useEffect(() => {
    const provider = searchParams?.get('provider');
    const token = searchParams?.get('token');
    const error = searchParams?.get('error');

    if (error) {
      // Handle error from social login
      console.error('Social login error:', error);
      return;
    }

    if (provider && token) {
      setIsRedirected(true);
      // Handle social login redirect
      // In a real app, this would verify the token with the provider
      // and complete the registration process
      router.push(`/registration/verify?email=${searchParams?.get('email') || ''}`);
    }
  }, [searchParams, router]);

  // If we're in the process of handling a social redirect, show a loading indicator
  if (isRedirected) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
          <p className="mt-4 text-gray-600">Completing your registration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <div className="flex flex-1 flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create an Account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <a href="/login" className="font-medium text-blue-600 hover:text-blue-500">
              sign in to your existing account
            </a>
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <SocialLoginButtons isSignUp={true} />

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-2 text-gray-500">
                    Or register with email
                  </span>
                </div>
              </div>

              <div className="mt-6">
                <RegistrationForm />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
