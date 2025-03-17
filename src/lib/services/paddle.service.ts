'use client';

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  priceId?: string;
  priceDisplay: string;
  interval?: string;
  features: string[];
  isPopular?: boolean;
}

class PaddleService {
  private isInitialized = false;
  private paddleInstance: any = null;

  async initialize() {
    if (this.isInitialized || typeof window === 'undefined') {
      return;
    }

    try {
      const paddleModule = await import('@paddle/paddle-js');
      const paddleEnv = process.env.NEXT_PUBLIC_PADDLE_ENV || 'sandbox';
      const paddleClientToken = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN || 'your-paddle-client-token';

      this.paddleInstance = await paddleModule.initializePaddle({
        environment: paddleEnv as 'sandbox' | 'production',
        token: paddleClientToken,
      });

      this.isInitialized = true;
      console.log('Paddle.js initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Paddle.js:', error);
    }
  }

  async checkout(options: {
    product: string;
    customerEmail?: string;
    customerName?: string;
    title?: string;
    successUrl?: string;
    closeUrl?: string;
    passthrough?: string;
  }) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (!this.paddleInstance) {
      throw new Error('Paddle is not initialized');
    }

    try {
      const plan = this.getPlanById(options.product);
      if (!plan || !plan.priceId) {
        throw new Error(`Invalid plan or missing priceId: ${options.product}`);
      }

      // Configure the checkout
      const checkoutData = {
        items: [
          {
            priceId: plan.priceId,
            quantity: 1
          }
        ],
        customer: options.customerEmail ? {
          email: options.customerEmail,
          name: options.customerName
        } : undefined,
        customData: options.passthrough ?
          JSON.parse(options.passthrough) : undefined,
        successUrl: options.successUrl,
        title: options.title,
        theme: 'light' as 'light' | 'dark'
      };

      console.log('Opening Paddle checkout:', checkoutData);
      return await this.paddleInstance.Checkout.open(checkoutData);
    } catch (error) {
      console.error('Failed to open Paddle checkout:', error);
      throw error;
    }
  }

  getPlanById(planId: string): SubscriptionPlan | undefined {
    return DEFAULT_PLANS.find(plan => plan.id === planId);
  }

  // Used by the initiateGitHubSignIn function in the social auth service
  initiateGitHubSignIn() {
    window.location.href = '/api/auth/github';
  }

  // Used to render the Google button
  renderGoogleButton(elementId: string) {
    if (typeof window === 'undefined') return;
    console.log(`Rendering Google button in element: ${elementId}`);
    // In a real implementation, this would use Google's Sign-In API
    const element = document.getElementById(elementId);
    if (element) {
      element.innerHTML = `
        <button class="flex w-full justify-center items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50">
          <svg viewBox="0 0 24 24" width="16" height="16" xmlns="http://www.w3.org/2000/svg">
            <g transform="matrix(1, 0, 0, 1, 0, 0)">
              <path d="M21.35,11.1H12.18V13.83H18.69C18.36,17.64 15.19,19.27 12.19,19.27C8.36,19.27 5,16.25 5,12C5,7.9 8.2,4.73 12.2,4.73C15.29,4.73 17.1,6.7 17.1,6.7L19,4.72C19,4.72 16.56,2 12.1,2C6.42,2 2.03,6.8 2.03,12C2.03,17.05 6.16,22 12.25,22C17.6,22 21.5,18.33 21.5,12.91C21.5,11.76 21.35,11.1 21.35,11.1V11.1Z" fill="#4285F4"/>
            </g>
          </svg>
          Sign in with Google
        </button>
      `;
    }
  }
}

export const DEFAULT_PLANS: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Free',
    description: 'For individuals getting started',
    priceDisplay: '$0',
    features: [
      '1 user',
      '3 projects',
      '1GB storage',
      'Community support',
      'Basic analytics',
    ],
  },
  {
    id: 'basic',
    name: 'Basic',
    description: 'For small teams and professionals',
    priceId: 'pri_basic_monthly',
    priceDisplay: '$9.99',
    interval: 'month',
    features: [
      'Up to 5 users',
      '10 projects',
      '10GB storage',
      'Email support',
      'Advanced analytics',
      'API access',
    ],
    isPopular: true,
  },
  {
    id: 'premium',
    name: 'Premium',
    description: 'For growing teams with advanced needs',
    priceId: 'pri_premium_monthly',
    priceDisplay: '$29.99',
    interval: 'month',
    features: [
      'Unlimited users',
      'Unlimited projects',
      '100GB storage',
      'Priority support',
      'Premium analytics',
      'Advanced API access',
      'SSO and team management',
      'Custom integrations',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'Custom solution for large organizations',
    priceDisplay: 'Custom',
    features: [
      'Unlimited users',
      'Unlimited projects',
      'Unlimited storage',
      'Dedicated support',
      'Custom SLAs',
      'Custom contract',
      'On-premises option',
      'Advanced security features',
    ],
  },
];

export const paddleService = new PaddleService();
