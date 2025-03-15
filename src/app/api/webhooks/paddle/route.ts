import { NextRequest, NextResponse } from 'next/server';
import { PaddleWebhookEvent, PaddleWebhookPayload } from '@/lib/services/paddle.service';

/**
 * Paddle webhooks handler
 *
 * This endpoint receives webhook events from Paddle for subscription
 * and payment processing events.
 */
export async function POST(request: NextRequest) {
  // In production, verify the webhook signature
  // const signature = request.headers.get('paddle-signature');
  // if (!signature || !paddleService.verifyWebhookSignature(body, signature)) {
  //   return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  // }

  try {
    const body = await request.json() as PaddleWebhookPayload;

    // Process the webhook based on the event type
    switch (body.alert_name) {
      case 'subscription_created':
        await handleSubscriptionCreated(body);
        break;

      case 'subscription_updated':
        await handleSubscriptionUpdated(body);
        break;

      case 'subscription_cancelled':
        await handleSubscriptionCancelled(body);
        break;

      case 'subscription_payment_succeeded':
        await handlePaymentSucceeded(body);
        break;

      case 'subscription_payment_failed':
        await handlePaymentFailed(body);
        break;

      case 'subscription_payment_refunded':
        await handlePaymentRefunded(body);
        break;

      default:
        console.log(`Unhandled webhook event: ${body.alert_name}`);
    }

    // Return a 200 response to acknowledge receipt
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * Handle subscription creation
 */
async function handleSubscriptionCreated(payload: PaddleWebhookPayload) {
  console.log('Subscription created:', payload);

  // Extract customer data from passthrough
  let customerData = {};
  try {
    if (payload.passthrough) {
      customerData = JSON.parse(payload.passthrough);
    }
  } catch (error) {
    console.error('Error parsing passthrough data:', error);
  }

  // In production, you would:
  // 1. Update user's subscription status in your database
  // 2. Provide access to premium features
  // 3. Send a welcome email to the customer

  // For this example, we'll just log the subscription ID
  console.log('New subscription ID:', payload.subscription_id);
}

/**
 * Handle subscription update
 */
async function handleSubscriptionUpdated(payload: PaddleWebhookPayload) {
  console.log('Subscription updated:', payload);

  // In production, you would update the subscription details in your database
  console.log('Updated subscription ID:', payload.subscription_id);
}

/**
 * Handle subscription cancellation
 */
async function handleSubscriptionCancelled(payload: PaddleWebhookPayload) {
  console.log('Subscription cancelled:', payload);

  // In production, you would:
  // 1. Update the subscription status in your database
  // 2. Downgrade access at the end of the billing period
  // 3. Send a cancellation email

  console.log('Cancelled subscription ID:', payload.subscription_id);
}

/**
 * Handle successful payment
 */
async function handlePaymentSucceeded(payload: PaddleWebhookPayload) {
  console.log('Payment succeeded:', payload);

  // In production, you would:
  // 1. Record the payment in your database
  // 2. Update the subscription status
  // 3. Send a receipt to the customer

  console.log('Payment ID:', payload.payment_id);
}

/**
 * Handle failed payment
 */
async function handlePaymentFailed(payload: PaddleWebhookPayload) {
  console.log('Payment failed:', payload);

  // In production, you would:
  // 1. Record the failed payment
  // 2. Notify the customer
  // 3. Potentially limit service access

  console.log('Failed payment for subscription:', payload.subscription_id);
}

/**
 * Handle refunded payment
 */
async function handlePaymentRefunded(payload: PaddleWebhookPayload) {
  console.log('Payment refunded:', payload);

  // In production, you would:
  // 1. Record the refund
  // 2. Update subscription status if necessary
  // 3. Notify internal team

  console.log('Refunded payment ID:', payload.payment_id);
}
