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
import { GsbCacheService } from '@/lib/gsb/services/cache/gsb-cache.service';
import ClientOnly from "@/components/client-only";
import { useRouter } from "next/navigation";
import { Pagination } from '@/components/gsb';

function DatabasePageContent() {
  const [searchQuery, setSearchQuery] = useState("");
  const [entityDefs, setEntityDefs] = useState<GsbEntityDef[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isClient, setIsClient] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Mark when component is mounted on client
  useEffect(() => {
    console.log("Component mounted, setting isClient = true");
    setIsClient(true);
  }, []);

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
      console.log(`Fetching entity definitions - page: ${page}, search: ${search}`);

      const cacheService = GsbCacheService.getInstance();
      console.log("GsbCacheService created");

      const entityDefs = await cacheService.getEntityDefinitions();
      console.log(`Fetched ${entityDefs.length} entity definitions`);

      // Filter by search query if provided
      const filteredDefs = search
        ? entityDefs.filter(def => 
            def.name.toLowerCase().includes(search.toLowerCase()) ||
            def.title?.toLowerCase().includes(search.toLowerCase())
          )
        : entityDefs;

      // Apply pagination
      const startIndex = (page - 1) * pageSize;
      const paginatedDefs = filteredDefs.slice(startIndex, startIndex + pageSize);

      setEntityDefs(paginatedDefs);
      setTotalCount(filteredDefs.length);
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
  
  // Handle page size change
  const handlePageSizeChange = (newPageSize: number) => {
    setCurrentPage(1); // Reset to first page when changing page size
    setPageSize(newPageSize);
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

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Search entity definitions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="w-[300px]"
            />
            <Button onClick={handleSearch}>
              <FiSearch className="mr-2 h-4 w-4" />
              Search
            </Button>
          </div>
          <Button onClick={() => router.push('/dashboard/database/new')}>
            <FiPlus className="mr-2 h-4 w-4" />
            New Entity
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Entity Definitions</CardTitle>
            <CardDescription>
              List of all entity definitions in the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex h-[400px] items-center justify-center">
                <FiLoader className="h-8 w-8 animate-spin" />
              </div>
            ) : error ? (
              <div className="flex h-[400px] items-center justify-center text-red-500">
                {error}
              </div>
            ) : entityDefs.length === 0 ? (
              <div className="flex h-[400px] items-center justify-center text-muted-foreground">
                No entity definitions found
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entityDefs.map((entityDef) => (
                    <TableRow key={entityDef.id}>
                      <TableCell className="font-medium">{entityDef.name}</TableCell>
                      <TableCell>{entityDef.title}</TableCell>
                      <TableCell>{entityDef.description}</TableCell>
                      <TableCell>{formatDate(entityDef.createDate)}</TableCell>
                      <TableCell>{formatDate(entityDef.lastUpdateDate)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <FiMoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => router.push(`/dashboard/database/${entityDef.name}`)}>
                              <FiEye className="mr-2 h-4 w-4" />
                              View Data
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => router.push(`/dashboard/database/${entityDef.name}/edit`)}>
                              <FiEdit2 className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => router.push(`/dashboard/database/${entityDef.name}/copy`)}>
                              <FiCopy className="mr-2 h-4 w-4" />
                              Copy
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
            )}
          </CardContent>
          <CardFooter>
            <Pagination
              totalItems={totalCount}
              currentPage={currentPage}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={handlePageSizeChange}
            />
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

export default function DatabasePage() {
  return (
    <ClientOnly>
      <DatabasePageContent />
    </ClientOnly>
  );
}
