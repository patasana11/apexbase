"use client";

import { useState } from "react";
import {
  FiDatabase,
  FiPlus,
  FiTrash2,
  FiEdit2,
  FiCopy,
  FiLink,
  FiCode,
  FiSettings,
  FiSearch,
  FiEye,
  FiLock,
  FiMoreHorizontal,
  FiDownload,
  FiFilter
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

export default function DatabasePage() {
  const [searchQuery, setSearchQuery] = useState("");

  // Mock data for tables
  const tables = [
    {
      name: "users",
      rows: 4829,
      size: "2.3 MB",
      lastModified: "2 hours ago",
      type: "table",
      hasRLS: true,
    },
    {
      name: "products",
      rows: 1253,
      size: "5.6 MB",
      lastModified: "1 day ago",
      type: "table",
      hasRLS: true,
    },
    {
      name: "orders",
      rows: 9721,
      size: "8.2 MB",
      lastModified: "3 hours ago",
      type: "table",
      hasRLS: true,
    },
    {
      name: "transactions",
      rows: 18329,
      size: "12.4 MB",
      lastModified: "30 minutes ago",
      type: "table",
      hasRLS: true,
    },
    {
      name: "categories",
      rows: 42,
      size: "0.3 MB",
      lastModified: "5 days ago",
      type: "table",
      hasRLS: false,
    },
    {
      name: "active_users_view",
      rows: 1253,
      size: "0.8 MB",
      lastModified: "1 day ago",
      type: "view",
      hasRLS: false,
    },
    {
      name: "product_analytics",
      rows: 5362,
      size: "3.1 MB",
      lastModified: "12 hours ago",
      type: "materialized view",
      hasRLS: false,
    },
  ];

  // Filter tables based on search query
  const filteredTables = tables.filter(table =>
    table.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 p-4 md:gap-8 md:p-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Database</h1>
        <p className="text-muted-foreground">
          Manage your databases, tables, and relationships.
        </p>
      </div>

      <Tabs defaultValue="tables" className="space-y-4">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <TabsList>
            <TabsTrigger value="tables">Tables</TabsTrigger>
            <TabsTrigger value="queries">SQL Editor</TabsTrigger>
            <TabsTrigger value="relationships">Relationships</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <FiSearch className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search tables..."
                className="pl-8 sm:w-[200px] md:w-[300px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button>
              <FiPlus className="mr-2 h-4 w-4" />
              New Table
            </Button>
          </div>
        </div>

        <TabsContent value="tables" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle>Database Tables and Views</CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <FiFilter className="mr-2 h-4 w-4" />
                    Filter
                  </Button>
                  <Button variant="outline" size="sm">
                    <FiDownload className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                </div>
              </div>
              <CardDescription>
                Manage your database tables, views, and materialized views.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="hidden md:table-cell">Rows</TableHead>
                    <TableHead className="hidden md:table-cell">Size</TableHead>
                    <TableHead className="hidden md:table-cell">Last Modified</TableHead>
                    <TableHead className="hidden md:table-cell">RLS</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTables.map((table) => (
                    <TableRow key={table.name}>
                      <TableCell className="font-medium">{table.name}</TableCell>
                      <TableCell>
                        <Badge variant={table.type === "table" ? "default" : table.type === "view" ? "outline" : "secondary"}>
                          {table.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{table.rows.toLocaleString()}</TableCell>
                      <TableCell className="hidden md:table-cell">{table.size}</TableCell>
                      <TableCell className="hidden md:table-cell">{table.lastModified}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        {table.hasRLS ? <FiLock className="h-4 w-4 text-green-500" /> : null}
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
                            <DropdownMenuItem className="cursor-pointer">
                              <FiEye className="mr-2 h-4 w-4" />
                              Browse Data
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer">
                              <FiEdit2 className="mr-2 h-4 w-4" />
                              Edit Structure
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer">
                              <FiSettings className="mr-2 h-4 w-4" />
                              Manage Policies
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="cursor-pointer">
                              <FiCopy className="mr-2 h-4 w-4" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer text-red-600">
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
                Showing <strong>{filteredTables.length}</strong> of{" "}
                <strong>{tables.length}</strong> tables
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

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Database Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">
                      Total Tables
                    </div>
                    <div className="text-2xl font-bold">
                      {tables.filter(t => t.type === "table").length}
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">
                      Total Rows
                    </div>
                    <div className="text-2xl font-bold">
                      {tables.reduce((acc, table) => acc + table.rows, 0).toLocaleString()}
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">
                      Database Size
                    </div>
                    <div className="text-2xl font-bold">
                      32.7 MB
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Queries</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    "SELECT * FROM users WHERE last_login > NOW() - INTERVAL '7 days'",
                    "UPDATE products SET stock = stock - 1 WHERE id = 245",
                    "INSERT INTO orders (user_id, total) VALUES (42, 129.99)",
                  ].map((query, i) => (
                    <div key={i} className="rounded-md bg-muted p-3">
                      <code className="text-xs">{query}</code>
                      <div className="mt-2 text-xs text-muted-foreground">
                        {i === 0 ? "2 minutes ago" : i === 1 ? "45 minutes ago" : "1 hour ago"}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-2">
                  <Button variant="outline" className="justify-start">
                    <FiPlus className="mr-2 h-4 w-4" />
                    Create New Table
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <FiCode className="mr-2 h-4 w-4" />
                    SQL Editor
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <FiLink className="mr-2 h-4 w-4" />
                    Create Relationship
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <FiDownload className="mr-2 h-4 w-4" />
                    Backup Database
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="queries">
          <Card>
            <CardHeader>
              <CardTitle>SQL Editor</CardTitle>
              <CardDescription>
                Write and execute SQL queries against your database.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex h-80 items-center justify-center rounded-md border border-dashed">
                <div className="flex flex-col items-center justify-center text-center">
                  <FiCode className="h-10 w-10 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-medium">SQL Editor</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    The SQL Editor will be implemented in the next phase.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="relationships">
          <Card>
            <CardHeader>
              <CardTitle>Table Relationships</CardTitle>
              <CardDescription>
                Manage foreign key relationships between your tables.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex h-80 items-center justify-center rounded-md border border-dashed">
                <div className="flex flex-col items-center justify-center text-center">
                  <FiLink className="h-10 w-10 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-medium">Relationship Manager</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    The Relationship Manager will be implemented in the next phase.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Database Settings</CardTitle>
              <CardDescription>
                Configure your database settings and preferences.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex h-80 items-center justify-center rounded-md border border-dashed">
                <div className="flex flex-col items-center justify-center text-center">
                  <FiSettings className="h-10 w-10 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-medium">Database Settings</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Database Settings will be implemented in the next phase.
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
