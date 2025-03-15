"use client";

import { useState } from "react";
import {
  FiCode,
  FiPlus,
  FiPlay,
  FiPause,
  FiClock,
  FiCpu,
  FiSearch,
  FiMoreHorizontal,
  FiEdit2,
  FiTrash2,
  FiCopy,
  FiDownload,
  FiExternalLink,
  FiServer,
  FiRefreshCw,
  FiFilter,
  FiSettings
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
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

export default function FunctionsPage() {
  const [searchQuery, setSearchQuery] = useState("");

  // Mock functions data
  const functions = [
    {
      id: "func_1",
      name: "processPayment",
      status: "active",
      runtime: "node.js",
      lastDeployed: "Today at 10:23 AM",
      executions: 1428,
      avgDuration: "120ms",
      memory: "128MB",
    },
    {
      id: "func_2",
      name: "generatePDF",
      status: "active",
      runtime: "python",
      lastDeployed: "Yesterday at 3:45 PM",
      executions: 356,
      avgDuration: "320ms",
      memory: "256MB",
    },
    {
      id: "func_3",
      name: "sendEmail",
      status: "inactive",
      runtime: "node.js",
      lastDeployed: "Jan 15, 2023",
      executions: 5892,
      avgDuration: "85ms",
      memory: "128MB",
    },
    {
      id: "func_4",
      name: "processImageUpload",
      status: "active",
      runtime: "node.js",
      lastDeployed: "Jan 10, 2023",
      executions: 782,
      avgDuration: "450ms",
      memory: "512MB",
    },
    {
      id: "func_5",
      name: "syncDatabaseRecords",
      status: "active",
      runtime: "python",
      lastDeployed: "Jan 5, 2023",
      executions: 128,
      avgDuration: "750ms",
      memory: "256MB",
    },
  ];

  // Filter functions based on search query
  const filteredFunctions = functions.filter(func =>
    func.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    func.runtime.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get runtime badge colors
  const getRuntimeBadge = (runtime: string) => {
    switch (runtime) {
      case "node.js":
        return <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400">Node.js</Badge>;
      case "python":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">Python</Badge>;
      default:
        return <Badge variant="outline">{runtime}</Badge>;
    }
  };

  return (
    <div className="flex flex-col gap-6 p-4 md:gap-8 md:p-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Serverless Functions</h1>
        <p className="text-muted-foreground">
          Deploy and manage your serverless cloud functions.
        </p>
      </div>

      <Tabs defaultValue="functions" className="space-y-4">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <TabsList>
            <TabsTrigger value="functions">Functions</TabsTrigger>
            <TabsTrigger value="logs">Logs</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <FiSearch className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search functions..."
                className="pl-8 sm:w-[250px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button>
              <FiPlus className="mr-2 h-4 w-4" />
              New Function
            </Button>
          </div>
        </div>

        <TabsContent value="functions" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle>Function Management</CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <FiFilter className="mr-2 h-4 w-4" />
                    Filter
                  </Button>
                </div>
              </div>
              <CardDescription>
                Deploy, configure, and monitor your serverless functions.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Runtime</TableHead>
                    <TableHead className="hidden md:table-cell">Memory</TableHead>
                    <TableHead className="hidden md:table-cell">Executions</TableHead>
                    <TableHead className="hidden md:table-cell">Avg. Duration</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFunctions.map((func) => (
                    <TableRow key={func.id}>
                      <TableCell>
                        <div className="font-medium">{func.name}</div>
                        <div className="text-xs text-muted-foreground">
                          Last deployed: {func.lastDeployed}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={func.status === "active" ? "default" : "secondary"}
                          className={func.status === "active" ? "bg-green-500" : ""}
                        >
                          {func.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {getRuntimeBadge(func.runtime)}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {func.memory}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {func.executions.toLocaleString()}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {func.avgDuration}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <FiMoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <FiPlay className="mr-2 h-4 w-4" />
                              Run Now
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <FiEdit2 className="mr-2 h-4 w-4" />
                              Edit Code
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <FiServer className="mr-2 h-4 w-4" />
                              Configure
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {func.status === "active" ? (
                              <DropdownMenuItem>
                                <FiPause className="mr-2 h-4 w-4" />
                                Disable
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem>
                                <FiPlay className="mr-2 h-4 w-4" />
                                Enable
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem>
                              <FiRefreshCw className="mr-2 h-4 w-4" />
                              Deploy
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">
                              <FiTrash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="flex items-center justify-between border-t px-6 py-4">
              <div className="text-sm text-muted-foreground">
                Showing <strong>{filteredFunctions.length}</strong> of{" "}
                <strong>{functions.length}</strong> functions
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled>
                  Previous
                </Button>
                <Button variant="outline" size="sm" disabled>
                  Next
                </Button>
              </div>
            </CardFooter>
          </Card>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Function Metrics</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Total Functions
                  </div>
                  <div className="text-2xl font-bold">
                    {functions.length}
                  </div>
                </div>
                <Separator />
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Total Executions (Last 24h)
                  </div>
                  <div className="text-2xl font-bold">
                    4,218
                  </div>
                </div>
                <Separator />
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Avg. Execution Time
                  </div>
                  <div className="text-2xl font-bold">
                    245 ms
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Runtime Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-green-500"></div>
                      <span>Node.js</span>
                    </div>
                    <span className="text-sm font-medium">{functions.filter(f => f.runtime === "node.js").length} functions</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                      <span>Python</span>
                    </div>
                    <span className="text-sm font-medium">{functions.filter(f => f.runtime === "python").length} functions</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <Button variant="outline" className="justify-start">
                    <FiPlus className="mr-2 h-4 w-4" />
                    Create Function
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <FiDownload className="mr-2 h-4 w-4" />
                    Download Templates
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <FiClock className="mr-2 h-4 w-4" />
                    Schedule Function
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <FiCpu className="mr-2 h-4 w-4" />
                    Resource Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>Function Logs</CardTitle>
              <CardDescription>
                View logs and monitor function performance.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex h-[400px] items-center justify-center rounded-md border border-dashed">
                <div className="flex flex-col items-center justify-center text-center">
                  <FiServer className="h-10 w-10 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-medium">Function Logs</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    The log viewer will be implemented in the next phase.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Function Settings</CardTitle>
              <CardDescription>
                Configure global settings for your serverless functions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex h-[400px] items-center justify-center rounded-md border border-dashed">
                <div className="flex flex-col items-center justify-center text-center">
                  <FiSettings className="h-10 w-10 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-medium">Function Settings</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Settings configuration will be implemented in the next phase.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
