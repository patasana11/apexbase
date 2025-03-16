'use client';

import { useEffect, useState } from 'react';

export type PaddleCheckoutSettings = {
  items: Array<{
    priceId: string;
    quantity?: number;
  }>;
  customer?: {
    email?: string;
    id?: string;
  };
  customData?: Record<string, any>;
  successUrl?: string;
  theme?: 'dark' | 'light';
};

/**
 * Paddle client-side integration hook
 */
export function usePaddleClient() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [paddle, setPaddle] = useState<any>(null);

  useEffect(() => {
    // Load Paddle.js
    const loadPaddle = async () => {
      if (!window.Paddle && !document.querySelector('script[src*="paddle.js"]')) {
        // Get Paddle config
        const paddleEnv = process.env.NEXT_PUBLIC_PADDLE_ENV || 'sandbox';
        const paddleClientToken = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;

        if (!paddleClientToken) {
          console.error('Paddle client token is not set. Checkout will not work.');
          return;
        }

        try {
          // Dynamically import Paddle.js
          const Paddle = await import('@paddle/paddle-js');

          // Initialize Paddle.js
          const instance = await Paddle.initializePaddle({
            environment: paddleEnv as 'sandbox' | 'production',
            token: paddleClientToken,
          });

          console.log('Paddle.js loaded successfully');
          setPaddle(instance);
          setIsLoaded(true);
        } catch (error) {
          console.error('Failed to load Paddle.js:', error);
        }
      } else if (window.Paddle) {
        console.log('Paddle.js already loaded');
        setPaddle(window.Paddle);
        setIsLoaded(true);
      }
    };

    loadPaddle();
  }, []);

  /**
   * Open the Paddle checkout
   */
  const openCheckout = async (settings: PaddleCheckoutSettings) => {
    if (!isLoaded || !paddle) {
      console.error('Paddle.js is not loaded yet');
      return;
    }

    try {
      console.log('Opening Paddle checkout with settings:', settings);
      const checkout = await paddle.Checkout.open(settings);

      return checkout;
    } catch (error) {
      console.error('Failed to open Paddle checkout:', error);
      throw error;
    }
  };

  /**
   * Get localized prices for a specific price ID
   */
  const getLocalizedPrice = async (priceId: string) => {
    if (!isLoaded || !paddle) {
      console.error('Paddle.js is not loaded yet');
      return null;
    }

    try {
      const price = await paddle.PricePreview.get([{ priceId }]);
      return price[0];
    } catch (error) {
      console.error(`Failed to get localized price for price ID ${priceId}:`, error);
      return null;
    }
  };

  return {
    isLoaded,
    paddle,
    openCheckout,
    getLocalizedPrice,
  };
}

// Add Paddle to the Window interface
declare global {
  interface Window {
    Paddle?: any;
  }
}
