"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ClientWrapper } from "@/components/client-wrapper";
import {
  FiInfo,
  FiSave,
  FiGlobe,
  FiMail,
  FiSettings,
  FiSlack,
  FiMessageCircle
} from "react-icons/fi";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { ToastAction } from "@/components/ui/toast";

const generalFormSchema = z.object({
  projectName: z.string().min(2, {
    message: "Project name must be at least 2 characters.",
  }),
  projectDescription: z.string().optional(),
  timezone: z.string({
    required_error: "Please select a timezone.",
  }),
  language: z.string({
    required_error: "Please select a language.",
  }),
  emailNotifications: z.boolean().default(true),
  slackNotifications: z.boolean().default(false),
  deploymentWebhook: z.string().optional(),
});

type GeneralFormValues = z.infer<typeof generalFormSchema>;

const defaultValues: Partial<GeneralFormValues> = {
  projectName: "ApexBase",
  projectDescription: "Modern backend as a service platform",
  timezone: "UTC",
  language: "en",
  emailNotifications: true,
  slackNotifications: false,
  deploymentWebhook: "",
};

export default function GeneralSettingsPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<GeneralFormValues>({
    resolver: zodResolver(generalFormSchema),
    defaultValues,
  });

  function onSubmit(data: GeneralFormValues) {
    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        title: "Settings updated",
        description: "Your general settings have been updated successfully.",
        action: (
          <ToastAction altText="Dismiss">Dismiss</ToastAction>
        ),
      });
      console.log(data);
    }, 1000);
  }

  return (
    <ClientWrapper fallback={
      <div className="flex flex-col gap-6 p-4 md:gap-8 md:p-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">General Settings</h1>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <div className="flex flex-col gap-6 p-4 md:gap-8 md:p-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">General Settings</h1>
          <p className="text-muted-foreground">
            Manage your project settings and preferences
          </p>
        </div>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="general">Project</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>
          <div className="mt-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <TabsContent value="general" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FiInfo className="h-5 w-5" />
                        <span>Project Information</span>
                      </CardTitle>
                      <CardDescription>
                        Basic details about your project
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <FormField
                        control={form.control}
                        name="projectName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Project Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter project name" {...field} />
                            </FormControl>
                            <FormDescription>
                              This is the name of your project as it appears everywhere.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="projectDescription"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Project Description</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Describe your project"
                                className="min-h-[100px] resize-y"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              A brief description of what your project does.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="preferences" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FiGlobe className="h-5 w-5" />
                        <span>Regional Preferences</span>
                      </CardTitle>
                      <CardDescription>
                        Configure your timezone and language preferences
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <FormField
                        control={form.control}
                        name="timezone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Timezone</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a timezone" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="UTC">UTC (Coordinated Universal Time)</SelectItem>
                                <SelectItem value="America/Los_Angeles">Pacific Time (US & Canada)</SelectItem>
                                <SelectItem value="America/New_York">Eastern Time (US & Canada)</SelectItem>
                                <SelectItem value="Europe/London">London</SelectItem>
                                <SelectItem value="Europe/Paris">Paris</SelectItem>
                                <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                                <SelectItem value="Australia/Sydney">Sydney</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              This will be used for all date and time displays.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="language"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Language</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a language" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="en">English</SelectItem>
                                <SelectItem value="es">Spanish</SelectItem>
                                <SelectItem value="fr">French</SelectItem>
                                <SelectItem value="de">German</SelectItem>
                                <SelectItem value="ja">Japanese</SelectItem>
                                <SelectItem value="zh">Chinese</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              Interface language for the dashboard.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="notifications" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FiMessageCircle className="h-5 w-5" />
                        <span>Notification Settings</span>
                      </CardTitle>
                      <CardDescription>
                        Control how and when you receive notifications
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <FormField
                        control={form.control}
                        name="emailNotifications"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="flex items-center gap-2">
                                <FiMail className="h-4 w-4" />
                                <span>Email Notifications</span>
                              </FormLabel>
                              <FormDescription>
                                Receive email updates about account activity.
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="slackNotifications"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="flex items-center gap-2">
                                <FiSlack className="h-4 w-4" />
                                <span>Slack Notifications</span>
                              </FormLabel>
                              <FormDescription>
                                Send notifications to a Slack channel.
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      {form.watch("slackNotifications") && (
                        <FormField
                          control={form.control}
                          name="deploymentWebhook"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Slack Webhook URL</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="https://hooks.slack.com/services/..."
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription>
                                Add your Slack webhook URL to receive notifications.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <div className="flex justify-end">
                  <Button type="submit" className="gap-2" disabled={isSubmitting}>
                    <FiSave className="h-4 w-4" />
                    {isSubmitting ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </Tabs>
      </div>
    </ClientWrapper>
  );
}
