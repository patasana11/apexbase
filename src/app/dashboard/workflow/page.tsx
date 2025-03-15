"use client";

import React, { useState, useEffect } from 'react';
import { PlusCircle, Filter, Clock, PlayCircle, Settings } from "lucide-react";
import { useRouter } from 'next/navigation';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

import DashboardShell from '@/components/dashboard-shell';
import DashboardHeader from '@/components/dashboard-header';
import EmptyPlaceholder from '@/components/empty-placeholder';

// Mocked workflow data for demonstration
const mockWorkflows = [
  {
    id: 'wf1',
    name: 'Employee Onboarding',
    status: 'active',
    lastRun: '2023-11-15T14:23:00Z',
    runCount: 127,
    description: 'Workflow for onboarding new employees',
    activities: 8,
    transitions: 12,
    createdBy: 'Admin',
    createdAt: '2023-01-10T10:00:00Z',
  },
  {
    id: 'wf2',
    name: 'Customer Support Ticket',
    status: 'active',
    lastRun: '2023-11-14T09:45:00Z',
    runCount: 543,
    description: 'Process for handling customer support tickets',
    activities: 12,
    transitions: 15,
    createdBy: 'Admin',
    createdAt: '2023-02-22T14:30:00Z',
  },
  {
    id: 'wf3',
    name: 'Invoice Approval',
    status: 'paused',
    lastRun: '2023-11-10T11:20:00Z',
    runCount: 89,
    description: 'Workflow for invoice review and approval',
    activities: 6,
    transitions: 7,
    createdBy: 'Admin',
    createdAt: '2023-05-17T09:15:00Z',
  },
  {
    id: 'wf4',
    name: 'Document Review',
    status: 'draft',
    lastRun: null,
    runCount: 0,
    description: 'Process for legal document review',
    activities: 4,
    transitions: 3,
    createdBy: 'Admin',
    createdAt: '2023-11-01T16:45:00Z',
  },
];

// Format date to a readable string
const formatDate = (dateString: string | null) => {
  if (!dateString) return 'Never';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric'
  }).format(date);
};

export default function WorkflowDashboard() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [workflows, setWorkflows] = useState(mockWorkflows);
  const [isLoading, setIsLoading] = useState(true);

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  // Filter workflows based on search query
  const filteredWorkflows = workflows.filter(wf =>
    wf.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    wf.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Navigate to workflow designer
  const navigateToDesigner = (workflowId?: string) => {
    if (workflowId) {
      router.push(`/dashboard/workflow/designer/${workflowId}`);
    } else {
      router.push('/dashboard/workflow/designer/new');
    }
  };

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Workflow Management"
        description="Create and manage workflow processes"
      >
        <Button onClick={() => navigateToDesigner()}>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Workflow
        </Button>
      </DashboardHeader>

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <Input
            placeholder="Search workflows..."
            className="max-w-[400px]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="all">All Workflows</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="drafts">Drafts</TabsTrigger>
            <TabsTrigger value="instances">Instances</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader>
                      <div className="h-5 bg-secondary rounded w-1/3"></div>
                      <div className="h-4 bg-secondary rounded w-1/4 mt-2"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-4 bg-secondary rounded w-2/3"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredWorkflows.length > 0 ? (
              <div className="space-y-3">
                {filteredWorkflows.map((workflow) => (
                  <Card key={workflow.id} className="overflow-hidden">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-xl">{workflow.name}</CardTitle>
                          <CardDescription className="mt-1">{workflow.description}</CardDescription>
                        </div>
                        <StatusBadge status={workflow.status} />
                      </div>
                    </CardHeader>
                    <CardContent className="pb-3">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Activities</p>
                          <p className="font-medium">{workflow.activities}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Transitions</p>
                          <p className="font-medium">{workflow.transitions}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Last Run</p>
                          <p className="font-medium">{formatDate(workflow.lastRun)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Run Count</p>
                          <p className="font-medium">{workflow.runCount}</p>
                        </div>
                      </div>
                    </CardContent>
                    <Separator />
                    <CardFooter className="justify-between py-3">
                      <div className="text-xs text-muted-foreground">
                        Created by {workflow.createdBy} on {formatDate(workflow.createdAt)}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={workflow.status !== 'active'}
                        >
                          <PlayCircle className="h-4 w-4 mr-1" />
                          Run
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigateToDesigner(workflow.id)}
                        >
                          <Settings className="h-4 w-4 mr-1" />
                          Design
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <EmptyPlaceholder>
                <EmptyPlaceholder.Icon name="workflow" />
                <EmptyPlaceholder.Title>No workflows found</EmptyPlaceholder.Title>
                <EmptyPlaceholder.Description>
                  {searchQuery
                    ? `No workflows match "${searchQuery}"`
                    : "You haven't created any workflows yet."}
                </EmptyPlaceholder.Description>
                {!searchQuery && (
                  <Button onClick={() => navigateToDesigner()}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create your first workflow
                  </Button>
                )}
              </EmptyPlaceholder>
            )}
          </TabsContent>

          <TabsContent value="active">
            <EmptyPlaceholder>
              <EmptyPlaceholder.Icon name="workflow" />
              <EmptyPlaceholder.Title>Active Workflows</EmptyPlaceholder.Title>
              <EmptyPlaceholder.Description>
                View and manage your active workflows.
              </EmptyPlaceholder.Description>
            </EmptyPlaceholder>
          </TabsContent>

          <TabsContent value="drafts">
            <EmptyPlaceholder>
              <EmptyPlaceholder.Icon name="draft" />
              <EmptyPlaceholder.Title>Draft Workflows</EmptyPlaceholder.Title>
              <EmptyPlaceholder.Description>
                Continue working on your unfinished workflows.
              </EmptyPlaceholder.Description>
            </EmptyPlaceholder>
          </TabsContent>

          <TabsContent value="instances">
            <EmptyPlaceholder>
              <EmptyPlaceholder.Icon name="instance" />
              <EmptyPlaceholder.Title>Workflow Instances</EmptyPlaceholder.Title>
              <EmptyPlaceholder.Description>
                View and manage running workflow instances.
              </EmptyPlaceholder.Description>
            </EmptyPlaceholder>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardShell>
  );
}

// Status badge component
function StatusBadge({ status }: { status: string }) {
  let color;
  let label;

  switch (status) {
    case 'active':
      color = 'bg-green-100 text-green-800';
      label = 'Active';
      break;
    case 'paused':
      color = 'bg-yellow-100 text-yellow-800';
      label = 'Paused';
      break;
    case 'draft':
      color = 'bg-blue-100 text-blue-800';
      label = 'Draft';
      break;
    default:
      color = 'bg-gray-100 text-gray-800';
      label = status;
  }

  return (
    <Badge className={`${color} capitalize`}>
      {label}
    </Badge>
  );
}
