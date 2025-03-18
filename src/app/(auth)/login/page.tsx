"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Icons } from "@/components/icons";
import { AuthService } from '@/lib/gsb/services/auth/auth.service';

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: 'admin@apexbase.dev',
    password: 'password123',
    remember: true,
    tenantCode: process.env.NEXT_PUBLIC_DEFAULT_TENANT_CODE || 'apexbase',
  });

  const authService = new AuthService();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      console.log('Starting login process with GSB...');
      
      // Skip GSB auth in development if needed
      if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_SKIP_GSB_AUTH === 'true') {
        console.log('Development mode: Skipping GSB authentication');
      } else {
        // Authenticate with GSB
        const authResponse = await authService.login({
          email: formData.email,
          password: formData.password,
          tenantCode: formData.tenantCode,
          remember: formData.remember,
        });

        if (!authResponse.success) {
          throw new Error(authResponse.error || 'Authentication failed');
        }
        
        console.log('GSB authentication successful');
      }

      // Then authenticate with NextAuth
      console.log('Starting NextAuth authentication...');
      const result = await signIn('credentials', {
        redirect: false,
        email: formData.email,
        password: formData.password,
        remember: formData.remember,
      });

      console.log('NextAuth result:', result);

      if (result?.error) {
        throw new Error(result.error);
      }

      if (result?.ok) {
        console.log('Login successful, redirecting to dashboard');
        router.push('/dashboard');
      } else {
        throw new Error('Authentication failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(error instanceof Error ? error.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: string) => {
    setIsLoading(true);
    setError(null);

    try {
      console.log(`Starting ${provider} login...`);
      const result = await signIn(provider, {
        redirect: false,
        callbackUrl: '/dashboard',
      });

      console.log(`${provider} login result:`, result);

      if (result?.error) {
        throw new Error(result.error);
      }

      if (result?.url) {
        console.log(`Redirecting to: ${result.url}`);
        router.push(result.url);
      }
    } catch (error) {
      console.error('Social login error:', error);
      setError(error instanceof Error ? error.message : 'Social login failed');
    } finally {
      setIsLoading(false);
    }
  };

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
            <Link href="/forgot-password">
              <Button variant="link" className="px-0 font-normal" disabled={isLoading}>
                Forgot password?
              </Button>
            </Link>
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
              disabled={isLoading}
              type="button"
            >
              <Icons.google className="mr-2 h-4 w-4" />
              Google
            </Button>
            <Button
              variant="outline"
              onClick={() => handleSocialLogin('github')}
              disabled={isLoading}
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
          <Link href="/register" className="text-primary underline-offset-4 hover:underline">
            Register
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
