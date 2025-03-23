"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { FiGithub, FiUser, FiLock, FiMail, FiAlertCircle } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PlanSelector } from "@/components/plan-selector";
import { DEFAULT_PLANS, paddleService } from '@/lib/gsb/services/subscription/paddle.service';
import { AuthService } from '@/lib/gsb/services/auth/auth.service';

// Registration form schema with validation
const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      "Password must include uppercase, lowercase, number and special character"
    ),
  termsAndConditions: z.boolean().refine(value => value === true, {
    message: "You must agree to the terms and conditions",
  }),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("account");
  const [selectedPlan, setSelectedPlan] = useState<string>(DEFAULT_PLANS[0].id);
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly');

  // Get plan from URL if present
  useEffect(() => {
    const planId = searchParams.get('plan');
    if (planId) {
      const plan = DEFAULT_PLANS.find(p => p.id === planId);
      if (plan) {
        setSelectedPlan(plan.id);
      }
    }
  }, [searchParams]);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      termsAndConditions: false,
    },
  });

  // Handle regular form submission
  async function onSubmit(values: RegisterFormValues) {
    setIsLoading(true);
    setError(null);

    try {
      const authService = AuthService.getInstance();

      // First, register with GSB
      // Note: We need to implement a register method in AuthService
      // For now, we'll use a direct API call
      const response = await fetch(`${process.env.NEXT_PUBLIC_GSB_API_URL || 'https://common.gsbapps.net'}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: values.email,
          password: values.password,
          name: values.name,
          planId: selectedPlan,
        }),
      });

      const registrationResult = await response.json();

      if (!registrationResult.success) {
        throw new Error(registrationResult.message || 'Registration failed');
      }

      // Sign in with NextAuth
      const signInResult = await signIn('credentials', {
        email: values.email,
        password: values.password,
        redirect: false,
      });

      if (signInResult?.error) {
        throw new Error(signInResult.error);
      }

      // Handle plan selection and payment
      if (selectedPlan !== DEFAULT_PLANS[0].id) {
        // Open Paddle checkout for paid plans
        await paddleService.checkout({
          product: selectedPlan,
          customerEmail: values.email,
          customerName: values.name,
          title: "ApexBase Subscription",
          successUrl: `${window.location.origin}/dashboard`,
          closeUrl: `${window.location.origin}/register`,
          passthrough: JSON.stringify({
            email: values.email,
            userId: registrationResult.userId
          })
        });
      } else {
        // For free plan, go directly to dashboard
        router.push("/dashboard");
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError(error instanceof Error ? error.message : 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  }

  const handleSocialSignIn = async (provider: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn(provider, {
        redirect: false,
        callbackUrl: `/dashboard?plan=${selectedPlan}`,
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      if (result?.url) {
        router.push(result.url);
      }
    } catch (error) {
      console.error('Social sign-in error:', error);
      setError(error instanceof Error ? error.message : 'Social sign-in failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Create an Account</CardTitle>
        <CardDescription>
          Get started with ApexBase by creating your account
        </CardDescription>
      </CardHeader>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="plan">Select Plan</TabsTrigger>
        </TabsList>
        <TabsContent value="account">
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <FiAlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          disabled={isLoading}
                          placeholder="Enter your name"
                          type="text"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          disabled={isLoading}
                          placeholder="Enter your email"
                          type="email"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          disabled={isLoading}
                          placeholder="Create a password"
                          type="password"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="termsAndConditions"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          I agree to the{" "}
                          <a
                            href="/terms"
                            className="text-primary hover:underline"
                          >
                            terms and conditions
                          </a>
                        </FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? "Creating account..." : "Create account"}
                </Button>
              </form>
            </Form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-card px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                onClick={() => handleSocialSignIn('google')}
                disabled={isLoading}
              >
                <FcGoogle className="mr-2 h-4 w-4" />
                Google
              </Button>
              <Button
                variant="outline"
                onClick={() => handleSocialSignIn('github')}
                disabled={isLoading}
              >
                <FiGithub className="mr-2 h-4 w-4" />
                GitHub
              </Button>
            </div>
          </CardContent>
        </TabsContent>
        <TabsContent value="plan">
          <CardContent>
            <PlanSelector
              plans={[
                {
                  id: 'starter',
                  name: 'Starter',
                  description: 'Essential features for small projects',
                  priceDisplay: '$9',
                  interval: 'month',
                  features: [
                    '5 projects',
                    '10GB storage',
                    'Basic analytics',
                    'Email support',
                  ],
                  isPopular: false
                },
                {
                  id: 'pro',
                  name: 'Professional',
                  description: 'Everything you need for growing businesses',
                  priceDisplay: '$29',
                  interval: 'month',
                  features: [
                    'Unlimited projects',
                    '100GB storage',
                    'Advanced analytics',
                    'Priority support',
                    'Team collaboration',
                  ],
                  isPopular: true
                },
                {
                  id: 'enterprise',
                  name: 'Enterprise',
                  description: 'Advanced features for larger organizations',
                  priceDisplay: '$79',
                  interval: 'month',
                  features: [
                    'Unlimited projects',
                    'Unlimited storage',
                    'Custom reporting',
                    'Dedicated support',
                    'SSO & advanced security',
                    'Custom integrations',
                  ],
                  isPopular: false
                }
              ]}
              selectedPlan={selectedPlan}
              onPlanSelect={setSelectedPlan}
              billing={billing}
              onBillingChange={setBilling}
            />
          </CardContent>
        </TabsContent>
      </Tabs>
      <CardFooter className="flex justify-center border-t p-4">
        <div className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <a href="/login" className="text-primary hover:underline">
            Sign in
          </a>
        </div>
      </CardFooter>
    </Card>
  );
}
