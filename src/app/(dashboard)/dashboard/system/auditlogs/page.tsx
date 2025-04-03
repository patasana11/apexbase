"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { GsbDataTable } from "@/components/gsb/gsb-data-table";
import { GsbDataTableService } from "@/lib/gsb/services/entity/gsb-data-table.service";
import { GsbCacheService } from "@/lib/gsb/services/cache/gsb-cache.service";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FiRefreshCw, FiFilter, FiDownload } from "react-icons/fi";
import { format } from "date-fns";
import { useToast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AuditLogsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEntity, setSelectedEntity] = useState<string>("");
  const [selectedFunction, setSelectedFunction] = useState<string>("");
  const [dateRange, setDateRange] = useState<{ start: Date; end: Date }>({
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
    end: new Date(),
  });

  // Load audit logs
  useEffect(() => {
    loadAuditLogs();
  }, [currentPage, pageSize, searchQuery, selectedEntity, selectedFunction, dateRange]);

  const loadAuditLogs = async () => {
    try {
      setIsLoading(true);
      const dataTableService = GsbDataTableService.getInstance();
      const response = await dataTableService.query({
        entityDefName: "GsbAuditLog",
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
          ...(selectedEntity ? [{
            name: "entity",
            isEqual: selectedEntity,
          }] : []),
          ...(selectedFunction ? [{
            name: "function",
            isEqual: selectedFunction,
          }] : []),
        ],
      });
      setAuditLogs(response.entities || []);
      setTotalCount(response.totalCount || 0);
    } catch (error) {
      console.error("Error loading audit logs:", error);
      toast({
        title: "Error",
        description: "Failed to load audit logs. Please try again.",
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
        description: "Audit logs export started.",
      });
    } catch (error) {
      console.error("Error exporting audit logs:", error);
      toast({
        title: "Error",
        description: "Failed to export audit logs. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col gap-6 p-4 md:gap-8 md:p-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Audit Logs</h1>
        <p className="text-muted-foreground">
          Monitor and analyze system activity
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Audit Log Statistics
          </CardTitle>
          <FiRefreshCw className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="flex flex-col">
              <span className="text-2xl font-bold">{auditLogs.length}</span>
              <span className="text-xs text-muted-foreground">
                Total Logs
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold">
                {new Set(auditLogs.map(log => log.entity)).size}
              </span>
              <span className="text-xs text-muted-foreground">
                Unique Entities
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold">
                {new Set(auditLogs.map(log => log.userName)).size}
              </span>
              <span className="text-xs text-muted-foreground">
                Active Users
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold">
                {new Set(auditLogs.map(log => log.function)).size}
              </span>
              <span className="text-xs text-muted-foreground">
                Unique Functions
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Audit Log Management
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
                <label className="text-sm font-medium">Entity</label>
                <Select value={selectedEntity} onValueChange={setSelectedEntity}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select entity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Entities</SelectItem>
                    {Array.from(new Set(auditLogs.map(log => log.entity))).map(entity => (
                      <SelectItem key={entity} value={entity}>
                        {entity}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Function</label>
                <Select value={selectedFunction} onValueChange={setSelectedFunction}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select function" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Functions</SelectItem>
                    {Array.from(new Set(auditLogs.map(log => log.function))).map(func => (
                      <SelectItem key={func} value={func}>
                        {func}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <GsbDataTable
            entityDefName="GsbAuditLog"
            data={auditLogs}
            totalCount={totalCount}
            page={currentPage}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
            onDataChange={setAuditLogs}
            view={{
              queryParams: {
                entityDefName: "GsbAuditLog",
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
                  ...(selectedEntity ? [{
                    name: "entity",
                    isEqual: selectedEntity,
                  }] : []),
                  ...(selectedFunction ? [{
                    name: "function",
                    isEqual: selectedFunction,
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