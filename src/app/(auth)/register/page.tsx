"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
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
import { DEFAULT_PLANS, paddleService } from "@/lib/services/paddle.service";
import { socialAuthService } from "@/lib/services/social-auth.service";

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

    // Initialize Google Sign-In
    socialAuthService.initGoogleSignIn((token) => {
      handleSocialLogin('google', token);
    }).catch(err => {
      console.error('Failed to initialize Google Sign-In:', err);
    });
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
      // For demo, we'll use a simulated API call
      // In production, this would call your actual API endpoint
      await new Promise(resolve => setTimeout(resolve, 1000));

      // After registration, redirect to checkout or dashboard
      if (selectedPlan !== DEFAULT_PLANS[0].id) {
        // Open Paddle checkout for paid plans
        paddleService.checkout({
          product: selectedPlan,
          customerEmail: values.email,
          customerName: values.name,
          title: "ApexBase Subscription",
          successUrl: `${window.location.origin}/dashboard`,
          closeUrl: `${window.location.origin}/register`,
          passthrough: JSON.stringify({ email: values.email })
        });
      } else {
        // For free plan, go directly to dashboard
        router.push("/dashboard");
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError("Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  // Handle social login
  const handleSocialLogin = async (provider: 'google' | 'github', token: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // In a real implementation, we would use the token to authenticate with GSB
      // For demo purposes, we'll just simulate a successful authentication
      await new Promise(resolve => setTimeout(resolve, 1000));

      // After registration with social login, redirect to dashboard
      router.push("/dashboard");
    } catch (error) {
      console.error(`${provider} login error:`, error);
      setError(`${provider.charAt(0).toUpperCase() + provider.slice(1)} login failed. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle GitHub login
  const handleGitHubLogin = () => {
    socialAuthService.initiateGitHubSignIn();
  };

  // Navigate between account and plan tabs
  const handleContinue = () => {
    const { name, email, password } = form.getValues();
    const isNameValid = name.length >= 2;
    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const isPasswordValid = password.length >= 8 &&
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password);

    if (isNameValid && isEmailValid && isPasswordValid) {
      setActiveTab("plan");
    } else {
      form.trigger(["name", "email", "password"]);
    }
  };

  // Go back to account tab
  const handleBack = () => {
    setActiveTab("account");
  };

  return (
    <>
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Create your account
        </h1>
        <p className="text-sm text-muted-foreground">
          Enter your details to create your account and get started
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="plan" disabled={isLoading}>
            Choose Plan
          </TabsTrigger>
        </TabsList>

        <Card>
          <CardContent className="pt-4">
            {error && (
              <Alert variant="destructive" className="mb-4">
                <FiAlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <TabsContent value="account" className="mt-0">
              <Form {...form}>
                <form className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <FiUser className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              placeholder="John Doe"
                              className="pl-10"
                              {...field}
                              disabled={isLoading}
                            />
                          </div>
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
                          <div className="relative">
                            <FiMail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              placeholder="name@example.com"
                              className="pl-10"
                              {...field}
                              disabled={isLoading}
                            />
                          </div>
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
                          <div className="relative">
                            <FiLock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              type="password"
                              placeholder="••••••••"
                              className="pl-10"
                              {...field}
                              disabled={isLoading}
                            />
                          </div>
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
                          <FormLabel className="text-xs">
                            I agree to the{" "}
                            <Link
                              href="/terms"
                              className="text-primary hover:underline"
                            >
                              terms of service
                            </Link>{" "}
                            and{" "}
                            <Link
                              href="/privacy"
                              className="text-primary hover:underline"
                            >
                              privacy policy
                            </Link>
                          </FormLabel>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />
                  <Button
                    type="button"
                    className="w-full"
                    disabled={isLoading}
                    onClick={handleContinue}
                  >
                    {isLoading ? "Please wait..." : "Continue"}
                  </Button>
                </form>
              </Form>

              <div className="mt-4">
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

                <div className="mt-4 flex gap-2">
                  <Button
                    variant="outline"
                    className="w-full"
                    type="button"
                    disabled={isLoading}
                    onClick={() => socialAuthService.renderGoogleButton('google-signin-button')}
                  >
                    <FcGoogle className="mr-2 h-4 w-4" />
                    Google
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    type="button"
                    disabled={isLoading}
                    onClick={handleGitHubLogin}
                  >
                    <FiGithub className="mr-2 h-4 w-4" />
                    GitHub
                  </Button>
                </div>

                {/* Container for Google sign-in button */}
                <div id="google-signin-button" className="mt-4 flex justify-center"></div>
              </div>
            </TabsContent>

            <TabsContent value="plan" className="mt-0">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Choose Your Plan</h3>
                <p className="text-sm text-muted-foreground">
                  Select the plan that best fits your needs. All plans include a 14-day free trial.
                </p>

                <PlanSelector
                  plans={DEFAULT_PLANS}
                  selectedPlan={selectedPlan}
                  onPlanSelect={setSelectedPlan}
                  disabled={isLoading}
                  billing={billing}
                  onBillingChange={setBilling}
                  className="my-6"
                />

                <div className="flex gap-2 mt-6">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={handleBack}
                    disabled={isLoading}
                  >
                    Back
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={form.handleSubmit(onSubmit)}
                    disabled={isLoading}
                  >
                    {isLoading ? "Creating account..." : "Create Account"}
                  </Button>
                </div>
              </div>
            </TabsContent>
          </CardContent>

          <CardFooter className="flex justify-center border-t p-4">
            <div className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-medium text-primary hover:underline"
              >
                Sign in
              </Link>
            </div>
          </CardFooter>
        </Card>
      </Tabs>
    </>
  );
}
