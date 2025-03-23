'use client';

import { GsbSubscription, GsbSubscriptionPlan, PaymentType, SubscriptionPlanStatus } from '@/types/gsb-subscription';

/**
 * Subscription service that handles all Paddle integration and subscription management
 */
export class SubscriptionService {
  private static instance: SubscriptionService;
  private paddleApiKey: string;
  private paddleWebhookSecret: string;
  private paddleClientToken: string;
  private paddleEnvironment: 'sandbox' | 'production';

  private constructor() {
    // Initialize with environment variables
    this.paddleApiKey = process.env.PADDLE_API_KEY || '';
    this.paddleWebhookSecret = process.env.PADDLE_WEBHOOK_SECRET || '';
    this.paddleClientToken = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN || '';
    this.paddleEnvironment = (process.env.NEXT_PUBLIC_PADDLE_ENV as 'sandbox' | 'production') || 'sandbox';

    if (!this.paddleApiKey || !this.paddleWebhookSecret || !this.paddleClientToken) {
      console.warn('Paddle configuration is incomplete. Some features may not work correctly.');
    }
  }

  public static getInstance(): SubscriptionService {
    if (!SubscriptionService.instance) {
      SubscriptionService.instance = new SubscriptionService();
    }
    return SubscriptionService.instance;
  }

  /**
   * Create a new subscription plan
   */
  public async createSubscriptionPlan(
    userId: string,
    tenantId: string,
    title: string,
    paymentType: PaymentType = PaymentType.CreditCardOnline,
    status: SubscriptionPlanStatus = SubscriptionPlanStatus.Active
  ): Promise<GsbSubscriptionPlan> {
    // In a real implementation, you would call Paddle API to create a new plan
    // For now, we'll create a mock plan that would be saved to GSB
    const plan: Partial<GsbSubscriptionPlan> = {
      title,
      tenant_id: tenantId,
      createdBy_id: userId,
      lastUpdatedBy_id: userId,
      paymentType,
      status,
      nextPaymentDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    };

    // This would be replaced with an actual API call
    console.log('Creating subscription plan:', plan);
    return plan as GsbSubscriptionPlan;
  }

  /**
   * Create a new subscription
   */
  public async createSubscription(
    userId: string,
    planId: string,
    productVariantId: string,
    quantity: number = 1
  ): Promise<GsbSubscription> {
    // In a real implementation, you would call Paddle API to create a new subscription
    // For now, we'll create a mock subscription that would be saved to GSB
    const subscription: Partial<GsbSubscription> = {
      plan_id: planId,
      productVariant_id: productVariantId,
      createdBy_id: userId,
      lastUpdatedBy_id: userId,
      quantity,
      active: true,
      startDate: new Date(),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
    };

    // This would be replaced with an actual API call
    console.log('Creating subscription:', subscription);
    return subscription as GsbSubscription;
  }

  /**
   * Process a Paddle webhook event
   */
  public async processWebhookEvent(
    event: any,
    signature: string
  ): Promise<boolean> {
    try {
      // Verify the webhook signature - in a real implementation
      // you would use a library like crypto to verify the HMAC signature
      console.log('Processing webhook event:', event);

      // Depending on the event type, update subscription information
      switch (event.event_type) {
        case 'subscription_created':
          await this.handleSubscriptionCreated(event);
          break;
        case 'subscription_updated':
          await this.handleSubscriptionUpdated(event);
          break;
        case 'subscription_cancelled':
          await this.handleSubscriptionCancelled(event);
          break;
        case 'payment_succeeded':
          await this.handlePaymentSucceeded(event);
          break;
        case 'payment_failed':
          await this.handlePaymentFailed(event);
          break;
        default:
          console.log(`Unhandled webhook event type: ${event.event_type}`);
      }

      return true;
    } catch (error) {
      console.error('Error processing webhook event:', error);
      return false;
    }
  }

  private async handleSubscriptionCreated(event: any): Promise<void> {
    // Logic to handle subscription created event
    console.log('Subscription created:', event);
  }

  private async handleSubscriptionUpdated(event: any): Promise<void> {
    // Logic to handle subscription updated event
    console.log('Subscription updated:', event);
  }

  private async handleSubscriptionCancelled(event: any): Promise<void> {
    // Logic to handle subscription cancelled event
    console.log('Subscription cancelled:', event);
  }

  private async handlePaymentSucceeded(event: any): Promise<void> {
    // Logic to handle payment succeeded event
    console.log('Payment succeeded:', event);
  }

  private async handlePaymentFailed(event: any): Promise<void> {
    // Logic to handle payment failed event
    console.log('Payment failed:', event);
  }

  /**
   * Get Paddle client configuration
   */
  public getPaddleConfig() {
    return {
      environment: this.paddleEnvironment,
      token: this.paddleClientToken,
    };
  }
}
