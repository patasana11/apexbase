'use client';

import { useState } from 'react';
import { AuthService } from '@/lib/gsb/services/auth/auth.service';

export enum SocialProvider {
  Google = 'google',
  Github = 'github',
  Facebook = 'facebook',
  Apple = 'apple'
}

interface SocialLoginButtonsProps {
  onLogin?: (provider: SocialProvider, token: string) => void;
  isSignUp?: boolean;
  tenantCode?: string;
  remember?: boolean;
}

export default function SocialLoginButtons({
  onLogin,
  isSignUp = false,
  tenantCode = process.env.NEXT_PUBLIC_DEFAULT_TENANT_CODE || 'dev1',
  remember = false
}: SocialLoginButtonsProps) {
  const [isLoading, setIsLoading] = useState<SocialProvider | null>(null);
  const authService = AuthService.getInstance();

  const handleSocialAuth = async (provider: SocialProvider, token: string) => {
    if (onLogin) {
      onLogin(provider, token);
    } else {
      try {
        // Handle the social login directly if no callback is provided
        const loginData: any = {
          email: '', // This would typically come from the social provider
          tenantCode,
          remember
        };

        // Add the appropriate token based on the provider
        switch (provider) {
          case SocialProvider.Google:
            loginData.googleToken = token;
            break;
          case SocialProvider.Facebook:
            loginData.facebookToken = token;
            break;
          case SocialProvider.Apple:
            loginData.appleToken = token;
            break;
          default:
            // For other providers like GitHub, we might need a different approach
            break;
        }

        const response = await authService.login(loginData);

        if (!response.success) {
          throw new Error(response.error || 'Social authentication failed');
        }

        // Redirect or handle successful login
        window.location.href = '/dashboard';
      } catch (error) {
        console.error(`${provider} login error:`, error);
      }
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(SocialProvider.Google);
    try {
      // In a real implementation, this would open a popup window
      // or redirect to Google for OAuth authentication
      window.location.href = '/api/auth/google';
    } catch (error) {
      console.error('Google login error:', error);
      setIsLoading(null);
    }
  };

  const handleGithubLogin = async () => {
    setIsLoading(SocialProvider.Github);
    try {
      // In a real implementation, this would open a popup window
      // or redirect to GitHub for OAuth authentication
      window.location.href = '/api/auth/github';
    } catch (error) {
      console.error('GitHub login error:', error);
      setIsLoading(null);
    }
  };

  const handleFacebookLogin = async () => {
    setIsLoading(SocialProvider.Facebook);
    try {
      // In a real implementation, this would open a popup window
      // or redirect to Facebook for OAuth authentication
      window.location.href = '/api/auth/facebook';
    } catch (error) {
      console.error('Facebook login error:', error);
      setIsLoading(null);
    }
  };

  return (
    <div className="space-y-3">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-white px-2 text-gray-500">
            {isSignUp ? 'Or sign up with' : 'Or sign in with'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <button
          onClick={handleGoogleLogin}
          disabled={isLoading !== null}
          className="inline-flex w-full items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          {isLoading === SocialProvider.Google ? (
            <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></span>
          ) : (
            <svg
              className="mr-2 h-5 w-5"
              aria-hidden="true"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M20.283 10.356h-8.327v3.451h4.792c-.446 2.193-2.313 3.453-4.792 3.453a5.27 5.27 0 0 1-5.279-5.28 5.27 5.27 0 0 1 5.279-5.279c1.259 0 2.397.447 3.29 1.178l2.6-2.599c-1.584-1.381-3.615-2.233-5.89-2.233a8.908 8.908 0 0 0-8.934 8.934 8.907 8.907 0 0 0 8.934 8.934c4.467 0 8.529-3.249 8.529-8.934 0-.528-.081-1.097-.202-1.625z"
              />
            </svg>
          )}
          Google
        </button>

        <button
          onClick={handleGithubLogin}
          disabled={isLoading !== null}
          className="inline-flex w-full items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          {isLoading === SocialProvider.Github ? (
            <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></span>
          ) : (
            <svg
              className="mr-2 h-5 w-5"
              aria-hidden="true"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                fillRule="evenodd"
                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                clipRule="evenodd"
              />
            </svg>
          )}
          GitHub
        </button>

        <button
          onClick={handleFacebookLogin}
          disabled={isLoading !== null}
          className="inline-flex w-full items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          {isLoading === SocialProvider.Facebook ? (
            <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></span>
          ) : (
            <svg
              className="mr-2 h-5 w-5"
              aria-hidden="true"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                fillRule="evenodd"
                d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                clipRule="evenodd"
              />
            </svg>
          )}
          Facebook
        </button>
      </div>
    </div>
  );
}
