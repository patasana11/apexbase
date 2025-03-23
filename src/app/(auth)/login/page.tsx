"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Icons } from "@/components/icons";
import { useNavigation } from '@/components/navigation-context';
import { ClientNavigationLink } from '@/components/client-navigation-link';
import { useAuth } from '@/components/auth-context';

export default function LoginPage() {
  const router = useRouter();
  const { status, login } = useAuth();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams?.get("callbackUrl") || "/dashboard";
  const { startNavigation, completeNavigation } = useNavigation();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: 'admin@apexbase.dev',
    password: 'password123',
    remember: true,
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (status === 'authenticated') {
      console.log('LoginPage: User already authenticated, redirecting to dashboard');
      startNavigation();
      router.push('/dashboard');
    } else if (status !== 'loading') {
      // If we're not authenticated and not loading, we can complete any in-progress navigation
      completeNavigation();
    }
  }, [status, router, startNavigation, completeNavigation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    startNavigation(); // Start progress indicator for login

    try {
      console.log('Starting login process...');

      const success = await login(
        formData.email,
        formData.password,
        formData.remember
      );

      if (success) {
        console.log('Login successful, redirecting to dashboard using client-side navigation');
        // Use client-side navigation
        router.push(callbackUrl);
      } else {
        throw new Error('Authentication failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(error instanceof Error ? error.message : 'Login failed');
      completeNavigation(); // Complete navigation (failure case)
    } finally {
      setIsLoading(false);
    }
  };

  // Deprecated - social login will be implemented differently without NextAuth
  const handleSocialLogin = async (provider: string) => {
    setError(`Social login with ${provider} is not available right now. Please use email and password.`);
  };

  // If auth state is loading, show loading indicator
  if (status === 'loading') {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center p-10">
          <Icons.spinner className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Welcome Back</CardTitle>
        <CardDescription>
          Sign in to your account to continue
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              disabled={isLoading}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                checked={formData.remember}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, remember: checked === true })
                }
                disabled={isLoading}
              />
              <Label htmlFor="remember" className="text-sm">Remember me</Label>
            </div>
            <Button
              variant="link"
              className="px-0 font-normal"
              disabled={isLoading}
              onClick={() => {
                startNavigation();
                router.push('/forgot-password');
              }}
            >
              Forgot password?
            </Button>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
            Sign In
          </Button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button
              variant="outline"
              onClick={() => handleSocialLogin('google')}
              disabled={isLoading || true} // Disabled until implemented
              type="button"
            >
              <Icons.google className="mr-2 h-4 w-4" />
              Google
            </Button>
            <Button
              variant="outline"
              onClick={() => handleSocialLogin('github')}
              disabled={isLoading || true} // Disabled until implemented
              type="button"
            >
              <Icons.gitHub className="mr-2 h-4 w-4" />
              GitHub
            </Button>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-muted-foreground">
          Don't have an account?{" "}
          <ClientNavigationLink
            href="/register"
            className="text-primary underline-offset-4 hover:underline"
            onClick={() => startNavigation()}
          >
            Register
          </ClientNavigationLink>
        </p>
      </CardFooter>
    </Card>
  );
}
