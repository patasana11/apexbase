"use client";

import { useEffect, useState } from 'react';
import Link from "next/link";
import { ClientWrapper } from "@/components/client-wrapper";
import {
  FiBarChart,
  FiDatabase,
  FiHardDrive,
  FiUploadCloud,
  FiUsers,
  FiZap,
  FiArrowUp,
  FiArrowDown,
  FiActivity,
  FiMoreHorizontal,
  FiCode,
  FiPlus,
  FiLayers,
} from "react-icons/fi";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { WorkflowMonitorService } from '@/lib/gsb/services/workflow/workflow-monitor.service';

// Initialize the workflow monitor service
const workflowMonitor = new WorkflowMonitorService();

export default function DashboardPage() {
  const [workflowStatus, setWorkflowStatus] = useState<'Operational' | 'Degraded' | 'Down'>('Operational');

  useEffect(() => {
    // Update workflow status initially and every minute
    const updateStatus = async () => {
      const status = await workflowMonitor.getOverallWorkflowStatus();
      setWorkflowStatus(status);
    };

    updateStatus();
    const interval = setInterval(updateStatus, 60000);

    return () => {
      clearInterval(interval);
      workflowMonitor.destroy();
    };
  }, []);

  const stats = [
    {
      title: "Active Users",
      value: "3,248",
      change: "+12.5%",
      trend: "up",
      icon: <FiUsers className="h-4 w-4" />,
    },
    {
      title: "Database Records",
      value: "1.2M",
      change: "+23.1%",
      trend: "up",
      icon: <FiDatabase className="h-4 w-4" />,
    },
    {
      title: "Storage Used",
      value: "256 GB",
      change: "+8.2%",
      trend: "up",
      icon: <FiHardDrive className="h-4 w-4" />,
    },
    {
      title: "Function Executions",
      value: "850K",
      change: "-2.5%",
      trend: "down",
      icon: <FiCode className="h-4 w-4" />,
    },
  ];

  const projects = [
    {
      name: "E-commerce App",
      description: "Online marketplace for digital products",
      updatedAt: "2 hours ago",
    },
    {
      name: "Healthcare Platform",
      description: "Patient management system with secure data",
      updatedAt: "Yesterday",
    },
    {
      name: "Banking Dashboard",
      description: "Financial analytics and transaction management",
      updatedAt: "3 days ago",
    },
  ];

  const activityLog = [
    {
      type: "user",
      message: "New user registration",
      time: "10 minutes ago",
    },
    {
      type: "database",
      message: "Database schema updated",
      time: "2 hours ago",
    },
    {
      type: "function",
      message: "Function 'processPayment' deployed",
      time: "4 hours ago",
    },
    {
      type: "storage",
      message: "20 GB of files uploaded",
      time: "Yesterday",
    },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "user":
        return <FiUsers className="h-4 w-4" />;
      case "database":
        return <FiDatabase className="h-4 w-4" />;
      case "function":
        return <FiCode className="h-4 w-4" />;
      case "storage":
        return <FiUploadCloud className="h-4 w-4" />;
      default:
        return <FiActivity className="h-4 w-4" />;
    }
  };

  return (
    <ClientWrapper fallback={
      <div className="flex flex-col gap-6 p-4 md:gap-8 md:p-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <div className="flex flex-col gap-6 p-4 md:gap-8 md:p-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your backend services and activity.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <div
                  className={`rounded-full p-1 ${
                    stat.trend === "up"
                      ? "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400"
                      : "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400"
                  }`}
                >
                  {stat.trend === "up" ? (
                    <FiArrowUp className="h-4 w-4" />
                  ) : (
                    <FiArrowDown className="h-4 w-4" />
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p
                  className={`text-xs ${
                    stat.trend === "up"
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {stat.change} from last month
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Projects List */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center">
              <div>
                <CardTitle>Your Projects</CardTitle>
                <CardDescription>
                  Recent projects you've been working on
                </CardDescription>
              </div>
              <Button size="sm" className="ml-auto gap-1">
                <FiPlus className="h-4 w-4" />
                <span>New Project</span>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {projects.map((project, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{project.name}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {project.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{project.updatedAt}</Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <FiMoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>View Details</DropdownMenuItem>
                          <DropdownMenuItem>Edit Project</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">
                            Delete Project
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                View All Projects
              </Button>
            </CardFooter>
          </Card>

          {/* Activity Log */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest actions across your projects</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activityLog.map((activity, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <p className="text-sm font-medium">{activity.message}</p>
                      <span className="text-xs text-muted-foreground">
                        {activity.time}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                View Full Activity Log
              </Button>
            </CardFooter>
          </Card>

          {/* Service Status */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Service Status</CardTitle>
              <CardDescription>
                Current status of your backend services
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: "Authentication", status: "Operational", icon: <FiUsers className="h-4 w-4" /> },
                  { name: "Database", status: "Operational", icon: <FiDatabase className="h-4 w-4" /> },
                  { name: "Storage", status: "Operational", icon: <FiHardDrive className="h-4 w-4" /> },
                  { name: "Functions", status: "Degraded", icon: <FiCode className="h-4 w-4" /> },
                  { name: "Workflow", status: workflowStatus, icon: <FiLayers className="h-4 w-4" /> },
                  { name: "Realtime", status: "Operational", icon: <FiZap className="h-4 w-4" /> },
                ].map((service, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
                        {service.icon}
                      </div>
                      <div>
                        <h3 className="font-medium">{service.name}</h3>
                      </div>
                    </div>
                    <Badge
                      variant={
                        service.status === "Operational" ? "outline" : "secondary"
                      }
                      className={
                        service.status === "Operational"
                          ? "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900 dark:text-green-400 dark:hover:bg-green-900"
                          : service.status === "Degraded"
                          ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-400 dark:hover:bg-yellow-900"
                          : "bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900 dark:text-red-400 dark:hover:bg-red-900"
                      }
                    >
                      {service.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" asChild className="w-full">
                <Link href="/dashboard/status">View System Status</Link>
              </Button>
            </CardFooter>
          </Card>

          {/* Quick Shortcuts */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks and shortcuts</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <Button variant="outline" className="justify-between px-4">
                <span className="flex items-center gap-2">
                  <FiUsers className="h-4 w-4" /> Manage Users
                </span>
                <Badge className="ml-2">4.2K</Badge>
              </Button>
              <Button variant="outline" className="justify-between px-4">
                <span className="flex items-center gap-2">
                  <FiDatabase className="h-4 w-4" /> Database Console
                </span>
              </Button>
              <Button variant="outline" className="justify-between px-4">
                <span className="flex items-center gap-2">
                  <FiCode className="h-4 w-4" /> Deploy Function
                </span>
              </Button>
              <Button variant="outline" className="justify-between px-4">
                <span className="flex items-center gap-2">
                  <FiHardDrive className="h-4 w-4" /> Storage Explorer
                </span>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </ClientWrapper>
  );
}
