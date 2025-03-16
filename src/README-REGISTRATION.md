# ApexBase Registration System

This directory contains the implementation of the registration system for ApexBase, including social login integration and Paddle payment processing for subscription plans.

## Overview

The registration system allows users to:

1. Register with email and password
2. Register using social login (Google, GitHub, Facebook)
3. Choose subscription plans (Free, Basic, Premium)
4. Process payments through Paddle
5. Verify email addresses
6. Upgrade/downgrade subscription plans

## Architecture

The implementation follows a service-based architecture:

- **Front-end Components**: Registration forms, verification pages, and subscription plan selection
- **API Routes**: Endpoints for registration, verification, social login, and webhooks
- **Services**: Backend logic for registration, subscription management, and payment processing
- **Models**: Data structures for users, subscriptions, and payments

## Key Components

### Services

- `RegistrationService`: Handles user registration, email verification, and social login
- `SubscriptionService`: Manages subscription plans, payments, and Paddle integration
- `PaddleClientService`: Client-side hook for Paddle integration

### API Routes

- `/api/registration`: Handles registration requests and email verification
- `/api/auth/google`, `/api/auth/github`, `/api/auth/facebook`: Social login endpoints
- `/api/webhook/paddle`: Webhook endpoint for Paddle events

### Pages

- `/registration`: Main registration page with subscription selection
- `/registration/verify`: Email verification page
- `/checkout/success`: Success page for Paddle checkout

## Paddle Integration

### Configuration

To use Paddle, the following environment variables need to be set:

```
PADDLE_API_KEY=your_paddle_api_key
PADDLE_WEBHOOK_SECRET=your_paddle_webhook_secret
NEXT_PUBLIC_PADDLE_CLIENT_TOKEN=your_paddle_client_token
NEXT_PUBLIC_PADDLE_ENV=sandbox|production
```

### Client-Side Integration

The `usePaddleClient` hook provides a simple way to interact with Paddle's client-side JavaScript API:

```typescript
import { usePaddleClient } from '@/lib/services/paddle-client.service';

function CheckoutButton() {
  const { isLoaded, openCheckout } = usePaddleClient();

  const handleCheckout = async () => {
    await openCheckout({
      items: [{ priceId: 'pri_your_price_id', quantity: 1 }],
      customer: { email: 'user@example.com' },
      successUrl: '/checkout/success'
    });
  };

  return (
    <button onClick={handleCheckout} disabled={!isLoaded}>
      Checkout
    </button>
  );
}
```

### Webhook Handling

Paddle webhooks are processed through the `/api/webhook/paddle` endpoint. The `SubscriptionService` handles webhook events like subscription creation, updates, cancellations, and payments.

## Subscription Plans

The system supports multiple subscription tiers:

1. **Free Tier**: Basic access with limited features
2. **Basic Plan**: For individuals and small teams
3. **Premium Plan**: For growing businesses with advanced needs
4. **Enterprise Plan**: Custom solutions for large organizations (requires contact)

## Social Login

Social login is implemented using OAuth flows for:

- Google
- GitHub
- Facebook

## Implementation Notes

This implementation is designed as a proof of concept. In a production environment, it would be necessary to:

1. Implement proper error handling and logging
2. Add comprehensive testing
3. Add additional security measures
4. Configure proper webhook verification
5. Implement database persistence
6. Handle subscription cancellations and upgrades properly

## Moving to Production

Before moving to production:

1. Create and configure a Paddle account
2. Set up webhook URLs in Paddle dashboard
3. Create pricing plans in Paddle
4. Update price IDs in the codebase
5. Configure social login credentials
6. Set proper environment variables
7. Test the complete flow in sandbox mode
8. Verify webhook handling

## References

- [Paddle Documentation](https://developer.paddle.com/)
- [Paddle Webhook Reference](https://developer.paddle.com/webhooks/overview)
- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [GitHub OAuth Documentation](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps)
- [Facebook Login Documentation](https://developers.facebook.com/docs/facebook-login/)
