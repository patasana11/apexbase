"use client";

import Link from "next/link";
import { ClientWrapper } from "@/components/client-wrapper";
import {
  FiSettings,
  FiShield,
  FiUsers,
  FiArrowRight,
  FiGlobe,
  FiBell,
  FiKey
} from "react-icons/fi";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  const settingsCategories = [
    {
      title: "General",
      description: "Manage your project settings and preferences",
      icon: <FiSettings className="h-5 w-5" />,
      href: "/dashboard/settings/general",
      items: ["Project information", "Language & Regional", "Notifications"],
    },
    {
      title: "Security",
      description: "Manage your account security and access controls",
      icon: <FiShield className="h-5 w-5" />,
      href: "/dashboard/settings/security",
      items: ["Password", "Two-factor authentication", "API keys"],
    },
    {
      title: "Team Members",
      description: "Manage your team and their access permissions",
      icon: <FiUsers className="h-5 w-5" />,
      href: "/dashboard/settings/team",
      items: ["Team management", "Roles & Permissions", "Invitations"],
    },
  ];

  return (
    <ClientWrapper fallback={
      <div className="flex flex-col gap-6 p-4 md:gap-8 md:p-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <div className="flex flex-col gap-6 p-4 md:gap-8 md:p-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your project settings, security, and team
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {settingsCategories.map((category, i) => (
            <Card key={i} className="flex flex-col">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="rounded-full bg-primary/10 p-2 text-primary">
                    {category.icon}
                  </div>
                  <CardTitle>{category.title}</CardTitle>
                </div>
                <CardDescription>{category.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <ul className="space-y-2 text-sm">
                  {category.items.map((item, j) => (
                    <li key={j} className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary/70"></div>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full justify-between">
                  <Link href={category.href}>
                    <span>Manage {category.title}</span>
                    <FiArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FiGlobe className="h-5 w-5" />
                <span>Account Information</span>
              </CardTitle>
              <CardDescription>View and edit your account details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-3 items-center gap-4">
                  <div className="font-medium">Account Name:</div>
                  <div className="col-span-2">ApexBase Demo Account</div>
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <div className="font-medium">Email:</div>
                  <div className="col-span-2">admin@apexbase.io</div>
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <div className="font-medium">Plan:</div>
                  <div className="col-span-2">Enterprise</div>
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <div className="font-medium">Created:</div>
                  <div className="col-span-2">January 15, 2023</div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" asChild className="w-full">
                <Link href="/account">
                  Manage Account
                </Link>
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FiBell className="h-5 w-5" />
                <span>Recent Activity</span>
              </CardTitle>
              <CardDescription>Latest activities in your account</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { action: "Password changed", time: "2 hours ago" },
                  { action: "New team member added", time: "Yesterday" },
                  { action: "API key created", time: "3 days ago" },
                  { action: "Project settings updated", time: "1 week ago" },
                ].map((activity, i) => (
                  <div key={i} className="flex justify-between gap-4 text-sm">
                    <span>{activity.action}</span>
                    <span className="text-muted-foreground">{activity.time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                View All Activity
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </ClientWrapper>
  );
}
