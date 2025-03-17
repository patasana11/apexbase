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
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
          <p className="mt-6 text-lg font-medium text-gray-800">Completing your registration...</p>
          <p className="mt-2 text-sm text-gray-600">Please wait while we set up your account.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <div className="flex-1">
        <div className="mx-auto max-w-screen-xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-extrabold sm:text-4xl">Create Your Account</h1>
            <p className="mt-3 text-lg text-gray-600 max-w-2xl mx-auto">
              Join thousands of developers building amazing products with ApexBase
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-5">
              {/* Social Login Section */}
              <div className="p-8 bg-gradient-to-b from-blue-50 to-indigo-50 md:col-span-2">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Sign Up</h2>
                <SocialLoginButtons isSignUp={true} />

                <div className="mt-10">
                  <h3 className="text-lg font-semibold mb-4">Why Choose ApexBase?</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <svg className="h-5 w-5 text-blue-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-700">Enterprise-grade security</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="h-5 w-5 text-blue-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-700">Scalable infrastructure</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="h-5 w-5 text-blue-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-700">Developer-friendly tools</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="h-5 w-5 text-blue-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-700">24/7 technical support</span>
                    </li>
                  </ul>
                </div>

                <div className="mt-10 pt-6 border-t border-gray-200">
                  <p className="text-sm text-gray-600">
                    Already have an account?{' '}
                    <a href="/login" className="font-medium text-blue-600 hover:text-blue-500">
                      Sign in
                    </a>
                  </p>
                </div>
              </div>

              {/* Registration Form Section */}
              <div className="p-8 md:col-span-3">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Register with Email</h2>
                <RegistrationForm />
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="bg-white border-t border-gray-200 py-6">
        <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} ApexBase. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="/terms" className="text-sm text-gray-500 hover:text-gray-700">Terms of Service</a>
              <a href="/privacy" className="text-sm text-gray-500 hover:text-gray-700">Privacy Policy</a>
              <a href="/contact" className="text-sm text-gray-500 hover:text-gray-700">Contact Us</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
