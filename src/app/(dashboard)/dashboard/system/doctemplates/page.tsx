"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { GsbDataTable } from "@/components/gsb/gsb-data-table";
import { GsbDataTableService } from "@/lib/gsb/services/entity/gsb-data-table.service";
import { GsbCacheService } from "@/lib/gsb/services/cache/gsb-cache.service";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FiPlus, FiEdit2, FiTrash2, FiRefreshCw, FiFileText, FiDownload } from "react-icons/fi";
import { format } from "date-fns";
import { useToast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function DocTemplatesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [docTemplates, setDocTemplates] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedModule, setSelectedModule] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("");

  // Load document templates
  useEffect(() => {
    loadDocTemplates();
  }, [currentPage, pageSize, searchQuery, selectedModule, selectedType]);

  const loadDocTemplates = async () => {
    try {
      setIsLoading(true);
      const dataTableService = GsbDataTableService.getInstance();
      const response = await dataTableService.query({
        entityDefName: "GsbDocTemplate",
        startIndex: (currentPage - 1) * pageSize,
        count: pageSize,
        search: searchQuery,
        sortCols: [{ col: { name: "name" }, sortType: "ASC" }],
        query: [
          ...(selectedModule ? [{
            name: "module_id",
            isEqual: selectedModule,
          }] : []),
          ...(selectedType ? [{
            name: "type",
            isEqual: selectedType,
          }] : []),
        ],
      });
      setDocTemplates(response.entities || []);
      setTotalCount(response.totalCount || 0);
    } catch (error) {
      console.error("Error loading document templates:", error);
      toast({
        title: "Error",
        description: "Failed to load document templates. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTemplate = () => {
    router.push("/dashboard/system/doctemplates/new");
  };

  const handleEditTemplate = (template: any) => {
    router.push(`/dashboard/system/doctemplates/${template.id}/edit`);
  };

  const handleDeleteTemplate = async (template: any) => {
    try {
      const dataTableService = GsbDataTableService.getInstance();
      await dataTableService.delete("GsbDocTemplate", template.id);
      toast({
        title: "Success",
        description: "Document template deleted successfully.",
      });
      loadDocTemplates();
    } catch (error) {
      console.error("Error deleting document template:", error);
      toast({
        title: "Error",
        description: "Failed to delete document template. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDownloadTemplate = async (template: any) => {
    try {
      // Implement template download logic
      toast({
        title: "Success",
        description: "Template download started.",
      });
    } catch (error) {
      console.error("Error downloading template:", error);
      toast({
        title: "Error",
        description: "Failed to download template. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col gap-6 p-4 md:gap-8 md:p-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Document Templates</h1>
        <p className="text-muted-foreground">
          Manage and generate system document templates
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Template Statistics
          </CardTitle>
          <FiRefreshCw className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex flex-col">
              <span className="text-2xl font-bold">{docTemplates.length}</span>
              <span className="text-xs text-muted-foreground">
                Total Templates
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold">
                {new Set(docTemplates.map(template => template.type)).size}
              </span>
              <span className="text-xs text-muted-foreground">
                Template Types
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold">
                {new Set(docTemplates.map(template => template.module?.name)).size}
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
            Template Management
          </CardTitle>
          <Button onClick={handleCreateTemplate}>
            <FiPlus className="mr-2 h-4 w-4" />
            New Template
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
                    {Array.from(new Set(docTemplates.map(template => template.module?.name))).map(moduleName => (
                      <SelectItem key={moduleName} value={moduleName}>
                        {moduleName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Type</label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Types</SelectItem>
                    {Array.from(new Set(docTemplates.map(template => template.type))).map(type => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <GsbDataTable
            entityDefName="GsbDocTemplate"
            data={docTemplates}
            totalCount={totalCount}
            page={currentPage}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
            onDataChange={setDocTemplates}
            view={{
              queryParams: {
                entityDefName: "GsbDocTemplate",
                startIndex: (currentPage - 1) * pageSize,
                count: pageSize,
                search: searchQuery,
                sortCols: [{ col: { name: "name" }, sortType: "ASC" }],
                query: [
                  ...(selectedModule ? [{
                    name: "module_id",
                    isEqual: selectedModule,
                  }] : []),
                  ...(selectedType ? [{
                    name: "type",
                    isEqual: selectedType,
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