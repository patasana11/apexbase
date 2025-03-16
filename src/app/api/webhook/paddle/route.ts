import { NextRequest, NextResponse } from 'next/server';
import { SubscriptionService } from '@/lib/services/subscription.service';

export const POST = async (req: NextRequest) => {
  // Get the raw body of the request
  const rawBody = await req.text();

  // Get the signature from the headers
  const signature = req.headers.get('Paddle-Signature') || '';

  if (!signature) {
    console.error('Missing Paddle-Signature header');
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  try {
    // Parse the webhook payload
    const event = JSON.parse(rawBody);
    console.log('Received Paddle webhook event:', event.data?.type || 'unknown');

    // Process the webhook with the subscription service
    const subscriptionService = SubscriptionService.getInstance();
    const result = await subscriptionService.processWebhookEvent(event, signature);

    if (result) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: 'Failed to process webhook' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
};

// Disable NextJS default body parsing because we need the raw body for signature verification
export const config = {
  api: {
    bodyParser: false,
  },
};
