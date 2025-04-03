"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { GsbDataTable } from "@/components/gsb/gsb-data-table";
import { GsbDataTableService } from "@/lib/gsb/services/entity/gsb-data-table.service";
import { GsbCacheService } from "@/lib/gsb/services/cache/gsb-cache.service";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FiRefreshCw, FiFilter, FiDownload, FiAlertCircle, FiAlertTriangle, FiInfo } from "react-icons/fi";
import { format } from "date-fns";
import { useToast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function SystemLogsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [systemLogs, setSystemLogs] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<number | "">("");
  const [selectedOperation, setSelectedOperation] = useState<string>("");
  const [dateRange, setDateRange] = useState<{ start: Date; end: Date }>({
    start: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
    end: new Date(),
  });

  // Load system logs
  useEffect(() => {
    loadSystemLogs();
  }, [currentPage, pageSize, searchQuery, selectedType, selectedOperation, dateRange]);

  const loadSystemLogs = async () => {
    try {
      setIsLoading(true);
      const dataTableService = GsbDataTableService.getInstance();
      const response = await dataTableService.query({
        entityDefName: "GsbSystemLog",
        startIndex: (currentPage - 1) * pageSize,
        count: pageSize,
        search: searchQuery,
        sortCols: [{ col: { name: "createDate" }, sortType: "DESC" }],
        query: [
          {
            name: "createDate",
            funcVal: "Between",
            value: [dateRange.start, dateRange.end],
          },
          ...(selectedType !== "" ? [{
            name: "type",
            isEqual: selectedType,
          }] : []),
          ...(selectedOperation ? [{
            name: "operation",
            isEqual: selectedOperation,
          }] : []),
        ],
      });
      setSystemLogs(response.entities || []);
      setTotalCount(response.totalCount || 0);
    } catch (error) {
      console.error("Error loading system logs:", error);
      toast({
        title: "Error",
        description: "Failed to load system logs. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportLogs = async () => {
    try {
      // Implement export logic
      toast({
        title: "Success",
        description: "System logs export started.",
      });
    } catch (error) {
      console.error("Error exporting system logs:", error);
      toast({
        title: "Error",
        description: "Failed to export system logs. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getTypeBadge = (type: number) => {
    switch (type) {
      case 1:
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
          <FiInfo className="mr-1 h-3 w-3" />
          Info
        </Badge>;
      case 2:
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
          <FiAlertTriangle className="mr-1 h-3 w-3" />
          Warning
        </Badge>;
      case 4:
        return <Badge variant="secondary" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
          <FiAlertCircle className="mr-1 h-3 w-3" />
          Error
        </Badge>;
      case 8:
        return <Badge variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">
          <FiAlertCircle className="mr-1 h-3 w-3" />
          Critical
        </Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  return (
    <div className="flex flex-col gap-6 p-4 md:gap-8 md:p-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">System Logs</h1>
        <p className="text-muted-foreground">
          Monitor and analyze system events and errors
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            System Log Statistics
          </CardTitle>
          <FiRefreshCw className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="flex flex-col">
              <span className="text-2xl font-bold">{systemLogs.length}</span>
              <span className="text-xs text-muted-foreground">
                Total Logs
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold">
                {systemLogs.filter(log => log.type === 4 || log.type === 8).length}
              </span>
              <span className="text-xs text-muted-foreground">
                Errors & Critical
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold">
                {systemLogs.filter(log => log.type === 2).length}
              </span>
              <span className="text-xs text-muted-foreground">
                Warnings
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold">
                {new Set(systemLogs.map(log => log.operation)).size}
              </span>
              <span className="text-xs text-muted-foreground">
                Unique Operations
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            System Log Management
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <FiFilter className="mr-2 h-4 w-4" />
              Filter
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportLogs}>
              <FiDownload className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Log Type</label>
                <Select value={String(selectedType)} onValueChange={(value) => setSelectedType(value === "" ? "" : Number(value))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Types</SelectItem>
                    <SelectItem value="1">Info</SelectItem>
                    <SelectItem value="2">Warning</SelectItem>
                    <SelectItem value="4">Error</SelectItem>
                    <SelectItem value="8">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Operation</label>
                <Select value={selectedOperation} onValueChange={setSelectedOperation}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select operation" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Operations</SelectItem>
                    {Array.from(new Set(systemLogs.map(log => log.operation))).map(operation => (
                      <SelectItem key={operation} value={operation}>
                        {operation}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <GsbDataTable
            entityDefName="GsbSystemLog"
            data={systemLogs}
            totalCount={totalCount}
            page={currentPage}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
            onDataChange={setSystemLogs}
            view={{
              queryParams: {
                entityDefName: "GsbSystemLog",
                startIndex: (currentPage - 1) * pageSize,
                count: pageSize,
                search: searchQuery,
                sortCols: [{ col: { name: "createDate" }, sortType: "DESC" }],
                query: [
                  {
                    name: "createDate",
                    funcVal: "Between",
                    value: [dateRange.start, dateRange.end],
                  },
                  ...(selectedType !== "" ? [{
                    name: "type",
                    isEqual: selectedType,
                  }] : []),
                  ...(selectedOperation ? [{
                    name: "operation",
                    isEqual: selectedOperation,
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