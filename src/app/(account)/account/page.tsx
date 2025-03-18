"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  BarChart,
  CreditCard,
  Database,
  LucideIcon,
  Plus,
  Server,
  Settings,
  User,
  Users,
  Zap,
  ArrowUpRight
} from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getWorkspaceUrl } from '@/lib/gsb/config/tenant-config';

// Mock data for workspaces
const workspaces = [
  { id: 1, name: 'Development', code: 'dev1', users: 5, tables: 12, storage: '250 MB' },
  { id: 2, name: 'Production', code: 'prod', users: 8, tables: 18, storage: '1.2 GB' },
  { id: 3, name: 'Testing', code: 'test', users: 3, tables: 7, storage: '120 MB' },
];

// Stat card component
interface StatCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: LucideIcon;
  trend?: { value: string | number; positive: boolean };
}

function StatCard({ title, value, description, icon: Icon, trend }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
        {trend && (
          <div className={`flex items-center text-xs mt-2 ${trend.positive ? 'text-green-500' : 'text-red-500'}`}>
            <ArrowUpRight className="h-3 w-3 mr-1" />
            <span>{trend.value} from last month</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Workspace card component
interface WorkspaceCardProps {
  name: string;
  code: string;
  users: number;
  tables: number;
  storage: string;
}

function WorkspaceCard({ name, code, users, tables, storage }: WorkspaceCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{name}</CardTitle>
        <CardDescription>Tenant: {code}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Users</p>
            <p className="font-medium">{users}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Tables</p>
            <p className="font-medium">{tables}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Storage</p>
            <p className="font-medium">{storage}</p>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild variant="outline" className="w-full">
          <Link href={getWorkspaceUrl(code)} target="_blank">
            Open Workspace
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

export default function AccountDashboard() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Account Dashboard</h1>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Workspace
        </Button>
      </div>

      {/* Stats overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Workspaces"
          value={workspaces.length}
          description="Active workspaces in your account"
          icon={Server}
          trend={{ value: "+1", positive: true }}
        />
        <StatCard
          title="Total Users"
          value={16}
          description="Users across all workspaces"
          icon={Users}
          trend={{ value: "+3", positive: true }}
        />
        <StatCard
          title="Database Tables"
          value={37}
          description="Total tables in all workspaces"
          icon={Database}
        />
        <StatCard
          title="Monthly Bill"
          value="$129.99"
          description="Current billing period"
          icon={CreditCard}
          trend={{ value: "+$29.99", positive: false }}
        />
      </div>

      {/* Usage chart */}
      <Card>
        <CardHeader>
          <CardTitle>Usage Overview</CardTitle>
          <CardDescription>API calls and storage usage over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center border border-dashed rounded-md bg-muted/50">
            <div className="flex flex-col items-center text-muted-foreground">
              <BarChart className="h-10 w-10 mb-2" />
              <p>Usage chart will be displayed here</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Workspaces */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Your Workspaces</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {workspaces.map((workspace) => (
            <WorkspaceCard
              key={workspace.id}
              name={workspace.name}
              code={workspace.code}
              users={workspace.users}
              tables={workspace.tables}
              storage={workspace.storage}
            />
          ))}

          {/* Create new workspace card */}
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center h-full py-10">
              <div className="rounded-full p-3 bg-primary-100 mb-3">
                <Plus className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-medium mb-1">Create New Workspace</h3>
              <p className="text-sm text-muted-foreground text-center mb-4">
                Set up a new environment for your team
              </p>
              <Button>Create Workspace</Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="h-5 w-5 mr-2" />
              Team Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Manage users, roles, and permissions across your workspaces.
            </p>
            <Button variant="outline" asChild className="w-full">
              <Link href="/account/team">Manage Team</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="h-5 w-5 mr-2" />
              Billing & Plans
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              View your current plan, billing history, and payment methods.
            </p>
            <Button variant="outline" asChild className="w-full">
              <Link href="/account/billing">Manage Billing</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              Account Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Configure your account settings, notifications, and preferences.
            </p>
            <Button variant="outline" asChild className="w-full">
              <Link href="/account/settings">Account Settings</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
