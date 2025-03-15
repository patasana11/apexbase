"use client";

import React, { useState, useEffect } from 'react';
import { PlusCircle, Filter, PlayCircle, Settings } from "lucide-react";
import { useRouter } from 'next/navigation';
import { FiPlus } from 'react-icons/fi';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

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

export default function WorkflowPage() {
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

  const handleCreateWorkflow = () => {
    // Generate a temporary ID for the new workflow
    const tempId = 'new';
    router.push(`/dashboard/workflow/designer/${tempId}`);
  };

  return (
    <div className="container py-6 mx-auto max-w-7xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Workflow Management</h1>
          <p className="text-muted-foreground mt-1">Create and manage workflow processes</p>
        </div>
        <Button onClick={handleCreateWorkflow}>
          <FiPlus className="h-4 w-4 mr-2" />
          Create Workflow
        </Button>
      </div>

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
                          onClick={() => router.push(`/dashboard/workflow/designer/${workflow.id}`)}
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
              <EmptyState
                title="No workflows found"
                description={searchQuery
                  ? `No workflows match "${searchQuery}"`
                  : "You haven't created any workflows yet."
                }
                action={!searchQuery ? (
                  <Button onClick={handleCreateWorkflow}>
                    <FiPlus className="h-4 w-4 mr-2" />
                    Create your first workflow
                  </Button>
                ) : undefined}
              />
            )}
          </TabsContent>

          <TabsContent value="active">
            <EmptyState
              title="Active Workflows"
              description="View and manage your active workflows."
            />
          </TabsContent>

          <TabsContent value="drafts">
            <EmptyState
              title="Draft Workflows"
              description="Continue working on your unfinished workflows."
            />
          </TabsContent>

          <TabsContent value="instances">
            <EmptyState
              title="Workflow Instances"
              description="View and manage running workflow instances."
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Status badge component
function StatusBadge({ status }: { status: string }) {
  let color;
  let label;

  switch (status) {
    case 'active':
      color = 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      label = 'Active';
      break;
    case 'paused':
      color = 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      label = 'Paused';
      break;
    case 'draft':
      color = 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      label = 'Draft';
      break;
    default:
      color = 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
      label = status;
  }

  return (
    <Badge className={`${color} capitalize`} variant="outline">
      {label}
    </Badge>
  );
}

// Empty state component
function EmptyState({
  title,
  description,
  action
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[200px] flex-col items-center justify-center rounded-md border border-dashed p-8 text-center">
      <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            className="h-10 w-10 text-muted-foreground"
            viewBox="0 0 24 24"
          >
            <path d="M9 17H7A5 5 0 0 1 7 7h10a5 5 0 0 1 0 10h-2" />
            <path d="m21 15-3-3-3 3M6 15l3-3 3 3" />
          </svg>
        </div>
        <h3 className="mt-4 text-lg font-semibold">{title}</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          {description}
        </p>
        {action && <div className="mt-4">{action}</div>}
      </div>
    </div>
  );
}
