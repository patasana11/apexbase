"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { GsbDataTable } from "@/components/gsb/gsb-data-table";
import { GsbDataTableService } from "@/lib/gsb/services/entity/gsb-data-table.service";
import { GsbCacheService } from "@/lib/gsb/services/cache/gsb-cache.service";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FiPlus, FiEdit2, FiTrash2, FiRefreshCw, FiPlay, FiPause } from "react-icons/fi";
import { format } from "date-fns";
import { useToast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function RecurringJobsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [recurringJobs, setRecurringJobs] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedModule, setSelectedModule] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<boolean | "">("");

  // Load recurring jobs
  useEffect(() => {
    loadRecurringJobs();
  }, [currentPage, pageSize, searchQuery, selectedModule, selectedStatus]);

  const loadRecurringJobs = async () => {
    try {
      setIsLoading(true);
      const dataTableService = GsbDataTableService.getInstance();
      const response = await dataTableService.query({
        entityDefName: "GsbRecurringJob",
        startIndex: (currentPage - 1) * pageSize,
        count: pageSize,
        search: searchQuery,
        sortCols: [{ col: { name: "name" }, sortType: "ASC" }],
        query: [
          ...(selectedModule ? [{
            name: "module_id",
            isEqual: selectedModule,
          }] : []),
          ...(selectedStatus !== "" ? [{
            name: "isActive",
            isEqual: selectedStatus,
          }] : []),
        ],
      });
      setRecurringJobs(response.entities || []);
      setTotalCount(response.totalCount || 0);
    } catch (error) {
      console.error("Error loading recurring jobs:", error);
      toast({
        title: "Error",
        description: "Failed to load recurring jobs. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateJob = () => {
    router.push("/dashboard/system/recurringjobs/new");
  };

  const handleEditJob = (job: any) => {
    router.push(`/dashboard/system/recurringjobs/${job.id}/edit`);
  };

  const handleDeleteJob = async (job: any) => {
    try {
      const dataTableService = GsbDataTableService.getInstance();
      await dataTableService.delete("GsbRecurringJob", job.id);
      toast({
        title: "Success",
        description: "Recurring job deleted successfully.",
      });
      loadRecurringJobs();
    } catch (error) {
      console.error("Error deleting recurring job:", error);
      toast({
        title: "Error",
        description: "Failed to delete recurring job. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleToggleJobStatus = async (job: any) => {
    try {
      const dataTableService = GsbDataTableService.getInstance();
      await dataTableService.update("GsbRecurringJob", job.id, {
        isActive: !job.isActive,
      });
      toast({
        title: "Success",
        description: `Recurring job ${job.isActive ? "paused" : "activated"} successfully.`,
      });
      loadRecurringJobs();
    } catch (error) {
      console.error("Error toggling job status:", error);
      toast({
        title: "Error",
        description: "Failed to update job status. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col gap-6 p-4 md:gap-8 md:p-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Recurring Jobs</h1>
        <p className="text-muted-foreground">
          Manage and monitor your system's scheduled tasks
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Job Statistics
          </CardTitle>
          <FiRefreshCw className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex flex-col">
              <span className="text-2xl font-bold">{recurringJobs.length}</span>
              <span className="text-xs text-muted-foreground">
                Total Jobs
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold">
                {recurringJobs.filter(job => job.isActive).length}
              </span>
              <span className="text-xs text-muted-foreground">
                Active Jobs
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold">
                {new Set(recurringJobs.map(job => job.module?.name)).size}
              </span>
              <span className="text-xs text-muted-foreground">
                Modules
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Job Management
          </CardTitle>
          <Button onClick={handleCreateJob}>
            <FiPlus className="mr-2 h-4 w-4" />
            New Job
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Module</label>
                <Select value={selectedModule} onValueChange={setSelectedModule}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select module" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Modules</SelectItem>
                    {Array.from(new Set(recurringJobs.map(job => job.module?.name))).map(moduleName => (
                      <SelectItem key={moduleName} value={moduleName}>
                        {moduleName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={String(selectedStatus)} onValueChange={(value) => setSelectedStatus(value === "" ? "" : value === "true")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Status</SelectItem>
                    <SelectItem value="true">Active</SelectItem>
                    <SelectItem value="false">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <GsbDataTable
            entityDefName="GsbRecurringJob"
            data={recurringJobs}
            totalCount={totalCount}
            page={currentPage}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
            onDataChange={setRecurringJobs}
            view={{
              queryParams: {
                entityDefName: "GsbRecurringJob",
                startIndex: (currentPage - 1) * pageSize,
                count: pageSize,
                search: searchQuery,
                sortCols: [{ col: { name: "name" }, sortType: "ASC" }],
                query: [
                  ...(selectedModule ? [{
                    name: "module_id",
                    isEqual: selectedModule,
                  }] : []),
                  ...(selectedStatus !== "" ? [{
                    name: "isActive",
                    isEqual: selectedStatus,
                  }] : []),
                ],
              },
            }}
            onViewChange={() => {}}
            onSortChange={() => {}}
            onFilterChange={() => {}}
          />
        </CardContent>
      </Card>
    </div>
  );
} 