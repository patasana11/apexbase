import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import TokenDisplay from './token-display';

/**
 * Test GSB Integration Page
 *
 * This page is for testing GSB API integration and token management.
 */
export default function TestGsbPage() {
  return (
    <div className="container mx-auto py-10 space-y-8">
      <h1 className="text-3xl font-bold mb-6">GSB Integration Test</h1>

      <TokenDisplay />

      <Card>
        <CardHeader>
          <CardTitle>GSB Token Management</CardTitle>
          <CardDescription>
            This page demonstrates the GSB token handling in the application
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <h3 className="text-lg font-medium">Multi-Tenant Token System</h3>
          <p>
            The application uses two types of tokens based on the URL path:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Common Token:</strong> Used for authentication and account operations (URL paths: /api/auth, /login, /register, /account)</li>
            <li><strong>User Token:</strong> Used for all other operations (dashboard, entity operations, etc.)</li>
          </ul>

          <h3 className="text-lg font-medium mt-6">How It Works</h3>
          <p>
            When a user logs in, they receive two tokens if they have access to a tenant:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>The common token provides access to the common tenant (common.gsbapps.net)</li>
            <li>The user tenant token provides access to the user's specific tenant (e.g., apexbase.gsbapps.net)</li>
          </ul>

          <p className="mt-4">
            The <code>getGsbToken()</code> function automatically selects the appropriate token based on the URL path context.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
