"use client";

import { useState, useEffect } from "react";
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
  FiFilter,
  FiLoader
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
import { GsbEntityDef } from '@/lib/gsb/models/gsb-entity-def.model';
import { EntityDefService } from '@/lib/gsb/services/entity/entity-def.service';
import { setGsbToken, setGsbTenantCode } from '@/lib/gsb/config/gsb-config';
import ClientOnly from "@/components/client-only";
import { useRouter } from "next/navigation";
import { createClientComponent } from "@/components/dynamic-component";

// Constants
const GSB_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiJiZjE1MjRiNy04MjBmLTQ2NGYtOWYzNC02ZWQ2Y2Q5NjVlNjEiLCJ0YyI6ImRldjEiLCJpIjoiOThCNUU0OUQiLCJleHAiOjE3NDMwMDcwMzQsImlzcyI6IkBnc2IifQ.0WImy6Y1XmC0RwJPG-Y3teTlAA4wL17rgDYARyySciQ";
const GSB_TENANT = "dev1";

function DatabasePageContent() {
  const [searchQuery, setSearchQuery] = useState("");
  const [entityDefs, setEntityDefs] = useState<GsbEntityDef[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isClient, setIsClient] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
  const router = useRouter();

  // Mark when component is mounted on client
  useEffect(() => {
    console.log("Component mounted, setting isClient = true");
    setIsClient(true);
  }, []);

  // Initialize token and service when component mounts
  useEffect(() => {
    if (!isClient) return;

    console.log("Setting up GSB token and tenant code...");

    try {
      // Set the GSB token and tenant code for the service to use
      setGsbToken(GSB_TOKEN);
      setGsbTenantCode(GSB_TENANT);

      // Parse JWT token to confirm it's valid
      const tokenParts = GSB_TOKEN.split('.');
      if (tokenParts.length === 3) {
        const payload = JSON.parse(atob(tokenParts[1]));
        console.log("Token payload:", payload);
        setDebugInfo(`Token tenant: ${payload.tc}, uid: ${payload.uid}, expiry: ${new Date(payload.exp * 1000).toLocaleString()}`);
      } else {
        console.error("Invalid token format, doesn't have 3 parts");
        setDebugInfo("Invalid token format");
        setError("Invalid token format");
      }
    } catch (error) {
      console.error("Error setting up GSB token:", error);
      setDebugInfo(`Error setting up GSB token: ${error}`);
      setError(`Failed to initialize: ${error instanceof Error ? error.message : String(error)}`);
      return;
    }

    // Initial data fetch
    console.log("Running initial data fetch...");
    fetchEntityDefs(currentPage, searchQuery);
  }, [isClient]);

  // Update when page changes
  useEffect(() => {
    if (!isClient) return;
    console.log(`Page changed to ${currentPage}, fetching data...`);
    fetchEntityDefs(currentPage, searchQuery);
  }, [currentPage, isClient]);

  // Fetch entity definitions using the service
  const fetchEntityDefs = async (page: number = 1, search: string = "") => {
    if (!isClient) return;

    setLoading(true);
    setError(null);

    try {
      // Check if token is set before making the request
      if (!GSB_TOKEN) {
        throw new Error("GSB Token not available");
      }

      console.log(`Fetching entity definitions - page: ${page}, search: ${search}`);

      const entityDefService = new EntityDefService();
      console.log("EntityDefService created");

      let result;

      if (search) {
        console.log(`Searching entity definitions with term: ${search}`);
        result = await entityDefService.searchEntityDefs(search, page, pageSize);
      } else {
        console.log(`Getting all entity definitions - page ${page}`);
        result = await entityDefService.getEntityDefs(page, pageSize);
      }

      if (!result) {
        throw new Error("No data received from server");
      }

      console.log(`Fetched ${result.entityDefs?.length || 0} entity definitions. Total: ${result.totalCount}`);

      if (result.entityDefs?.length > 0) {
        console.log("Sample entity def:", result.entityDefs[0]);
      }

      setEntityDefs(result.entityDefs || []);
      setTotalCount(result.totalCount || 0);
    } catch (error) {
      console.error("Error fetching entity definitions:", error);
      setError(`Failed to fetch data: ${error instanceof Error ? error.message : String(error)}`);
      setEntityDefs([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  // Handle search
  const handleSearch = () => {
    if (!isClient) return;
    console.log(`Searching for term: ${searchQuery}`);
    setCurrentPage(1); // Reset to first page when searching
    fetchEntityDefs(1, searchQuery);
  };

  // Handle pagination
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage * pageSize < totalCount) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Format date string safely - ensure consistent output to avoid hydration issues
  const formatDate = (dateStr: string | Date | undefined) => {
    if (!dateStr) return "N/A";

    // Just return a static string in server rendering to avoid hydration mismatch
    if (!isClient) return "N/A";

    try {
      const dateObj = new Date(dateStr);
      if (isNaN(dateObj.getTime())) return "N/A";
      return dateObj.toLocaleDateString();
    } catch (error) {
      return "N/A";
    }
  };

  // Initial loading state - show simple loading without hydration-sensitive elements
  if (!isClient) {
    return (
      <div className="flex flex-col gap-6 p-4 md:gap-8 md:p-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Database</h1>
          <p className="text-muted-foreground">
            Manage your databases, tables, and relationships.
          </p>
        </div>
        <div className="flex h-[60vh] items-center justify-center">
          <div className="h-8 w-8" />
          <span className="ml-2">Loading...</span>
        </div>
      </div>
    );
  }

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
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button onClick={handleSearch}>
              <FiSearch className="mr-2 h-4 w-4" />
              Search
            </Button>
            <Button onClick={() => router.push('/dashboard/database/new')}>
              <FiPlus className="mr-2 h-4 w-4" />
              New Table
            </Button>
          </div>
        </div>

        <TabsContent value="tables" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle>Database Tables</CardTitle>
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
                Manage your database tables and entity definitions.
              </CardDescription>
              {debugInfo && (
                <div className="mt-2 text-xs text-muted-foreground">
                  <code>{debugInfo}</code>
                </div>
              )}
            </CardHeader>
            <CardContent className="p-0">
              {error && (
                <div className="p-4 mb-4 text-red-700 bg-red-100 rounded-md">
                  <p>{error}</p>
                </div>
              )}
              <ClientOnly>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Database Table</TableHead>
                      <TableHead className="hidden md:table-cell">Title</TableHead>
                      <TableHead className="hidden md:table-cell">Status</TableHead>
                      <TableHead className="hidden md:table-cell">Last Modified</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                          <div className="flex items-center justify-center">
                            <FiLoader className="h-6 w-6 animate-spin mr-2" />
                            <span>Loading tables...</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : entityDefs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                          No tables found
                        </TableCell>
                      </TableRow>
                    ) : (
                      entityDefs.map((entityDef) => (
                        <TableRow key={entityDef.id}>
                          <TableCell className="font-medium">{entityDef.name}</TableCell>
                          <TableCell>{entityDef.dbTableName || 'N/A'}</TableCell>
                          <TableCell className="hidden md:table-cell">
                            {entityDef.title || 'N/A'}
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <Badge variant={entityDef.isActive !== false ? 'default' : 'secondary'}>
                              {entityDef.isActive !== false ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {formatDate(entityDef.lastUpdateDate)}
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
                      ))
                    )}
                  </TableBody>
                </Table>
              </ClientOnly>
            </CardContent>
            <CardFooter className="flex items-center justify-between border-t px-6 py-4">
              <div className="text-sm text-muted-foreground">
                Showing <strong>{entityDefs.length}</strong> of{" "}
                <strong>{totalCount !== -1 ? totalCount : 'many'}</strong> tables
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage <= 1 || loading}
                  onClick={handlePreviousPage}
                >
                  Previous
                </Button>
                <span className="mx-2">
                  Page {currentPage}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={(totalCount !== -1 && currentPage * pageSize >= totalCount) || loading}
                  onClick={handleNextPage}
                >
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
                      <ClientOnly>
                        {loading ? <FiLoader className="h-4 w-4 animate-spin" /> :
                        totalCount !== -1 ? totalCount : 'Many'}
                      </ClientOnly>
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">
                      Active Tables
                    </div>
                    <div className="text-2xl font-bold">
                      <ClientOnly>
                        {loading ? <FiLoader className="h-4 w-4 animate-spin" /> :
                          entityDefs.filter(def => def.isActive !== false).length}
                      </ClientOnly>
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">
                      Table Types
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <ClientOnly>
                        {!loading && entityDefs.length > 0 && (
                          <>
                            <Badge variant="default" className="text-xs">
                              {entityDefs.filter(def => def.name?.startsWith('Gsb')).length} System
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {entityDefs.filter(def => !def.name?.startsWith('Gsb')).length} Custom
                            </Badge>
                          </>
                        )}
                      </ClientOnly>
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
                  <Button variant="outline" className="justify-start" onClick={() => router.push('/dashboard/database/new')}>
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

// Export the wrapped version
export default createClientComponent(DatabasePageContent);
