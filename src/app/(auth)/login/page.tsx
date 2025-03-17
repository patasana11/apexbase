"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Icons } from "@/components/icons";
import { AuthService } from "@/lib/services/auth.service";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false,
    tenantCode: process.env.NEXT_PUBLIC_DEFAULT_TENANT_CODE || 'dev1',
  });

  const authService = new AuthService();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
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

      // Then, authenticate with NextAuth
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        remember: formData.remember,
        redirect: false,
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      // Redirect to dashboard on success
      router.push('/dashboard');
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
      const result = await signIn(provider, {
        redirect: false,
        callbackUrl: '/dashboard',
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      if (result?.url) {
        router.push(result.url);
      }
    } catch (error) {
      console.error('Social login error:', error);
      setError(error instanceof Error ? error.message : 'Social login failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle social auth callback
  const handleSocialAuthCallback = async (provider: string, token: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Authenticate with GSB using the social token
      const authResponse = await authService.login({
        email: formData.email, // This might be populated from the social provider
        tenantCode: formData.tenantCode,
        remember: formData.remember,
        ...(provider === 'google' && { googleToken: token }),
        ...(provider === 'facebook' && { facebookToken: token }),
        ...(provider === 'apple' && { appleToken: token }),
      });

      if (!authResponse.success) {
        throw new Error(authResponse.error || 'Social authentication failed');
      }

      // Redirect to dashboard on success
      router.push('/dashboard');
    } catch (error) {
      console.error('Social auth callback error:', error);
      setError(error instanceof Error ? error.message : 'Social authentication failed');
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
            <Button variant="link" className="px-0 font-normal" disabled={isLoading}>
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
              disabled={isLoading}
            >
              <Icons.google className="mr-2 h-4 w-4" />
              Google
            </Button>
            <Button
              variant="outline"
              onClick={() => handleSocialLogin('github')}
              disabled={isLoading}
            >
              <Icons.gitHub className="mr-2 h-4 w-4" />
              GitHub
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
