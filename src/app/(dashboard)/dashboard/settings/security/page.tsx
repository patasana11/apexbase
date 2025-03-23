"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ClientWrapper } from "@/components/client-wrapper";
import {
  FiShield,
  FiKey,
  FiLock,
  FiSave,
  FiAlertTriangle,
  FiLogOut,
  FiWatch,
  FiEye,
  FiEyeOff
} from "react-icons/fi";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "@/components/ui/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const passwordFormSchema = z
  .object({
    currentPassword: z.string().min(1, {
      message: "Current password is required.",
    }),
    newPassword: z
      .string()
      .min(8, {
        message: "Password must be at least 8 characters.",
      })
      .regex(/[A-Z]/, {
        message: "Password must contain at least one uppercase letter.",
      })
      .regex(/[a-z]/, {
        message: "Password must contain at least one lowercase letter.",
      })
      .regex(/[0-9]/, {
        message: "Password must contain at least one number.",
      }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match.",
    path: ["confirmPassword"],
  });

type PasswordFormValues = z.infer<typeof passwordFormSchema>;

const apiKeys = [
  { name: "Production API Key", value: "pk_live_X7yfL2sEJMzgkTP6rvbYm8Wd", created: "2023-06-15", lastUsed: "2 hours ago" },
  { name: "Development API Key", value: "pk_test_5Ry2vN4qJpL8bW3zKsTgE9Hf", created: "2023-06-15", lastUsed: "5 days ago" },
  { name: "Sandbox API Key", value: "pk_sand_3Hr7sP9bVmY2xQz4gKdF6Jn1", created: "2023-07-22", lastUsed: "2 weeks ago" },
];

const activeSessions = [
  { device: "Windows 11 / Chrome", location: "San Francisco, USA", ip: "192.168.1.1", lastActive: "Current session" },
  { device: "macOS / Safari", location: "New York, USA", ip: "192.168.1.2", lastActive: "2 days ago" },
  { device: "iPhone / Safari", location: "Boston, USA", ip: "192.168.1.3", lastActive: "1 week ago" },
];

export default function SecuritySettingsPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedKeyIndex, setSelectedKeyIndex] = useState<number | null>(null);

  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  function onSubmit(data: PasswordFormValues) {
    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        title: "Password updated",
        description: "Your password has been changed successfully.",
        action: (
          <ToastAction altText="Dismiss">Dismiss</ToastAction>
        ),
      });
      form.reset();
      console.log(data);
    }, 1000);
  }

  function handleRevokeSession(index: number) {
    toast({
      title: "Session revoked",
      description: `The session from ${activeSessions[index].device} has been revoked.`,
    });
  }

  function handleRegenerateTwoFactorCode() {
    toast({
      title: "New 2FA code generated",
      description: "Please scan the new QR code with your authenticator app.",
    });
  }

  function handleDisableTwoFactor() {
    setTwoFactorEnabled(false);
    toast({
      title: "Two-factor authentication disabled",
      description: "Your account is now protected with password only.",
    });
  }

  function handleEnableTwoFactor() {
    setTwoFactorEnabled(true);
    toast({
      title: "Two-factor authentication enabled",
      description: "Your account is now protected with an additional layer of security.",
    });
  }

  const toggleShowPassword = () => setShowPassword(!showPassword);

  return (
    <ClientWrapper fallback={
      <div className="flex flex-col gap-6 p-4 md:gap-8 md:p-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Security Settings</h1>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <div className="flex flex-col gap-6 p-4 md:gap-8 md:p-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Security Settings</h1>
          <p className="text-muted-foreground">
            Manage your account security and access controls
          </p>
        </div>

        <Tabs defaultValue="password" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="password">Password</TabsTrigger>
            <TabsTrigger value="twoFactor">Two-Factor</TabsTrigger>
            <TabsTrigger value="apiKeys">API Keys</TabsTrigger>
          </TabsList>
          <div className="mt-6">
            <TabsContent value="password" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FiLock className="h-5 w-5" />
                    <span>Change Password</span>
                  </CardTitle>
                  <CardDescription>
                    Update your password to maintain account security
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <FormField
                        control={form.control}
                        name="currentPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Current Password</FormLabel>
                            <div className="relative">
                              <FormControl>
                                <Input
                                  type={showPassword ? "text" : "password"}
                                  placeholder="Enter current password"
                                  {...field}
                                />
                              </FormControl>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute right-0 top-0 h-full px-3"
                                onClick={toggleShowPassword}
                              >
                                {showPassword ? (
                                  <FiEyeOff className="h-4 w-4" />
                                ) : (
                                  <FiEye className="h-4 w-4" />
                                )}
                                <span className="sr-only">
                                  {showPassword ? "Hide password" : "Show password"}
                                </span>
                              </Button>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="newPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>New Password</FormLabel>
                            <div className="relative">
                              <FormControl>
                                <Input
                                  type={showPassword ? "text" : "password"}
                                  placeholder="Enter new password"
                                  {...field}
                                />
                              </FormControl>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute right-0 top-0 h-full px-3"
                                onClick={toggleShowPassword}
                              >
                                {showPassword ? (
                                  <FiEyeOff className="h-4 w-4" />
                                ) : (
                                  <FiEye className="h-4 w-4" />
                                )}
                                <span className="sr-only">
                                  {showPassword ? "Hide password" : "Show password"}
                                </span>
                              </Button>
                            </div>
                            <FormDescription>
                              Password must be at least 8 characters and include uppercase, lowercase, and numbers.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirm New Password</FormLabel>
                            <div className="relative">
                              <FormControl>
                                <Input
                                  type={showPassword ? "text" : "password"}
                                  placeholder="Confirm new password"
                                  {...field}
                                />
                              </FormControl>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute right-0 top-0 h-full px-3"
                                onClick={toggleShowPassword}
                              >
                                {showPassword ? (
                                  <FiEyeOff className="h-4 w-4" />
                                ) : (
                                  <FiEye className="h-4 w-4" />
                                )}
                                <span className="sr-only">
                                  {showPassword ? "Hide password" : "Show password"}
                                </span>
                              </Button>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="flex justify-end">
                        <Button type="submit" className="gap-2" disabled={isSubmitting}>
                          <FiSave className="h-4 w-4" />
                          {isSubmitting ? "Updating..." : "Update Password"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-600">
                    <FiAlertTriangle className="h-5 w-5" />
                    <span>Active Sessions</span>
                  </CardTitle>
                  <CardDescription>
                    Manage all your active login sessions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Device</TableHead>
                          <TableHead>Location</TableHead>
                          <TableHead>IP Address</TableHead>
                          <TableHead>Last Active</TableHead>
                          <TableHead></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {activeSessions.map((session, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{session.device}</TableCell>
                            <TableCell>{session.location}</TableCell>
                            <TableCell>{session.ip}</TableCell>
                            <TableCell>
                              {session.lastActive === "Current session" ? (
                                <Badge className="bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900 dark:text-green-400 dark:hover:bg-green-900">
                                  {session.lastActive}
                                </Badge>
                              ) : (
                                session.lastActive
                              )}
                            </TableCell>
                            <TableCell>
                              {session.lastActive !== "Current session" && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-600 hover:text-red-800 hover:bg-red-100 dark:hover:bg-red-900"
                                  onClick={() => handleRevokeSession(index)}
                                >
                                  <FiLogOut className="h-4 w-4 mr-1" />
                                  Revoke
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" className="gap-2">
                        <FiLogOut className="h-4 w-4" />
                        Logout All Other Sessions
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will log out all devices except your current session. You'll need to log in again on those devices.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-red-600 hover:bg-red-700"
                          onClick={() => {
                            toast({
                              title: "All other sessions logged out",
                              description: "You have been logged out from all other devices."
                            });
                          }}
                        >
                          Logout All
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="twoFactor" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FiShield className="h-5 w-5" />
                    <span>Two-Factor Authentication</span>
                  </CardTitle>
                  <CardDescription>
                    Add an extra layer of security to your account
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <div className="font-medium">Two-Factor Authentication (2FA)</div>
                      <div className="text-sm text-muted-foreground">
                        {twoFactorEnabled
                          ? "Your account is protected with an authenticator app."
                          : "Protect your account with an authenticator app."}
                      </div>
                    </div>
                    <Switch
                      checked={twoFactorEnabled}
                      onCheckedChange={(value) => {
                        if (value) {
                          handleEnableTwoFactor();
                        } else {
                          handleDisableTwoFactor();
                        }
                      }}
                    />
                  </div>

                  {twoFactorEnabled && (
                    <>
                      <div className="rounded-lg border p-4">
                        <div className="flex flex-col items-center space-y-4">
                          <div className="h-48 w-48 rounded-lg bg-muted flex items-center justify-center">
                            <span className="text-sm">QR Code Placeholder</span>
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-medium mb-1">
                              Scan this QR code with your authenticator app
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Google Authenticator, Authy, or any other TOTP app
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={handleRegenerateTwoFactorCode}
                            className="gap-2"
                          >
                            <FiKey className="h-4 w-4" />
                            Generate New Code
                          </Button>
                        </div>
                      </div>

                      <div className="rounded-lg border p-4">
                        <div className="font-medium mb-2">Recovery Codes</div>
                        <p className="text-sm text-muted-foreground mb-4">
                          Save these recovery codes in a secure place. You can use them to regain access to your account if you lose your authenticator device.
                        </p>
                        <div className="grid grid-cols-2 gap-2 mb-4">
                          {Array.from({ length: 10 }).map((_, i) => (
                            <code key={i} className="inline-block rounded bg-muted p-2 text-sm font-mono">
                              {`RECOV-${Math.random().toString(36).substring(2, 8).toUpperCase()}`}
                            </code>
                          ))}
                        </div>
                        <Button type="button" variant="outline" className="w-full">
                          Download Recovery Codes
                        </Button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="apiKeys" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FiKey className="h-5 w-5" />
                    <span>API Keys</span>
                  </CardTitle>
                  <CardDescription>
                    Manage your API keys for app integration
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Created</TableHead>
                          <TableHead>Last Used</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {apiKeys.map((key, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{key.name}</TableCell>
                            <TableCell>{key.created}</TableCell>
                            <TableCell>{key.lastUsed}</TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 gap-1"
                                onClick={() => {
                                  navigator.clipboard.writeText(key.value);
                                  toast({
                                    title: "API key copied",
                                    description: "The API key has been copied to your clipboard."
                                  });
                                }}
                              >
                                Copy
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 gap-1 text-red-600 hover:text-red-800 hover:bg-red-100 dark:hover:bg-red-900"
                                  >
                                    Revoke
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This will revoke the "{key.name}" API key. Any applications using this key will no longer be able to access your account.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      className="bg-red-600 hover:bg-red-700"
                                      onClick={() => {
                                        toast({
                                          title: "API key revoked",
                                          description: `The ${key.name} API key has been revoked.`
                                        });
                                      }}
                                    >
                                      Revoke Key
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button className="gap-2">
                    <FiKey className="h-4 w-4" />
                    Generate New API Key
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </ClientWrapper>
  );
}
